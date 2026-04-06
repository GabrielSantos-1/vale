import { decode as decodeNextAuthJwt } from "next-auth/jwt";

type ClientSessionUser = {
  id: string;
  name: string;
  email: string;
};

export function shouldUseSecureClientCookie() {
  return process.env.NEXTAUTH_URL?.startsWith("https://") ?? !!process.env.VERCEL;
}

export function getClientAuthCookieName() {
  return shouldUseSecureClientCookie()
    ? "__Secure-client-next-auth.session-token"
    : "client-next-auth.session-token";
}

export async function getClientSession(request: { cookies?: { get: (name: string) => { value: string } | undefined } }) {
  const authSecret =
    process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;

  if (!authSecret) return null;

  const tokenValue = request.cookies?.get(getClientAuthCookieName())?.value;
  if (!tokenValue) return null;

  const token = await decodeNextAuthJwt({
    token: tokenValue,
    secret: authSecret,
  });

  if (!token || !token.sub) return null;

  return {
    id: token.sub,
    name: (token.name ?? "") as string,
    email: (token.email ?? "") as string,
  } as ClientSessionUser;
}
