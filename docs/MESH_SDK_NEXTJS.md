# Integrating Mesh SDK with Next.js 14 (App Router)

Lessons from Haulink's production integration — real errors, real fixes.

---

## The Problem

Mesh SDK ships WebAssembly (`.wasm`) files and depends on `libsodium-wrappers-sumo`. Both cause build or runtime failures in Next.js 14 with webpack 5. Common errors:

- `Module parse failed: Unexpected character` — webpack encounters a `.wasm` file it can't parse
- `Can't resolve './libsodium-sumo.mjs'` — missing ESM file in the `libsodium-wrappers-sumo` package
- `Conversion of type 'Window & typeof globalThis'` — TypeScript rejects direct `window.cardano` access
- `Type 'Set<string>' can only be iterated with downlevelIteration` — tsconfig target too old for Mesh dependencies
- `Multiple GoTrueClient instances detected` — Supabase browser client recreated on every render

---

## Fix 1 — `next.config.js`: WebAssembly + server externals

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Enable async WebAssembly — required by @meshsdk/core-csl
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    }

    // Explicitly type .wasm files — Next.js asset rules can intercept
    // them before the asyncWebAssembly experiment applies
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    })

    // Keep Mesh and libsodium out of the server bundle entirely —
    // they are browser-only and will error if bundled for Node.js
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        '@meshsdk/core',
        '@meshsdk/react',
        '@meshsdk/core-csl',
        'libsodium-wrappers-sumo',
        'libsodium-sumo',
      ]
    }

    return config
  },
}

module.exports = nextConfig
```

---

## Fix 2 — Missing `libsodium-sumo.mjs`

**Root cause:** `libsodium-wrappers-sumo`'s ESM build imports `./libsodium-sumo.mjs` as a relative sibling, but that file only ships inside the separate `libsodium-sumo` package. On a clean install it is absent, causing the `Can't resolve` error.

**Fix — `package.json` postinstall script:**

```json
{
  "scripts": {
    "postinstall": "cp node_modules/libsodium-sumo/dist/modules-sumo-esm/libsodium-sumo.mjs node_modules/libsodium-wrappers-sumo/dist/modules-sumo-esm/libsodium-sumo.mjs 2>/dev/null || true"
  }
}
```

This copies the file into place after every `npm install`. It is essential on **Vercel**, which runs a fresh `npm install` on every deploy — without it, the build will fail in CI even if it works locally.

---

## Fix 3 — Dynamic imports (never import Mesh at module level)

All Mesh imports must be dynamic and client-side only. Static top-level imports are evaluated during SSR and will crash the server bundle.

**Correct:**

```ts
// Inside an async function, after confirming typeof window !== 'undefined'
const { BrowserWallet, Transaction } = await import('@meshsdk/core')
```

**Never:**

```ts
import { BrowserWallet } from '@meshsdk/core' // breaks SSR — do not use
```

---

## Fix 4 — TypeScript: `window.cardano` type narrowing

TypeScript won't let you access `window.cardano` directly because `Window & typeof globalThis` doesn't declare it. Use a double-cast:

```ts
const cardano = (
  window as unknown as Record<string, Record<string, unknown>>
).cardano
```

---

## Fix 5 — `tsconfig.json` target

Mesh dependencies use `Set` iteration and other ES2017+ features. If `target` is `ES5` or `ES6`, TypeScript emits downlevel code that breaks at runtime.

```json
{
  "compilerOptions": {
    "target": "ES2017"
  }
}
```

---

## Fix 6 — Supabase + Mesh singleton conflict

If you use Supabase auth alongside Mesh, creating a new `BrowserClient` inside a component or hook causes the `Multiple GoTrueClient instances` warning, which leads to auth state inconsistencies (session lost on navigation, duplicate listeners).

**Wrong — creates a new client on every render:**

```ts
// Inside a component or hook
const supabase = createBrowserClient(url, key) // ❌
```

**Correct — singleton module:**

```ts
// lib/supabase-browser.ts
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)
```

Import `supabase` from this module everywhere. Never call `createBrowserClient()` inside a component or hook.

---

## CIP-0020 Metadata — booking and POD anchoring

Attach structured metadata to Cardano transactions using label `674` (the CIP-0020 standard for on-chain messages):

```ts
tx.setMetadata(674, {
  msg: [
    "Haulink booking",
    trackingCode,            // e.g. "HLK-2024-ABCD"
    origin + " to " + destination,  // e.g. "Uyo to Lagos"
  ],
})
```

**64-byte limit per string:** each entry in the `msg` array must be ≤ 64 bytes (UTF-8). For longer strings, split across multiple array items:

```ts
msg: [
  "First 64 bytes or fewer here",
  "Continuation of the long string here",
]
```

---

## Tested Environment

| Package | Version |
|---|---|
| Next.js | 14.2.x |
| `@meshsdk/core` | 1.7.x |
| `@meshsdk/react` | 1.4.x |
| Node.js | 20.x (18.x causes engine warnings with Mesh) |
| Wallet | Eternl on Cardano mainnet (production) |

---

## References

- Mesh SDK docs: [meshjs.dev](https://meshjs.dev)
- CIP-0020 (transaction metadata): [github.com/cardano-foundation/CIPs/tree/master/CIP-0020](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0020)
- Cardano preprod faucet: [docs.cardano.org/cardano-testnet/tools/faucet](https://docs.cardano.org/cardano-testnet/tools/faucet)
- Haulink repo (working implementation): [github.com/FoladDTechie/Haulink](https://github.com/FoladDTechie/Haulink)
