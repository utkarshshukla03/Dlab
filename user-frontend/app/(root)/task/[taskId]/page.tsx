"use client"
import { Appbar } from '@/components/Appbar';
import { BACKEND_URL } from '@/utils';
import axios from 'axios';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

async function getTaskDetails(taskId: string) {
    const response = await axios.get(`${BACKEND_URL}/v1/user/task?taskId=${taskId}`, {
        headers: {
            "Authorization": localStorage.getItem("token")
        }
    })
    return response.data
}

export default function Page({params}: {params: Promise<{ taskId: string }>}) {
    const { taskId } = use(params);
    const router = useRouter();
    const [result, setResult] = useState<Record<string, {
        count: number;
        option: {
            imageUrl: string
        }
    }>>({});
    const [taskDetails, setTaskDetails] = useState<{
        title?: string
    }>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTaskDetails(taskId)
            .then((data) => {
                setResult(data.result)
                setTaskDetails(data.taskDetails)
                setLoading(false)
            })
            .catch((error) => {
                console.error('Error fetching task details:', error);
                setLoading(false);
            })
    }, [taskId]);

    const totalVotes = Object.values(result || {}).reduce((sum, item) => sum + item.count, 0);
    const resultArray = Object.entries(result || {}).map(([id, data]) => ({
        id,
        ...data
    })).sort((a, b) => b.count - a.count);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
                <Appbar />
                <div className="flex justify-center items-center h-screen">
                    <div className="text-2xl text-gray-600">Loading results...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
            <Appbar />
            
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Navigation Bar */}
                <div className="mb-8 flex justify-between items-center">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl shadow-md transition-all hover:shadow-lg border border-gray-200"
                    >
                        <span>←</span>
                        <span>Back to Home</span>
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-lg transition-all hover:shadow-xl"
                    >
                        Create New Task
                    </button>
                </div>

                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
                        {taskDetails.title || 'Task Results'}
                    </h1>
                    <div className="flex justify-center items-center gap-6 text-gray-600">
                        <div className="flex items-center gap-2">
                            <span className="text-3xl">📊</span>
                            <span className="text-lg">Total Votes: <span className="font-semibold text-purple-600">{totalVotes}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl">🖼️</span>
                            <span className="text-lg">Options: <span className="font-semibold text-blue-600">{resultArray.length}</span></span>
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                {resultArray.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                        <div className="text-6xl mb-4">📭</div>
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2">No votes yet</h2>
                        <p className="text-gray-500">Workers haven't voted on this task yet. Check back later!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resultArray.map((item, index) => {
                            const percentage = totalVotes > 0 ? ((item.count / totalVotes) * 100).toFixed(1) : 0;
                            const isWinner = index === 0;
                            
                            return (
                                <div
                                    key={item.id}
                                    className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-2xl hover:scale-105 border-2 ${
                                        isWinner ? 'border-yellow-400 ring-4 ring-yellow-100' : 'border-gray-200'
                                    }`}
                                >
                                    {/* Winner Badge */}
                                    {isWinner && (
                                        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white py-2 px-4 text-center font-bold flex items-center justify-center gap-2">
                                            <span className="text-xl">🏆</span>
                                            <span>Most Popular</span>
                                        </div>
                                    )}
                                    
                                    {/* Image */}
                                    <div className="relative h-64 bg-gray-100">
                                        <img
                                            src={item.option.imageUrl}
                                            alt={`Option ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+PC9zdmc+';
                                            }}
                                        />
                                        {/* Rank Badge */}
                                        <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                                            #{index + 1}
                                        </div>
                                    </div>
                                    
                                    {/* Stats */}
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-gray-600 font-medium">Votes</span>
                                            <span className="text-3xl font-bold text-purple-600">{item.count}</span>
                                        </div>
                                        
                                        {/* Progress Bar */}
                                        <div className="mb-2">
                                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                <span>Percentage</span>
                                                <span className="font-semibold">{percentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="mt-12 flex justify-center gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 rounded-xl shadow-lg transition-all hover:shadow-xl border-2 border-gray-200 font-semibold"
                    >
                        🔄 Refresh Results
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl shadow-lg transition-all hover:shadow-xl font-semibold"
                    >
                        ✨ Create Another Task
                    </button>
                </div>
            </div>
        </div>
    );
}