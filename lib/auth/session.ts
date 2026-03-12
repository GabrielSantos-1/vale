export function getSessionPlaceholder() {
  return null
}

export default getSessionPlaceholder
import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';

export function getSession() {
  return getServerSession(authOptions);
}
