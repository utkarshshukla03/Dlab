"use client"
import { BACKEND_URL } from "../utils";
import axios from "axios";
import { useEffect, useState } from "react"

interface Task {
    "id": number,
    "amount": number,
    "title": string,
    "options": {
        id: number;
        image_url: string;
        task_id: number
    }[]
}

interface TaskHistory {
    taskId: number;
    title: string;
    reward: string;
    timestamp: Date;
    selectedOption?: number;
}

// CSR
export const NextTask = () => {
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [taskHistory, setTaskHistory] = useState<TaskHistory[]>([]);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    useEffect(() => {
        setMounted(true);
        // Load history from localStorage
        const savedHistory = localStorage.getItem('taskHistory');
        if (savedHistory) {
            setTaskHistory(JSON.parse(savedHistory));
        }
    }, []);

    const saveToHistory = (task: Task, optionId: number, reward: string) => {
        const newEntry: TaskHistory = {
            taskId: task.id,
            title: task.title,
            reward,
            timestamp: new Date(),
            selectedOption: optionId
        };
        const updatedHistory = [newEntry, ...taskHistory].slice(0, 50); // Keep last 50
        setTaskHistory(updatedHistory);
        localStorage.setItem('taskHistory', JSON.stringify(updatedHistory));
    };

    useEffect(() => {
        if (!mounted) return;
        
        setLoading(true);
        const token = localStorage.getItem("token");
        
        if (!token) {
            console.log("No authentication token found");
            setLoading(false);
            setCurrentTask(null);
            return;
        }

        console.log("Fetching next task...");
        axios.get(`${BACKEND_URL}/v1/worker/nextTask`, {
            headers: {
                "Authorization": token
            }
        })
            .then(res => {
                console.log("Task response:", res.data);
                setCurrentTask(res.data.task);
                setLoading(false)
            })
            .catch(e => {
                console.error("Error fetching next task:", e);
                console.error("Error response:", e.response?.data);
                setLoading(false)
                setCurrentTask(null)
            })
    }, [mounted])
    
    if (!mounted || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <div className="text-2xl text-gray-700 font-medium">Loading tasks...</div>
                </div>
            </div>
        );
    }

    if (!currentTask) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
                {/* History Sidebar */}
                {showHistory && (
                    <>
                        <div 
                            className="fixed inset-0 backdrop-blur-sm bg-white/30 z-40"
                            onClick={() => setShowHistory(false)}
                        />
                        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto">
                            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 z-10">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold">Task History</h2>
                                    <button
                                        onClick={() => setShowHistory(false)}
                                        className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <p className="text-indigo-100 mt-2">
                                    {taskHistory.length} tasks completed
                                </p>
                            </div>
                            
                            <div className="p-4 space-y-3">
                                {taskHistory.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <div className="text-5xl mb-3">📋</div>
                                        <p>No history yet</p>
                                    </div>
                                ) : (
                                    taskHistory.map((entry, index) => (
                                        <div
                                            key={index}
                                            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-gray-800 flex-1">
                                                    {entry.title}
                                                </h3>
                                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                                    {entry.reward}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {new Date(entry.timestamp).toLocaleString()}
                                            </p>
                                            <div className="mt-2 text-xs text-gray-600">
                                                Task #{entry.taskId}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}

                <div className="max-w-4xl mx-auto px-4 py-16">
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                        <div className="text-8xl mb-6">🎉</div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">All Done!</h2>
                        <p className="text-xl text-gray-600 mb-8">
                            No pending tasks at the moment. Check back soon for more opportunities to earn!
                        </p>
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg transition-all"
                        >
                            📜 View Your History
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
            {/* History Sidebar Toggle Button */}
            <button
                onClick={() => setShowHistory(!showHistory)}
                className="fixed top-24 right-4 z-50 bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-xl shadow-lg border-2 border-gray-200 transition-all hover:shadow-xl flex items-center gap-2"
            >
                <span className="text-xl">📜</span>
                <span className="font-medium">History</span>
                {taskHistory.length > 0 && (
                    <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                        {taskHistory.length}
                    </span>
                )}
            </button>

            {/* History Sidebar */}
            {showHistory && (
                <>
                    <div 
                        className="fixed inset-0 backdrop-blur-sm bg-white/30 z-40"
                        onClick={() => setShowHistory(false)}
                    />
                    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 z-10">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold">Task History</h2>
                                <button
                                    onClick={() => setShowHistory(false)}
                                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
                                >
                                    ✕
                                </button>
                            </div>
                            <p className="text-indigo-100 mt-2">
                                {taskHistory.length} tasks completed
                            </p>
                        </div>
                        
                        <div className="p-4 space-y-3">
                            {taskHistory.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <div className="text-5xl mb-3">📋</div>
                                    <p>No history yet</p>
                                </div>
                            ) : (
                                taskHistory.map((entry, index) => (
                                    <div
                                        key={index}
                                        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-gray-800 flex-1">
                                                {entry.title}
                                            </h3>
                                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                                {entry.reward}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {new Date(entry.timestamp).toLocaleString()}
                                        </p>
                                        <div className="mt-2 text-xs text-gray-600">
                                            Task #{entry.taskId}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Task Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-gray-800">
                            {currentTask.title}
                        </h1>
                        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl font-semibold">
                            <span className="text-xl">💰</span>
                            <span>+0.01 SOL</span>
                        </div>
                    </div>
                    <p className="text-gray-600">
                        Select the option you think is best. Your choice will be recorded anonymously.
                    </p>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {currentTask.options.map(option => (
                        <div
                            key={option.id}
                            onClick={async () => {
                                if (submitting) return;
                                setSelectedOption(option.id);
                                setSubmitting(true);
                                try {
                                    const token = localStorage.getItem("token");
                                    if (!token) {
                                        console.error("No authorization token found");
                                        setSubmitting(false);
                                        return;
                                    }

                                    const response = await axios.post(`${BACKEND_URL}/v1/worker/submission`, {
                                        taskId: currentTask.id,
                                        selection: option.id.toString()
                                    }, {
                                        headers: {
                                            "Authorization": token
                                        }
                                    });

                                    console.log("Submission response:", response.data);
                                    
                                    const newBalance = response.data.nextTask?.amount || "0.01";
                                    saveToHistory(currentTask, option.id, `+0.01 SOL`);

                                    // Dispatch event for balance update
                                    window.dispatchEvent(new CustomEvent('balanceUpdate', {
                                        detail: { balance: newBalance }
                                    }));

                                    setCurrentTask(response.data.nextTask);
                                    setSubmitting(false);
                                    setSelectedOption(null);
                                } catch (e: any) {
                                    console.error("Error submitting task:", e);
                                    console.error("Error response:", e.response?.data);
                                    alert(e.response?.data?.message || "Failed to submit. Please try again.");
                                    setSubmitting(false);
                                    setSelectedOption(null);
                                }
                            }}
                            className={`group cursor-pointer transition-all duration-300 ${
                                selectedOption === option.id ? 'opacity-50' : 'hover:scale-[1.02]'
                            } ${submitting ? 'pointer-events-none' : ''}`}
                        >
                            <div className={`bg-white rounded-2xl shadow-lg overflow-hidden border-4 transition-all ${
                                selectedOption === option.id 
                                    ? 'border-indigo-600' 
                                    : 'border-transparent group-hover:border-indigo-300'
                            }`}>
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        src={option.image_url}
                        alt={`Option ${option.id}`}
                    />
                    {selectedOption === option.id && (
                        <div className="absolute inset-0 bg-indigo-600 bg-opacity-20 flex items-center justify-center">
                            <div className="bg-white rounded-full p-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-indigo-600"></div>
                            </div>
                        </div>
                    )}
                    </div>
                    <div className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-gray-700">
                                Option {option.id}
                            </span>
                            {selectedOption === option.id ? (
                                <span className="text-sm text-indigo-600 font-medium">Submitting...</span>
                            ) : (
                                <span className="text-sm text-gray-500 group-hover:text-indigo-600 transition-colors">
                                    Click to select
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        ))}
    </div>

    {/* Help Text */}
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
        <p className="text-blue-800">
            💡 <strong>Tip:</strong> Click on any image to submit your choice and earn rewards!
        </p>
    </div>
            </div>
        </div>
    );
};

