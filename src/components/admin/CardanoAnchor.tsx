'use client'

import { useState } from 'react'

interface Props {
  shipmentId: string
  trackingCode: string
  podHash: string
  onAnchored: (txHash: string) => void
}

export function CardanoAnchor({ shipmentId, trackingCode, podHash, onAnchored }: Props) {
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash]   = useState<string | null>(null)
  const [error, setError]     = useState<string | null>(null)

  async function anchor() {
    setLoading(true)
    setError(null)

    try {
      const { BrowserWallet, Transaction } = await import('@meshsdk/core')

      const wallet = await BrowserWallet.enable('eternl')

      const recipientAddress =
        process.env.NEXT_PUBLIC_HAULINK_WALLET_ADDRESS ||
        (await wallet.getChangeAddress())

      const tx = new Transaction({ initiator: wallet })
      tx.sendLovelace(recipientAddress, '2000000')
      tx.setMetadata(674, {
        msg: [
          'Haulink POD',
          trackingCode.slice(0, 64),
          podHash.slice(0, 32),
          podHash.slice(32, 64),
        ],
      })

      const unsigned = await tx.build()
      const signed   = await wallet.signTx(unsigned)
      const hash     = await wallet.submitTx(signed)

      await fetch(`/api/admin/shipments/${shipmentId}/cardano`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardano_tx_hash: hash, pod_hash: podHash }),
      })

      setTxHash(hash)
      onAnchored(hash)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Transaction failed'
      setError(
        msg.toLowerCase().includes('not installed') || msg.toLowerCase().includes('not found')
          ? 'Eternl wallet not found. Install it and switch to preprod.'
          : msg,
      )
    } finally {
      setLoading(false)
    }
  }

  if (txHash) {
    return (
      <div className="flex items-center gap-2.5 text-[12px] text-green-deep bg-green-muted px-3.5 py-2.5 rounded-xl border border-green-brand/20 font-grotesk">
        <span className="font-mono font-bold">₳</span>
        <span className="font-medium">Anchored on Cardano</span>
        <code className="font-mono text-[11px] opacity-70">{txHash.slice(0, 16)}…</code>
        <a
          href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline opacity-70 hover:opacity-100"
        >
          View ↗
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={anchor}
        disabled={loading}
        className="inline-flex items-center gap-2.5 bg-[#0033AD] text-white text-[12px] font-medium px-4 py-2.5 rounded-full hover:bg-[#002490] transition-colors disabled:opacity-50 font-grotesk"
      >
        {loading ? (
          <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin flex-shrink-0" />
        ) : (
          <span className="font-mono font-bold text-[14px]">₳</span>
        )}
        {loading ? 'Anchoring on Cardano…' : 'Anchor on Cardano'}
      </button>
      {error && (
        <span className="text-[11px] text-red-600 max-w-xs leading-snug">{error}</span>
      )}
    </div>
  )
}
