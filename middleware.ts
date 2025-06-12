import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  // Match /[tenant]/dashboard or /[tenant]/dashboard/
  const match = pathname.match(/^\/(\w+)\/dashboard\/?$/);
  if (match) {
    const tenant = match[1];
    return NextResponse.redirect(
      new URL(`/${tenant}/dashboard/en`, request.url)
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
