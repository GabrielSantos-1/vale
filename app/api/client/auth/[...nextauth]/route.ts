import NextAuth from 'next-auth';
import { clientAuthOptions } from '@/lib/auth/client-auth-options';

const handler = NextAuth(clientAuthOptions);

export { handler as GET, handler as POST };
