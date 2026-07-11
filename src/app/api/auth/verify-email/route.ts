import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return NextResponse.redirect(new URL('/login?error=InvalidToken', req.url))
    }

    const record = await prisma.verificationToken.findFirst({
      where: { identifier: email, token, expires: { gt: new Date() } },
    })

    if (!record) {
      return NextResponse.redirect(new URL('/login?error=ExpiredToken', req.url))
    }

    await prisma.user.update({ where: { email }, data: { emailVerified: new Date() } })
    await prisma.verificationToken.delete({ where: { identifier_token: { identifier: email, token } } })

    return NextResponse.redirect(new URL('/login?verified=true', req.url))
  } catch {
    return NextResponse.redirect(new URL('/login?error=ServerError', req.url))
  }
}
