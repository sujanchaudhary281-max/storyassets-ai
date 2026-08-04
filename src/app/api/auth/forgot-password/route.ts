import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetCodeEmail } from '@/lib/resend'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })

    // For security, respond success even if email is not found to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a verification code has been sent.',
      })
    }

    // Generate 6-digit numeric OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const identifier = `reset:${normalizedEmail}`
    const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Remove any existing reset tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { identifier },
    })

    // Store token in database
    await prisma.verificationToken.create({
      data: {
        identifier,
        token: code,
        expires,
      },
    })

    // Send email with 6-digit code
    await sendPasswordResetCodeEmail(normalizedEmail, code)

    return NextResponse.json({
      success: true,
      message: 'A 6-digit verification code has been sent to your email.',
    })
  } catch (error) {
    console.error('[forgot-password]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send reset code. Please try again.' },
      { status: 500 }
    )
  }
}
