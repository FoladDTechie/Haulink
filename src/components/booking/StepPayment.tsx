'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, AlertCircle, Loader2, ChevronDown, CheckCircle2 } from 'lucide-react'
import { cn, formatNGN, ngnToAda } from '@/lib/utils'
import { useCardanoPayment, getAvailableWallets, type WalletName } from '@/hooks/useCardanoPayment'
import type { BookingFormData } from '@/types'

interface Props {
  form: BookingFormData
  totalNGN: number
  tierName: string
  escrowFeeNGN: number
  basePriceNGN: number
  isSubmitting: boolean
  update: (field: keyof BookingFormData, value: string | boolean) => void
  onSubmit: (cardanoTxHash?: string) => void
  onBack: () => void
}

type PayMethod = 'ada' | 'card' | 'transfer'

const ADA_ICON = (
  <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor">
    <circle cx="16" cy="16" r="16" fill="#0033AD" />
    <circle cx="16" cy="16" r="5" fill="white" fillOpacity="0.9" />
    <circle cx="16" cy="6"  r="2.5" fill="white" fillOpacity="0.7" />
    <circle cx="16" cy="26" r="2.5" fill="white" fillOpacity="0.7" />
    <circle cx="6"  cy="16" r="2.5" fill="white" fillOpacity="0.7" />
    <circle cx="26" cy="16" r="2.5" fill="white" fillOpacity="0.7" />
    <circle cx="9.5"  cy="9.5"  r="2" fill="white" fillOpacity="0.5" />
    <circle cx="22.5" cy="9.5"  r="2" fill="white" fillOpacity="0.5" />
    <circle cx="9.5"  cy="22.5" r="2" fill="white" fillOpacity="0.5" />
    <circle cx="22.5" cy="22.5" r="2" fill="white" fillOpacity="0.5" />
  </svg>
)

