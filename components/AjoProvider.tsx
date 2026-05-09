'use client'

import React, { ReactNode } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'

// Next.js Turbopack prefers ES6 imports for CSS rather than require()
import '@solana/wallet-adapter-react-ui/styles.css'

interface AjoProviderProps {
  children: ReactNode
}

export function AjoProvider({ children }: AjoProviderProps) {
  const network = WalletAdapterNetwork.Mainnet
  const endpoint = clusterApiUrl(network)

  const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()]

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
