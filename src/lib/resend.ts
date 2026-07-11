import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)
const from = process.env.RESEND_FROM_EMAIL ?? 'noreply@storeassets.ai'

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`
  await resend.emails.send({
    from, to: email, subject: 'Verify your StoreAssets AI email',
    html: `<p>Your verification code is: <strong>${token}</strong></p><p>Or click: <a href="${url}">${url}</a></p>`,
  })
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/login?reset=${token}&email=${encodeURIComponent(email)}`
  await resend.emails.send({
    from, to: email, subject: 'Reset your StoreAssets AI password',
    html: `<p>Reset your password: <a href="${url}">${url}</a></p><p>This link expires in 1 hour.</p>`,
  })
}

export async function sendJobCompleteEmail(email: string, projectName: string, jobId: string): Promise<void> {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/projects/${jobId}/results`
  await resend.emails.send({
    from, to: email, subject: `Your assets for ${projectName} are ready!`,
    html: `<p>Your assets for <strong>${projectName}</strong> are ready to download.</p><p><a href="${url}">View & Download</a></p>`,
  })
}

export async function sendLowCreditEmail(email: string, balance: number): Promise<void> {
  await resend.emails.send({
    from, to: email, subject: 'Your StoreAssets AI credits are running low',
    html: `<p>You have <strong>${balance}</strong> credit${balance === 1 ? '' : 's'} remaining.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/billing">Upgrade to Pro</a> for 30 credits/month.</p>`,
  })
}
