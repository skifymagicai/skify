import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, ArrowLeft, File, CheckCircle, AlertCircle, X } from "lucide-react";

const SUPPORTED_FORMATS = ["MP4", "MOV", "AVI", "MKV", "WMV"];
const MAX_FILE_SIZE = "2GB";
const MAX_DURATION = "15 minutes";

interface UploadedFile {
  name: string;
  size: string;
  type: string;
  file: File;
}

export default function UploadApply() {
  const [, setLocation] = useLocation();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBack = () => {
    setLocation("/");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file: File) => {
    const isVideoFile = file.type.startsWith('video/');
    if (!isVideoFile) {
      alert('Please select a video file');
      return;
    }

    setUploadedFile({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.type,
      file: file
    });

    simulateUpload();
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadComplete(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadComplete(false);
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleApplyTemplate = () => {
    setLocation("/comparison-export");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-900"
              data-testid="back-button"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Upload Your Video</h1>
              <p className="text-sm text-gray-500">Upload your video to apply the selected template</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {!uploadedFile ? (
          /* Upload Area */
          <Card className="mb-8">
            <CardContent className="p-8">
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                  isDragOver 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                data-testid="upload-area"
              >
                <div className="flex flex-col items-center space-y-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <Upload className="h-10 w-10 text-blue-600" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-gray-900">Upload your video</h3>
                    <p className="text-gray-600">
                      Drag and drop your video file here, or click to browse
                    </p>
                  </div>

                  <Button 
                    onClick={handleChooseFile}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                    data-testid="choose-file-button"
                  >
                    Choose Video File
                  </Button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                    data-testid="file-input"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* File Upload Status */
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Uploaded Video</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="text-gray-500 hover:text-gray-700"
                  data-testid="remove-file-button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <File className="h-6 w-6 text-blue-600" />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900" data-testid="file-name">
                    {uploadedFile.name}
                  </h4>
                  <p className="text-sm text-gray-500" data-testid="file-size">
                    {uploadedFile.size}
                  </p>
                </div>

                <div className="flex items-center">
                  {uploadComplete ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : isUploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  ) : null}
                </div>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Uploading...</span>
                    <span className="font-medium" data-testid="upload-progress">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {uploadComplete && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 font-medium">Upload complete!</span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    Your video is ready to be processed with the selected template.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* File Requirements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">File Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <File className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Supported Formats</h4>
                <div className="space-y-1">
                  {SUPPORTED_FORMATS.map((format) => (
                    <span key={format} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded mr-1">
                      {format}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Upload className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">File Size Limit</h4>
                <p className="text-gray-600">Maximum {MAX_FILE_SIZE}</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Duration Limit</h4>
                <p className="text-gray-600">Maximum {MAX_DURATION}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Selection Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Selected Template</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <img 
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120"
                alt="Template preview"
                className="w-20 h-12 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Cinematic Travel Pack</h4>
                <p className="text-sm text-gray-600">Film grain, color grading, smooth transitions</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLocation("/template-preview")}
                data-testid="change-template-button"
              >
                Change Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="text-center">
          <Button 
            onClick={handleApplyTemplate}
            disabled={!uploadComplete}
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="apply-template-button"
          >
            {uploadComplete ? "Apply Template to Video" : "Upload Video First"}
          </Button>
          
          {uploadComplete && (
            <p className="text-sm text-gray-500 mt-3">
              Processing usually takes 30-60 seconds depending on video length
            </p>
          )}
        </div>
      </div>
    </div>
  );
}