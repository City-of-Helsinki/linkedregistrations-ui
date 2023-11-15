import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(req: NextRequest) {
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/healthz') ||
    req.nextUrl.pathname.startsWith('/readiness') ||
    req.nextUrl.pathname.includes('/api/') ||
    PUBLIC_FILE.test(req.nextUrl.pathname)
  ) {
    return;
  }

  if (req.nextUrl.locale === 'default') {
    const locale = 'fi';
    const { pathname, protocol, search } = req.nextUrl;
    const { headers } = req;
    const originalHost = headers.get('x-original-host');
    const origin = originalHost
      ? `${protocol}//${originalHost}`
      : req.nextUrl.origin;

    return NextResponse.redirect(
      new URL(`/${locale}${pathname}${search}`, origin)
    );
  }
}
