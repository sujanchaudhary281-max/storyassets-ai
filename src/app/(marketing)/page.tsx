import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, ArrowRight, Smartphone, Type, Download, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="bg-[var(--canvas)]">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        <div className="relative max-w-[1400px] mx-auto px-6 pt-24 pb-32 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--canvas-soft)] border border-[var(--hairline)] text-xs text-[var(--body)] font-mono shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--link)] animate-pulse" />
              Pay-as-you-go pricing
            </div>
          </div>

          <h1 className="text-[clamp(32px,5vw,48px)] font-semibold tracking-[-2.4px] leading-[1] mb-4 max-w-3xl mx-auto">
            Stop designing store assets.<br />Start shipping your app.
          </h1>
          <p className="text-lg text-[var(--body)] max-w-xl mx-auto mb-8 leading-7">
            Describe your app. Get a complete set of App Store and Play Store screenshot marketing assets — captions, overlays, and framed screenshots — in 90 seconds.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-[var(--radius-pill)] h-12 px-6 text-base font-medium">
              <Link href="/signup">Get Started<ArrowRight size={16} className="ml-2" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-[var(--radius-pill)] h-12 px-6 text-base font-medium">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>

        </div>
      </section>

      <section className="my-16 overflow-hidden w-full">

        <div className="marquee-track overflow-hidden cursor-pointer">
          <div className="flex gap-4 animate-marquee max-w-[1400px]">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                style={{ width: 'calc((100vw - 4 * 1rem) / 7)' }}
                className="aspect-[9/16] flex-shrink-0 rounded-[var(--radius-lg)] bg-gradient-to-b from-[#1a1a2e] to-[#16213e] flex items-center justify-center transition-transform duration-200 hover:scale-[1.03] shadow-[var(--shadow-xl)]"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#007cf0] to-[#00dfd8] opacity-60" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-[var(--canvas-soft)] py-24">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className="font-mono text-xs uppercase text-[var(--mute)] text-center mb-3">How it works</p>
          <h2 className="text-[32px] font-semibold tracking-[-1.28px] text-center mb-16">Three steps. Zero design skills.</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Describe your app', desc: 'Name, description, category. That\'s all we need to understand your brand.' },
              { step: '02', title: 'AI generates everything', desc: 'Framed screenshots with captions and overlays — all sized for the stores.' },
              { step: '03', title: 'Download and publish', desc: 'Get a ready-to-upload ZIP organized by platform. Submit to the stores.' },
            ].map(({ step, title, desc }) => (
              <Card key={step} className="shadow-[var(--shadow-md)] border-0 bg-[var(--canvas)]">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold tracking-[-0.6px] mb-2">{title}</h3>
                  <p className="text-sm text-[var(--body)] leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className="font-mono text-xs uppercase text-[var(--mute)] text-center mb-3">What you get</p>
          <h2 className="text-[32px] font-semibold tracking-[-1.28px] text-center mb-16">Every asset. Every size. Both platforms.</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Smartphone, title: 'iOS Screenshots', spec: 'Up to 5 at 1242×2688 with device frames' },
              { icon: Smartphone, title: 'Android Screenshots', spec: 'Up to 5 at 1080×1920 with device frames' },
              { icon: Type, title: 'Smart Captions', spec: 'AI-generated marketing headlines & subtexts' },
              { icon: Download, title: 'ZIP Download', spec: 'Organized by platform, ready to upload' },
            ].map(({ icon: Icon, title, spec }) => (
              <div key={title} className="flex items-start gap-3 p-4 rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--canvas)]">
                <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--canvas-soft-2)] flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-[var(--body)]" />
                </div>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-[var(--mute)] mt-0.5">{spec}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--canvas-soft)] py-24">
        <div className="max-w-[1400px] mx-auto px-6 text-center">
          <p className="font-mono text-xs uppercase text-[var(--mute)] mb-3">Early access</p>
          <h2 className="text-[32px] font-semibold tracking-[-1.28px] mb-12">Be one of our first users.</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Alex R.', role: 'Indie iOS Dev', quote: 'I used to spend an entire weekend on store assets. Now it takes 2 minutes.' },
              { name: 'Sarah K.', role: 'Flutter Developer', quote: 'The screenshot framing alone is worth it. Perfect device mockups every time.' },
              { name: 'Marcus T.', role: 'Startup Founder', quote: 'We launched 3 apps last month. StoreAssets AI saved us from hiring a designer.' },
            ].map(({ name, role, quote }) => (
              <Card key={name} className="shadow-[var(--shadow-sm)] text-left">
                <CardContent className="p-6">
                  <p className="text-sm text-[var(--body)] mb-4 leading-relaxed">&ldquo;{quote}&rdquo;</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--canvas-soft-2)]" />
                    <div>
                      <p className="text-sm font-medium">{name}</p>
                      <p className="text-xs text-[var(--mute)]">{role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-[1400px] mx-auto px-6 text-center">
          <p className="font-mono text-xs uppercase text-[var(--mute)] mb-3">Pricing</p>
          <h2 className="text-[32px] font-semibold tracking-[-1.28px] mb-12">Simple pricing. Pay as you go.</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto text-left">
            {[
              { name: 'Starter', price: '$5', period: '/month', featured: false, features: ['1 project', '3 generations/month', '1 language (English)', 'All device sizes', 'AI captions & overlays', 'PNG + ZIP downloads'], cta: 'Get Starter' },
              { name: 'Maker', price: '$19', period: '/month', featured: true, features: ['3 projects', '60 generations/month', '3 languages', 'Full-res export', 'Template gallery', 'AI captions & overlays', 'Drag-to-reorder editor'], cta: 'Get Maker' },
              { name: 'Pro', price: '$49', period: '/month', featured: false, features: ['Unlimited projects', '300 generations/month', 'Unlimited languages', 'Version history', 'A/B headline variants', 'API read access', 'Priority support'], cta: 'Get Pro' },
              { name: 'Agency', price: '$129', period: '/month', featured: false, features: ['Everything in Pro', '5 team seats', 'Client workspaces', 'White-label export', 'Full API access', 'Dedicated support'], cta: 'Get Agency' },
            ].map(tier => (
              <Card key={tier.name} className={`shadow-[var(--shadow-lg)] ${tier.featured ? 'bg-[var(--ink)] text-[var(--on-primary)] border-[var(--ink)] ring-2 ring-[var(--link)] ring-offset-2' : ''}`}>
                <CardContent className="p-6">
                  <h3 className="text-base font-semibold mb-1">{tier.name}</h3>
                  <p className="mb-5">
                    <span className="text-3xl font-semibold tracking-[-2px]">{tier.price}</span>
                    <span className={`text-sm ${tier.featured ? 'opacity-70' : 'text-[var(--mute)]'}`}>{tier.period}</span>
                  </p>
                  <ul className="space-y-2.5 mb-6">
                    {tier.features.map(f => (
                      <li key={f} className={`flex items-start gap-2 text-sm ${tier.featured ? 'opacity-90' : 'text-[var(--body)]'}`}>
                        <Check size={14} className={`mt-0.5 shrink-0 ${tier.featured ? 'opacity-70' : 'text-[var(--success)]'}`} />{f}
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant={tier.featured ? 'secondary' : 'outline'} className="w-full rounded-[var(--radius-pill)] h-10 text-sm">
                    <Link href="/signup">{tier.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-[var(--canvas-soft)] py-24">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-[32px] font-semibold tracking-[-1.28px] text-center mb-12">FAQ</h2>
          <div className="space-y-6">
            {[
              { q: 'Do I need design skills?', a: 'No. Just describe your app.' },
              { q: 'What file formats do I get?', a: 'PNG at all required sizes, organized by platform in a ZIP.' },
              { q: 'Can I regenerate if I don\'t like the result?', a: 'Yes, each generation costs 1 credit.' },
              { q: 'Do you support both iOS and Android?', a: 'Yes, simultaneously in one generation job.' },
              { q: 'Is my app description stored?', a: 'Yes, as part of your project. You can delete it anytime.' },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-[var(--hairline)] pb-6">
                <h3 className="text-base font-medium mb-2">{q}</h3>
                <p className="text-sm text-[var(--body)]">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 text-center">
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className="text-[32px] font-semibold tracking-[-1.28px] mb-4">Your first app asset is 90 seconds away.</h2>
          <p className="text-[var(--body)] mb-8">Professional store assets. Pay-as-you-go pricing.</p>
          <Button asChild size="lg" className="rounded-[var(--radius-pill)] h-12 px-8 text-base font-medium">
            <Link href="/signup">Get Started<Zap size={16} className="ml-2" /></Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
