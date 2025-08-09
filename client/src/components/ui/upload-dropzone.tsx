import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Video, Image, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { apiClient } from '../../lib/api.js';

interface UploadDropzoneProps {
  onUploadComplete: (uploadId: string) => void;
  onUploadError: (error: string) => void;
  className?: string;
  maxSizeMB?: number;
}

interface UploadState {
  file: File | null;
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  uploadId?: string;
}

export function UploadDropzone({ 
  onUploadComplete, 
  onUploadError, 
  className,
  maxSizeMB = 500 
}: UploadDropzoneProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    progress: 0,
    status: 'idle'
  });

  const uploadFile = async (file: File) => {
    try {
      setUploadState({
        file,
        progress: 0,
        status: 'uploading'
      });

      // Get signed URL
      const signResponse = await apiClient.getUploadSignedUrl(
        file.name,
        file.type,
        file.size
      );

      // Upload to S3
      await apiClient.uploadFile(
        signResponse.data.signedUrl,
        file,
        (progress) => {
          setUploadState(prev => ({
            ...prev,
            progress: Math.round(progress * 0.8) // Reserve 20% for processing
          }));
        }
      );

      setUploadState(prev => ({
        ...prev,
        progress: 80,
        status: 'processing',
        uploadId: signResponse.data.uploadId
      }));

      // Complete upload
      await apiClient.completeUpload(signResponse.data.uploadId);

      setUploadState(prev => ({
        ...prev,
        progress: 100,
        status: 'completed'
      }));

      onUploadComplete(signResponse.data.uploadId);

    } catch (error: any) {
      setUploadState(prev => ({
        ...prev,
        status: 'error',
        error: error.message || 'Upload failed'
      }));
      onUploadError(error.message || 'Upload failed');
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        onUploadError(`File size exceeds ${maxSizeMB}MB limit`);
        return;
      }
      
      uploadFile(file);
    }
  }, [maxSizeMB]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif']
    },
    maxFiles: 1,
    disabled: uploadState.status === 'uploading' || uploadState.status === 'processing'
  });

  const resetUpload = () => {
    setUploadState({
      file: null,
      progress: 0,
      status: 'idle'
    });
  };

  const getStatusIcon = () => {
    switch (uploadState.status) {
      case 'completed':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      case 'uploading':
      case 'processing':
        return (
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        );
      default:
        return uploadState.file?.type.startsWith('video/') ? 
          <Video className="w-8 h-8 text-gray-400" /> : 
          <Image className="w-8 h-8 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (uploadState.status) {
      case 'uploading':
        return `Uploading ${uploadState.file?.name}...`;
      case 'processing':
        return 'Processing upload...';
      case 'completed':
        return 'Upload completed successfully!';
      case 'error':
        return uploadState.error || 'Upload failed';
      default:
        return isDragActive ? 'Drop your file here' : 'Drag & drop your video or image here';
    }
  };

  if (uploadState.status === 'completed') {
    return (
      <div className={cn(
        "border-2 border-dashed border-green-300 rounded-lg p-8 text-center bg-green-50 dark:bg-green-950",
        className
      )}>
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">
          Upload Successful!
        </h3>
        <p className="text-green-600 dark:text-green-400 mb-4">
          Your file has been uploaded and is being analyzed.
        </p>
        <Button onClick={resetUpload} variant="outline">
          Upload Another File
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive && !isDragReject && "border-blue-400 bg-blue-50 dark:bg-blue-950",
          isDragReject && "border-red-400 bg-red-50 dark:bg-red-950",
          uploadState.status === 'error' && "border-red-400 bg-red-50 dark:bg-red-950",
          uploadState.status === 'idle' && "border-gray-300 hover:border-gray-400 dark:border-gray-600",
          (uploadState.status === 'uploading' || uploadState.status === 'processing') && "border-blue-400 bg-blue-50 dark:bg-blue-950"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {getStatusIcon()}
          
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              {getStatusText()}
            </h3>
            
            {uploadState.status === 'idle' && (
              <p className="text-gray-500 dark:text-gray-400">
                Supports MP4, MOV, AVI, MKV, JPG, PNG, GIF (max {maxSizeMB}MB)
              </p>
            )}
            
            {(uploadState.status === 'uploading' || uploadState.status === 'processing') && (
              <div className="space-y-2">
                <Progress value={uploadState.progress} className="w-64 mx-auto" />
                <p className="text-sm text-gray-500">
                  {uploadState.progress}% complete
                </p>
              </div>
            )}
            
            {uploadState.status === 'error' && (
              <div className="space-y-2">
                <p className="text-red-600 dark:text-red-400">
                  {uploadState.error}
                </p>
                <Button onClick={resetUpload} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            )}
          </div>

          {uploadState.file && uploadState.status !== 'error' && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{uploadState.file.name}</span>
              <span>•</span>
              <span>{(uploadState.file.size / (1024 * 1024)).toFixed(1)} MB</span>
              {uploadState.status === 'idle' && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetUpload();
                  }}
                  variant="ghost"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}