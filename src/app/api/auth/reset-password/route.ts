import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { email, code, newPassword } = await req.json()

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Email, verification code, and new password are required.' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()
    const identifier = `reset:${normalizedEmail}`
    const trimmedCode = code.trim()

    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier,
        token: trimmedCode,
      },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code. Please check your email and try again.' },
        { status: 400 }
      )
    }

    if (new Date() > verificationToken.expires) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier,
            token: trimmedCode,
          },
        },
      })
      return NextResponse.json(
        { success: false, error: 'Verification code has expired. Please request a new code.' },
        { status: 400 }
      )
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 12)

    // Update user's password in database
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { passwordHash },
    })

    // Delete the used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier,
          token: trimmedCode,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    })
  } catch (error) {
    console.error('[reset-password]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    )
  }
}
