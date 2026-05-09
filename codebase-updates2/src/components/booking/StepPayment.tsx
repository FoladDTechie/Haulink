'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, AlertCircle, Loader2, CheckCircle2, ArrowRight, Lock, CreditCard, Repeat } from 'lucide-react'
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

const AdaMark = ({ size = 40 }: { size?: number }) => (
  <div
    className="ada-mark relative rounded-full grid place-items-center flex-shrink-0"
    style={{ width: size, height: size, background: '#0033AD' }}
  >
    <div className="rounded-full" style={{ width: size * 0.35, height: size * 0.35, background: 'rgba(255,255,255,0.92)' }} />
    <div
      className="absolute rounded-full"
      style={{
        inset: size * 0.125,
        background:
          'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.55) 12%, transparent 13%),' +
          'radial-gradient(circle at 50% 100%, rgba(255,255,255,0.55) 12%, transparent 13%),' +
          'radial-gradient(circle at 0% 50%, rgba(255,255,255,0.55) 12%, transparent 13%),' +
          'radial-gradient(circle at 100% 50%, rgba(255,255,255,0.55) 12%, transparent 13%)',
      }}
    />
  </div>
)

const WALLET_COLORS: Record<string, string> = {
  nami: '#349EA3', eternl: '#E3506A', lace: '#1B5BFF', yoroi: '#3154CB',
}

