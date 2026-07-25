'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { z } from 'zod'
import { signUpSchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Wrench } from 'lucide-react'

type FormData = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(signUpSchema),
  })

  const password = watch('password', '')
  const strength = getPasswordStrength(password)

  async function onSubmit(_data: FormData) {
    setError('System is currently under maintenance. Registration is temporarily unavailable as setup is not yet completed.')
  }

  function handleGoogleAuth() {
    setError('System is currently under maintenance. Google signup is temporarily unavailable as setup is not yet completed.')
  }

  if (success) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="w-12 h-12 rounded-full bg-[var(--success)] mx-auto mb-4 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-xl font-semibold tracking-[-0.6px] mb-2">Check your inbox</h1>
        <p className="text-sm text-[var(--body)]">We sent you a verification link. Click it to activate your account.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <Link href="/" className="text-lg font-semibold tracking-[-0.6px]">StoreAssets AI</Link>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-sm p-4 rounded-[var(--radius-sm)] mb-6 flex items-start gap-3">
        <Wrench className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <div>
          <p className="font-semibold text-amber-800 dark:text-amber-200 mb-0.5">System Under Maintenance</p>
          <p className="text-xs text-amber-700/90 dark:text-amber-300/90 leading-relaxed">
            Account registration is currently under maintenance as feature setup is still in progress.
          </p>
        </div>
      </div>

      <h1 className="text-2xl font-semibold tracking-[-0.96px] mb-2">Create your account</h1>
      <p className="text-sm text-[var(--body)] mb-6">Ship your app. Not your weekend.</p>

      <Button variant="outline" className="w-full mb-4 rounded-[var(--radius-sm)] h-10" onClick={handleGoogleAuth}>
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        Continue with Google
      </Button>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--hairline)]" /></div>
        <div className="relative flex justify-center text-xs"><span className="bg-[var(--canvas-soft)] px-2 text-[var(--mute)]">or</span></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm">Name</Label>
          <Input id="name" {...register('name')} className="mt-1 h-10 rounded-[var(--radius-sm)]" placeholder="Jane Doe" />
          {errors.name && <p className="text-xs text-[var(--error)] mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="email" className="text-sm">Email</Label>
          <Input id="email" type="email" {...register('email')} className="mt-1 h-10 rounded-[var(--radius-sm)]" placeholder="you@example.com" />
          {errors.email && <p className="text-xs text-[var(--error)] mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="password" className="text-sm">Password</Label>
          <Input id="password" type="password" {...register('password')} className="mt-1 h-10 rounded-[var(--radius-sm)]" placeholder="••••••••" />
          {password && (
            <div className="flex gap-1 mt-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-1 flex-1 rounded-full" style={{ background: i <= strength ? ['','#ee0000','#f5a623','#0070f3','#50e3c2'][strength] : 'var(--hairline)' }} />
              ))}
            </div>
          )}
          {errors.password && <p className="text-xs text-[var(--error)] mt-1">{errors.password.message}</p>}
        </div>

        {error && (
          <div className="text-sm text-[var(--error)] bg-[var(--error-soft)] p-3 rounded-[var(--radius-sm)] border border-[var(--error)]/20">
            {error}
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full h-10 rounded-[var(--radius-pill)] font-medium">
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <p className="text-sm text-[var(--body)] text-center mt-6">
        Already have an account? <Link href="/login" className="text-[var(--link)] hover:underline">Log in</Link>
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
