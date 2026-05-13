'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name, phone: form.phone },
      },
    })

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }

    toast.success('Account created!')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-ink relative overflow-hidden font-grotesk flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 slot-grid-dark pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-10">
          <Link href="/" className="flex items-baseline font-serif-display font-medium text-[24px] tracking-[-0.02em] text-white">
            <span className="w-[9px] h-[9px] rounded-full bg-green-brand mr-3 self-center"
              style={{ boxShadow: '0 0 0 4px rgba(46,204,82,0.18)' }} />
            Hau<em className="font-serif-italic text-green-brand font-normal">link</em>
          </Link>
        </div>

        <div className="bg-paper rounded-3xl p-10 shadow-2xl shadow-black/40 border border-white/[0.06]">
          <div className="eyebrow mb-4 flex items-center gap-2.5" style={{ color: 'rgba(13,27,62,0.55)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-brand" />
            Merchant access
          </div>

          <h1 className="font-grotesk font-medium text-[32px] leading-[1] tracking-[-0.035em] text-ink mb-8">
            Create your{' '}
            <em className="font-serif-italic text-green-deep font-normal">account.</em>
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-[11px] tracking-[0.2em] uppercase font-medium text-muted mb-2">
                Full name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="Ada Okonkwo"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-[11px] tracking-[0.2em] uppercase font-medium text-muted mb-2">
                Phone
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                placeholder="+234 801 234 5678"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-[11px] tracking-[0.2em] uppercase font-medium text-muted mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => update('email', e.target.value)}
                placeholder="ada@business.ng"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-[11px] tracking-[0.2em] uppercase font-medium text-muted mb-2">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={e => update('password', e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full inline-flex items-center justify-center gap-2.5 bg-ink text-white font-medium text-[14px] px-5 py-3.5 rounded-full hover:-translate-y-px hover:bg-green-deep transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {isLoading ? 'Creating account…' : 'Create account'}
              {!isLoading && <ArrowRight size={14} />}
            </button>
          </form>

          <p className="mt-7 text-center text-[13px]" style={{ color: 'rgba(13,27,62,0.55)' }}>
            Already have an account?{' '}
            <Link href="/auth/login" className="text-green-deep font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
