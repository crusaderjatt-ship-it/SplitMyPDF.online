"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/integrations/supabase/session-context';
import { showSuccess, showError } from '@/utils/toast';
import { Progress } from '@/components/ui/progress';
import { logUserAction } from '@/utils/analytics'; // Import logUserAction

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const PdfUploader = () => {
  const { user } = useSession();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type !== 'application/pdf') {
        showError('Only PDF files are allowed.');
        setSelectedFile(null);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        showError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!user || !selectedFile) {
      showError('Please select a file and ensure you are logged in.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const filePath = `${user.id}/${selectedFile.name}`;

    try {
      const { data, error } = await supabase.storage
        .from('user_pdfs')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (event) => {
            if (event.totalBytes) {
              const progress = Math.round((event.loaded / event.totalBytes) * 100);
              setUploadProgress(progress);
            }
          },
        });

      if (error) {
        throw error;
      }

      showSuccess('PDF uploaded successfully!');
      setSelectedFile(null); // Clear selected file after successful upload
      setUploadProgress(0);
      
      // Log the upload action
      logUserAction(user.id, 'upload_pdf', { fileName: selectedFile.name, fileSize: selectedFile.size });

    } catch (error: any) {
      showError(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Upload PDF</h3>
      <div className="grid w-full items-center gap-1.5 mb-4">
        <Label htmlFor="pdf-upload" className="text-gray-700 dark:text-gray-300">Choose PDF file (Max {MAX_FILE_SIZE_MB}MB)</Label>
        <Input
          id="pdf-upload"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-700 dark:file:text-white dark:hover:file:bg-blue-600" // Adjusted dark mode file input styling
        />
      </div>
      {selectedFile && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Selected: {selectedFile.name}</p>
      )}
      {uploading && (
        <div className="mb-4">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Uploading... {uploadProgress}%</p>
        </div>
      )}
      <Button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        {uploading ? 'Uploading...' : 'Upload PDF'}
      </Button>
    </div>
  );
};

export default PdfUploader;