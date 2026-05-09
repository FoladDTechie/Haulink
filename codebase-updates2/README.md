# Codebase patch — Editorial typography redesign

Drop these files into your `haulink/` repo, replacing the existing ones at the same paths.

## Files to replace

```
src/app/layout.tsx                       ← Space Grotesk + Bodoni Moda fonts (Mabry / Ivy Presto stand-ins)
src/app/globals.css                      ← typography tokens + utilities (.accent-it, .eyebrow, .slot-grid-dark, .animate-marq)
src/app/page.tsx                         ← Hero + Marquee + HighwayBand + Problem + How + Pricing + CTA + Footer
src/components/landing/HeroSection.tsx   ← editorial hero (Space Grotesk headline, Bodoni italic accents, stat grid + quote)
src/components/landing/PricingSection.tsx← restyled tier slab (featured tier inverted)
src/components/layout/Navbar.tsx         ← serif logomark, paper bg
tailwind.config.ts                       ← font-grotesk, font-serif, ink/paper/line/muted colors, marq keyframe
```

## Files to add

```
public/images/truck-highway.png    ← in-transit hero band
public/images/truck-dock.png       ← inline feature in How section
public/images/truck-loading.png    ← tinted CTA background
```

## Files no longer used

`src/components/landing/TrailerVisual.tsx` — the hero now uses the photo + stat grid instead of the SVG trailer. You can delete it, or keep around if you want to swap back later.

## Font notes

- **Space Grotesk** (Google) is loaded via `next/font/google` as `--font-grotesk`. Stands in for Mabry — same friendly geometric sans, free + self-hostable.
- **Bodoni Moda** (Google) is loaded as `--font-serif`. Stands in for Ivy Presto Display — high-contrast didone with a true italic. Italics drive the editorial feel via the `.accent-it` utility.
- If you license real Mabry Pro / Ivy Presto Display, drop them in `app/fonts/`, register with `next/font/local`, and just keep the same `--font-grotesk` / `--font-serif` variable names — nothing else needs to change.

## After dropping in

```bash
npm run dev
```

Should work immediately. No new dependencies.
