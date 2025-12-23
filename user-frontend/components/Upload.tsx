"use client";
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { UploadImage } from "@/components/uploadImage";
import { BACKEND_URL, PLATFORM_WALLET } from "@/utils";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

export const Upload = () => {
    const [images, setImages] = useState<string[]>([]);
    const [title, setTitle] = useState("");
    const [txSignature, setTxSignature] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { publicKey, sendTransaction } = useWallet();
    const { connection } = useConnection();
    const router = useRouter();

    async function onSubmit() {
        if (!publicKey) {
            alert('Please connect your wallet first!');
            return;
        }

        if (images.length < 2) {
            alert('Please upload at least 2 images for comparison');
            return;
        }

        if (!title.trim()) {
            alert('Please enter a task title');
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            alert('Please sign in with your wallet first!');
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to create this task?\n\nTitle: ${title}\nImages: ${images.length}\nPayment: 0.1 SOL\n\nThis will deduct 0.1 SOL from your wallet.`
        );

        if (!confirmed) {
            return;
        }

        setSubmitting(true);
        try {
            console.log('Submitting task with:', {
                title,
                imageCount: images.length,
                signature: txSignature,
                token: token ? 'Present' : 'Missing'
            });

            // Create task on backend
            const response = await axios.post(`${BACKEND_URL}/v1/user/task`, {
                options: images.map(image => ({
                    imageUrl: image,
                })),
                title,
                signature: txSignature || "pending"
            }, {
                headers: {
                    "Authorization": token
                }
            });

            console.log('Task created successfully:', response.data);
            alert(`Task created successfully! Redirecting to results...`);
            router.push(`/task/${response.data.id}`);
        } catch (error) {
            console.error('Error creating task:', error);
            if (axios.isAxiosError(error)) {
                console.error('Response data:', error.response?.data);
                console.error('Response status:', error.response?.status);
                if (error.response?.status === 403) {
                    alert('Authentication failed. Please reconnect your wallet.');
                    localStorage.removeItem('token');
                } else {
                    const errorMsg = error.response?.data?.error || error.message;
                    alert(`Failed to create task: ${errorMsg}`);
                }
            } else {
                alert('Failed to create task. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    }

    async function makePayment() {
        if (!publicKey || !sendTransaction) {
            alert('Please connect your wallet first!');
            return;
        }

        try {
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey(PLATFORM_WALLET),
                    lamports: 100000000, // 0.1 SOL
                })
            );

            const {
                context: { slot: minContextSlot },
                value: { blockhash, lastValidBlockHeight }
            } = await connection.getLatestBlockhashAndContext();

            const signature = await sendTransaction(transaction, connection, { minContextSlot });

            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });

            setTxSignature(signature);
            console.log('Payment confirmed:', signature);
        } catch (error) {
            console.error('Payment failed:', error);
            alert('Payment failed. Please try again.');
        }
    }

    return (
        <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex justify-center items-center px-4 py-12 min-h-[calc(100vh-80px)]">
            <div className="max-w-2xl w-full">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-700 to-gray-700 px-8 py-6">
                        <h2 className="text-2xl font-bold text-white">Create New Task</h2>
                        <p className="text-slate-200 text-sm mt-1">Upload images and get feedback from workers</p>
                    </div>

                    <div className="p-8">
                        {/* Task Title */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Task Title
                            </label>
                            <input 
                                onChange={(e) => setTitle(e.target.value)}
                                type="text" 
                                placeholder="e.g., Select the most clickable thumbnail"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-white text-gray-800 placeholder-gray-400"
                                value={title}
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Upload Images (Minimum 2)
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-slate-400 hover:bg-gray-50 transition-all">
                                <UploadImage onImageAdded={(imageUrl) => {
                                    setImages(prev => [...prev, imageUrl]);
                                }} />
                                <p className="text-gray-500 text-sm mt-3">Click to upload or drag and drop</p>
                                <p className="text-gray-400 text-xs mt-1">PNG, JPG, GIF up to 10MB</p>
                            </div>
                        
                            {images.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm text-gray-600 font-medium mb-3">
                                    Uploaded Images ({images.length})
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    {images.map((image, index) => (
                                        <div key={index} className="relative group">
                                                    <img 
                                                src={image} 
                                                className="w-full h-32 object-cover rounded-lg border border-gray-300 shadow-sm group-hover:shadow-md transition-shadow"
                                                alt={`Upload ${index + 1}`}
                                                onError={(e) => {
                                                    console.error('Image failed to load:', image);
                                                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAzMEMxNi42ODYzIDMwIDEzLjkzNzMgMjkuMjY3IDExLjc2MjcgMjcuODAxQzEwLjQxMTggMjcuMDY3IDEwIDI2IDEwIDI2VjE0QzEwIDEyLjg5NTQgMTAuODk1NCAxMiAxMiAxMkgyOEMyOS4xMDQ2IDEyIDMwIDEyLjg5NTQgMzAgMTRWMjZDMzAgMjYgMjkuNTg4MiAyNy4wNjcgMjguMjM3MyAyNy44MDFDMJYuMDYyNyAyOS4yNjcgMjMuMzEzNyAzMCAyMCAzMFoiIGZpbGw9IiNEMUQ1REIiLz4KPHBhdGggZD0iTTE2IDIwQzE3LjEwNDYgMjAgMTggMTkuMTA0NiAxOCAxOEMxOCAxNi44OTU0IDE3LjEwNDYgMTYgMTYgMTZDMTQuODk1NCAxNiAxNCAxNi44OTU0IDE0IDE4QzE0IDE5LjEwNDYgMTQuODk1NCAyMCAxNiAyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI2IDI2TDIyIDIyTDE4IDI2SDE0VjE0SDI2VjI2WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                                                }}
                                                onLoad={() => {
                                                    console.log('Image loaded successfully:', image);
                                                }}
                                            />
                                            <button
                                                onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold hover:bg-red-600 shadow-md transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            )}
                        </div>

                        {/* Payment and Submit */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            {!txSignature ? (
                                <div>
                                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-700">Task Cost</p>
                                                <p className="text-xs text-gray-500 mt-1">One-time payment</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-slate-700">0.1 SOL</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={makePayment}
                                        disabled={images.length < 2 || !title.trim() || !publicKey}
                                        className="w-full bg-slate-700 text-white py-4 px-6 rounded-lg font-semibold hover:bg-slate-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg disabled:shadow-none"
                                    >
                                        {publicKey ? 'Pay 0.1 SOL' : 'Connect Wallet First'}
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <div className="flex items-center justify-center w-10 h-10 bg-green-500 rounded-full">
                                                    <span className="text-white text-lg font-bold">✓</span>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <p className="text-sm font-semibold text-green-800">Payment Confirmed</p>
                                                <p className="text-xs text-green-700 mt-1 font-mono break-all">
                                                    {txSignature.slice(0, 16)}...{txSignature.slice(-16)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={onSubmit}
                                        disabled={submitting}
                                        className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
                                    >
                                        {submitting ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Creating Task...
                                            </span>
                                        ) : 'Create Task'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Status Indicators */}
                        {(title || images.length > 0 || txSignature) && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Progress</p>
                                <div className="flex justify-between items-center space-x-4">
                                    <div className={`flex items-center space-x-2 ${title ? 'text-green-600' : 'text-gray-400'}`}>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${title ? 'border-green-600 bg-green-600' : 'border-gray-300'}`}>
                                            {title && <span className="text-white text-xs">✓</span>}
                                        </div>
                                        <span className="text-sm font-medium">Title</span>
                                    </div>
                                    <div className={`flex items-center space-x-2 ${images.length >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${images.length >= 2 ? 'border-green-600 bg-green-600' : 'border-gray-300'}`}>
                                            {images.length >= 2 && <span className="text-white text-xs">✓</span>}
                                        </div>
                                        <span className="text-sm font-medium">Images</span>
                                    </div>
                                    <div className={`flex items-center space-x-2 ${txSignature ? 'text-green-600' : 'text-gray-400'}`}>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${txSignature ? 'border-green-600 bg-green-600' : 'border-gray-300'}`}>
                                            {txSignature && <span className="text-white text-xs">✓</span>}
                                        </div>
                                        <span className="text-sm font-medium">Payment</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};