import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadBuffer, getPublicUrl } from '@/lib/r2'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg']

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
        { error: 'Invalid file type. Only PNG and JPEG are allowed.' },
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
    const extension = file.type === 'image/png' ? 'png' : 'jpg'
    const key = `icons/${session.user.id}/${timestamp}.${extension}`

    // Upload to R2
    await uploadBuffer(key, buffer, file.type)

    // Get public URL
    const url = getPublicUrl(key)

    return NextResponse.json({
      data: {
        key,
        url,
      },
      message: 'Icon uploaded successfully',
    })
  } catch (error) {
    console.error('Upload icon error:', error)
    return NextResponse.json(
      { error: 'Failed to upload icon' },
      { status: 500 }
    )
  }
}
