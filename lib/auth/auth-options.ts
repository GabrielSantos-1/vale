import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'

import { prisma } from '../db/prisma'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
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
          return null
        }

        const email = credentials.email.trim().toLowerCase()
        const password = credentials.password

        const user = await prisma.adminUser.findUnique({
          where: { email },
        })

        if (!user || !user.isActive) {
          return null
        }

        const isValidPassword = await compare(password, user.passwordHash)

        if (!isValidPassword) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        ;(token as typeof token & { role?: string }).role = (user as { role?: string }).role
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as typeof session.user & { id?: string; role?: string }).id = token.sub
        ;(session.user as typeof session.user & { id?: string; role?: string }).role = (
          token as typeof token & { role?: string }
        ).role
      }

      return session
    },
  },
}

export default authOptions