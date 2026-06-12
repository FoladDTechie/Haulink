import type { Metadata } from 'next'
import { Space_Grotesk, Bodoni_Moda } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

// Sans — Space Grotesk (UI, body, headlines)
const grotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-grotesk',
  display: 'optional',
})

// Serif — Bodoni Moda (Ivy Presto Display alternative — italic accents, editorial)
const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'optional',
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://haulink.xyz'
  ),
  title: 'Haulink — Containerizing Trailer Space for SMEs',
  description:
    'Book, pay, and track interstate cargo shipments. Structured freight for Nigerian SMEs, traders, and farmers — powered by Cardano.',
  openGraph: {
    title: 'Haulink',
    description: 'Containerizing trailer space for SMEs. Book. Pay. Track. Deliver.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${bodoni.variable}`}>
      <body className="bg-paper font-grotesk antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0A0F22',
              color: '#fff',
              fontFamily: 'var(--font-grotesk)',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#2ECC52', secondary: '#0A0F22' },
            },
          }}
        />
      </body>
    </html>
  )
}
