import { NextResponse } from 'next/server'

export function middleware(request) {
  if (request.nextUrl.pathname.startsWith('/admin-dashboard')) {
    const auth = request.cookies.get('admin_auth')
    if (!auth || auth.value !== 'yes') {
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin-dashboard/:path*'],
}
