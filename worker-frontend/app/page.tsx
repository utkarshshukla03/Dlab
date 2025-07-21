"use client";
import { Appbar } from "@/components/AppBar";
import { NextTask } from "@/components/Nexttask";
import WalletContextProvider from "@/components/WalletContextProvider";

export default function Home() {
  return (
    <WalletContextProvider>
      <div>
        <Appbar />
        <NextTask />
      </div>
    </WalletContextProvider>
  );
}
