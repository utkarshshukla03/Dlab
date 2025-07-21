"use client";

import { BACKEND_URL, CLOUDFRONT_URL } from "@/utils";
import axios from "axios";
import { useState } from "react";

export function UploadImage({
  onImageAdded,
  image,
}: {
  onImageAdded: (image: string) => void;
  image?: string;
}) {
  const [uploading, setUploading] = useState(false);

  async function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setUploading(true);
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      // ✅ Get the pre-signed URL from the backend
      const response = await axios.get(`${BACKEND_URL}/v1/user/presignedUrl`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const { preSignedUrl, fields } = response.data;
      console.log("Presigned URL response:", response.data);

      // ✅ Prepare form data for S3
      const formData = new FormData();
      formData.set("bucket", fields["bucket"]);
      formData.set("X-Amz-Algorithm", fields["X-Amz-Algorithm"]);
      formData.set("X-Amz-Credential", fields["X-Amz-Credential"]);
      formData.set("X-Amz-Date", fields["X-Amz-Date"]);
      formData.set("key", fields["key"]);
      formData.set("Policy", fields["Policy"]);
      formData.set("X-Amz-Signature", fields["X-Amz-Signature"]);
      formData.append("file", file);

      // ✅ Upload to AWS via preSigned URL
      const awsResponse = await axios.post(preSignedUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (awsResponse.status === 204 || awsResponse.status === 200) {
        const uploadedImageUrl = `${CLOUDFRONT_URL}/${fields["key"]}`;
        onImageAdded(uploadedImageUrl);
      } else {
        console.error("Upload failed", awsResponse);
      }
    } catch (error) {
      console.error("Upload error:", error);
    }

    setUploading(false);
  }

  if (image) {
    return <img className="p-2 w-96 rounded" src={image} alt="Uploaded" />;
  }

  return (
    <div>
      <div className="w-40 h-40 rounded border text-2xl cursor-pointer">
        <div className="h-full flex justify-center flex-col relative w-full">
          <div className="h-full flex justify-center w-full pt-16 text-4xl">
            {uploading ? (
              <div className="text-sm">Loading...</div>
            ) : (
              <>
                +
                <input
                  className="absolute opacity-0 top-0 left-0 right-0 bottom-0 w-full h-full"
                  type="file"
                  accept="image/*"
                  onChange={onFileSelect}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
