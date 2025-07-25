"use client";
import React, {FC, useMemo} from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    WalletModalProvider
} from '@solana/wallet-adapter-react-ui';

import { clusterApiUrl } from '@solana/web3.js';

// Default styles that can be overridden by your app

import '@solana/wallet-adapter-react-ui/styles.css';



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

   const network = WalletAdapterNetwork.Devnet;
   const endpoint = useMemo(() => clusterApiUrl(network), [network]);

   const wallets = useMemo(
       () => [],
       [network]);
  return (
    
       <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    { children }
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>

  );
}
