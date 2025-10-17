import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isAsset = pathname.startsWith('/_next') || /\.(.*)$/.test(pathname) || pathname.startsWith('/public')
  const isApi = pathname.startsWith('/api')
  if (isAsset || isApi) return NextResponse.next()

  const accessToken = req.cookies.get('access_token')?.value
  const isAuthPublic = PUBLIC_AUTH_PATHS.some((p) => pathname.startsWith(p))

  if (!accessToken && !isAuthPublic) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  if (accessToken && isAuthPublic) {
    const url = req.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}


