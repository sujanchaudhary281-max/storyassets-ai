# StoreAssets.ai — Product & Workflow Docs

## What it does

StoreAssets.ai turns an app's basic info (name, description, category, brand color)
into a full set of App Store / Play Store marketing screenshots — sized correctly
for every required device, captioned with AI-generated headlines, styled with a
template, and optionally localized into 30 languages. Users pay with a
credit-based subscription (Stripe) and download a ready-to-upload asset pack.

Stack: Next.js (App Router) + NextAuth v5 (credentials + Google) + Prisma/Postgres
(Neon) + Stripe + OpenAI (captions & translation) + `sharp` for image rendering.

## Core domain model

| Model | Purpose |
|---|---|
| `User` | Account, credit balance, role, auth (password or OAuth) |
| `Project` | One app being marketed — name, description, category, platforms, style/template, brand color |
| `Template` | Reusable visual style (bg color/gradient, text color, frame) — global, not per-user |
| `GenerationJob` | One "render all screenshots" run for a project; tracks status/credits/zip |
| `GeneratedAsset` | A single rendered screenshot (platform + device size + caption) belonging to a job |
| `ScreenshotVersion` | Saved history of edits to a `GeneratedAsset` (undo/version trail) |
| `UploadedScreenshot` | Raw screenshots the user uploaded to be composited into frames |
| `ReferenceImage` | Brand/reference images uploaded for style guidance |
| `ProjectLocale` | A target language enabled for a project (status: draft → translated → approved) |
| `LocalizedAsset` | Translated caption (+ overflow/font-size hints) for one asset in one locale |
| `Subscription` | Stripe plan state — generation quota, project/language limits, features |
| `CreditPack` | One-off purchased credit top-up |
| `WebhookEvent` | Log of inbound webhook payloads (Stripe, generation-complete) |

## Auth

`src/lib/auth.ts` — NextAuth v5, JWT sessions.
- **Credentials**: email/password, bcrypt-hashed. Login blocked until `emailVerified` is set (see `/api/auth/verify-email`).
- **Google OAuth**: via `PrismaAdapter`.
- New users get `creditBalance = 3` free credits on account creation (`events.createUser`).
- Session carries `user.id`, `user.creditBalance`, refreshed on sign-in/update.

## Main workflow: create → generate → export

1. **Sign up / log in** (`(auth)/signup`, `(auth)/login`) → land on `(dashboard)/dashboard`.
2. **Create a project** (`(dashboard)/projects/new` → `POST /api/projects`)
   - Name, short/full description, category, target platforms (`ios`/`android`), style preset or template, brand color.
3. **Configure** (`(dashboard)/projects/[id]`)
   - Pick/override a `Template` (`PATCH /api/projects/[id]/template`) — can set separate templates per platform (`templateId`, `iosTemplateId`, `androidTemplateId`).
   - Optionally upload reference brand images (`/api/projects/[id]/reference-images`).
   - Optionally upload existing app screenshots to frame (`upload-url` → direct-to-storage upload, then `POST /api/projects/[id]/screenshots`).
   - Optionally get AI headline suggestions (`/api/projects/[id]/headlines`).
4. **Generate** — the core job:
   - `POST /api/projects/[id]/generate` — renders only the project's configured platforms.
   - `POST /api/projects/[id]/generate-all` — forces both iOS **and** Android regardless of project settings.
   - Both routes: verify auth → verify project ownership → check `creditBalance >= 1` → reject if another job is already `pending`/`processing` for this project (one active job per project) → **in one transaction**, create a `GenerationJob(status: processing)` and decrement 1 credit → kick off rendering **inline, fire-and-forget** (not a queue — see note below).
   - Rendering (`processJob`): for each platform × each required device size (`src/lib/device-sizes.ts`) × 3 screenshots, builds an SVG (background/gradient, headline, subtext, optional device "frame") and rasterizes it with `sharp` to PNG, written to `public/generated/{jobId}/screenshots/{platform}/{size}/...`. Captions come from OpenAI (`generateCaptions`) if `OPENAI_API_KEY` is set, otherwise a template fallback (`"{App Name} Feature {n}"`).
   - Each rendered PNG becomes a `GeneratedAsset` row. Job is marked `completed` with a 60-day `expiresAt`, or `failed` with `errorMessage` on error.
5. **Review results** (`(dashboard)/projects/[id]/results/[jobId]`)
   - Poll `GET /api/jobs/[jobId]` for job status, `GET /api/jobs/[jobId]/assets` for rendered images.
