'use client'

import { useState, useCallback } from 'react'
import { ngnToAda } from '@/lib/utils'

export type WalletName = 'nami' | 'eternl' | 'lace' | 'yoroi'

export interface CardanoPaymentState {
  isConnecting: boolean
  isConnected: boolean
  isSending: boolean
  walletName: string | null
  walletAddress: string | null
  txHash: string | null
  error: string | null
}

// Lazy-load Mesh only in browser — never import at module level
async function getMesh() {
  if (typeof window === 'undefined') {
    throw new Error('Cardano wallet only available in browser')
  }
  // Dynamic import deferred to runtime — webpack excludes from SSR bundle
  const mesh = await import('@meshsdk/core')
  return mesh
}

export function useCardanoPayment() {
  const [state, setState] = useState<CardanoPaymentState>({
    isConnecting: false,
    isConnected: false,
    isSending: false,
    walletName: null,
    walletAddress: null,
    txHash: null,
    error: null,
  })

  const connectWallet = useCallback(async (walletName: WalletName) => {
    setState(s => ({ ...s, isConnecting: true, error: null }))
    try {
      const { BrowserWallet } = await getMesh()
      const wallet = await BrowserWallet.enable(walletName)
      const addresses = await wallet.getUsedAddresses()
      const address = addresses[0] || await wallet.getChangeAddress()
      setState(s => ({ ...s, isConnecting: false, isConnected: true, walletName, walletAddress: address }))
      return wallet
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet'
      setState(s => ({ ...s, isConnecting: false, error: message }))
      return null
    }
  }, [])

  const sendPayment = useCallback(async (
    walletName: WalletName,
    amountNGN: number,
    memo: string
  ) => {
    setState(s => ({ ...s, isSending: true, error: null }))
    try {
      const { BrowserWallet, Transaction } = await getMesh()
      const wallet = await BrowserWallet.enable(walletName)
      const adaAmount = ngnToAda(amountNGN)
      const recipientAddress = process.env.NEXT_PUBLIC_HAULINK_WALLET_ADDRESS!

      const tx = new Transaction({ initiator: wallet })
        .sendLovelace(recipientAddress, String(Math.ceil(adaAmount * 1_000_000)))

      tx.setMetadata(674, { msg: [memo.slice(0, 64)] })

      const unsignedTx = await tx.build()
      const signedTx = await wallet.signTx(unsignedTx)
      const txHash = await wallet.submitTx(signedTx)

      setState(s => ({ ...s, isSending: false, txHash }))
      return txHash
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transaction failed'
      setState(s => ({ ...s, isSending: false, error: message }))
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      isConnecting: false, isConnected: false, isSending: false,
      walletName: null, walletAddress: null, txHash: null, error: null,
    })
  }, [])

  return { state, connectWallet, sendPayment, reset }
}

// Detect which Cardano wallets are installed in the browser
export function getAvailableWallets(): WalletName[] {
  if (typeof window === 'undefined') return []
  const w = window as unknown as { cardano?: Record<string, unknown> }
  if (!w.cardano) return []
  const supported: WalletName[] = ['nami', 'eternl', 'lace', 'yoroi']
  return supported.filter(name => !!w.cardano![name])
}
