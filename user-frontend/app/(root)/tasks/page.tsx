"use client"
import { Appbar } from '@/components/Appbar';
import { BACKEND_URL } from '@/utils';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Task {
    id: number;
    title: string;
    done: boolean;
    amount: number;
    options: any[];
    submissions?: any[];
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log('Token:', token ? 'Present' : 'Missing');
                
                if (!token) {
                    router.push('/');
                    return;
                }

                console.log('Fetching tasks from:', `${BACKEND_URL}/v1/user/tasks`);
                const response = await axios.get(`${BACKEND_URL}/v1/user/tasks`, {
                    headers: { Authorization: token }
                });

                console.log('Tasks response:', response.data);
                setTasks(response.data || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                if (axios.isAxiosError(error)) {
                    setError(`Error: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
                } else {
                    setError('Failed to fetch tasks');
                }
                setLoading(false);
            }
        };

        fetchTasks();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
                <Appbar />
                <div className="flex justify-center items-center h-screen">
                    <div className="text-2xl text-gray-600">Loading your tasks...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
                <Appbar />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl shadow-md transition-all hover:shadow-lg border border-gray-200 mb-6"
                    >
                        <span>←</span>
                        <span>Back to Home</span>
                    </button>
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
                        <div className="text-2xl mb-2">❌ Error</div>
                        <p className="text-red-700 font-semibold mb-4">{error}</p>
                        <details className="text-sm text-red-600 bg-white p-4 rounded border border-red-200">
                            <summary className="cursor-pointer font-medium">Debug Info</summary>
                            <div className="mt-2 space-y-2 font-mono text-xs">
                                <p>Backend URL: {BACKEND_URL}</p>
                                <p>Token present: {localStorage.getItem('token') ? 'Yes' : 'No'}</p>
                                <p>Check browser console for more details</p>
                            </div>
                        </details>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
            <Appbar />
            
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl shadow-md transition-all hover:shadow-lg border border-gray-200 mb-6"
                    >
                        <span>←</span>
                        <span>Back to Home</span>
                    </button>
                    <h1 className="text-4xl font-bold text-gray-800">All Your Tasks</h1>
                    <p className="text-gray-600 mt-2">Click on any task to view detailed analytics</p>
                </div>

                {/* Tasks Grid */}
                {tasks.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                        <div className="text-6xl mb-4">📭</div>
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2">No tasks yet</h2>
                        <p className="text-gray-500 mb-6">Create your first task to get started!</p>
                        <button
                            onClick={() => router.push('/')}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-lg transition-all hover:shadow-xl font-semibold"
                        >
                            Create a Task
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tasks.map((task) => {
                            const totalVotes = task.options?.reduce((sum, opt) => sum + (opt.submissions?.length || 0), 0) || 0;
                            const topOption = task.options?.reduce((max, opt) => 
                                (opt.submissions?.length || 0) > (max.submissions?.length || 0) ? opt : max
                            , task.options[0]);

                            return (
                                <div
                                    key={task.id}
                                    onClick={() => router.push(`/task/${task.id}`)}
                                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all cursor-pointer border border-gray-100 hover:border-purple-300"
                                >
                                    {/* Task Image Preview */}
                                    <div className="relative h-40 bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden">
                                        {topOption?.image_url ? (
                                            <img
                                                src={topOption.image_url}
                                                alt={task.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+PC9zdmc+';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl">📊</div>
                                        )}
                                        {/* Badge */}
                                        <div className="absolute top-3 right-3 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                            {totalVotes} votes
                                        </div>
                                    </div>

                                    {/* Task Info */}
                                    <div className="p-6">
                                        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                                            {task.title}
                                        </h3>
                                        
                                        <div className="mb-4 space-y-2">
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Options:</span>
                                                <span className="font-semibold text-blue-600">{task.options?.length || 0}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Total Votes:</span>
                                                <span className="font-semibold text-purple-600">{totalVotes}</span>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        {totalVotes > 0 ? (
                                            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                                                <span className="text-lg">✓</span>
                                                <span>Active</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                                <span className="text-lg">⏳</span>
                                                <span>Waiting for votes</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Button */}
                                    <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50 border-t border-gray-100">
                                        <button className="w-full text-center text-purple-600 hover:text-purple-700 font-semibold text-sm transition-colors">
                                            View Analytics →
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
