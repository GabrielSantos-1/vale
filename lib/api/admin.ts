import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';

import authOptions from '@/lib/auth/auth-options';
import { isAdminRole } from '@/lib/auth/roles';

export async function requireAdmin(): Promise<Session | null> {
  const session = await getServerSession(authOptions);

  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session || !isAdminRole(role)) {
    return null;
  }

  return session;
}