6. **Edit individual screenshots** (`(dashboard)/projects/[id]/editor/[assetId]`)
   - `POST .../screenshots/[assetId]/regenerate` — re-render one asset.
   - `POST .../screenshots/[assetId]/save` — persist edits, creating a `ScreenshotVersion` snapshot.
   - `GET .../screenshots/[assetId]/versions` — version history / rollback.
   - `POST .../screenshots/[assetId]/apply-all` — apply a caption/style change from one asset to all assets in the job.
   - `POST .../screenshots/reorder` — change `sortOrder` for the asset grid.
7. **Download** — `GET /api/jobs/[jobId]/download` zips the completed job's assets for export.

> **Note on jobs**: despite the `GenerationJob` model and `bullmq` dependency implying a background queue, both `generate` and `generate-all` currently run the render **inline** in the request's async context (`processJob(...).catch(...)`), not via a BullMQ worker. This works for small batches but means a serverless/edge timeout could kill an in-flight job silently (it would sit at `processing` forever, blocking new generations for that project — the "one active job" check has no auto-recovery).

## Localization workflow

1. Enable a locale for a project → creates `ProjectLocale` (`status: draft`), locale limited by plan's `maxLanguages`.
2. `POST /api/projects/[id]/locales/translate` — takes the **most recently completed** `GenerationJob`'s assets, sends each caption to OpenAI (`gpt-4o-mini`, JSON mode) for translation into the target locale, and upserts a `LocalizedAsset` per asset.
   - Detects text overflow: if the translated headline is >30% longer than the source, flags `overflowDetected` and computes a `suggestedFontSize` to compensate (useful for verbose languages like German/Finnish/Russian, see `LONG_TEXT_LOCALES`).
   - Sets `ProjectLocale.status = 'translated'`.
3. Review screen (`locales/[localeId]/review`) — human reviews/edits translated captions.
4. `POST /api/projects/[id]/locales/approve` — marks locale `approved`, ready for export in that language.

30 locales supported across Americas / Europe / Asia Pacific / Middle East & Africa (`src/lib/locales.ts`).

## Billing workflow

Plans (`src/lib/stripe.ts`):

| Plan | Monthly generations | Max projects | Max languages | Notable features |
|---|---|---|---|---|
| `starter` | 3 | 1 | 1 | — |
| `maker` | 60 | 3 | 3 | full-res export |
| `pro` | 300 | 999 | 99 | + version history, A/B variants, API read |
| `agency` | 999 | 999 | 99 | + full API, 5 seats, client workspaces, white-label |

- `POST /api/billing/checkout` — creates a Stripe Checkout session for a subscription plan, a one-off credit pack (`50` or `200` credits), or a lifetime deal. Auto-creates a Stripe customer (and a `Subscription` row defaulted to `plan: free`) on first purchase.
- `POST /api/billing/portal` — opens the Stripe customer billing portal (manage/cancel subscription).
- `POST /api/webhooks/stripe` — Stripe webhook receiver; reconciles `Subscription` state (plan changes, renewals, cancellations) and credit pack fulfillment.
- Generating a screenshot set costs **1 credit** per job (checked and decremented atomically at job creation).
- `POST /api/webhooks/generation-complete` — logs a `WebhookEvent` row for external generation-complete notifications (used if generation is later moved to an external worker/queue).

## Route map

```
(marketing)/            landing + pricing (public)
(auth)/login            credentials + Google sign-in
(auth)/signup           account creation → email verification
(dashboard)/dashboard        project list / overview
(dashboard)/projects/new     create project
(dashboard)/projects/[id]           project settings/config
  /generate                  kick off a generation job
  /results/[jobId]           view rendered assets, poll status, download
  /editor/[assetId]          per-screenshot editing + version history
  /locales                   manage target languages
  /locales/[localeId]/review approve/edit translated captions
(dashboard)/billing           plan, credits, Stripe portal
(dashboard)/settings          account settings
```

## Environment / integrations

- **Postgres (Neon)** via `@prisma/adapter-neon` — `DATABASE_URL`.
- **OpenAI** — captions (`generateCaptions`) and locale translation. Falls back gracefully to templated captions if unset.
- **Stripe** — subscriptions, credit packs, lifetime deals, billing portal, webhooks.
- **Google OAuth** — alternate sign-in.
- Rendered assets are written to `public/generated/{jobId}/...` (local/disk-based storage — check deployment target's filesystem persistence, e.g. this won't survive a redeploy on most serverless hosts without moving to S3/blob storage, which `@aws-sdk/client-s3` is already a dependency for but isn't wired into `processJob` yet).

## Known gaps worth knowing about

- Generation is inline, not queued (see note above) — no retry/resume if the process dies mid-render.
- Rendered files go to local disk, not S3, despite S3 SDK being installed.
- No rate limiting visible on generation/translation endpoints beyond the credit balance and "one active job per project" check.
