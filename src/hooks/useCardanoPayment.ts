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
      // Dynamically import Mesh to avoid SSR issues
      const { BrowserWallet } = await import('@meshsdk/core')

      const wallet = await BrowserWallet.enable(walletName)
      const addresses = await wallet.getUsedAddresses()
      const address = addresses[0] || await wallet.getChangeAddress()

      setState(s => ({
        ...s,
        isConnecting: false,
        isConnected: true,
        walletName,
        walletAddress: address,
      }))

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
      const { BrowserWallet, Transaction } = await import('@meshsdk/core')

      const wallet = await BrowserWallet.enable(walletName)
      const adaAmount = ngnToAda(amountNGN)

      // Haulink receiving address — set in .env.local
      const recipientAddress = process.env.NEXT_PUBLIC_HAULINK_WALLET_ADDRESS!

      const tx = new Transaction({ initiator: wallet })
        .sendLovelace(
          recipientAddress,
          String(Math.ceil(adaAmount * 1_000_000)) // convert ADA to Lovelace
        )

      // Attach shipment memo as transaction metadata (key 674 = msg standard)
      tx.setMetadata(674, { msg: [memo] })

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
      isConnecting: false,
      isConnected: false,
      isSending: false,
      walletName: null,
      walletAddress: null,
      txHash: null,
      error: null,
    })
  }, [])

  return { state, connectWallet, sendPayment, reset }
}

// ── Available Cardano wallets detector ────────────────────────
export function getAvailableWallets(): WalletName[] {
  if (typeof window === 'undefined') return []
  const wallets: WalletName[] = ['nami', 'eternl', 'lace', 'yoroi']
  const cardano = (window as Record<string, Record<string, unknown>>).cardano
  return wallets.filter(w => !!cardano?.[w])
}
