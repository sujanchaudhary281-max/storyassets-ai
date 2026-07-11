# StoreAssets AI

AI-powered App Store & Play Store marketing asset generator. Describe your app, get a complete set of store-ready assets (logo, icons at every size, framed screenshots with captions, feature graphic) in 90 seconds.

## Prerequisites

- Node.js 20+
- PostgreSQL (Neon recommended)
- Redis (Upstash recommended)
- npm

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.local.example .env.local
# Fill in all values (see Environment Variables below)

# 3. Generate Prisma client
npx prisma generate

# 4. Push schema to database
npx prisma db push

# 5. Start development server
npm run dev

# 6. In a separate terminal, start the generation worker
npx tsx src/workers/generation.worker.ts
```

## Environment Variables

| Variable | Description | Where to get |
|----------|-------------|--------------|
| `DATABASE_URL` | PostgreSQL connection string | [neon.tech](https://neon.tech) |
| `AUTH_SECRET` | NextAuth secret (generate with `openssl rand -base64 32`) | Local |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | [Google Cloud Console](https://console.cloud.google.com) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Same as above |
| `OPENAI_API_KEY` | OpenAI API key | [platform.openai.com](https://platform.openai.com/api-keys) |
| `CLOUDFLARE_R2_ACCOUNT_ID` | R2 account ID | [Cloudflare Dashboard](https://dash.cloudflare.com) |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | R2 API token access key | Same |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | R2 API token secret | Same |
| `CLOUDFLARE_R2_BUCKET_NAME` | R2 bucket name | `storeassets-ai-assets` |
| `CLOUDFLARE_R2_PUBLIC_URL` | R2 public bucket URL | After enabling public access |
| `UPSTASH_REDIS_URL` | Redis connection URL | [console.upstash.com](https://console.upstash.com) |
| `STRIPE_SECRET_KEY` | Stripe secret key | [dashboard.stripe.com](https://dashboard.stripe.com/apikeys) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Same |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Stripe webhooks page |
| `STRIPE_PRO_PRICE_ID` | Stripe Price ID for Pro plan ($19/mo) | Create product in Stripe |
| `RESEND_API_KEY` | Resend email API key | [resend.com](https://resend.com) |
| `RESEND_FROM_EMAIL` | Verified sender email | Resend domain settings |
| `REMOVE_BG_API_KEY` | remove.bg API key | [remove.bg/api](https://www.remove.bg/api) |

## Manual Setup Checklist

- [ ] Create Neon PostgreSQL database and set `DATABASE_URL`
- [ ] Create Google OAuth credentials and set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- [ ] Create OpenAI API key and set `OPENAI_API_KEY`
- [ ] Create Cloudflare R2 bucket named `storeassets-ai-assets`, enable public access, create API token
- [ ] Create Stripe account, create Pro product at $19/mo, get price ID, set up webhook endpoint
- [ ] Create Resend account, verify sending domain, get API key
- [ ] Create remove.bg account and get API key
- [ ] Create Upstash Redis database and get Redis URL
- [ ] Add device frame PNGs to `/public/frames/` (see `/public/frames/README.md`)
- [ ] Run `npx prisma db push` to create database tables
- [ ] Run `npx prisma generate` to generate Prisma client

## Running

```bash
# Development
npm run dev

# Worker (separate terminal)
npx tsx src/workers/generation.worker.ts

# Build for production
npm run build
npm start
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth v5
- **Storage**: Cloudflare R2 (S3-compatible)
- **Queue**: BullMQ + Upstash Redis
- **AI**: OpenAI (GPT-4o-mini + DALL-E 3)
- **Payments**: Stripe
- **Email**: Resend
- **UI**: shadcn/ui + Radix + Tailwind CSS
- **Design**: Vercel design language (Geist fonts, stacked shadows, ink-on-white)

## Known Limitations (MVP)

- Device frame compositing uses placeholder rectangles until real frame PNGs are added
- Password reset flow is UI-only (form present but not wired to backend)
- Notifications settings are stored client-side only
- No real-time WebSocket updates (uses polling every 3s)
- ZIP bundle includes README but does not re-download assets from R2 (optimization pending)
