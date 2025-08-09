import React, { useState, useRef } from 'react';
import { Upload, Link, Camera, Play, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';

interface MobileUploadProps {
  onViralVideoUpload: (file: File | string) => void;
  onUserMediaUpload: (files: File[]) => void;
  isProcessing?: boolean;
}

export function MobileUpload({ onViralVideoUpload, onUserMediaUpload, isProcessing = false }: MobileUploadProps) {
  const [activeTab, setActiveTab] = useState<'viral' | 'media'>('viral');
  const [viralUrl, setViralUrl] = useState('');
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const viralFileRef = useRef<HTMLInputElement>(null);
  const mediaFileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleViralFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast({
          title: "File too large",
          description: "Viral videos must be under 100MB",
          variant: "destructive"
        });
        return;
      }
      onViralVideoUpload(file);
    }
  };

  const handleViralUrlSubmit = () => {
    if (!viralUrl.trim()) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid video URL",
        variant: "destructive"
      });
      return;
    }
    
    const supportedPlatforms = ['instagram.com', 'tiktok.com', 'youtube.com', 'youtu.be'];
    const isSupported = supportedPlatforms.some(platform => viralUrl.includes(platform));
    
    if (!isSupported) {
      toast({
        title: "Platform not supported",
        description: "Currently supports Instagram, TikTok, and YouTube",
        variant: "destructive"
      });
      return;
    }
    
    onViralVideoUpload(viralUrl);
    setViralUrl('');
  };

  const handleMediaFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      if (file.size > 500 * 1024 * 1024) { // 500MB per file
        toast({
          title: "File too large",
          description: `${file.name} is over 500MB limit`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setPreviewFiles(validFiles);
      onUserMediaUpload(validFiles);
    }
  };

  const removePreviewFile = (index: number) => {
    const newFiles = previewFiles.filter((_, i) => i !== index);
    setPreviewFiles(newFiles);
    onUserMediaUpload(newFiles);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6" data-testid="mobile-upload">
      {/* Tab Navigation */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'viral'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
          onClick={() => setActiveTab('viral')}
          data-testid="tab-viral"
        >
          <Play className="w-4 h-4 inline mr-2" />
          Viral Video
        </button>
        <button
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'media'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
          onClick={() => setActiveTab('media')}
          data-testid="tab-media"
        >
          <Camera className="w-4 h-4 inline mr-2" />
          Your Media
        </button>
      </div>

      {/* Viral Video Upload */}
      {activeTab === 'viral' && (
        <Card className="border-dashed border-2 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto">
              <Play className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Add Viral Video</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload or paste a link to extract the viral style
              </p>
            </div>

            {/* URL Input */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Paste Instagram, TikTok, or YouTube link"
                  value={viralUrl}
                  onChange={(e) => setViralUrl(e.target.value)}
                  className="flex-1"
                  data-testid="input-viral-url"
                />
                <Button 
                  onClick={handleViralUrlSubmit}
                  disabled={!viralUrl.trim() || isProcessing}
                  size="sm"
                  data-testid="button-submit-url"
                >
                  <Link className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <hr className="flex-1 border-gray-200 dark:border-gray-700" />
                <span className="text-xs text-gray-500">OR</span>
                <hr className="flex-1 border-gray-200 dark:border-gray-700" />
              </div>

              <Button
                variant="outline"
                onClick={() => viralFileRef.current?.click()}
                disabled={isProcessing}
                className="w-full"
                data-testid="button-upload-viral"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Video File
              </Button>
            </div>

            <div className="flex flex-wrap gap-1 justify-center">
              <Badge variant="secondary" className="text-xs">Instagram</Badge>
              <Badge variant="secondary" className="text-xs">TikTok</Badge>
              <Badge variant="secondary" className="text-xs">YouTube</Badge>
            </div>

            <input
              ref={viralFileRef}
              type="file"
              accept="video/*"
              onChange={handleViralFileSelect}
              className="hidden"
            />
          </CardContent>
        </Card>
      )}

      {/* User Media Upload */}
      {activeTab === 'media' && (
        <Card className="border-dashed border-2 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
              <Camera className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Your Media</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload your videos or photos to transform
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => mediaFileRef.current?.click()}
              disabled={isProcessing}
              className="w-full"
              data-testid="button-upload-media"
            >
              <Upload className="w-4 h-4 mr-2" />
              Select Files
            </Button>

            <p className="text-xs text-gray-500">
              Supports multiple files • Max 500MB each
            </p>

            <input
              ref={mediaFileRef}
              type="file"
              accept="video/*,image/*"
              multiple
              onChange={handleMediaFileSelect}
              className="hidden"
            />
          </CardContent>
        </Card>
      )}

      {/* File Previews */}
      {previewFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Files ({previewFiles.length})</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {previewFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-md"
              >
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                  {file.type.startsWith('video') ? (
                    <Play className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Camera className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePreviewFile(index)}
                  data-testid={`button-remove-${index}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}