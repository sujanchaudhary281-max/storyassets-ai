import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadBuffer, getPublicUrl } from '@/lib/r2'
import { prisma } from '@/lib/prisma'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PNG, JPEG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generate unique key
    const timestamp = Date.now()
    const extension = file.type.split('/')[1]
    const key = `users/${session.user.id}/profile-${timestamp}.${extension}`

    // Upload to R2
    await uploadBuffer(key, buffer, file.type)

    // Get public URL
    const url = getPublicUrl(key)

    // Update user profile image in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: url },
    })

    return NextResponse.json({
      data: {
        key,
        url,
      },
      message: 'Profile image uploaded successfully',
    })
  } catch (error) {
    console.error('Upload profile image error:', error)
    return NextResponse.json(
      { error: 'Failed to upload profile image' },
      { status: 500 }
    )
  }
}
