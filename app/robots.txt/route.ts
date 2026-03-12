import { NextResponse } from 'next/server';

export function GET() {
  return new NextResponse(`User-agent: *\nAllow: /\nSitemap: /sitemap.xml`, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
