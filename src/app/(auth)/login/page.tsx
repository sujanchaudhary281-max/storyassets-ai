'use client'

import { Suspense, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod'
import { loginSchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, Eye, EyeOff, CheckCircle2, KeyRound, Mail } from 'lucide-react'

type FormData = z.infer<typeof loginSchema>

type AuthMode = 'login' | 'forgot-email' | 'forgot-reset' | 'forgot-success'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const params = useSearchParams()
  const verified = params.get('verified') === 'true'
  const googleNotRegistered = params.get('error') === 'GoogleNotRegistered'

  const [mode, setMode] = useState<AuthMode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // State for forgot password flow
  const [resetEmail, setResetEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
  })

  // Check URL query param for forgot=true
  useEffect(() => {
    if (params.get('forgot') === 'true') {
      setMode('forgot-email')
    }
  }, [params])

  async function onSubmitLogin(data: FormData) {
    setError('')
    const result = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
    })
    if (result?.error) setError('Invalid email or password.')
    else window.location.href = '/dashboard'
  }

  function handleGoogleAuth() {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  // Step 1: Send 6-digit code to email
  async function handleSendResetCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!resetEmail || !resetEmail.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    setIsSendingCode(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Failed to send verification code.')
        return
      }

      setMode('forgot-reset')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsSendingCode(false)
    }
  }

  // Step 2: Submit 6-digit code and new password
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!code || code.trim().length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email.')
      return
    }

    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    setIsResettingPassword(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          code: code.trim(),
          newPassword,
        }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Failed to reset password.')
        return
      }

      setMode('forgot-success')
      setSuccessMsg('Your password has been reset successfully! You can now log in with your new password.')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsResettingPassword(false)
    }
  }

  const passwordStrength = getPasswordStrength(newPassword)

  // ----------------------------------------------------
  // RENDER: FORGOT PASSWORD STEP 3 (SUCCESS)
  // ----------------------------------------------------
  if (mode === 'forgot-success') {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="w-12 h-12 rounded-full bg-[var(--success)]/10 text-[var(--success)] mx-auto mb-4 flex items-center justify-center">
          <CheckCircle2 size={28} />
        </div>
        <h1 className="text-xl font-semibold tracking-[-0.6px] mb-2">Password reset successful</h1>
        <p className="text-sm text-[var(--body)] mb-6">{successMsg}</p>
        <Button
          className="w-full h-10 rounded-[var(--radius-pill)] font-medium"
          onClick={() => {
            setValue('email', resetEmail)
            setMode('login')
            setError('')
          }}
        >
          Back to log in
        </Button>
      </div>
    )
  }

  // ----------------------------------------------------
  // RENDER: FORGOT PASSWORD STEP 2 (ENTER CODE & NEW PASSWORD)
  // ----------------------------------------------------
  if (mode === 'forgot-reset') {
    return (
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-lg font-semibold tracking-[-0.6px]">StoreAssets AI</Link>
          <button
            type="button"
            onClick={() => { setMode('login'); setError('') }}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--body)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft size={15} />
            Back to login
          </button>
        </div>

        <div className="w-10 h-10 rounded-full bg-[var(--canvas-soft-2)] flex items-center justify-center mb-4 text-[var(--ink)]">
          <KeyRound size={20} />
        </div>

        <h1 className="text-2xl font-semibold tracking-[-0.96px] mb-2">Enter verification code</h1>
        <p className="text-sm text-[var(--body)] mb-6">
          We sent a 6-digit code to <strong className="text-[var(--ink)]">{resetEmail}</strong>
        </p>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <Label htmlFor="code" className="text-sm">6-Digit Code</Label>
            <Input
              id="code"
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="mt-1 h-11 rounded-[var(--radius-sm)] text-center font-mono text-lg tracking-[0.3em]"
              required
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="newPassword" className="text-sm">New Password</Label>
            <div className="relative mt-1">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 rounded-[var(--radius-sm)] pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mute)] hover:text-[var(--ink)] transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {newPassword && (
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full"
                    style={{ background: i <= passwordStrength ? ['', '#ee0000', '#f5a623', '#0070f3', '#50e3c2'][passwordStrength] : 'var(--hairline)' }}
                  />
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-[var(--error)] bg-[var(--error-soft)] p-3 rounded-[var(--radius-sm)] border border-[var(--error)]/20">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isResettingPassword} className="w-full h-10 rounded-[var(--radius-pill)] font-medium">
            {isResettingPassword && <Loader2 size={16} className="mr-2 animate-spin" />}
            {isResettingPassword ? 'Resetting password...' : 'Save new password'}
          </Button>
        </form>

        <div className="flex justify-between items-center text-xs text-[var(--body)] mt-6">
          <span>Didn&apos;t receive a code?</span>
          <button
            type="button"
            onClick={() => { setMode('forgot-email'); setError('') }}
            className="text-[var(--link)] hover:underline font-medium"
          >
            Resend code
          </button>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------
  // RENDER: FORGOT PASSWORD STEP 1 (ENTER EMAIL)
  // ----------------------------------------------------
  if (mode === 'forgot-email') {
    return (
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-lg font-semibold tracking-[-0.6px]">StoreAssets AI</Link>
          <button
            type="button"
            onClick={() => { setMode('login'); setError('') }}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--body)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft size={15} />
            Back to login
          </button>
        </div>

        <div className="w-10 h-10 rounded-full bg-[var(--canvas-soft-2)] flex items-center justify-center mb-4 text-[var(--ink)]">
          <Mail size={20} />
        </div>

        <h1 className="text-2xl font-semibold tracking-[-0.96px] mb-2">Reset your password</h1>
        <p className="text-sm text-[var(--body)] mb-6">
          Enter your account email address and we&apos;ll send you a 6-digit verification code.
        </p>

        <form onSubmit={handleSendResetCode} className="space-y-4">
          <div>
            <Label htmlFor="resetEmail" className="text-sm">Email address</Label>
            <Input
              id="resetEmail"
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 h-10 rounded-[var(--radius-sm)]"
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="text-sm text-[var(--error)] bg-[var(--error-soft)] p-3 rounded-[var(--radius-sm)] border border-[var(--error)]/20">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isSendingCode} className="w-full h-10 rounded-[var(--radius-pill)] font-medium">
            {isSendingCode && <Loader2 size={16} className="mr-2 animate-spin" />}
            {isSendingCode ? 'Sending code...' : 'Send verification code'}
          </Button>
        </form>

        <p className="text-sm text-[var(--body)] text-center mt-6">
          Remember your password?{' '}
          <button
            type="button"
            onClick={() => { setMode('login'); setError('') }}
            className="text-[var(--link)] hover:underline font-medium"
          >
            Log in
          </button>
        </p>
      </div>
    )
  }

  // ----------------------------------------------------
  // RENDER: DEFAULT LOGIN FORM
  // ----------------------------------------------------
  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="text-lg font-semibold tracking-[-0.6px]">StoreAssets AI</Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--body)] hover:text-[var(--ink)] transition-colors"
        >
          <ArrowLeft size={15} />
          Back
        </Link>
      </div>

      <h1 className="text-2xl font-semibold tracking-[-0.96px] mb-2">Welcome back</h1>
      <p className="text-sm text-[var(--body)] mb-6">Log in to your account</p>

      {googleNotRegistered && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-sm p-3 rounded-[var(--radius-sm)] mb-4">
          No account found for that Google address.{' '}
          <Link href="/signup" className="font-medium underline underline-offset-2">Sign up first</Link>.
        </div>
      )}

      {verified && (
        <div className="bg-[#d3e5ff] text-[var(--link-deep)] text-sm p-3 rounded-[var(--radius-sm)] mb-4">
          Email verified! You can now log in.
        </div>
      )}

      <Button variant="outline" className="w-full mb-4 rounded-[var(--radius-sm)] h-10" onClick={handleGoogleAuth}>
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
        Continue with Google
      </Button>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--hairline)]" /></div>
        <div className="relative flex justify-center text-xs"><span className="bg-[var(--canvas-soft)] px-2 text-[var(--mute)]">or</span></div>
      </div>

      <form onSubmit={handleSubmit(onSubmitLogin)} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-sm">Email</Label>
          <Input id="email" type="email" {...register('email')} className="mt-1 h-10 rounded-[var(--radius-sm)]" placeholder="you@example.com" />
          {errors.email && <p className="text-xs text-[var(--error)] mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-sm">Password</Label>
            <button
              type="button"
              onClick={() => { setMode('forgot-email'); setError('') }}
              className="text-xs text-[var(--link)] hover:underline font-medium"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative mt-1">
            <Input id="password" type={showPassword ? 'text' : 'password'} {...register('password')} className="h-10 rounded-[var(--radius-sm)] pr-10" placeholder="••••••••" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mute)] hover:text-[var(--ink)] transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-[var(--error)] mt-1">{errors.password.message}</p>}
        </div>

        {error && (
          <div className="text-sm text-[var(--error)] bg-[var(--error-soft)] p-3 rounded-[var(--radius-sm)] border border-[var(--error)]/20">
            {error}
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full h-10 rounded-[var(--radius-pill)] font-medium">
          {isSubmitting && <Loader2 size={16} className="mr-2 animate-spin" />}
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </Button>
      </form>

      <p className="text-sm text-[var(--body)] text-center mt-6">
        Don&apos;t have an account? <Link href="/signup" className="text-[var(--link)] hover:underline">Sign up</Link>
      </p>
    </div>
  )
}

function getPasswordStrength(pw: string): number {
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}
