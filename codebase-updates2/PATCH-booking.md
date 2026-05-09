# Codebase patch — Booking / Payment

Drop these files into your `haulink/` repo, replacing the existing ones at the same paths.

## Files to replace

```
src/app/book/page.tsx                      ← Dark editorial booking shell (top nav + roman-numeral stepper + serif italic route caption)
src/components/booking/StepPayment.tsx     ← Two-column payment: methods + wallet picker + escrow + sticky summary
```

## What changed

- **Background** is now `bg-ink` with the `slot-grid-dark` utility (same as the `How it works` section on the landing page).
- **Stepper** uses italic roman numerals (i. ii. iii. iv.) to match the landing-page Problem section vocabulary.
- **Step heads** are big Space Grotesk display with a Bodoni‑italic accent word (“cargo.”, “securely.”, “booked.”) and a serif‑italic route caption on the right.
- **StepPayment** is now a two‑column layout (≥ lg): left card on cream paper holds three numbered sections (`i.` Method → `ii.` Wallet → `iii.` Escrow), right column is a sticky summary with a 64px ₦ total, a Cardano‑blue ADA equivalent chip, dashed‑rule line items, and a pill Pay button.
- **Method tiles** stack ADA at the top with a dark gradient + italic ₳ glyph; Card and Bank Transfer sit below as quieter options. Selection state inverts to `bg-ink`.
- **Wallet picker** is a 4‑up grid (Nami / Eternl / Lace / Yoroi) with a coloured letter mark, status (`— Connected` / `Detected` / `Install →`), and a `bg-green-brand/8` selected state.
- **Escrow** is a single full‑width tile with the shield icon, the fee shown in italic serif (`+ ₦1,500`), and a green pill toggle.
- **Trust note** at the bottom: italic serif quote + three pill badges (PCI‑compliant, Cardano‑anchored, Support 24/7), shown only on step 3.

## Dependencies

No new packages — uses what's already installed (`framer-motion`, `lucide-react`, your existing `useCardanoPayment` hook, `formatNGN` / `ngnToAda` utils).

## Notes

- `StepCargo`, `StepPeople`, `StepConfirmed` aren't restyled in this patch — the new shell wraps them in the same cream `rounded-3xl` card so they look consistent until you're ready to redesign each step.
- `StepIndicator.tsx` is no longer used by `book/page.tsx` (the new stepper is inline). Safe to delete or leave around.
- `Navbar` is intentionally **not** rendered on the booking page — the dark editorial shell has its own minimal top nav.
- The local `cn()` helper inside `book/page.tsx` is just to keep the patch self‑contained; you can swap it for your existing `@/lib/utils` `cn` if you prefer.

## After dropping in

```bash
npm run dev
```

Hit `/book` — should work immediately.
