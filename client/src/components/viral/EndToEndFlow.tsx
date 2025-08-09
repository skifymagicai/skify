import React, { useState } from 'react';
import { Upload, Video, Wand2, Download, Crown, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '../../hooks/use-toast';

interface ViralAnalysis {
  timing: {
    cuts: number[];
    speedRamps: Array<{ start: number; end: number; speed: number }>;
    keyMoments: number[];
  };
  visual: {
    colorGrading: Record<string, any>;
    effects: string[];
    transitions: Array<{ type: string; timing: number }>;
  };
  text: {
    overlays: Array<{
      text: string;
      font: string;
      size: number;
      color: string;
      position: { x: string; y: string };
      animation: string;
      timing: { start: number; end: number };
    }>;
    lyricSync: {
      enabled: boolean;
      karaoke: boolean;
      segments: Array<{ text: string; start: number; end: number }>;
    };
  };
  audio: {
    bpm: number;
    key: string;
    beatMap: number[];
    musicCues: Array<{ type: string; timing: number }>;
  };
}

type FlowStage = 'upload_viral' | 'analyzing' | 'upload_user' | 'applying' | 'preview' | 'download';

export function EndToEndFlow() {
  const [currentStage, setCurrentStage] = useState<FlowStage>('upload_viral');
  const [viralVideo, setViralVideo] = useState<File | null>(null);
  const [viralLink, setViralLink] = useState('');
  const [userMedia, setUserMedia] = useState<File[]>([]);
  const [viralAnalysis, setViralAnalysis] = useState<ViralAnalysis | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const { toast } = useToast();

  // Step 1: Analyze Viral Video
  const analyzeViralVideo = async () => {
    if (!viralVideo && !viralLink) {
      toast({
        title: "Missing Input",
        description: "Please upload a video or provide a link",
        variant: "destructive"
      });
      return;
    }

    setCurrentStage('analyzing');
    setProcessingProgress(0);

    const formData = new FormData();
    if (viralVideo) formData.append('video', viralVideo);
    if (viralLink) formData.append('videoLink', viralLink);

    try {
      // Simulate analysis progress
      for (let i = 0; i <= 100; i += 20) {
        setProcessingProgress(i);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const response = await fetch('/api/viral/analyze', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setViralAnalysis(result.data.analysis.styleExtraction);
        setCurrentStage('upload_user');
        toast({
          title: "Analysis Complete",
          description: "Viral style extracted successfully! Now upload your media."
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze viral video. Please try again.",
        variant: "destructive"
      });
      setCurrentStage('upload_viral');
    }
  };

  // Step 2: Upload User Media
  const uploadUserMedia = async () => {
    if (userMedia.length === 0) {
      toast({
        title: "No Media",
        description: "Please upload at least one photo or video",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    userMedia.forEach(file => formData.append('media', file));

    try {
      const response = await fetch('/api/user/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setCurrentStage('applying');
        applyTemplate();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload media. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Step 3: Apply Template
  const applyTemplate = async () => {
    setProcessingProgress(0);
    
    try {
      const response = await fetch('/api/viral/apply-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: 'viral-template-1',
          userMediaIds: userMedia.map((_, i) => `media-${i}`),
          customizations: {}
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setJobId(result.data.jobId);
        pollJobStatus(result.data.jobId);
      }
    } catch (error) {
      console.error('Template application error:', error);
      toast({
        title: "Application Failed",
        description: "Failed to apply template. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Poll job status for real-time updates
  const pollJobStatus = async (jobId: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/job/${jobId}/status`);
        const result = await response.json();
        
        if (result.success) {
          setProcessingProgress(result.data.progress);
          
          if (result.data.status === 'completed') {
            setResultVideo(result.data.result.videoUrl);
            setCurrentStage('preview');
            toast({
              title: "Processing Complete",
              description: "Your viral video is ready!"
            });
            return;
          }
          
          if (result.data.status === 'error') {
            throw new Error(result.data.error);
          }
          
          // Continue polling
          setTimeout(checkStatus, 1000);
        }
      } catch (error) {
        console.error('Status check error:', error);
        toast({
          title: "Processing Error",
          description: "Something went wrong during processing.",
          variant: "destructive"
        });
        setCurrentStage('upload_viral');
      }
    };
    
    checkStatus();
  };

  // Enhance to 4K (Pro feature)
  const enhanceTo4K = async () => {
    if (!isPro) {
      toast({
        title: "Pro Feature",
        description: "4K Ultra HD enhancement requires Pro subscription",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/enhance/4k-ultra-hd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: jobId,
          subscriptionTier: 'pro'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "4K Enhancement Started",
          description: "Your video is being enhanced to 4K Ultra HD"
        });
        // Poll for 4K enhancement status
        pollJobStatus(result.data.jobId);
      }
    } catch (error) {
      console.error('4K enhancement error:', error);
    }
  };

  const renderStageContent = () => {
    switch (currentStage) {
      case 'upload_viral':
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Step 1: Provide Viral Video
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload Video</TabsTrigger>
                  <TabsTrigger value="link">Social Media Link</TabsTrigger>
                </TabsList>
                <TabsContent value="upload">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setViralVideo(e.target.files?.[0] || null)}
                      className="hidden"
                      id="viral-upload"
                    />
                    <label htmlFor="viral-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {viralVideo ? viralVideo.name : 'Click to upload viral video'}
                      </p>
                    </label>
                  </div>
                </TabsContent>
                <TabsContent value="link">
                  <input
                    type="url"
                    placeholder="Paste TikTok, Instagram, or YouTube link..."
                    value={viralLink}
                    onChange={(e) => setViralLink(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </TabsContent>
              </Tabs>
              <Button 
                onClick={analyzeViralVideo}
                disabled={!viralVideo && !viralLink}
                className="w-full"
                data-testid="button-analyze-viral"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Analyze Viral Style
              </Button>
            </CardContent>
          </Card>
        );

      case 'analyzing':
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>AI Style Extraction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={processingProgress} className="w-full" />
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Analyzing timing and cuts
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Extracting visual effects and color grading
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Processing text overlays and animations
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Analyzing audio and beat mapping
                </div>
              </div>
              <p className="text-center text-sm text-gray-600">
                {processingProgress}% complete
              </p>
            </CardContent>
          </Card>
        );

      case 'upload_user':
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Step 2: Upload Your Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {viralAnalysis && (
                <div className="bg-green-50 p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold text-green-800">Style Extracted Successfully!</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Badge variant="secondary">{viralAnalysis.audio.bpm} BPM</Badge>
                      <Badge variant="secondary" className="ml-1">{viralAnalysis.audio.key}</Badge>
                    </div>
                    <div>
                      <Badge variant="outline">{viralAnalysis.visual.effects.length} Effects</Badge>
                      <Badge variant="outline" className="ml-1">{viralAnalysis.text.overlays.length} Text Overlays</Badge>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="video/*,image/*"
                  multiple
                  onChange={(e) => setUserMedia(Array.from(e.target.files || []))}
                  className="hidden"
                  id="user-media-upload"
                />
                <label htmlFor="user-media-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {userMedia.length > 0 
                      ? `${userMedia.length} file(s) selected` 
                      : 'Click to upload your photos/videos'
                    }
                  </p>
                </label>
              </div>
              
              {userMedia.length > 0 && (
                <div className="space-y-2">
                  {userMedia.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{file.name}</span>
                      <Badge variant="outline">
                        {file.type.startsWith('video/') ? 'Video' : 'Image'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              
              <Button 
                onClick={uploadUserMedia}
                disabled={userMedia.length === 0}
                className="w-full"
                data-testid="button-upload-media"
              >
                Apply Viral Template
              </Button>
            </CardContent>
          </Card>
        );

      case 'applying':
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Applying Viral Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={processingProgress} className="w-full" />
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${processingProgress > 20 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  Cutting and timing to match viral sequence
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${processingProgress > 40 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  Applying speed ramps and transitions
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${processingProgress > 60 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  Matching color grading and visual effects
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${processingProgress > 80 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  Syncing text overlays and animations
                </div>
              </div>
              <p className="text-center text-sm text-gray-600">
                {processingProgress}% complete • Estimated time: {Math.ceil((100 - processingProgress) * 0.6)} seconds
              </p>
            </CardContent>
          </Card>
        );

      case 'preview':
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Your Viral Video is Ready!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {resultVideo && (
                <div className="aspect-[9/16] max-w-xs mx-auto bg-black rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <Video className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm">Video Preview</p>
                      <p className="text-xs text-gray-300">HD • 0:15 • 3.2 MB</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setCurrentStage('download')}
                  className="flex-1"
                  data-testid="button-download"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download HD
                </Button>
                
                <Button 
                  onClick={enhanceTo4K}
                  variant="outline"
                  className="flex-1"
                  disabled={!isPro}
                  data-testid="button-enhance-4k"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Enhance to 4K
                  {!isPro && <Badge variant="secondary" className="ml-1">Pro</Badge>}
                </Button>
              </div>
              
              <Button 
                onClick={() => {
                  setCurrentStage('upload_viral');
                  setViralVideo(null);
                  setViralLink('');
                  setUserMedia([]);
                  setViralAnalysis(null);
                  setResultVideo(null);
                  setJobId(null);
                }}
                variant="outline"
                className="w-full"
                data-testid="button-create-another"
              >
                Create Another Video
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Skify AI Video Transform
          </h1>
          <p className="text-gray-600">
            End-to-End Viral Video Transformation in 3 Simple Steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[
              { stage: 'upload_viral', label: 'Viral Video', icon: Video },
              { stage: 'upload_user', label: 'Your Media', icon: Upload },
              { stage: 'preview', label: 'Result', icon: CheckCircle }
            ].map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStage === step.stage || 
                               (currentStage === 'analyzing' && step.stage === 'upload_viral') ||
                               (currentStage === 'applying' && step.stage === 'upload_user');
              const isCompleted = 
                (currentStage !== 'upload_viral' && step.stage === 'upload_viral') ||
                (['preview', 'download'].includes(currentStage) && ['upload_viral', 'upload_user'].includes(step.stage as any));

              return (
                <div key={step.stage} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isCompleted ? 'bg-green-500 text-white' : 
                    isActive ? 'bg-blue-500 text-white' : 
                    'bg-gray-200 text-gray-500'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="ml-2 text-sm font-medium">{step.label}</span>
                  {index < 2 && <div className="w-8 h-0.5 bg-gray-300 mx-4" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stage Content */}
        {renderStageContent()}
      </div>
    </div>
  );
}