export function StepPayment({
  form, totalNGN, tierName, escrowFeeNGN, basePriceNGN,
  isSubmitting, update, onSubmit, onBack,
}: Props) {
  const [availableWallets, setAvailableWallets] = useState<WalletName[]>([])
  const [selectedWallet, setSelectedWallet]     = useState<WalletName | null>(null)
  const [walletOpen, setWalletOpen]             = useState(false)
  const [payMethod, setPayMethod]               = useState<PayMethod>('ada')
  const { state: cardano, sendPayment }         = useCardanoPayment()

  useEffect(() => {
    setAvailableWallets(getAvailableWallets())
    update('payment_method', 'ada')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePay = async () => {
    if (payMethod === 'ada' && selectedWallet) {
      const txHash = await sendPayment(
        selectedWallet,
        totalNGN,
        `Haulink ${tierName} ${form.origin}→${form.destination}`,
      )
      if (txHash) onSubmit(txHash)
    } else {
      update('payment_method', payMethod)
      onSubmit()
    }
  }

  const adaAmount  = ngnToAda(totalNGN)
  const isLoading  = isSubmitting || cardano.isSending
  const canPay     = payMethod !== 'ada' || !!selectedWallet

  return (
    <div className="space-y-0">

      {/* ── Header bar ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[10px] font-medium tracking-[0.2em] uppercase text-gray-400 mb-0.5">
            Payment
          </div>
          <div className="text-xs text-gray-400">
            {form.origin} &rarr; {form.destination}
          </div>
        </div>
        {/* Cardano network badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0033AD]/8 border border-[#0033AD]/15">
          <div className="w-4 h-4 rounded-full bg-[#0033AD] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
          <span className="text-[10px] font-semibold text-[#0033AD] tracking-wide">Cardano</span>
        </div>
      </div>

      {/* ── Final Amount — reference style ── */}
      <div className="bg-gray-50 rounded-2xl p-5 mb-4 border border-gray-100">
        <div className="text-xs text-gray-400 mb-1">Final Amount</div>
        <div className="flex items-baseline justify-between">
          <div className="font-display font-extrabold text-navy tracking-tight"
               style={{ fontSize: 'clamp(28px, 5vw, 36px)' }}>
            {formatNGN(totalNGN)}
          </div>
          <AnimatePresence>
            {payMethod === 'ada' && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="text-right"
              >
                <div className="text-base font-bold text-[#0033AD]">{adaAmount} <span className="text-sm">₳</span></div>
                <div className="text-[10px] text-gray-400">ADA equivalent</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fee breakdown — "How fee works?" style */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-[10px] text-gray-400">How the fee works?</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-dark">
            <span className="w-1.5 h-1.5 rounded-full bg-green-brand" />
            {formatNGN(basePriceNGN)} cargo slot
          </span>
          {form.escrow_enabled && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-dark">
              <span className="w-1.5 h-1.5 rounded-full bg-green-brand" />
              {formatNGN(escrowFeeNGN)} escrow
            </span>
          )}
        </div>
      </div>

      {/* ── Payment method — ADA selector ── */}
      <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
        {/* ADA row — prominent, reference token-selector style */}
        <button
          onClick={() => setPayMethod('ada')}
          className={cn(
            'w-full flex items-center justify-between px-4 py-3.5 transition-colors',
            payMethod === 'ada' ? 'bg-[#0033AD]/[0.04]' : 'bg-white hover:bg-gray-50'
          )}
        >
          <div className="flex items-center gap-3">
            {ADA_ICON}
            <div className="text-left">
              <div className="text-sm font-semibold text-navy">ADA (Cardano)</div>
              <div className="text-[10px] text-gray-400">On-chain proof of delivery</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {payMethod === 'ada' && <CheckCircle2 size={15} className="text-green-brand" />}
            {payMethod === 'ada' && (
              <span className="text-xs text-[#0033AD] font-semibold">{adaAmount} ₳</span>
            )}
          </div>
        </button>

        <div className="h-px bg-gray-100" />

        {/* Cardano network (always mainnet — read-only display) */}
        <div className="flex items-center justify-between px-4 py-3 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#0033AD] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
            <span className="text-sm text-navy/70">Cardano Mainnet</span>
          </div>
          <span className="text-[10px] font-semibold text-green-dark bg-green-muted px-2 py-0.5 rounded-full">
            Selected
          </span>
        </div>
      </div>

      {/* ── Other payment methods ── */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {([
          { id: 'card' as PayMethod, label: 'Card / Bank' },
          { id: 'transfer' as PayMethod, label: 'Bank Transfer' },
        ]).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setPayMethod(id)}
            className={cn(
              'py-3 px-4 rounded-xl border text-xs font-semibold transition-all',
              payMethod === id
                ? 'border-navy/30 bg-navy/5 text-navy'
                : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── ADA wallet selector — shown when ADA selected ── */}
      <AnimatePresence>
        {payMethod === 'ada' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-2 font-medium">Select wallet</div>

              {availableWallets.length > 0 ? (
                <div className="relative">
                  <button
                    onClick={() => setWalletOpen(!walletOpen)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-sm transition-all',
                      selectedWallet
                        ? 'border-green-brand/40 bg-green-muted text-navy'
                        : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300'
                    )}
                  >
                    <span className="font-medium capitalize">
                      {selectedWallet ?? 'Choose a wallet…'}
                    </span>
                    <ChevronDown size={15} className={cn('transition-transform', walletOpen && 'rotate-180')} />
                  </button>

                  <AnimatePresence>
                    {walletOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200
                                   rounded-xl shadow-lg overflow-hidden z-20"
                      >
                        {availableWallets.map((w) => (
                          <button
                            key={w}
                            onClick={() => { setSelectedWallet(w); setWalletOpen(false) }}
                            className={cn(
                              'w-full text-left px-4 py-3 text-sm capitalize transition-colors',
                              selectedWallet === w
                                ? 'bg-green-muted text-navy font-semibold'
                                : 'text-navy/70 hover:bg-gray-50'
                            )}
                          >
                            {cardano.isConnecting && selectedWallet === w
                              ? <Loader2 size={14} className="animate-spin" />
                              : w}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-xl p-3.5 border border-amber-100">
                  <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                  No Cardano wallet detected. Install Nami, Eternl, or Lace browser extension.
                </div>
              )}

              {cardano.txHash && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 flex items-center gap-2 text-xs text-green-dark bg-green-muted rounded-xl p-3 border border-green-brand/20"
                >
                  <CheckCircle2 size={13} className="flex-shrink-0" />
                  <code className="font-mono truncate">{cardano.txHash.slice(0, 32)}…</code>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Escrow toggle ── */}
      <button
        onClick={() => update('escrow_enabled', !form.escrow_enabled)}
        className="w-full flex items-center justify-between rounded-xl px-4 py-3.5 mb-4
                   border border-gray-200 hover:border-green-brand/30
                   bg-white hover:bg-gray-50/50 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
            form.escrow_enabled ? 'bg-green-muted' : 'bg-gray-100'
          )}>
            <Shield size={14} className={form.escrow_enabled ? 'text-green-dark' : 'text-gray-400'} />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-navy">
              Escrow Protection
              <span className="ml-1.5 text-gray-400 font-normal text-xs">+{formatNGN(escrowFeeNGN)}</span>
            </div>
            <div className="text-xs text-gray-400">Funds held until confirmed delivery</div>
          </div>
        </div>
        <div className={cn(
          'w-10 h-5.5 rounded-full transition-colors duration-200 relative flex-shrink-0',
          form.escrow_enabled ? 'bg-green-brand' : 'bg-gray-200'
        )}
          style={{ height: '22px', width: '40px' }}
        >
          <motion.div
            layout
            className="absolute top-[3px] w-4 h-4 bg-white rounded-full shadow-sm"
            animate={{ left: form.escrow_enabled ? '20px' : '3px' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </div>
      </button>

      {/* ── Error ── */}
      {cardano.error && (
        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-xl p-3.5 mb-4 border border-red-100">
          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
          {cardano.error}
        </div>
      )}

      {/* ── Pay Securely — reference style full-width dark button ── */}
      <button
        onClick={handlePay}
        disabled={isLoading || !canPay}
        className="w-full flex items-center justify-between bg-dark text-white
                   font-display font-bold text-sm px-6 py-4 rounded-xl
                   hover:bg-dark-mid transition-all
                   disabled:opacity-40 disabled:cursor-not-allowed
                   shadow-lg shadow-black/15 mb-3"
      >
        <span className="flex items-center gap-2">
          {isLoading && <Loader2 size={15} className="animate-spin" />}
          Pay Securely
        </span>
        {!isLoading && (
          <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8M6 2l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </button>

      <button
        onClick={onBack}
        className="w-full py-3 text-sm text-gray-400 font-medium hover:text-navy transition-colors"
      >
        Cancel
      </button>

      {/* ── Trust signal ── */}
      <p className="text-center text-xs text-gray-400 mt-2">
        Need help? Our support team is here 24/7.
      </p>
    </div>
  )
}
