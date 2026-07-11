'use client'

import { Suspense, useState } from 'react'
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
import { Loader2 } from 'lucide-react'

type FormData = z.infer<typeof loginSchema>

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
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: FormData) {
    setError('')
    const res = await signIn('credentials', { email: data.email, password: data.password, redirect: false })
    if (res?.error) {
      setError(res.error === 'CredentialsSignin' ? 'Invalid email or password.' : res.error)
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <Link href="/" className="text-lg font-semibold tracking-[-0.6px]">StoreAssets AI</Link>
      </div>
      <h1 className="text-2xl font-semibold tracking-[-0.96px] mb-2">Welcome back</h1>
      <p className="text-sm text-[var(--body)] mb-6">Log in to your account</p>

      {verified && (
        <div className="bg-[#d3e5ff] text-[var(--link-deep)] text-sm p-3 rounded-[var(--radius-sm)] mb-4">
          Email verified! You can now log in.
        </div>
      )}

      <Button variant="outline" className="w-full mb-4 rounded-[var(--radius-sm)] h-10" onClick={() => signIn('google', { callbackUrl: '/dashboard' })}>
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
        Continue with Google
      </Button>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--hairline)]" /></div>
        <div className="relative flex justify-center text-xs"><span className="bg-[var(--canvas-soft)] px-2 text-[var(--mute)]">or</span></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-sm">Email</Label>
          <Input id="email" type="email" {...register('email')} className="mt-1 h-10 rounded-[var(--radius-sm)]" placeholder="you@example.com" />
          {errors.email && <p className="text-xs text-[var(--error)] mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-sm">Password</Label>
            <Link href="/login?forgot=true" className="text-xs text-[var(--link)] hover:underline">Forgot password?</Link>
          </div>
          <Input id="password" type="password" {...register('password')} className="mt-1 h-10 rounded-[var(--radius-sm)]" placeholder="••••••••" />
          {errors.password && <p className="text-xs text-[var(--error)] mt-1">{errors.password.message}</p>}
        </div>

        {error && <p className="text-sm text-[var(--error)] bg-[var(--error-soft)] p-3 rounded-[var(--radius-sm)]">{error}</p>}

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
