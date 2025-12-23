"use client"
import { BACKEND_URL, CLOUDFRONT_URL } from "@/utils";
import axios from "axios";
import { useState } from "react"

export function UploadImage({ onImageAdded, image }: {
    onImageAdded: (image: string) => void;
    image?: string;
}) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function uploadWithRetry(uploadFn: () => Promise<void>, maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                await uploadFn();
                return;
            } catch (error) {
                console.error(`Upload attempt ${i + 1} failed:`, error);
                if (i === maxRetries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }

    async function onFileSelect(e: any) {
        setUploading(true);
        setError(null);
        try {
            const file = e.target.files[0];
            
            if (!file) {
                setUploading(false);
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                setUploading(false);
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                setUploading(false);
                return;
            }
            
            // Check if user is authenticated
            const token = localStorage.getItem("token");
            if (!token) {
                setError('Please connect your wallet and sign in first!');
                setUploading(false);
                return;
            }

            console.log('Getting presigned URL for upload...');

            await uploadWithRetry(async () => {
                // Get presigned URL from backend
                const presignedResponse = await axios.get(`${BACKEND_URL}/v1/user/presignedUrl`, {
                    headers: {
                        "Authorization": token
                    }
                });

                console.log('Presigned URL response:', presignedResponse.data);

                const { preSignedUrl, fields, cloudFrontUrl } = presignedResponse.data;

                // Create FormData for S3 upload
                const formData = new FormData();
                Object.keys(fields).forEach(key => {
                    formData.append(key, fields[key]);
                });
                formData.append('file', file);

                console.log('Uploading directly to S3...');
                
                // Upload to S3 using presigned URL
                await axios.post(preSignedUrl, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                console.log('Upload successful! CloudFront URL:', cloudFrontUrl);
                
                // Use CloudFront URL for displaying the image
                onImageAdded(cloudFrontUrl);
            });
            
            setUploading(false);
        } catch(e) {
            console.error('Upload failed:', e);
            if (axios.isAxiosError(e)) {
                if (e.response?.status === 403) {
                    setError('Upload authentication failed. Please reconnect your wallet.');
                } else if (e.response?.status === 404) {
                    setError('Upload failed: Bucket not found.');
                } else if (e.response?.status === 429) {
                    setError('Too many requests. Please try again later.');
                } else {
                    setError(`Upload failed: ${e.response?.data?.error || e.message}`);
                }
            } else {
                setError('Upload failed with unknown error.');
            }
            setUploading(false);
        }
    }

    if (image) {
        return <img className={"p-2 w-96 rounded"} src={image} alt="Uploaded" />
    }

    return (
        <div className="flex justify-center">
            <div className="relative group cursor-pointer">
                {error && (
                    <div className="absolute -top-16 left-0 right-0 bg-red-500 text-white text-sm p-2 rounded-lg z-10">
                        {error}
                    </div>
                )}
                <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center group-hover:border-blue-400 group-hover:bg-blue-50 transition-all">
                    {uploading ? (
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                            <div className="text-sm text-gray-500">Uploading...</div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="text-4xl text-gray-400 mb-2 group-hover:text-blue-500 transition-colors">+</div>
                            <div className="text-sm text-gray-500 group-hover:text-blue-600">Add Image</div>
                        </div>
                    )}
                </div>
                {!uploading && (
                    <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        onChange={onFileSelect} 
                    />
                )}
            </div>
        </div>
    );
}