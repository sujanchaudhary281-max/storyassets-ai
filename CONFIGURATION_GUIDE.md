# Configuration Guide

This guide covers all the services and APIs you need to replace or configure for your StoreAssets AI application.

---

## 1. 🔐 Authentication (NextAuth.js)

### Environment Variables

```env
# Required: Generate a random secret for NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-here
```

### Generate NextAuth Secret

```bash
# Run this to generate a secure random secret
openssl rand -base64 32
```

### Google OAuth (Optional)

If you want to enable Google Sign-In:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Remove Google OAuth

If you don't want Google authentication, edit `src/lib/auth.ts` and remove the Google provider from the `providers` array.

---

## 2. 🗄️ Database (PostgreSQL)

### Local Development

Install PostgreSQL locally or use Docker:

```bash
# Using Docker
docker run --name storeassets-db -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres
```

### Environment Variable

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/storeassets?schema=public"
```

### Cloud Options

**Recommended providers:**
- [Neon](https://neon.tech/) - Serverless Postgres (Free tier available)
- [Supabase](https://supabase.com/) - Postgres with auth (Free tier available)
- [Railway](https://railway.app/) - Postgres hosting
- [Render](https://render.com/) - Managed PostgreSQL

### Apply Migrations

After setting up your database:

```bash
npx prisma migrate deploy
npx prisma generate
```

---

## 3. 📦 File Storage (Cloudflare R2)

R2 is used for storing uploaded screenshots, generated assets, and app icons.

### Setup Cloudflare R2

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to R2 Object Storage
3. Create a new bucket (e.g., `storeassets-media`)
4. Create API token with R2 Edit permissions

### Environment Variables

```env
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=storeassets-media
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

### Alternative: AWS S3

If you prefer S3 over R2, you'll need to update `src/lib/r2.ts` to use AWS SDK v3:

```bash
npm install @aws-sdk/client-s3
```

---

## 4. 🤖 AI Services (OpenAI)

OpenAI is used for generating captions and headlines.

### Get API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys
4. Create a new secret key

### Environment Variable

```env
OPENAI_API_KEY=sk-proj-your-openai-api-key
```

### Cost Considerations

The app uses `gpt-4o-mini` model which is cost-effective:
- ~$0.01-0.02 per project generation
- Consider adding rate limits if needed

---

## 5. 📧 Email Service (Resend)

Used for sending transactional emails (verification, password reset, etc.)

### Setup Resend

1. Go to [Resend](https://resend.com/)
2. Sign up for free account
3. Verify your domain (or use their dev domain for testing)
4. Create API key

### Environment Variable

```env
RESEND_API_KEY=re_your-resend-api-key
FROM_EMAIL=noreply@yourdomain.com
```

### Alternative: SendGrid, Postmark, AWS SES

Edit `src/lib/resend.ts` to use your preferred email service.

---

## 6. 💳 Payments (Stripe)

Stripe handles subscriptions and credit purchases.

### Setup Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your API keys from Developers > API Keys
3. Create products and pricing in Products section
4. Set up webhook endpoint

### Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Create these product prices in Stripe Dashboard
STRIPE_PRICE_ID_BASIC=price_xxxxx
STRIPE_PRICE_ID_PRO=price_xxxxx
STRIPE_PRICE_ID_CREDITS_10=price_xxxxx
STRIPE_PRICE_ID_CREDITS_50=price_xxxxx
```

### Webhook Setup

1. Go to Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Testing Webhooks Locally

```bash
# Install Stripe CLI
npm install -g stripe

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 7. 🔴 Redis (Optional - Job Queue)

Redis is optional but recommended for production job queuing.

### Local Development

```bash
# Using Docker
docker run --name storeassets-redis -p 6379:6379 -d redis
```

### Environment Variable

```env
REDIS_URL=redis://localhost:6379
```

### Cloud Options

- [Upstash](https://upstash.com/) - Serverless Redis (Free tier)
- [Redis Cloud](https://redis.com/cloud/) - Managed Redis
- Railway/Render also offer Redis

### Skip Redis

If you don't want to use Redis, the app will fall back to in-memory processing. No code changes needed.

---

## 8. 🔧 Optional Configurations

### Developer Unlimited Access

To give yourself unlimited credits during development:

1. Set your user role to `admin` in the database:

```sql
UPDATE users SET "isAdmin" = true, "role" = 'admin' WHERE email = 'your@email.com';
```

2. Or update `src/middleware.ts` to bypass credit checks for your user ID

### Content Moderation

Edit `src/lib/content-policy.ts` to configure content filtering rules.

### Device Sizes

Edit `src/lib/device-sizes.ts` to add/modify screenshot dimensions for different devices.

---

## 📋 Complete .env.local Template

Create this file in the root of your project:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/storeassets"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudflare R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=storeassets-media
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev

# OpenAI
OPENAI_API_KEY=sk-proj-your-key

# Resend
RESEND_API_KEY=re_your-key
FROM_EMAIL=noreply@yourdomain.com

# Stripe
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-secret
STRIPE_PRICE_ID_BASIC=price_xxxxx
STRIPE_PRICE_ID_PRO=price_xxxxx
STRIPE_PRICE_ID_CREDITS_10=price_xxxxx
STRIPE_PRICE_ID_CREDITS_50=price_xxxxx

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Environment
NODE_ENV=development
```

---

## 🚀 Quick Start Checklist

- [ ] Set up PostgreSQL database
- [ ] Run `npx prisma migrate deploy`
- [ ] Set up Cloudflare R2 bucket
- [ ] Get OpenAI API key
- [ ] Set up Resend account
- [ ] Create Stripe account and products
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Fill in all environment variables
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Test sign up and create first project

---

## 💡 Cost Estimates (Monthly)

**Minimal Setup (Solo Developer)**
- Database: Free (Neon free tier)
- R2 Storage: ~$0.015/GB (free for small usage)
- OpenAI: ~$5-20 (depends on usage)
- Resend: Free (up to 3,000 emails/month)
- Stripe: Free (pay per transaction)

**Total**: ~$5-20/month for development/small scale

**Production (100 users)**
- Database: ~$20-50
- R2 Storage: ~$5-15
- OpenAI: ~$50-200
- Resend: ~$10
- Stripe: Transaction fees only

**Total**: ~$85-275/month

---

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Test connection
npx prisma db push
```

### R2 Upload Failures
- Check bucket permissions
- Verify CORS settings in R2 dashboard
- Ensure API token has Edit permissions

### Stripe Webhook Not Working
- Use Stripe CLI for local testing
- Check webhook signature verification
- Verify endpoint is publicly accessible

### OpenAI Rate Limits
- Set up usage limits in OpenAI dashboard
- Implement rate limiting in your app
- Consider caching generated content

---

**Need Help?** Check the main `README.md` for more details or refer to each service's documentation.
