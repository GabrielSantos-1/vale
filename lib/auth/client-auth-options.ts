import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';

import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/security/logger';
import { normalizeEmail, sanitizeString } from '@/lib/security/sanitize';

const authSecret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;

if (!authSecret) {
  throw new Error('Missing NEXTAUTH_SECRET/AUTH_SECRET for client auth');
}

type ClientToken = {
  sub?: string;
  id?: string;
  email?: string | null;
  name?: string | null;
};

export const clientAuthOptions: NextAuthOptions = {
  secret: authSecret,

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 8,
    updateAge: 60 * 60,
  },

  pages: {
    signIn: '/cliente/login',
  },

  providers: [
    CredentialsProvider({
      name: 'ClientCredentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          logger.warn('Client login rejected: missing credentials', {
            route: '/api/client/auth/[...nextauth]',
          });
          return null;
        }

        const email = normalizeEmail(credentials.email);
        const password = credentials.password;
        let client: {
          id: string;
          name: string;
          email: string;
          isActive: boolean;
          passwordHash: string;
        } | null = null;

        try {
          client = await prisma.clientUser.findUnique({
            where: { email },
            select: {
              id: true,
              name: true,
              email: true,
              isActive: true,
              passwordHash: true,
            },
          });
        } catch (error) {
          logger.error('Client login failed due to auth backend error', {
            route: '/api/client/auth/[...nextauth]',
            dependency: 'database',
            error,
          });
          return null;
        }

        if (!client || !client.isActive) {
          logger.warn('Client login rejected: invalid account state', {
            route: '/api/client/auth/[...nextauth]',
            email,
          });
          return null;
        }

        const isValidPassword = await compare(password, client.passwordHash);

        if (!isValidPassword) {
          logger.warn('Client login rejected: invalid password', {
            route: '/api/client/auth/[...nextauth]',
            email,
          });
          return null;
        }

        const safeName = client.name
          ? sanitizeString(client.name, { maxLength: 120 })
          : 'Cliente';

        logger.info('Client login successful', {
          route: '/api/client/auth/[...nextauth]',
          clientId: client.id,
          email: client.email,
        });

        return { id: client.id, name: safeName, email: client.email };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      const nextToken = token as ClientToken;

      if (user) {
        nextToken.id = user.id;
        nextToken.sub = user.id;
        nextToken.email = user.email;
        nextToken.name = user.name;
      }

      return nextToken;
    },

    async session({ session, token }) {
      const clientToken = token as ClientToken;

      if (!session.user) {
        session.user = { name: null, email: null, image: null };
      }

      session.user.name = clientToken.name ?? null;
      session.user.email = clientToken.email ?? null;

      (session.user as typeof session.user & { id?: string }).id =
        clientToken.id ?? clientToken.sub;

      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/cliente')) {
        return `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
      }
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      return `${baseUrl}/cliente/dashboard`;
    },
  },
};

export default clientAuthOptions;
