import React, { useState, useEffect } from 'react';
import { ArrowLeft, Crown, Menu } from 'lucide-react';
import { Button } from '../components/ui/button';
import { MobileUpload } from '../components/mobile/MobileUpload';
import { ProcessingStatus, defaultProcessingStages } from '../components/mobile/ProcessingStatus';
import { TemplatePreview } from '../components/mobile/TemplatePreview';
import { MyTemplates } from '../components/templates/MyTemplates';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import { Badge } from '../components/ui/badge';

type AppStage = 'upload' | 'processing' | 'preview' | 'templates';

interface ProcessingJob {
  id: string;
  status: 'processing' | 'completed' | 'error';
  progress: number;
  stages: typeof defaultProcessingStages;
  currentStage?: string;
  resultUrl?: string;
  templateName?: string;
}

export function MobileApp() {
  const [currentStage, setCurrentStage] = useState<AppStage>('upload');
  const [processingJob, setProcessingJob] = useState<ProcessingJob | null>(null);
  const [completedVideo, setCompletedVideo] = useState<{
    url: string;
    templateName: string;
    metadata: any;
  } | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Simulate AI processing flow
  const simulateProcessing = async (templateName: string) => {
    const stages = [...defaultProcessingStages];
    const job: ProcessingJob = {
      id: `job-${Date.now()}`,
      status: 'processing',
      progress: 0,
      stages,
      currentStage: 'extraction',
      templateName
    };
    
    setProcessingJob(job);
    setCurrentStage('processing');

    // Simulate progressive processing
    const stageOrder = ['extraction', 'audio', 'text', 'visual', 'application'];
    let overallProgress = 0;

    for (let i = 0; i < stageOrder.length; i++) {
      const stageId = stageOrder[i];
      const stageIndex = stages.findIndex(s => s.id === stageId);
      
      if (stageIndex >= 0) {
        // Mark current stage as processing
        stages[stageIndex].status = 'processing';
        setProcessingJob(prev => prev ? {
          ...prev,
          stages: [...stages],
          currentStage: stageId
        } : null);

        // Simulate stage progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          stages[stageIndex].progress = progress;
          overallProgress = ((i * 100 + progress) / (stageOrder.length * 100)) * 100;
          
          setProcessingJob(prev => prev ? {
            ...prev,
            stages: [...stages],
            progress: overallProgress
          } : null);
        }

        // Mark stage as completed
        stages[stageIndex].status = 'completed';
      }
    }

    // Complete processing
    setProcessingJob(prev => prev ? {
      ...prev,
      status: 'completed',
      progress: 100,
      resultUrl: '/api/placeholder/300x533'
    } : null);

    setCompletedVideo({
      url: '/api/placeholder/300x533',
      templateName,
      metadata: {
        duration: '0:15',
        aspectRatio: '9:16',
        fileSize: '2.4 MB',
        effects: 5,
        textOverlays: 3
      }
    });

    // Move to preview after short delay
    setTimeout(() => {
      setCurrentStage('preview');
    }, 1500);

    toast({
      title: "Video transformation complete!",
      description: `Your video has been transformed with the ${templateName} style.`
    });
  };

  const handleViralVideoUpload = async (fileOrUrl: File | string) => {
    const templateName = typeof fileOrUrl === 'string' 
      ? 'Social Media Viral Style'
      : `${fileOrUrl.name} Style`;
    
    toast({
      title: "Processing viral video",
      description: "Extracting style and effects from viral content..."
    });

    // Start processing
    await simulateProcessing(templateName);
  };

  const handleUserMediaUpload = (files: File[]) => {
    if (files.length > 0) {
      toast({
        title: `${files.length} file${files.length > 1 ? 's' : ''} selected`,
        description: "Ready to apply viral style to your media"
      });
    }
  };

  const handleDownload = (quality: '720p' | '1080p' | '4k') => {
    if (quality === '4k' && user?.tier !== 'pro') {
      toast({
        title: "Pro upgrade required",
        description: "4K downloads are available for Pro users only",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: `Downloading in ${quality}`,
      description: "Your transformed video is being prepared..."
    });

    // Simulate download
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = completedVideo?.url || '';
      link.download = `skify-transformed-${quality}.mp4`;
      link.click();
      
      toast({
        title: "Download started",
        description: `Your ${quality} video is downloading now`
      });
    }, 1000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out my Skify transformation!',
        text: 'I just transformed my video with viral AI styles using Skify',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard"
      });
    }
  };

  const handleSaveTemplate = () => {
    toast({
      title: "Template saved!",
      description: "Style has been added to your template library"
    });
    setCurrentStage('templates');
  };

  const handleEnhance4K = () => {
    if (user?.tier !== 'pro') {
      toast({
        title: "Pro upgrade required",
        description: "4K enhancement is available for Pro users only",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Enhancing to 4K Ultra HD",
      description: "Your video is being enhanced to cinematic quality..."
    });
  };

  const handleBack = () => {
    if (currentStage === 'processing') return; // Can't go back during processing
    
    const stages: AppStage[] = ['upload', 'preview', 'templates'];
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex > 0) {
      setCurrentStage(stages[currentIndex - 1]);
    }
  };

  const handleCancelProcessing = () => {
    setProcessingJob(null);
    setCurrentStage('upload');
    toast({
      title: "Processing cancelled",
      description: "You can start a new transformation anytime"
    });
  };

  // Mock templates data
  const mockTemplates = [
    {
      id: '1',
      name: 'Viral Dance Moves',
      thumbnailUrl: '/api/placeholder/300x533',
      duration: '0:15',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      uses: 12,
      rating: 4.8,
      tags: ['dance', 'viral', 'transitions'],
      metadata: {
        aspectRatio: '9:16',
        effects: 8,
        textOverlays: 2,
        sourceVideo: 'TikTok viral dance'
      }
    },
    {
      id: '2',
      name: 'Text Animation Style',
      thumbnailUrl: '/api/placeholder/300x533',
      duration: '0:30',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      uses: 8,
      rating: 4.6,
      tags: ['text', 'animation', 'trendy'],
      metadata: {
        aspectRatio: '9:16',
        effects: 5,
        textOverlays: 6,
        sourceVideo: 'Instagram Reel'
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {currentStage !== 'upload' && currentStage !== 'processing' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Skify
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                AI Video Transform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user?.tier === 'pro' && (
              <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Pro
              </Badge>
            )}
            
            <Button variant="ghost" size="sm" data-testid="button-menu">
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-20">
        {currentStage === 'upload' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Transform Any Video</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Extract viral styles and apply them to your content
              </p>
            </div>

            <MobileUpload
              onViralVideoUpload={handleViralVideoUpload}
              onUserMediaUpload={handleUserMediaUpload}
            />

            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setCurrentStage('templates')}
                data-testid="button-my-templates"
              >
                Browse My Templates
              </Button>
            </div>
          </div>
        )}

        {currentStage === 'processing' && processingJob && (
          <ProcessingStatus
            stages={processingJob.stages}
            overallProgress={processingJob.progress}
            currentStage={processingJob.currentStage}
            onCancel={handleCancelProcessing}
          />
        )}

        {currentStage === 'preview' && completedVideo && (
          <TemplatePreview
            videoUrl={completedVideo.url}
            templateName={completedVideo.templateName}
            processingProgress={100}
            isProcessing={false}
            isPro={user?.tier === 'pro'}
            onDownload={handleDownload}
            onShare={handleShare}
            onSaveTemplate={handleSaveTemplate}
            onEnhance4K={handleEnhance4K}
            metadata={completedVideo.metadata}
          />
        )}

        {currentStage === 'templates' && (
          <MyTemplates
            templates={mockTemplates}
            onApplyTemplate={(templateId) => {
              const template = mockTemplates.find(t => t.id === templateId);
              if (template) {
                simulateProcessing(template.name);
              }
            }}
            onDeleteTemplate={(templateId) => {
              toast({
                title: "Template deleted",
                description: "Template has been removed from your library"
              });
            }}
            onRenameTemplate={(templateId, newName) => {
              toast({
                title: "Template renamed",
                description: `Template renamed to "${newName}"`
              });
            }}
            onShareTemplate={(templateId) => {
              toast({
                title: "Template shared",
                description: "Share link has been copied to clipboard"
              });
            }}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      {currentStage !== 'processing' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-around items-center p-4">
            <Button
              variant={currentStage === 'upload' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentStage('upload')}
              className="flex-col gap-1 h-auto py-2"
              data-testid="nav-upload"
            >
              <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <span className="text-xs">📹</span>
              </div>
              <span className="text-xs">Transform</span>
            </Button>

            <Button
              variant={currentStage === 'templates' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentStage('templates')}
              className="flex-col gap-1 h-auto py-2"
              data-testid="nav-templates"
            >
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="text-xs">📚</span>
              </div>
              <span className="text-xs">Templates</span>
            </Button>

            {currentStage === 'preview' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setCurrentStage('upload')}
                className="flex-col gap-1 h-auto py-2 bg-gradient-to-r from-purple-600 to-blue-600"
                data-testid="nav-new"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xs">✨</span>
                </div>
                <span className="text-xs">New</span>
              </Button>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}