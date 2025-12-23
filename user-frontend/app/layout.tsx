
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import '@solana/wallet-adapter-react-ui/styles.css';
import React, {FC, useMemo} from 'react';


const inter= Inter({subsets: ['latin']});

export const metadata: Metadata = {
  title: "Organization",
  description: "Your one stop destination to getting your data labelled",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className={inter.className}>
      
                    { children }
              
      </body>
    </html>
  );
}
