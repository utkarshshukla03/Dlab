"use client";
import React from 'react';
import WalletContextProvider from '@/components/WalletContextProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <WalletContextProvider>
      {children}
    </WalletContextProvider>
  );
}
