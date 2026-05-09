import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy:  { DEFAULT: '#0D1B3E', mid: '#162952', light: '#1e3a6e' },
        ink:   { DEFAULT: '#0A0F22', soft: '#162236' },
        dark:  { DEFAULT: '#0A0A0A', mid: '#111111', light: '#1A1A1A' },
        green: {
          brand: '#2ECC52',
          dark:  '#1fa33e',
          deep:  '#0e6a28',
          muted: 'rgba(46,204,82,0.12)',
        },
        cream: '#F5F2EC',
        sand:  '#EDE8DF',
        paper: '#FBF9F4',
        line:  'rgba(13,27,62,0.08)',
        'line-strong': 'rgba(13,27,62,0.16)',
        muted: 'rgba(13,27,62,0.55)',
      },
      fontFamily: {
        // Sans / UI / headlines
        grotesk: ['var(--font-grotesk)', 'Space Grotesk', 'sans-serif'],
        sans:    ['var(--font-grotesk)', 'Space Grotesk', 'sans-serif'],
        // Serif — editorial italic accents
        serif:   ['var(--font-serif)', 'Bodoni Moda', 'Didot', 'Georgia', 'serif'],
        display: ['var(--font-serif)', 'Bodoni Moda', 'Didot', 'Georgia', 'serif'],
      },
      letterSpacing: {
        tightest: '-0.05em',
        'tight-2': '-0.04em',
        'tight-3': '-0.03em',
      },
      animation: {
        'pulse-dot': 'pulseDot 2s infinite',
        'slide-up':  'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in':   'fadeIn 0.4s ease both',
        'marq':      'marq 40s linear infinite',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.4', transform: 'scale(1.5)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(32px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        marq: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

export default config
