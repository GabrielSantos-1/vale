import { NextResponse } from 'next/server';

export function GET() {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://verdevale.example.com';
  return new NextResponse(
    `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`,
    { headers: { 'Content-Type': 'text/plain' } }
  );
}
