"use client";
import {
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export const Appbar = () => {
    const { publicKey, signMessage } = useWallet();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasAttemptedAuth, setHasAttemptedAuth] = useState(false);
    const [userTasks, setUserTasks] = useState<any[]>([]);

    // Ensure component only renders wallet content after mounting
    useEffect(() => {
        setMounted(true);
    }, []);

    // Clear authentication when wallet disconnects
    useEffect(() => {
        if (mounted && !publicKey) {
            // Wallet is disconnected, clear auth state
            setAuthenticated(false);
            setHasAttemptedAuth(false);
            localStorage.removeItem('token');
        }
    }, [publicKey, mounted]);

    // Handle authentication when wallet connects
    useEffect(() => {
        if (!mounted || !publicKey || loading || hasAttemptedAuth) {
            return;
        }

        const token = localStorage.getItem('token');
        
        if (token) {
            // Token exists, mark as authenticated
            setAuthenticated(true);
            setHasAttemptedAuth(true);
        } else {
            // No token, trigger signin
            setHasAttemptedAuth(true);
            
            const signAndSend = async () => {
                if (!signMessage) return;
                
                setLoading(true);
                try {
                    const message = new TextEncoder().encode("Sign into DLab as a user");
                    const signature = await signMessage(message);
                    
                    const response = await axios.post(`${BACKEND_URL}/v1/user/signin`, {
                        signature: Array.from(signature),
                        publicKey: publicKey.toString()
                    });

                    localStorage.setItem("token", response.data.token);
                    setAuthenticated(true);
                } catch (error) {
                    console.error("Error signing in:", error);
                    setAuthenticated(false);
                } finally {
                    setLoading(false);
                }
            };
            
            signAndSend();
        }
    }, [publicKey, mounted, signMessage, loading, hasAttemptedAuth]);

    // Fetch user's tasks
    useEffect(() => {
        if (authenticated) {
            const fetchTasks = async () => {
                try {
                    const token = localStorage.getItem('token');
                    console.log('Fetching user tasks...');
                    const response = await axios.get(`${BACKEND_URL}/v1/user/task`, {
                        headers: { Authorization: token }
                    });
                    console.log('User tasks fetched:', response.data);
                    setUserTasks(response.data || []);
                } catch (error) {
                    console.error('Error fetching tasks:', error);
                }
            };
            fetchTasks();
        }
    }, [authenticated]);

    const handleDisconnect = () => {
        localStorage.removeItem('token');
        setAuthenticated(false);
        console.log('User disconnected and token cleared');
    };

    const navigateToLatestTask = () => {
        if (userTasks.length > 0) {
            const latestTask = userTasks[userTasks.length - 1];
            router.push(`/task/${latestTask.id}`);
        } else {
            alert('You have no tasks yet. Create one first!');
        }
    };

    if (!mounted) {
        return <div className="w-32 h-10 bg-gray-700 rounded animate-pulse"></div>;
    }

    return (
        <div className="flex justify-between border-b border-gray-800 pb-4 pt-4 bg-black shadow-sm">
            <div className="text-2xl pl-6 flex justify-center pt-2 font-bold text-white">
                DLab - Create Tasks • Get Insights
            </div>
            <div className="text-xl pr-4 flex items-center gap-4">
                {authenticated && (
                    <button
                        onClick={navigateToLatestTask}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={userTasks.length === 0}
                    >
                        📊 View Analysis {userTasks.length > 0 && `(${userTasks.length})`}
                    </button>
                )}
                {loading && (
                    <span className="text-yellow-600 text-sm font-medium">Signing in...</span>
                )}
                {authenticated && !loading && (
                    <span className="text-green-600 text-sm font-medium">✓ Authenticated</span>
                )}
                {mounted ? (
                    publicKey ? (
                        <div onClick={handleDisconnect}>
                            <WalletDisconnectButton />
                        </div>
                    ) : <WalletMultiButton />
                ) : (
                    <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
                )}
            </div>
        </div>
    );
};