import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '../db/prisma'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials) return null
        const { email, password } = credentials as { email: string; password: string }

        const user = await prisma.adminUser.findUnique({ where: { email } })
        if (!user) return null

        // NOTE: This is a placeholder check. In production, store hashed passwords and compare with bcrypt.
        if (password !== user.passwordHash) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore
        token.role = (user as any).role
        // @ts-ignore
        token.id = (user as any).id
      }
      return token
    },
    async session({ session, token }) {
      // @ts-ignore
      session.user = session.user ?? {}
      // @ts-ignore
      session.user.id = token.id
      // @ts-ignore
      session.user.role = token.role
      return session
    }
  }
}

export default authOptions