export function StepPayment({
  form, totalNGN, tierName, escrowFeeNGN, basePriceNGN,
  isSubmitting, update, onSubmit, onBack,
}: Props) {
  const [availableWallets, setAvailableWallets] = useState<WalletName[]>([])
  const [selectedWallet, setSelectedWallet]     = useState<WalletName | null>(null)
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
        selectedWallet, totalNGN,
        `Haulink ${tierName} ${form.origin}→${form.destination}`,
      )
      if (txHash) onSubmit(txHash)
    } else {
      update('payment_method', payMethod)
      onSubmit()
    }
  }

  const adaAmount = ngnToAda(totalNGN)
  const isLoading = isSubmitting || cardano.isSending
  const canPay = payMethod !== 'ada' || !!selectedWallet

  const allWallets: WalletName[] = ['nami', 'eternl', 'lace', 'yoroi'] as WalletName[]

  return (
    <div className="grid lg:grid-cols-[1fr_420px] gap-10 items-start">

      {/* ── LEFT — Card ── */}
      <div className="bg-paper rounded-3xl p-10 border border-white/[0.06] shadow-2xl shadow-black/40">

        {/* Section i — methods */}
        <div className="mb-9">
          <div className="eyebrow mb-3.5 flex items-center gap-2.5">
            <span className="font-serif-italic text-green-deep text-xl tracking-tight-2 mr-1">i.</span>
            Choose method
          </div>
          <h3 className="font-serif-display text-ink leading-[1.1] tracking-tight-2 mb-6 text-balance" style={{ fontSize: 30 }}>
            How would you like to <em className="font-serif-italic text-green-deep">pay?</em>
          </h3>

          <div className="grid gap-2.5">
            {/* ADA */}
            <button
              onClick={() => setPayMethod('ada')}
              className={cn(
                'flex items-center justify-between gap-3.5 px-5 py-4 rounded-2xl border transition-all text-left',
                payMethod === 'ada'
                  ? 'border-[#0033AD] text-white'
                  : 'border-line-strong bg-white hover:border-ink',
              )}
              style={payMethod === 'ada' ? { background: 'linear-gradient(120deg, var(--color-ink, #0A0F22), #0a1338)' } : undefined}
            >
              <div className="flex items-center gap-4">
                <AdaMark />
                <div>
                  <div className="font-medium text-[15.5px] tracking-tight">ADA · Cardano</div>
                  <div className={cn('text-[12px] mt-0.5', payMethod === 'ada' ? 'text-white/55' : 'text-muted')}>
                    On‑chain proof of delivery, escrow native
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-medium text-[15px] tracking-tight-2">
                  {adaAmount}<em className="font-serif-italic text-green-brand font-normal ml-1">₳</em>
                </span>
                <span className={cn(
                  'w-[18px] h-[18px] rounded-full border-[1.5px] grid place-items-center',
                  payMethod === 'ada' ? 'border-white' : 'border-line-strong',
                )}>
                  {payMethod === 'ada' && <span className="w-2 h-2 rounded-full bg-green-brand" />}
                </span>
              </div>
            </button>

            {/* Card */}
            <button
              onClick={() => setPayMethod('card')}
              className={cn(
                'flex items-center justify-between gap-3.5 px-5 py-4 rounded-2xl border transition-all text-left',
                payMethod === 'card' ? 'border-ink bg-ink text-white' : 'border-line-strong bg-white hover:border-ink',
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-10 h-10 rounded-xl grid place-items-center',
                  payMethod === 'card' ? 'bg-white/10 text-white' : 'bg-[rgba(13,27,62,0.05)] text-ink',
                )}>
                  <CreditCard size={18} />
                </div>
                <div>
                  <div className="font-medium text-[15.5px] tracking-tight">Card &amp; bank account</div>
                  <div className={cn('text-[12px] mt-0.5', payMethod === 'card' ? 'text-white/55' : 'text-muted')}>
                    Visa, Verve, Mastercard · Paystack
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-medium text-[15px] tracking-tight-2">{formatNGN(totalNGN)}</span>
                <span className={cn(
                  'w-[18px] h-[18px] rounded-full border-[1.5px] grid place-items-center',
                  payMethod === 'card' ? 'border-white' : 'border-line-strong',
                )}>
                  {payMethod === 'card' && <span className="w-2 h-2 rounded-full bg-green-brand" />}
                </span>
              </div>
            </button>

            {/* Transfer */}
            <button
              onClick={() => setPayMethod('transfer')}
              className={cn(
                'flex items-center justify-between gap-3.5 px-5 py-4 rounded-2xl border transition-all text-left',
                payMethod === 'transfer' ? 'border-ink bg-ink text-white' : 'border-line-strong bg-white hover:border-ink',
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-10 h-10 rounded-xl grid place-items-center',
                  payMethod === 'transfer' ? 'bg-white/10 text-white' : 'bg-[rgba(13,27,62,0.05)] text-ink',
                )}>
                  <Repeat size={18} />
                </div>
                <div>
                  <div className="font-medium text-[15.5px] tracking-tight">Direct bank transfer</div>
                  <div className={cn('text-[12px] mt-0.5', payMethod === 'transfer' ? 'text-white/55' : 'text-muted')}>
                    NUBAN · settled within 30 min
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-medium text-[15px] tracking-tight-2">{formatNGN(totalNGN)}</span>
                <span className={cn(
                  'w-[18px] h-[18px] rounded-full border-[1.5px] grid place-items-center',
                  payMethod === 'transfer' ? 'border-white' : 'border-line-strong',
                )}>
                  {payMethod === 'transfer' && <span className="w-2 h-2 rounded-full bg-green-brand" />}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Section ii — wallet */}
        <AnimatePresence>
          {payMethod === 'ada' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-9"
            >
              <div className="eyebrow mb-3.5 flex items-center gap-2.5">
                <span className="font-serif-italic text-green-deep text-xl tracking-tight-2 mr-1">ii.</span>
                Wallet
              </div>
              <h3 className="font-serif-display text-ink leading-[1.1] tracking-tight-2 mb-5 text-balance" style={{ fontSize: 30 }}>
                Connect a <em className="font-serif-italic text-green-deep">Cardano</em> wallet.
              </h3>

              <div className="grid grid-cols-4 gap-2">
                {allWallets.map((w) => {
                  const detected = availableWallets.includes(w)
                  const isSel = selectedWallet === w
                  return (
                    <button
                      key={w}
                      onClick={() => detected && setSelectedWallet(w)}
                      disabled={!detected}
                      className={cn(
                        'p-3.5 rounded-2xl border bg-white flex flex-col items-center gap-2 transition-all',
                        isSel
                          ? 'border-green-deep'
                          : detected ? 'border-line-strong hover:border-ink' : 'border-line opacity-60 cursor-not-allowed',
                      )}
                      style={isSel ? { background: 'rgba(46,204,82,0.08)' } : undefined}
                    >
                      <div
                        className="w-8 h-8 rounded-xl grid place-items-center text-white font-serif-italic text-[18px]"
                        style={{ background: WALLET_COLORS[w] }}
                      >
                        {w[0].toUpperCase()}
                      </div>
                      <div className="text-[11px] font-medium tracking-[0.04em] capitalize text-ink">{w}</div>
                      <div className={cn(
                        'text-[9.5px] tracking-[0.14em] uppercase font-medium',
                        isSel ? 'text-green-deep' : 'text-muted',
                      )}>
                        {isSel ? '— Connected' : detected ? 'Detected' : 'Install →'}
                      </div>
                    </button>
                  )
                })}
              </div>

              {cardano.txHash && (
                <div className="mt-3 flex items-center gap-2 text-xs text-green-deep bg-green-muted rounded-xl p-3 border border-green-brand/20">
                  <CheckCircle2 size={13} className="flex-shrink-0" />
                  <code className="font-mono truncate">{cardano.txHash.slice(0, 32)}…</code>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section iii — escrow */}
        <div>
          <div className="eyebrow mb-3.5 flex items-center gap-2.5">
            <span className="font-serif-italic text-green-deep text-xl tracking-tight-2 mr-1">iii.</span>
            Protection
          </div>
          <h3 className="font-serif-display text-ink leading-[1.1] tracking-tight-2 mb-5 text-balance" style={{ fontSize: 30 }}>
            Hold funds in <em className="font-serif-italic text-green-deep">escrow.</em>
          </h3>

          <button
            onClick={() => update('escrow_enabled', !form.escrow_enabled)}
            className="w-full flex items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-white border border-line-strong hover:border-ink transition-all text-left"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl grid place-items-center flex-shrink-0"
                style={{ background: 'rgba(46,204,82,0.1)', color: 'var(--green-deep, #0e6a28)' }}>
                <Shield size={18} />
              </div>
              <div>
                <div className="font-medium text-[15px] text-ink mb-1 tracking-tight">
                  Escrow protection
                  <span className="font-serif-italic text-green-deep font-normal ml-1.5 tracking-tight-2">+ {formatNGN(escrowFeeNGN)}</span>
                </div>
                <p className="text-[12.5px] text-muted leading-[1.5] max-w-[38ch]">
                  Funds are held by Haulink and only released when the receiver confirms delivery via OTP. Anchored on‑chain.
                </p>
              </div>
            </div>
            <div className={cn(
              'w-11 h-6 rounded-full relative flex-shrink-0 transition-colors',
              form.escrow_enabled ? 'bg-green-brand' : 'bg-[rgba(13,27,62,0.15)]',
            )}>
              <motion.div
                layout
                className="absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-sm"
                animate={{ left: form.escrow_enabled ? '23px' : '3px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </div>
          </button>
        </div>

        {cardano.error && (
          <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-xl p-3.5 mt-4 border border-red-100">
            <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
            {cardano.error}
          </div>
        )}
      </div>

      {/* ── RIGHT — Summary ── */}
      <aside className="bg-paper rounded-3xl p-8 border border-white/[0.06] shadow-2xl shadow-black/40 lg:sticky lg:top-6">
        <div className="eyebrow mb-2.5">Final amount</div>
        <div className="font-grotesk font-medium text-ink leading-none tracking-tightest" style={{ fontSize: 64 }}>
          <span className="font-serif-italic text-green-deep font-normal mr-1.5 tracking-tight-3" style={{ fontSize: 42, verticalAlign: 6 }}>₦</span>
          {formatNGN(totalNGN).replace('₦', '').trim()}
        </div>

        <div className="flex items-center justify-between mt-4 px-4 py-3.5 rounded-2xl"
          style={{ background: 'rgba(0,51,173,0.06)', color: '#0033AD' }}>
          <div>
            <div className="text-[11px] tracking-[0.18em] uppercase font-medium opacity-70">ADA equivalent</div>
            <div className="font-grotesk font-medium text-[22px] tracking-tight-2">
              {adaAmount}<em className="font-serif-italic font-normal ml-1 opacity-80">₳</em>
            </div>
          </div>
          <AdaMark size={34} />
        </div>

        <div className="h-px bg-line my-6" />

        <div className="flex flex-col">
          <div className="flex justify-between items-baseline py-2.5 text-[13.5px]">
            <span className="text-muted">Slot tier</span>
            <span className="font-serif-italic text-green-deep text-[15px] tracking-tight-2">{tierName}</span>
          </div>
          <div className="flex justify-between items-baseline py-2.5 border-t border-dashed border-line text-[13.5px]">
            <span className="text-muted">Cargo slot</span>
            <span className="font-grotesk font-medium text-ink tracking-tight">{formatNGN(basePriceNGN)}</span>
          </div>
          {form.escrow_enabled && (
            <div className="flex justify-between items-baseline py-2.5 border-t border-dashed border-line text-[13.5px]">
              <span className="text-muted">Escrow protection</span>
              <span className="font-grotesk font-medium text-ink tracking-tight">{formatNGN(escrowFeeNGN)}</span>
            </div>
          )}
          {payMethod === 'ada' && (
            <div className="flex justify-between items-baseline py-2.5 border-t border-dashed border-line text-[13.5px]">
              <span className="text-muted">Network fee · Cardano</span>
              <span className="font-grotesk font-medium text-ink tracking-tight">~ 0.17 ₳</span>
            </div>
          )}
        </div>

        <button
          onClick={handlePay}
          disabled={isLoading || !canPay}
          className="w-full flex items-center justify-between gap-3.5 mt-6 bg-ink text-white px-6 py-5 rounded-full font-grotesk font-medium text-[15px] hover:bg-green-deep hover:-translate-y-px transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="flex items-center gap-2.5">
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
            {payMethod === 'ada' ? `Pay ${adaAmount} ₳ securely` : 'Pay securely'}
          </span>
          <span className="w-8 h-8 rounded-full bg-green-brand text-ink grid place-items-center">
            <ArrowRight size={14} />
          </span>
        </button>

        <div className="flex justify-between items-center mt-3.5 text-[11px] text-muted tracking-[0.06em]">
          <span className="text-green-deep font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-brand" />
            {selectedWallet ? `Wallet connected · ${selectedWallet}` : 'No wallet'}
          </span>
          <span className="uppercase tracking-[0.14em]">Mainnet</span>
        </div>

        <button onClick={onBack} className="mt-3.5 w-full bg-transparent border-0 text-muted font-grotesk text-[13px] py-2 hover:text-ink transition-colors">
          Cancel and return
        </button>
      </aside>
    </div>
  )
}
