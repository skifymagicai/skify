import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Upload, 
  Link2, 
  Wand2, 
  Play, 
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles,
  Music,
  Type,
  Palette,
  Video
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: any;
}

export default function AIWorkflowPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [workflowData, setWorkflowData] = useState<{
    videoFile?: File;
    videoUrl?: string;
    analysisResult?: any;
    template?: any;
    userVideo?: File;
    finalVideo?: any;
  }>({});

  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    {
      id: 'import',
      title: 'Import Viral Video',
      description: 'Upload video file or paste social media link',
      status: 'pending'
    },
    {
      id: 'analysis',
      title: 'AI Analysis & Separation',
      description: 'Extract visual styles, audio, and text elements',
      status: 'pending'
    },
    {
      id: 'template',
      title: 'Create Template',
      description: 'Save extracted elements as reusable template',
      status: 'pending'
    },
    {
      id: 'apply',
      title: 'Apply to Your Video',
      description: 'Upload your video and apply the template',
      status: 'pending'
    },
    {
      id: 'export',
      title: 'Export & Download',
      description: 'Preview and download your styled video',
      status: 'pending'
    }
  ]);

  const updateStepStatus = (stepId: string, status: WorkflowStep['status'], progress?: number, result?: any) => {
    setWorkflowSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, progress, result }
        : step
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI Video Transformation Workflow
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Complete AI-powered pipeline to analyze viral videos and apply their styles to your content
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Workflow Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {workflowSteps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center space-y-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    step.status === 'completed' ? 'bg-green-100 border-green-500 text-green-600' :
                    step.status === 'processing' ? 'bg-blue-100 border-blue-500 text-blue-600' :
                    step.status === 'failed' ? 'bg-red-100 border-red-500 text-red-600' :
                    'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    {step.status === 'completed' ? <CheckCircle className="h-5 w-5" /> :
                     step.status === 'processing' ? <Clock className="h-5 w-5" /> :
                     step.status === 'failed' ? <AlertCircle className="h-5 w-5" /> :
                     index + 1}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                    {step.progress !== undefined && (
                      <Progress value={step.progress} className="w-16 mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Workflow Steps */}
        <Tabs value={workflowSteps[currentStep]?.id} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            {workflowSteps.map((step, index) => (
              <TabsTrigger 
                key={step.id} 
                value={step.id}
                disabled={index > currentStep}
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                {step.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Step 1: Import Video */}
          <TabsContent value="import">
            <VideoImportStep 
              onVideoImported={(data) => {
                setWorkflowData(prev => ({ ...prev, ...data }));
                updateStepStatus('import', 'completed');
                setCurrentStep(1);
              }}
            />
          </TabsContent>

          {/* Step 2: AI Analysis */}
          <TabsContent value="analysis">
            <AIAnalysisStep 
              videoData={workflowData}
              onAnalysisComplete={(result) => {
                setWorkflowData(prev => ({ ...prev, analysisResult: result }));
                updateStepStatus('analysis', 'completed', 100, result);
                setCurrentStep(2);
              }}
              onProgress={(progress) => updateStepStatus('analysis', 'processing', progress)}
            />
          </TabsContent>

          {/* Step 3: Template Creation */}
          <TabsContent value="template">
            <TemplateCreationStep 
              analysisResult={workflowData.analysisResult}
              onTemplateCreated={(template) => {
                setWorkflowData(prev => ({ ...prev, template }));
                updateStepStatus('template', 'completed');
                setCurrentStep(3);
              }}
            />
          </TabsContent>

          {/* Step 4: Apply Template */}
          <TabsContent value="apply">
            <TemplateApplicationStep 
              template={workflowData.template}
              onApplicationComplete={(result) => {
                setWorkflowData(prev => ({ ...prev, finalVideo: result }));
                updateStepStatus('apply', 'completed');
                setCurrentStep(4);
              }}
              onProgress={(progress) => updateStepStatus('apply', 'processing', progress)}
            />
          </TabsContent>

          {/* Step 5: Export & Download */}
          <TabsContent value="export">
            <ExportStep 
              finalVideo={workflowData.finalVideo}
              onExportComplete={() => updateStepStatus('export', 'completed')}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Step Components
function VideoImportStep({ onVideoImported }: { onVideoImported: (data: any) => void }) {
  const [importMethod, setImportMethod] = useState<'upload' | 'url'>('upload');
  const [videoUrl, setVideoUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', file.name);

      const response = await apiRequest('/api/videos/upload', {
        method: 'POST',
        body: formData,
      });

      onVideoImported({ videoFile: file, uploadResponse: response });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUrlImport = async () => {
    if (!videoUrl.trim()) return;
    
    setIsProcessing(true);
    try {
      const response = await apiRequest('/api/videos/fetch-from-url', {
        method: 'POST',
        body: JSON.stringify({ url: videoUrl }),
      });

      onVideoImported({ videoUrl, fetchResponse: response });
    } catch (error) {
      console.error('URL import failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Viral Video
        </CardTitle>
        <CardDescription>
          Upload a video file or paste a link from Instagram, TikTok, or YouTube
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={importMethod} onValueChange={(value) => setImportMethod(value as 'upload' | 'url')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="url">Paste URL</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="font-medium">Drop your video here or click to browse</p>
              <p className="text-sm text-gray-500">MP4, MOV, AVI, WebM up to 500MB</p>
              <Input
                type="file"
                accept="video/*"
                className="mt-4"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                disabled={isProcessing}
                data-testid="input-video-upload"
              />
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-url">Video URL</Label>
              <Input
                id="video-url"
                placeholder="https://instagram.com/reel/... or https://tiktok.com/@user/video/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                disabled={isProcessing}
                data-testid="input-video-url"
              />
            </div>
            <Button 
              onClick={handleUrlImport} 
              disabled={!videoUrl.trim() || isProcessing}
              className="w-full"
              data-testid="button-import-url"
            >
              {isProcessing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-2" />
                  Import from URL
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function AIAnalysisStep({ videoData, onAnalysisComplete, onProgress }: {
  videoData: any;
  onAnalysisComplete: (result: any) => void;
  onProgress: (progress: number) => void;
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (videoData.uploadResponse?.analysisJobId && !isAnalyzing) {
      startAnalysis(videoData.uploadResponse.analysisJobId);
    }
  }, [videoData]);

  const startAnalysis = async (jobId: string) => {
    setIsAnalyzing(true);
    onProgress(10);

    // Poll for job completion
    const pollJob = async () => {
      try {
        const jobStatus = await apiRequest(`/api/jobs/${jobId}/status`);
        
        if (jobStatus.status === 'completed') {
          onProgress(100);
          onAnalysisComplete(jobStatus);
          setIsAnalyzing(false);
        } else if (jobStatus.status === 'failed') {
          setIsAnalyzing(false);
          // Handle error
        } else {
          onProgress(jobStatus.progress || 50);
          setTimeout(pollJob, 2000); // Poll every 2 seconds
        }
      } catch (error) {
        console.error('Job polling failed:', error);
        setIsAnalyzing(false);
      }
    };

    pollJob();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          AI Analysis & Asset Separation
        </CardTitle>
        <CardDescription>
          Our AI is analyzing your video to extract visual styles, audio, and text elements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isAnalyzing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Visual Analysis</span>
                </div>
                <p className="text-sm text-gray-600">Extracting effects, transitions, color grading</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Music className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Audio Extraction</span>
                </div>
                <p className="text-sm text-gray-600">Analyzing tempo, key, energy, beat sync</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Type className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Text/Lyric OCR</span>
                </div>
                <p className="text-sm text-gray-600">Detecting fonts, positions, animations</p>
              </Card>
            </div>
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>Processing in progress</AlertTitle>
              <AlertDescription>
                This may take 30-60 seconds depending on video length and complexity.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Analysis Complete!</AlertTitle>
            <AlertDescription>
              Successfully extracted all visual, audio, and text elements from your video.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

function TemplateCreationStep({ analysisResult, onTemplateCreated }: {
  analysisResult: any;
  onTemplateCreated: (template: any) => void;
}) {
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const createTemplate = async () => {
    if (!templateName.trim()) return;
    
    setIsCreating(true);
    try {
      const response = await apiRequest('/api/templates/create-from-analysis', {
        method: 'POST',
        body: JSON.stringify({
          videoId: analysisResult.videoId,
          templateName,
          templateDescription
        }),
      });

      onTemplateCreated(response.template);
    } catch (error) {
      console.error('Template creation failed:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Create Reusable Template
        </CardTitle>
        <CardDescription>
          Save the extracted elements as a template for future use
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              placeholder="e.g., Cinematic Urban Style, Viral Dance Template"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              data-testid="input-template-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-description">Description (Optional)</Label>
            <Textarea
              id="template-description"
              placeholder="Describe the style and when to use this template..."
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              data-testid="textarea-template-description"
            />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium mb-2">Template will include:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <Badge variant="secondary">Visual Effects</Badge>
            <Badge variant="secondary">Color Grading</Badge>
            <Badge variant="secondary">Transitions</Badge>
            <Badge variant="secondary">Audio Track</Badge>
            <Badge variant="secondary">Text Elements</Badge>
            <Badge variant="secondary">Font Styles</Badge>
          </div>
        </div>

        <Button 
          onClick={createTemplate}
          disabled={!templateName.trim() || isCreating}
          className="w-full"
          data-testid="button-create-template"
        >
          {isCreating ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Creating Template...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Create Template
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function TemplateApplicationStep({ template, onApplicationComplete, onProgress }: {
  template: any;
  onApplicationComplete: (result: any) => void;
  onProgress: (progress: number) => void;
}) {
  const [userVideo, setUserVideo] = useState<File | null>(null);
  const [options, setOptions] = useState({
    applyVisual: true,
    applyAudio: true,
    applyText: true
  });
  const [isApplying, setIsApplying] = useState(false);

  const applyTemplate = async () => {
    if (!userVideo || !template) return;

    setIsApplying(true);
    onProgress(10);

    try {
      const formData = new FormData();
      formData.append('userVideo', userVideo);
      formData.append('applyVisual', options.applyVisual.toString());
      formData.append('applyAudio', options.applyAudio.toString());
      formData.append('applyText', options.applyText.toString());
      formData.append('videoTitle', `Styled with ${template.name}`);

      const response = await apiRequest(`/api/templates/${template.id}/apply-to-video`, {
        method: 'POST',
        body: formData,
      });

      // Poll for completion
      const pollJob = async () => {
        try {
          const jobStatus = await apiRequest(`/api/jobs/${response.applicationJobId}/status`);
          
          if (jobStatus.status === 'completed') {
            onProgress(100);
            onApplicationComplete(response);
            setIsApplying(false);
          } else if (jobStatus.status === 'failed') {
            setIsApplying(false);
          } else {
            onProgress(jobStatus.progress || 50);
            setTimeout(pollJob, 2000);
          }
        } catch (error) {
          console.error('Job polling failed:', error);
          setIsApplying(false);
        }
      };

      pollJob();
    } catch (error) {
      console.error('Template application failed:', error);
      setIsApplying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Apply Template to Your Video
        </CardTitle>
        <CardDescription>
          Upload your video and choose which elements to apply
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Upload Your Video</Label>
            <Input
              type="file"
              accept="video/*"
              onChange={(e) => setUserVideo(e.target.files?.[0] || null)}
              disabled={isApplying}
              data-testid="input-user-video"
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Template Elements to Apply</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Visual Effects & Color Grading</p>
                  <p className="text-sm text-gray-500">Apply visual style, effects, and transitions</p>
                </div>
                <Switch
                  checked={options.applyVisual}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, applyVisual: checked }))}
                  data-testid="switch-apply-visual"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Audio Matching</p>
                  <p className="text-sm text-gray-500">Replace or sync with template's audio</p>
                </div>
                <Switch
                  checked={options.applyAudio}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, applyAudio: checked }))}
                  data-testid="switch-apply-audio"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Text & Lyric Overlays</p>
                  <p className="text-sm text-gray-500">Apply text styling and animations</p>
                </div>
                <Switch
                  checked={options.applyText}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, applyText: checked }))}
                  data-testid="switch-apply-text"
                />
              </div>
            </div>
          </div>
        </div>

        <Button 
          onClick={applyTemplate}
          disabled={!userVideo || isApplying}
          className="w-full"
          data-testid="button-apply-template"
        >
          {isApplying ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Applying Template...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Apply Template
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function ExportStep({ finalVideo, onExportComplete }: {
  finalVideo: any;
  onExportComplete: () => void;
}) {
  const [removeWatermark, setRemoveWatermark] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const exportVideo = async () => {
    if (!finalVideo?.userVideo?.id) return;

    setIsExporting(true);
    try {
      const response = await apiRequest(`/api/videos/${finalVideo.userVideo.id}/export`, {
        method: 'POST',
        body: JSON.stringify({ removeWatermark }),
      });

      if (response.paymentRequired) {
        // Handle payment flow
        console.log('Payment required for watermark removal');
      } else {
        // Direct download
        window.open(response.exportUrl, '_blank');
        onExportComplete();
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export & Download
        </CardTitle>
        <CardDescription>
          Your styled video is ready! Choose your export options.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Transformation Complete!</AlertTitle>
          <AlertDescription>
            Your video has been successfully styled with the template.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Remove Watermark</p>
              <p className="text-sm text-gray-500">₹49 one-time payment for clean export</p>
            </div>
            <Switch
              checked={removeWatermark}
              onCheckedChange={setRemoveWatermark}
              data-testid="switch-remove-watermark"
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium mb-2">Export Details:</h4>
            <div className="text-sm space-y-1">
              <p>Format: MP4 (H.264)</p>
              <p>Quality: HD 1080p</p>
              <p>Estimated Size: ~25MB</p>
              <p>Watermark: {removeWatermark ? 'None' : 'Skify branding'}</p>
            </div>
          </div>
        </div>

        <Button 
          onClick={exportVideo}
          disabled={isExporting}
          className="w-full"
          data-testid="button-export-video"
        >
          {isExporting ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Preparing Export...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              {removeWatermark ? 'Export Clean Version (₹49)' : 'Download with Watermark (Free)'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}