import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ADA_NGN_RATE } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNGN(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function ngnToAda(ngn: number): number {
  return Math.ceil((ngn / ADA_NGN_RATE) * 10) / 10
}

export function generateTrackingCode(origin: string): string {
  const prefix = origin.slice(0, 3).toUpperCase()
  const num = Math.floor(1000 + Math.random() * 9000)
  return `HL-${prefix}-${num}`
}

export function getStatusIndex(status: string): number {
  const order = ['booked', 'collected', 'loaded', 'in_transit', 'arrived', 'delivered']
  return order.indexOf(status)
}

export function shimmer(w: number, h: number) {
  return `
    <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#f0ece4" offset="20%" />
          <stop stop-color="#e8e3da" offset="50%" />
          <stop stop-color="#f0ece4" offset="70%" />
        </linearGradient>
        <animateTransform attributeName="gradientTransform" type="translate" values="-1 0; 1 0; -1 0" dur="1.5s" repeatCount="indefinite"/>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#g)" />
    </svg>`
}

export function toBase64(str: string) {
  return typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str)
}
