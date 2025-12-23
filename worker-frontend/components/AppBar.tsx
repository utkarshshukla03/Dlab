"use client";
import {
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../utils';

export const Appbar = () => {
    const { publicKey, signMessage } = useWallet();
    const [balance, setBalance] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [hasAttemptedAuth, setHasAttemptedAuth] = useState(false);

    // Ensure component only renders wallet content after mounting
    useEffect(() => {
        setMounted(true);
    }, []);

    // Listen for balance updates from task submissions
    useEffect(() => {
        const handleBalanceUpdate = (event: any) => {
            const newBalance = event.detail.balance;
            console.log('Balance updated to:', newBalance);
            setBalance(newBalance);
        };

        window.addEventListener('balanceUpdate', handleBalanceUpdate);
        return () => window.removeEventListener('balanceUpdate', handleBalanceUpdate);
    }, []);

    // Clear token when wallet disconnects
    useEffect(() => {
        if (mounted && !publicKey) {
            localStorage.removeItem('token');
            setBalance(0);
            setHasAttemptedAuth(false);
        }
    }, [publicKey, mounted]);

    // Handle authentication when wallet connects
    useEffect(() => {
        if (!mounted || !publicKey || hasAttemptedAuth) {
            return;
        }

        setHasAttemptedAuth(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
            // No token, trigger signin
            const signAndSend = async () => {
                if (!signMessage) return;
                
                try {
                    const message = new TextEncoder().encode("Sign into mechanical turks as a worker");
                    const signature = await signMessage(message);
                    
                    const response = await axios.post(`${BACKEND_URL}/v1/worker/signin`, {
                        signature,
                        publicKey: publicKey.toString()
                    });

                    setBalance(response.data.amount);
                    localStorage.setItem("token", response.data.token);
                } catch (error) {
                    console.error("Error signing in:", error);
                    setBalance(0);
                }
            };
            
            signAndSend();
        } else {
            // Token exists, fetch balance
            axios.get(`${BACKEND_URL}/v1/worker/balance`, {
                headers: { "Authorization": token }
            })
            .then(res => setBalance(res.data.balance))
            .catch(() => {
                // Token invalid, clear and retry
                localStorage.removeItem('token');
                setHasAttemptedAuth(false);
            });
        }
    }, [publicKey, mounted, signMessage, hasAttemptedAuth]);

    const handlePayout = async () => {
        if (balance === 0) {
            alert('You have no balance to payout');
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to request a payout of ${balance} SOL? This action cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await axios.post(`${BACKEND_URL}/v1/worker/payout`, {}, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            console.log('Payout response:', response.data);
            
            const message = response.data.transactionSignature 
                ? `✅ ${response.data.message}\n\nAmount: ${response.data.amount}\nWallet: ${response.data.workerAddress}\n\nTransaction: ${response.data.transactionSignature}\n\nView on Explorer: ${response.data.explorerUrl}`
                : `✅ ${response.data.message}\n\nAmount: ${response.data.amount}\nWallet: ${response.data.workerAddress}`;
            
            alert(message);
            
            // Open explorer in new tab if transaction exists
            if (response.data.explorerUrl) {
                window.open(response.data.explorerUrl, '_blank');
            }
            
            setBalance(0);
        } catch (error: any) {
            console.error("Error with payout:", error);
            alert('Payout failed. Please try again later.');
        }
    };

    return (
        <div className="flex justify-between border-b border-gray-800 pb-4 pt-4 bg-black shadow-sm">
            <div className="text-2xl pl-6 flex justify-center pt-2 font-bold text-white">
                DLab - Turn Choices into Rewards
            </div>
            <div className="text-xl pr-4 flex">
                <button 
                    onClick={handlePayout}
                    className="m-2 mr-4 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                >
                    Pay me out ({balance}) SOL
                </button>
                {mounted ? (
                    publicKey ? <WalletDisconnectButton /> : <WalletMultiButton />
                ) : (
                    <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
                )}
            </div>
        </div>
    );
};




// "use client";
// import {
//     WalletDisconnectButton,
//     WalletMultiButton
// } from '@solana/wallet-adapter-react-ui';
// import { useWallet } from '@solana/wallet-adapter-react';
// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { BACKEND_URL } from '../utils';
// export const Appbar = () => {
//     const { publicKey , signMessage} = useWallet();
//     const [balance, setBalance] = useState(0);

//     async function signAndSend() {
//         if (!publicKey) {
//             return;
//         }
//         const message = new TextEncoder().encode("Sign into mechanical turks as a worker");
//         const signature = await signMessage?.(message);
//         console.log(signature)
//         console.log(publicKey)
//         const response = await axios.post(`${BACKEND_URL}/v1/worker/signin`, {
//             signature,
//             publicKey: publicKey?.toString()
//         });

//         setBalance(response.data.amount)

//         localStorage.setItem("token", response.data.token);
//     }

//     useEffect(() => {
//         signAndSend()
//     }, [publicKey]);

//     return <div className="flex justify-between border-b pb-2 pt-2">
//         <div className="text-2xl pl-4 flex justify-center pt-2">
//             DLab
//         </div>
//         <div className="text-xl pr-4 flex" >
//             <button onClick={() => {
//                 axios.post(`${BACKEND_URL}/v1/worker/payout`, {
                    
//                 }, {
//                     headers: {
//                         "Authorization": localStorage.getItem("token")
//                     }
//                 })
//             }} className="m-2 mr-4 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">Pay me out ({balance}) SOL</button>
//             {publicKey  ? <WalletDisconnectButton /> : <WalletMultiButton />}
//         </div>
//     </div>
// }