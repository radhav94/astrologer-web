import { useState } from "react";
import { useGetS3SignedUrlMutation } from "../redux/s3SignedApi";
import { useFileSelector } from "../screens/private/chat/filePicker/useFileSelector";
import { Toast } from "../components";

/**
 * Custom hook for handling file uploads to S3
 * @returns {Object} - { uploadFile, loading, error, finalUploadUrl }
 * 
 * @example
 * const { uploadFile, loading, error, finalUploadUrl } = useFileUpload();
 * 
 * const handleUpload = async () => {
 *   const url = await uploadFile("image/*,.pdf");
 *   if (url) {
 *     console.log("Uploaded file URL:", url);
 *   }
 * };
 */
export const useFileUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [finalUploadUrl, setFinalUploadUrl] = useState(null);

  const [getS3SignedUrl] = useGetS3SignedUrlMutation();
  const { openFileSelector } = useFileSelector();

  /**
   * Upload file to S3
   * @param {string} uploadUrl - S3 signed upload URL
   * @param {Blob} blob - File blob to upload
   * @returns {Promise<string>} - Success message
   */
  const uploadFileToS3 = async (uploadUrl, blob) => {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      body: blob,
      headers: {
        "Content-Type": blob.type,
      },
    });

    if (!res.ok) {
      throw new Error("S3 upload failed");
    }

    return "success";
  };

  /**
   * Main upload function
   * @param {string} acceptTypes - Accepted file types (default: "image/*,.pdf")
   * @param {boolean} showToast - Whether to show success/error toasts (default: true)
   * @returns {Promise<string|null>} - Uploaded file URL or null if failed
   */
  const uploadFile = async (acceptTypes = "image/*,.pdf", showToast = true) => {
    try {
      setLoading(true);
      setError(null);
      setFinalUploadUrl(null);

      // Open file selector
      const { blob } = await openFileSelector(acceptTypes);

      // Get signed URL from API
      const signedUrl = await getS3SignedUrl({
        fileType: blob.type,
      }).unwrap();

      const uploadUrl = signedUrl.uploadUrl;
      const fileUrl = uploadUrl.split("?")[0];

      // Upload to S3
      await uploadFileToS3(uploadUrl, blob);

      // Set final upload URL
      setFinalUploadUrl(fileUrl);

      if (showToast) {
        Toast.success("File uploaded successfully");
      }

      return fileUrl;
    } catch (err) {
      console.error("File upload error:", err);
      
      // Don't show error if user cancelled file selection
      if (err !== "No file selected") {
        setError(err.message || "Failed to upload file");
        if (showToast) {
          Toast.error("Failed to upload file");
        }
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset hook state
   */
  const reset = () => {
    setLoading(false);
    setError(null);
    setFinalUploadUrl(null);
  };

  return {
    uploadFile,
    loading,
    error,
    finalUploadUrl,
    reset,
  };
};
