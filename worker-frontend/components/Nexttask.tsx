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

// CSR
export const NextTask = () => {
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        
        setLoading(true);
        const token = localStorage.getItem("token");
        
        if (!token) {
            setLoading(false);
            setCurrentTask(null);
            return;
        }

        axios.get(`${BACKEND_URL}/v1/worker/nextTask`, {
            headers: {
                "Authorization": token
            }
        })
            .then(res => {
                setCurrentTask(res.data.task);
                setLoading(false)
            })
            .catch(e => {
                console.error("Error fetching next task:", e);
                setLoading(false)
                setCurrentTask(null)
            })
    }, [mounted])
    
    if (!mounted || loading) {
        return <div className="h-screen flex justify-center flex-col">
            <div className="w-full flex justify-center text-2xl">
                Loading...
            </div>
        </div>
    }

    if (!currentTask) {
        return <div className="h-screen flex justify-center flex-col">
            <div className="w-full flex justify-center text-2xl">
                Please check back in some time, there are no pending tasks at the moment
            </div>
        </div>
    }

    return <div>
        <div className='text-2xl pt-20 flex justify-center'>
            {currentTask.title}
            <div className="pl-4">
                {submitting && "Submitting..."}
            </div>
        </div>
        <div className='flex justify-center pt-8'>
            {currentTask.options.map(option => <Option onSelect={async () => {
                setSubmitting(true);
                try {
                    const token = localStorage.getItem("token");
                    if (!token) {
                        console.error("No authorization token found");
                        setSubmitting(false);
                        return;
                    }

                    const response = await axios.post(`${BACKEND_URL}/v1/worker/submission`, {
                        taskId: currentTask.id.toString(),
                        selection: option.id.toString()
                    }, {
                        headers: {
                            "Authorization": token
                        }
                    });
    
                    const nextTask = response.data.nextTask;
                    if (nextTask) {
                        setCurrentTask(nextTask)
                    } else {
                        setCurrentTask(null);
                    }
                    // refresh the user balance in the appbar
                } catch(e) {
                    console.error("Something went wrong", e);
                }
                setSubmitting(false);

            }} key={option.id} imageUrl={option.image_url} />)}
        </div>
    </div>
}

function Option({imageUrl, onSelect}: {
    imageUrl: string;
    onSelect: () => void;
}) {
    return <div>
        <img 
            onClick={onSelect} 
            className={"p-2 w-96 rounded-md cursor-pointer hover:opacity-80 transition-opacity"} 
            src={imageUrl} 
            alt="Task option"
        />
    </div>
}


// "use client"
// import { BACKEND_URL } from "../utils";
// import axios from "axios";
// import { useEffect, useState } from "react"

// interface Task {
//     "id": number,
//     "amount": number,
//     "title": string,
//     "options": {
//         id: number;
//         image_url: string;
//         task_id: number
//     }[]
// }

// // CSR
// export const NextTask = () => {
//     const [currentTask, setCurrentTask] = useState<Task | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [submitting, setSubmitting] = useState(false);

//     useEffect(() => {
//         setLoading(true);
//         axios.get(`${BACKEND_URL}/v1/worker/nextTask`, {
//             headers: {
//                 "Authorization": localStorage.getItem("token")
//             }
//         })
//             .then(res => {
//                 setCurrentTask(res.data.task);
//                 setLoading(false)
//             })
//             .catch(e => {
//                 setLoading(false)
//                 setCurrentTask(null)
//             })
//     }, [])
    
//     if (loading) {
//         return <div className="h-screen flex justify-center flex-col">
//             <div className="w-full flex justify-center text-2xl">
//                 Loading...
//             </div>
//         </div>
//     }

//     if (!currentTask) {
//         return <div className="h-screen flex justify-center flex-col">
//             <div className="w-full flex justify-center text-2xl">
//                 Please check back in some time, there are no pending tasks at the moment
//             </div>
//         </div>
//     }

//     return <div>
//         <div className='text-2xl pt-20 flex justify-center'>
//             {currentTask.title}
//             <div className="pl-4">
//                 {submitting && "Submitting..."}
//             </div>
//         </div>
//         <div className='flex justify-center pt-8'>
//             {currentTask.options.map(option => <Option onSelect={async () => {
//                 setSubmitting(true);
//                 try {
//                     const response = await axios.post(`${BACKEND_URL}/v1/worker/submission`, {
//                         taskId: currentTask.id.toString(),
//                         selection: option.id.toString()
//                     }, {
//                         headers: {
//                             "Authorization": localStorage.getItem("token")
//                         }
//                     });
    
//                     const nextTask = response.data.nextTask;
//                     if (nextTask) {
//                         setCurrentTask(nextTask)
//                     } else {
//                         setCurrentTask(null);
//                     }
//                     // refresh the user balance in the appbar
//                 } catch(e) {
//                     console.error("Something went wrong",e);
//                 }
//                 setSubmitting(false);

//             }} key={option.id} imageUrl={option.image_url} />)}
//         </div>
//     </div>
// }

// function Option({imageUrl, onSelect}: {
//     imageUrl: string;
//     onSelect: () => void;
// }) {
//     return <div>
//         <img onClick={onSelect} className={"p-2 w-96 rounded-md"} src={imageUrl} />
//     </div>
// }