'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'

export default function TrackSearchPage() {
  const [code, setCode] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.trim()) router.push(`/track/${code.trim().toUpperCase()}`)
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="text-5xl mb-6">📍</div>
          <h1 className="font-display font-extrabold text-3xl text-navy mb-3">
            Track your shipment
          </h1>
          <p className="text-navy/50 mb-8">
            Enter your Haulink tracking code to see live status updates.
          </p>
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="HL-UYO-4821"
              className="form-input flex-1 font-mono text-center tracking-widest"
            />
            <button
              type="submit"
              className="bg-navy text-white px-6 py-3 rounded-xl font-display
                         font-bold hover:bg-navy-mid transition-all flex items-center gap-2"
            >
              <Search size={16} />
              Track
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
