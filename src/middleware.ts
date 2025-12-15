import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Proteger rotas /admin/* (exceto /admin que é a página de login)
  if (request.nextUrl.pathname.startsWith('/admin/')) {
    const adminSession = request.cookies.get('admin_session')

    if (!adminSession || adminSession.value !== process.env.ADMIN_SESSION_SECRET) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // Proteger APIs /api/admin/* (exceto login)
  if (request.nextUrl.pathname.startsWith('/api/admin/') &&
      !request.nextUrl.pathname.includes('/login')) {
    const adminSession = request.cookies.get('admin_session')

    if (!adminSession || adminSession.value !== process.env.ADMIN_SESSION_SECRET) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path+', '/api/admin/:path*']
}
