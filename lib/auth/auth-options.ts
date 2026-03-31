import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';

import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/security/logger';
import { normalizeEmail, sanitizeString } from '@/lib/security/sanitize';
import { isAdminRole } from '@/lib/auth/roles';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 8, // 8 horas
    updateAge: 60 * 60, // 1 hora
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

        const user = await prisma.adminUser.findUnique({
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

        logger.info('Admin login successful', {
          route: '/api/auth/[...nextauth]',
          userId: user.id,
          email: user.email,
        });

        return {
          id: user.id,
          name: sanitizeString(user.name, { maxLength: 120 }),
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as typeof token & { id?: string }).id = user.id;
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        (token as typeof token & { role?: string }).role = (
          user as { role?: string }
        ).role;
      }

      return token;
    },

    async session({ session, token }) {
      session.user ??= {
        name: null,
        email: null,
        image: null,
      };

      (
        session.user as typeof session.user & {
          id?: string;
          role?: string;
        }
      ).id = (token as typeof token & { id?: string }).id ?? token.sub;
      session.user.email = token.email ?? null;
      session.user.name = token.name ?? null;
      (
        session.user as typeof session.user & {
          id?: string;
          role?: string;
        }
      ).role = (token as typeof token & { role?: string }).role;

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
