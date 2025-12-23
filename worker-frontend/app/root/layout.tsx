"use client";
import React, { useMemo, ReactNode } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { 
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
    LedgerWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

export default function WalletContextProvider({ children }: { children: ReactNode }) {
  const network = WalletAdapterNetwork.Devnet; // Change to Mainnet for production
  
  // Use the proper RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter()
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

// "use client";
// import React, {useMemo } from 'react';
// import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
// import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
// import {
//     WalletModalProvider
// } from '@solana/wallet-adapter-react-ui';

// // Default styles that can be overridden by your app
// require('@solana/wallet-adapter-react-ui/styles.css');

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   const network = WalletAdapterNetwork.Mainnet;

//   // You can also provide a custom RPC endpoint.
//   const endpoint = "your_rpc_url";

//   const wallets = useMemo(
//       () => [],
//       [network]
//   );

//     return (
//     <ConnectionProvider endpoint={endpoint}>
//         <WalletProvider wallets={wallets} autoConnect>
//             <WalletModalProvider>
//                 {children}
//             </WalletModalProvider>
//         </WalletProvider>
//     </ConnectionProvider>
//   );
// }
