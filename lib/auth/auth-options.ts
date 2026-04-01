import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';

import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/security/logger';
import { normalizeEmail, sanitizeString } from '@/lib/security/sanitize';
import { isAdminRole } from '@/lib/auth/roles';

const authSecret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;

if (!authSecret) {
  throw new Error('Missing NEXTAUTH_SECRET/AUTH_SECRET for NextAuth');
}

type AuthToken = {
  sub?: string;
  id?: string;
  email?: string | null;
  name?: string | null;
  role?: string;
};

export const authOptions: NextAuthOptions = {
  secret: authSecret,

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 8,
    updateAge: 60 * 60,
  },

  pages: {
    signIn: '/admin/login',
  },

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          logger.warn('Admin login rejected: missing credentials', {
            route: '/api/auth/[...nextauth]',
          });
          return null;
        }

        const email = normalizeEmail(credentials.email);
        const password = credentials.password;
        let user: {
          id: string;
          name: string;
          email: string;
          role: string;
          isActive: boolean;
          passwordHash: string;
        } | null = null;

        try {
          user = await prisma.adminUser.findUnique({
            where: { email },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
              passwordHash: true,
            },
          });
        } catch (error) {
          logger.error('Admin login failed due to auth backend dependency', {
            route: '/api/auth/[...nextauth]',
            dependency: 'database',
            error,
          });

          return null;
        }

        if (!user || !user.isActive) {
          logger.warn('Admin login rejected: invalid account state', {
            route: '/api/auth/[...nextauth]',
            email,
          });
          return null;
        }

        const isValidPassword = await compare(password, user.passwordHash);

        if (!isValidPassword) {
          logger.warn('Admin login rejected: invalid password', {
            route: '/api/auth/[...nextauth]',
            email,
          });
          return null;
        }

        if (!isAdminRole(user.role)) {
          logger.warn(
            'Admin login rejected: non-admin role attempted admin access',
            {
              route: '/api/auth/[...nextauth]',
              email,
              role: user.role,
            },
          );
          return null;
        }

        const safeName = user.name
          ? sanitizeString(user.name, { maxLength: 120 })
          : 'Administrador';

        logger.info('Admin login successful', {
          route: '/api/auth/[...nextauth]',
          userId: user.id,
          email: user.email,
          role: user.role,
        });

        return {
          id: user.id,
          name: safeName,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      const nextToken = token as AuthToken;

      if (user) {
        nextToken.id = user.id;
        nextToken.sub = user.id;
        nextToken.email = user.email;
        nextToken.name = user.name;
        nextToken.role = (user as { role?: string }).role;
      }

      return nextToken;
    },

    async session({ session, token }) {
      const authToken = token as AuthToken;

      if (!session.user) {
        session.user = {
          name: null,
          email: null,
          image: null,
        };
      }

      session.user.name = authToken.name ?? null;
      session.user.email = authToken.email ?? null;

      (
        session.user as typeof session.user & {
          id?: string;
          role?: string;
        }
      ).id = authToken.id ?? authToken.sub;

      (
        session.user as typeof session.user & {
          id?: string;
          role?: string;
        }
      ).role = authToken.role;

      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }

      try {
        const target = new URL(url);

        if (target.origin === baseUrl) {
          return url;
        }
      } catch {
        logger.warn('NextAuth redirect rejected: invalid URL', {
          route: '/api/auth/[...nextauth]',
          url,
        });
      }

      return `${baseUrl}/admin/dashboard`;
    },
  },
};

export default authOptions;
