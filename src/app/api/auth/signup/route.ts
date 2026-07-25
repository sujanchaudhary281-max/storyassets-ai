import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'System is currently under maintenance. Registration setup is not yet complete.' },
    { status: 503 }
  )
}

