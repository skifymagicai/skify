import React, { useState, useRef } from 'react';
import { Play, Pause, Download, Share2, Heart, MoreVertical, Maximize, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';

interface TemplatePreviewProps {
  videoUrl: string;
  templateName: string;
  processingProgress: number;
  isProcessing: boolean;
  isPro?: boolean;
  onDownload: (quality: '720p' | '1080p' | '4k') => void;
  onShare: () => void;
  onSaveTemplate: () => void;
  onEnhance4K?: () => void;
  metadata?: {
    duration: string;
    aspectRatio: string;
    fileSize: string;
    effects: number;
    textOverlays: number;
  };
}

export function TemplatePreview({
  videoUrl,
  templateName,
  processingProgress,
  isProcessing,
  isPro = false,
  onDownload,
  onShare,
  onSaveTemplate,
  onEnhance4K,
  metadata
}: TemplatePreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6" data-testid="template-preview">
      {/* Video Preview Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative bg-black rounded-t-lg">
            {/* Processing Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <div className="bg-white/90 rounded-lg p-4 text-center space-y-3">
                  <div className="animate-spin w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full mx-auto" />
                  <div>
                    <p className="text-sm font-medium">Processing Video</p>
                    <p className="text-xs text-gray-600">{processingProgress}% complete</p>
                  </div>
                  <Progress value={processingProgress} className="w-32" />
                </div>
              </div>
            )}

            {/* Video Element */}
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full aspect-[9/16] object-cover rounded-t-lg"
              onEnded={handleVideoEnded}
              poster="/api/placeholder/300/533" // 9:16 aspect ratio
              data-testid="video-preview"
            />

            {/* Play Button Overlay */}
            {!isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="lg"
                  className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm"
                  onClick={togglePlay}
                  data-testid="button-play"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </Button>
              </div>
            )}

            {/* Top Controls */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              <Badge 
                variant="secondary" 
                className="bg-black/50 text-white backdrop-blur-sm"
              >
                {templateName}
              </Badge>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm p-0"
                  onClick={() => setIsLiked(!isLiked)}
                  data-testid="button-like"
                >
                  <Heart 
                    className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} 
                  />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm p-0"
                      data-testid="button-more"
                    >
                      <MoreVertical className="w-5 h-5 text-white" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {}}>
                      <Maximize className="w-4 h-4 mr-2" />
                      View Fullscreen
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onSaveTemplate}>
                      <Settings className="w-4 h-4 mr-2" />
                      Save as Template
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Video Info */}
          <div className="p-4 space-y-4">
            {/* Metadata */}
            {metadata && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <span className="ml-2 font-medium">{metadata.duration}</span>
                </div>
                <div>
                  <span className="text-gray-500">Ratio:</span>
                  <span className="ml-2 font-medium">{metadata.aspectRatio}</span>
                </div>
                <div>
                  <span className="text-gray-500">Size:</span>
                  <span className="ml-2 font-medium">{metadata.fileSize}</span>
                </div>
                <div>
                  <span className="text-gray-500">Effects:</span>
                  <span className="ml-2 font-medium">{metadata.effects + metadata.textOverlays}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Primary Actions */}
              <div className="grid grid-cols-2 gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      className="w-full" 
                      disabled={isProcessing}
                      data-testid="button-download"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onDownload('720p')}>
                      720p HD (Free)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDownload('1080p')}>
                      1080p Full HD {!isPro && '(Pro)'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDownload('4k')}
                      disabled={!isPro}
                    >
                      4K Ultra HD (Pro)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button 
                  variant="outline" 
                  onClick={onShare}
                  disabled={isProcessing}
                  data-testid="button-share"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* 4K Enhancement for Pro Users */}
              {isPro && onEnhance4K && (
                <Button
                  variant="secondary"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                  onClick={onEnhance4K}
                  disabled={isProcessing}
                  data-testid="button-enhance-4k"
                >
                  <Maximize className="w-4 h-4 mr-2" />
                  Enhance to 4K Ultra HD
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing Progress */}
      {isProcessing && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Video Processing</h4>
                <span className="text-sm text-gray-600">{processingProgress}%</span>
              </div>
              <Progress value={processingProgress} />
              <p className="text-xs text-gray-600 text-center">
                {processingProgress < 50 
                  ? 'Applying viral style to your media...' 
                  : 'Finalizing video with effects and overlays...'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pro Upgrade Hint */}
      {!isPro && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4 text-center">
            <h4 className="text-sm font-medium mb-2">Upgrade to Pro</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Get 4K Ultra HD exports, unlimited processing, and premium effects
            </p>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" data-testid="button-upgrade">
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}