import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signUpSchema } from '@/lib/validations'
import { sendVerificationEmail } from '@/lib/resend'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = signUpSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { email, password, name } = parsed.data
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists.' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    await prisma.user.create({ data: { email, name, passwordHash, creditBalance: 0 } })

    const token = String(Math.floor(100000 + Math.random() * 900000))
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await prisma.verificationToken.create({ data: { identifier: email, token, expires } })
    await sendVerificationEmail(email, token)

    return NextResponse.json({ success: true, message: 'Verification email sent' }, { status: 201 })
  } catch (err) {
    console.error('Signup error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
