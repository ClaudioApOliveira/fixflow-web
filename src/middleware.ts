import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware mínimo apenas para passar requisições adiante
 * A lógica de autenticação e redirecionamento é feita no cliente via AuthRedirector
 */
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
