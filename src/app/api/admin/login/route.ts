import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (password === process.env.ADMIN_PASSWORD) {
      const cookieStore = await cookies()

      cookieStore.set('admin_session', process.env.ADMIN_SESSION_SECRET!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 dias
        path: '/'
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
