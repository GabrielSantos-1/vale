import { getServerSession } from 'next-auth'

import authOptions from '@/lib/auth/auth-options'

export async function requireAdmin() {
  const session = await getServerSession(authOptions)

  const role = (session?.user as { role?: string } | undefined)?.role

  if (!session || role !== 'admin') {
    return null
  }

  return session
}