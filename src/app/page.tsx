import { Navbar } from '@/components/layout/Navbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { PricingSection } from '@/components/landing/PricingSection'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/* ─────────── MARQUEE STRIP ─────────── */
function StripMarquee() {
  const items = [
    'Standardized slots',
    'Escrow on every booking',
    'SMS + on‑chain delivery proof',
    'Pay in ₦ or ADA',
    'Built for SMEs',
    'Uyo · Calabar · Aba · Enugu · Kano',
  ]
  const all = [...items, ...items]
  return (
    <div className="border-t border-b border-line bg-cream overflow-hidden">
      <div className="flex gap-16 items-center py-4 whitespace-nowrap animate-marq text-[13px] text-muted tracking-[0.06em]"
        style={{ color: 'rgba(13,27,62,0.55)' }}>
        {all.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-3.5">
            {t}
            <span className="w-[5px] h-[5px] rounded-full bg-green-brand opacity-70" />
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─────────── HIGHWAY BAND ─────────── */
function HighwayBand() {
  return (
    <section className="relative bg-ink overflow-hidden">
      <div className="relative w-full" style={{ height: 'clamp(320px, 56vw, 640px)' }}>
        <Image
          src="/images/truck-highway.png"
          alt="Haulink trailer in transit on a highway"
          fill
          priority={false}
          className="object-cover"
          style={{ filter: 'saturate(0.92) contrast(1.02)' }}
        />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(10,15,34,0.30) 0%, rgba(10,15,34,0.05) 35%, rgba(10,15,34,0.45) 100%)' }} />
      </div>
      <div className="absolute left-0 right-0 bottom-0 py-8 text-white">
        <div className="max-w-[1240px] mx-auto px-8">
          <div className="flex justify-between items-end gap-8 flex-wrap border-t border-white/25 pt-6">
            <div>
              <div className="eyebrow mb-3.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                <span className="eyebrow-dot" />In transit
              </div>
              <div className="font-serif-italic max-w-[30ch] text-white"
                style={{ fontSize: 'clamp(22px,3vw,36px)', lineHeight: 1.1, letterSpacing: '-0.015em' }}>
                Every trailer is shared infrastructure — eight standardized slots, one route, predictable price.
              </div>
            </div>
            <div className="font-grotesk text-[13px] font-medium tracking-[0.04em] flex gap-5 items-center flex-wrap"
              style={{ color: 'rgba(255,255,255,0.55)' }}>
              <span><span className="text-green-brand mr-2">—</span>Trip 0421</span>
              <span><span className="text-green-brand mr-2">—</span>Uyo → Lagos</span>
              <span><span className="text-green-brand mr-2">—</span>ETA 2 days</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────── PROBLEM ─────────── */
function ProblemSection() {
  const problems = [
    { num: 'i.',  title: 'Fragmented, informal logistics.', desc: 'Traders waybill by bus, beg tanker drivers for roof space, or pay informal park loaders with no receipts and no recourse.' },
    { num: 'ii.', title: 'Full trailer or nothing.',         desc: 'Only big distributors can afford full trailers. SMEs and farmer cooperatives are locked out of the pricing large players enjoy every week.' },
    { num: 'iii.',title: 'Farmers exposed to shocks.',       desc: 'When export conditions shift, small producers have no reliable domestic route to fall back on. Stock spoils. Margins evaporate.' },
  ]
  return (
    <section className="py-32 px-8 bg-paper">
      <div className="max-w-[1240px] mx-auto">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-20 items-end mb-20">
          <h2 className="font-grotesk font-medium text-ink leading-[1.0] tracking-[-0.04em] text-balance"
            style={{ fontSize: 'clamp(40px, 6vw, 80px)' }}>
            Small producers can <span className="accent-it">make</span> value.<br />
            They <span className="line-through" style={{ textDecorationThickness: '2px', textDecorationColor: 'rgba(13,27,62,0.25)' }}>can&apos;t</span>{' '}
            <span className="accent-it">can</span> move it.
          </h2>
          <p className="text-base leading-[1.6] text-muted max-w-[36ch] border-l border-line-strong pl-6"
            style={{ color: 'rgba(13,27,62,0.55)' }}>
            Nigeria&apos;s 40M+ MSMEs generate enormous output, but the trade between cities is still a daily gamble — informal arrangements, cash‑in‑hand, no recourse when things go missing.
          </p>
        </div>

        <div className="grid md:grid-cols-3 border-t border-line">
          {problems.map((p) => (
            <div key={p.title} className="px-8 py-12 border-b border-line border-r last:border-r-0 hover:bg-cream transition-colors">
              <div className="font-serif-italic text-green-deep leading-[0.9] tracking-[-0.02em] mb-8" style={{ fontSize: '54px' }}>
                {p.num}
              </div>
              <h4 className="font-serif-display text-ink leading-[1.15] tracking-[-0.018em] mb-3.5 text-balance" style={{ fontSize: '26px' }}>
                {p.title}
              </h4>
              <p className="text-[14px] leading-[1.6] text-muted max-w-[34ch]" style={{ color: 'rgba(13,27,62,0.55)' }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────── HOW IT WORKS ─────────── */
function HowSection() {
  const steps = [
    { n: '01', t: 'Book a slot.',         e: 'slot',         d: 'Choose your route, pick a standardized slot — Micro, Half, Full or Bulk — and enter your cargo details in under two minutes.' },
    { n: '02', t: 'Pay securely.',        e: 'securely',     d: 'Pay by card or ADA on Cardano. Funds sit in escrow until delivery is confirmed by the receiver — never before.' },
    { n: '03', t: 'Track in real time.',  e: 'real time',    d: 'A tracking code follows every milestone — collected, loaded, in‑transit, arrived — and is auto‑shared with your receiver by SMS.' },
    { n: '04', t: 'Verified delivery.',   e: 'delivery',     d: 'Receiver confirms via OTP. Proof of delivery is timestamped and anchored on Cardano — a permanent reputation record.' },
  ]
  return (
    <section id="how" className="bg-ink text-white py-32 relative overflow-hidden">
      <div className="absolute inset-0 slot-grid-dark pointer-events-none" />
      <div className="max-w-[1240px] mx-auto px-8 relative z-10">
        <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.45)' }}>
          <span className="eyebrow-dot" />How it works
        </div>
        <h2 className="font-grotesk font-medium leading-[0.95] tracking-[-0.045em] mt-8 mb-20 text-balance"
          style={{ fontSize: 'clamp(44px, 7vw, 104px)' }}>
          Book. Pay. <span className="accent-it" style={{ color: '#2ECC52' }}>Track.</span><br />Deliver.
        </h2>

        <div className="grid md:grid-cols-4 border-t border-white/10">
          {steps.map((s) => {
            const parts = s.t.split(s.e)
            return (
              <div key={s.n} className="p-7 pb-14 border-b border-r border-white/10 last:border-r-0 hover:bg-white/[0.025] transition-colors">
                <div className="flex items-center gap-2.5 mb-8">
                  <div className="w-6 h-px bg-green-brand" />
                  <span className="text-[11px] tracking-[0.22em] uppercase font-medium text-green-brand">Step {s.n}</span>
                </div>
                <h4 className="font-serif-display text-white leading-[1.1] tracking-[-0.02em] mb-3.5 text-balance" style={{ fontSize: '30px' }}>
                  {parts[0]}<span className="accent-it" style={{ color: '#2ECC52' }}>{s.e}</span>{parts[1]}
                </h4>
                <p className="text-[13.5px] leading-[1.65] text-white/55">{s.d}</p>
              </div>
            )
          })}
        </div>

        {/* Inline feature image */}
        <div className="mt-20 rounded-3xl overflow-hidden relative border border-white/10">
          <div className="relative w-full" style={{ height: 'clamp(280px, 42vw, 520px)' }}>
            <Image src="/images/truck-dock.png" alt="Haulink trailer at a loading dock with bay numbers" fill className="object-cover" style={{ filter: 'saturate(0.95)' }} />
          </div>

          <div className="absolute left-8 top-8 flex gap-2.5 flex-wrap">
            <div className="px-3.5 py-2 rounded-full bg-ink/55 backdrop-blur border border-white/15 text-white text-[11px] tracking-[0.18em] uppercase font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-brand mr-2 align-[1px]" style={{ boxShadow: '0 0 0 4px rgba(46,204,82,0.25)' }} />
              Bay 03 · Loading
            </div>
            <div className="px-3.5 py-2 rounded-full bg-ink/55 backdrop-blur border border-white/15 text-white text-[11px] tracking-[0.18em] uppercase font-medium">
              Slot 4 / 8 booked
            </div>
          </div>

          <div className="absolute left-8 right-8 bottom-8 flex justify-between items-end gap-6 flex-wrap text-white">
            <div className="font-serif-italic max-w-[36ch] leading-[1.15] tracking-[-0.015em]"
              style={{ fontSize: 'clamp(20px,2.4vw,30px)', textShadow: '0 2px 24px rgba(0,0,0,0.5)' }}>
              A working dock, a structured trailer — the smallest trader steps onto the same shelf as the largest distributor.
            </div>
            <div className="flex flex-col items-end gap-1.5 font-grotesk font-medium" style={{ textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}>
              <div className="text-white tracking-[-0.04em] leading-none" style={{ fontSize: 'clamp(28px,3.6vw,46px)' }}>04 / 08</div>
              <div className="text-[11px] tracking-[0.2em] uppercase font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>slots loaded · today</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────── CTA ─────────── */
function CtaBanner() {
  return (
    <section id="book" className="py-40 px-8 bg-paper text-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <Image src="/images/truck-loading.png" alt="" fill className="object-cover opacity-[0.22]" />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, var(--paper) 0%, rgba(251,249,244,0.55) 35%, rgba(251,249,244,0.9) 100%)'
        }} />
      </div>
      <div className="max-w-[1240px] mx-auto relative z-10">
        <div className="eyebrow mb-8"><span className="eyebrow-dot" />Pilot route · Uyo → Lagos</div>
        <h2 className="font-grotesk font-medium text-ink leading-[0.95] tracking-[-0.05em] mb-8 text-balance"
          style={{ fontSize: 'clamp(56px, 9vw, 140px)' }}>
          Ready to move<br /><span className="accent-it">your goods?</span>
        </h2>
        <p className="text-[17px] leading-[1.55] text-muted max-w-[42ch] mx-auto mb-11"
          style={{ color: 'rgba(13,27,62,0.55)' }}>
          Join the pilot. Book your first slot and ship with the structure usually reserved for large distributors — at a fraction of the price.
        </p>
        <Link href="/book" className="inline-flex items-center gap-2.5 bg-ink text-white font-medium text-[15px] px-7 py-4 rounded-full hover:-translate-y-px hover:bg-green-deep transition-all">
          Book a slot
          <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  )
}

/* ─────────── FOOTER ─────────── */
function Footer() {
  return (
    <footer className="bg-ink text-white py-24 px-8">
      <div className="max-w-[1240px] mx-auto">
        <div className="grid md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-12 pb-16 border-b border-white/10">
          <div>
            <div className="font-serif-display font-medium text-[32px] tracking-[-0.02em] flex items-baseline mb-5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-brand mr-3 self-center"
                style={{ boxShadow: '0 0 0 4px rgba(46,204,82,0.16)' }} />
              Hau<em className="font-serif-italic text-green-brand">link</em>
            </div>
            <p className="font-serif-italic text-[22px] leading-[1.3] max-w-[28ch] tracking-[-0.01em]"
              style={{ color: 'rgba(255,255,255,0.7)' }}>
              Containerizing trailer space, so the smallest trader can ship like the largest distributor.
            </p>
          </div>

          {[
            { h: 'Product', items: [
              { l: 'How it works', href: '/#how' },
              { l: 'Pricing', href: '/#pricing' },
              { l: 'Book a slot', href: '/book' },
              { l: 'Track shipment', href: '/track' },
            ] },
            { h: 'Pilot routes', items: [
              { l: 'Uyo → Lagos' }, { l: 'Calabar → Lagos' }, { l: 'Aba → Abuja' }, { l: 'Enugu → Lagos' },
            ] },
            { h: 'Company', items: [
              { l: 'About', href: '#' },
              { l: 'Building in public', href: '#' },
              { l: 'Contact', href: '#' },
              { l: 'X / @haulink', href: '#' },
            ] },
          ].map((col) => (
            <div key={col.h}>
              <h5 className="text-[11px] tracking-[0.22em] uppercase font-medium mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>{col.h}</h5>
              <div className="space-y-1.5">
                {col.items.map((it) => (
                  'href' in it ? (
                    <Link key={it.l} href={it.href} className="block text-[14px] py-1.5 transition-colors hover:text-green-brand"
                      style={{ color: 'rgba(255,255,255,0.7)' }}>{it.l}</Link>
                  ) : (
                    <div key={it.l} className="block text-[14px] py-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>{it.l}</div>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center flex-wrap gap-4 pt-8 text-[12px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          <div>© 2026 Haulink · Building in public · Gimbalabs Piece of Pie</div>
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 text-[11px] tracking-[0.18em] uppercase"
            style={{ color: 'rgba(255,255,255,0.55)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-brand" style={{ boxShadow: '0 0 0 4px rgba(46,204,82,0.2)' }} />
            Pilot live · Uyo → Lagos
          </span>
        </div>
      </div>
    </footer>
  )
}

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <StripMarquee />
      <HighwayBand />
      <ProblemSection />
      <HowSection />
      <PricingSection />
      <CtaBanner />
      <Footer />
    </main>
  )
}
