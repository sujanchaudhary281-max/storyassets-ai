import { NextResponse } from 'next/server'

/**
 * Sets a short-lived `google_signup_intent` cookie (5 min) so the NextAuth
 * `signIn` callback knows this Google OAuth was initiated from the signup page
 * (i.e. a new account should be allowed to be created).
 */
export async function GET(req: Request) {
  const base = new URL(req.url).origin
  const response = NextResponse.redirect(
    `${base}/api/auth/signin/google?callbackUrl=${encodeURIComponent('/dashboard')}`
  )
  response.cookies.set('google_signup_intent', '1', {
    maxAge: 300,      // 5 minutes — enough to complete the OAuth round-trip
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })
  return response
}
