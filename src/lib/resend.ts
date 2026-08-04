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

export async function sendPasswordResetCodeEmail(email: string, code: string): Promise<void> {
  await resend.emails.send({
    from,
    to: email,
    subject: 'Your StoreAssets AI password reset code',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px;">
        <h2 style="font-weight: 600; font-size: 20px; color: #111; margin-bottom: 8px;">Reset your password</h2>
        <p style="font-size: 14px; color: #555; line-height: 1.5;">Use the 6-digit verification code below to reset your StoreAssets AI password. This code will expire in 15 minutes.</p>
        <div style="background-color: #f4f4f5; padding: 18px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; font-family: monospace; color: #111;">${code}</span>
        </div>
        <p style="font-size: 12px; color: #888; margin-top: 16px;">If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `,
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
