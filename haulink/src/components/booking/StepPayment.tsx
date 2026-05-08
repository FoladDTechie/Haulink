'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Wallet, CreditCard, Building2, AlertCircle, Loader2 } from 'lucide-react'
import { cn, formatNGN, ngnToAda } from '@/lib/utils'
import { getAvailableWallets, type WalletName } from '@/hooks/useCardanoPayment'
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

const PAYMENT_METHODS = [
  { id: 'card',     label: 'Card / Bank',    icon: CreditCard  },
  { id: 'ada',      label: 'ADA (Cardano)',  icon: Wallet      },
  { id: 'transfer', label: 'Bank Transfer',  icon: Building2   },
] as const

export function StepPayment({
  form, totalNGN, tierName, escrowFeeNGN, basePriceNGN,
  isSubmitting, update, onSubmit, onBack,
}: Props) {
  const [availableWallets, setAvailableWallets]   = useState<WalletName[]>([])
  const [selectedWallet, setSelectedWallet]       = useState<WalletName | null>(null)
  const [adaState, setAdaState]                   = useState({ isSending: false, error: null as string | null, txHash: null as string | null })

  // Detect installed wallets — client only
  useEffect(() => { setAvailableWallets(getAvailableWallets()) }, [])

  const handlePay = async () => {
    if (form.payment_method === 'ada' && selectedWallet) {
      setAdaState({ isSending: true, error: null, txHash: null })
      try {
        // Dynamic import keeps Mesh out of initial SSR bundle completely
        const { useCardanoPayment } = await import('@/hooks/useCardanoPayment')
        // We can't call a hook here — call the payment logic directly
        const { BrowserWallet, Transaction } = await import('@meshsdk/core')
        const wallet = await BrowserWallet.enable(selectedWallet)
        const adaAmount = ngnToAda(totalNGN)
        const recipientAddress = process.env.NEXT_PUBLIC_HAULINK_WALLET_ADDRESS || 'addr1_placeholder'

        const tx = new Transaction({ initiator: wallet })
          .sendLovelace(recipientAddress, String(Math.ceil(adaAmount * 1_000_000)))
        tx.setMetadata(674, { msg: [`Haulink ${tierName} ${form.origin}-${form.destination}`] })

        const unsigned = await tx.build()
        const signed   = await wallet.signTx(unsigned)
        const txHash   = await wallet.submitTx(signed)

        setAdaState({ isSending: false, error: null, txHash })
        onSubmit(txHash)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Transaction failed'
        setAdaState({ isSending: false, error: msg, txHash: null })
      }
    } else {
      onSubmit()
    }
  }

  const adaAmount = ngnToAda(totalNGN)
  const busy      = isSubmitting || adaState.isSending

  return (
    <div className="space-y-5">
      {/* Route summary */}
      <div className="flex items-center gap-3 bg-cream rounded-xl px-5 py-4 border border-navy/8">
        <div>
          <div className="font-display font-bold text-navy text-base">{form.origin}</div>
          <div className="text-xs text-gray-400">{form.cargo_type}</div>
        </div>
        <div className="flex-1 text-center text-green-brand font-bold text-lg">──→</div>
        <div className="text-right">
          <div className="font-display font-bold text-navy text-base">{form.destination}</div>
          <div className="text-xs text-gray-400">{form.pickup_date}</div>
        </div>
      </div>

      {/* Payment method */}
      <div>
        <div className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">
          Payment Method
        </div>
        <div className="grid grid-cols-3 gap-2">
          {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => update('payment_method', id)}
              className={cn(
                'flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-xl border-2',
                'text-xs font-semibold transition-all',
                form.payment_method === id
                  ? 'border-green-brand bg-green-muted text-navy'
                  : 'border-navy/10 bg-cream text-gray-400 hover:border-navy/25'
              )}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ADA wallet picker */}
      <AnimatePresence>
        {form.payment_method === 'ada' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-navy/5 border border-navy/10 rounded-xl p-4 space-y-3">
              <p className="text-sm text-navy/70 leading-relaxed">
                <strong className="text-green-dark">Pay with ADA</strong> — your booking
                is anchored on Cardano. Proof of delivery is verifiable on-chain.
              </p>
              <div className="text-sm font-bold text-navy">
                Amount: <span className="text-green-dark">{adaAmount} ₳</span>
                <span className="text-gray-400 font-normal ml-2">(≈ {formatNGN(totalNGN)})</span>
              </div>

              {availableWallets.length > 0 ? (
                <div className="flex gap-2 flex-wrap">
                  {availableWallets.map(w => (
                    <button
                      key={w}
                      onClick={() => setSelectedWallet(w)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-semibold capitalize border transition-all',
                        selectedWallet === w
                          ? 'border-green-brand bg-green-muted text-navy'
                          : 'border-navy/15 text-navy hover:border-navy/30'
                      )}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg p-3">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  No Cardano wallet detected. Install Nami, Eternl, or Lace browser extension, then refresh.
                </div>
              )}

              {adaState.txHash && (
                <div className="text-xs text-green-dark bg-green-muted rounded-lg p-3">
                  ✓ TX: <code className="font-mono">{adaState.txHash.slice(0, 24)}…</code>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Escrow toggle */}
      <button
        onClick={() => update('escrow_enabled', !form.escrow_enabled)}
        className="w-full flex items-center justify-between bg-cream rounded-xl px-4 py-4
                   border border-navy/8 hover:border-navy/20 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-navy/8 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-navy" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-navy">
              Escrow Protection (+{formatNGN(escrowFeeNGN)})
            </div>
            <div className="text-xs text-gray-400">Funds release only on confirmed delivery</div>
          </div>
        </div>
        <div className={cn(
          'w-11 h-6 rounded-full transition-all duration-200 relative flex-shrink-0',
          form.escrow_enabled ? 'bg-green-brand' : 'bg-navy/15'
        )}>
          <motion.div
            layout
            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
            animate={{ left: form.escrow_enabled ? '24px' : '4px' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </div>
      </button>

      {/* Price summary */}
      <div className="bg-cream rounded-xl p-5 border border-navy/8 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">{tierName}</span>
          <span className="font-semibold text-navy">{formatNGN(basePriceNGN)}</span>
        </div>
        {form.escrow_enabled && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Escrow fee</span>
            <span className="font-semibold text-navy">{formatNGN(escrowFeeNGN)}</span>
          </div>
        )}
        {form.payment_method === 'ada' && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">ADA equivalent</span>
            <span className="font-semibold text-green-dark">≈ {adaAmount} ₳</span>
          </div>
        )}
        <div className="h-px bg-navy/8" />
        <div className="flex justify-between">
          <span className="font-display font-bold text-navy">Total</span>
          <span className="font-display font-extrabold text-2xl text-navy">
            {formatNGN(totalNGN)}
          </span>
        </div>
      </div>

      {/* Errors */}
      {adaState.error && (
        <div className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3 flex items-start gap-2">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          {adaState.error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={busy}
          className="flex-1 py-4 rounded-xl border-2 border-navy/15 text-navy
                     font-display font-bold text-sm hover:border-navy transition-all
                     disabled:opacity-40"
        >
          ← Back
        </button>
        <button
          onClick={handlePay}
          disabled={busy || (form.payment_method === 'ada' && !selectedWallet)}
          className="flex-[2] py-4 rounded-xl bg-navy text-white font-display font-bold
                     text-sm hover:bg-navy-mid transition-all disabled:opacity-40
                     disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {busy && <Loader2 size={16} className="animate-spin" />}
          🔒 Pay {formatNGN(totalNGN)}
        </button>
      </div>
    </div>
  )
}
