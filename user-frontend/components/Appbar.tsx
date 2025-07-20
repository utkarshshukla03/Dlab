"use client";
import {
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';


export const Appbar = () => {
    const { publicKey} = useWallet();

    

    return <div className="flex justify-between border-b pb-2 pt-2">
        <div className="text-2xl pl-4 flex justify-center pt-3">
            DLAB
        </div>
        <div className="text-xl pr-4 pb-2">
            {publicKey  ? <WalletDisconnectButton /> : <WalletMultiButton />}
        </div>
    </div>
}