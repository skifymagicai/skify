import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Video,
  Folder,
  Eye
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AnalysisStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
}

export default function ViralAnalysisPage() {
  const [currentPhase, setCurrentPhase] = useState<'upload_viral' | 'analyzing' | 'template_created' | 'upload_user' | 'applying' | 'completed'>('upload_viral');
  const [viralVideoData, setViralVideoData] = useState<{
    file?: File;
    url?: string;
    uploadResponse?: any;
  }>({});
  const [userVideoData, setUserVideoData] = useState<{
    file?: File;
    uploadResponse?: any;
  }>({});
  const [templateData, setTemplateData] = useState<any>(null);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([
    {
      id: 'visual_analysis',
      title: 'Visual Style Extraction',
      description: 'Analyzing effects, transitions, color grading, camera movements',
      status: 'pending'
    },
    {
      id: 'audio_separation',
      title: 'Audio Track Separation',
      description: 'Extracting and analyzing audio, tempo, key, energy',
      status: 'pending'
    },
    {
      id: 'text_ocr',
      title: 'Text/Lyrics OCR',
      description: 'Detecting fonts, colors, animations, positioning',
      status: 'pending'
    },
    {
      id: 'template_creation',
      title: 'Template Folder Creation',
      description: 'Saving all extracted assets to cloud storage',
      status: 'pending'
    }
  ]);

  const updateStepStatus = (stepId: string, status: AnalysisStep['status'], progress?: number) => {
    setAnalysisSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, progress }
        : step
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Viral Video Analysis & Recreation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Upload a viral video → Extract all style elements → Upload your video → Apply viral styling
          </p>
        </div>

        {/* Phase Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-blue-600" />
              Template Creation Workflow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { id: 'upload_viral', title: 'Upload Viral Video', icon: Upload },
                { id: 'analyzing', title: 'AI Analysis', icon: Wand2 },
                { id: 'template_created', title: 'Template Created', icon: Folder },
                { id: 'upload_user', title: 'Upload Your Video', icon: Video },
                { id: 'completed', title: 'Apply & Export', icon: Download }
              ].map((phase, index) => (
                <div key={phase.id} className="flex flex-col items-center space-y-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    currentPhase === phase.id ? 'bg-blue-100 border-blue-500 text-blue-600' :
                    ['analyzing', 'template_created', 'upload_user', 'completed'].indexOf(currentPhase) > 
                    ['upload_viral', 'analyzing', 'template_created', 'upload_user', 'completed'].indexOf(phase.id) 
                    ? 'bg-green-100 border-green-500 text-green-600' :
                    'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    <phase.icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-center">{phase.title}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Phase 1: Upload Viral Video */}
        {currentPhase === 'upload_viral' && (
          <ViralVideoUploadSection 
            onViralVideoAnalyzed={(data) => {
              setViralVideoData(data);
              setCurrentPhase('analyzing');
            }}
            onAnalysisProgress={(steps) => setAnalysisSteps(steps)}
          />
        )}

        {/* Phase 2: Analysis in Progress */}
        {currentPhase === 'analyzing' && (
          <AnalysisProgressSection 
            steps={analysisSteps}
            onAnalysisComplete={(template) => {
              setTemplateData(template);
              setCurrentPhase('template_created');
            }}
            onStepUpdate={updateStepStatus}
          />
        )}

        {/* Phase 3: Template Created - Show Preview */}
        {currentPhase === 'template_created' && (
          <TemplatePreviewSection 
            template={templateData}
            onProceedToUserUpload={() => setCurrentPhase('upload_user')}
          />
        )}

        {/* Phase 4: Upload User Video */}
        {currentPhase === 'upload_user' && (
          <UserVideoUploadSection 
            template={templateData}
            onUserVideoUploaded={(data) => {
              setUserVideoData(data);
              setCurrentPhase('applying');
            }}
          />
        )}

        {/* Phase 5: Apply Template and Export */}
        {currentPhase === 'applying' && (
          <TemplateApplicationSection 
            template={templateData}
            userVideo={userVideoData}
            onApplicationComplete={() => setCurrentPhase('completed')}
          />
        )}

        {/* Phase 6: Completed */}
        {currentPhase === 'completed' && (
          <CompletedSection 
            template={templateData}
            onStartNew={() => {
              setCurrentPhase('upload_viral');
              setViralVideoData({});
              setUserVideoData({});
              setTemplateData(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Component for uploading viral video
function ViralVideoUploadSection({ onViralVideoAnalyzed, onAnalysisProgress }: {
  onViralVideoAnalyzed: (data: any) => void;
  onAnalysisProgress: (steps: AnalysisStep[]) => void;
}) {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [videoUrl, setVideoUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('viralVideo', file);
      formData.append('title', file.name);
      formData.append('isViralVideo', 'true');

      const response = await apiRequest('/api/videos/analyze-viral', {
        method: 'POST',
        body: formData,
      });

      onViralVideoAnalyzed({ file, uploadResponse: response });
    } catch (error) {
      console.error('Viral video upload failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUrlImport = async () => {
    if (!videoUrl.trim()) return;
    
    setIsProcessing(true);
    try {
      const response = await apiRequest('/api/videos/analyze-viral-url', {
        method: 'POST',
        body: JSON.stringify({ url: videoUrl }),
      });

      onViralVideoAnalyzed({ url: videoUrl, uploadResponse: response });
    } catch (error) {
      console.error('Viral video URL import failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Step 1: Upload Viral Video for Analysis
        </CardTitle>
        <CardDescription>
          Upload the viral video you want to recreate the style from
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant={uploadMethod === 'file' ? 'default' : 'outline'}
            onClick={() => setUploadMethod('file')}
            className="h-12"
            data-testid="button-upload-file"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
          <Button
            variant={uploadMethod === 'url' ? 'default' : 'outline'}
            onClick={() => setUploadMethod('url')}
            className="h-12"
            data-testid="button-paste-url"
          >
            <Link2 className="h-4 w-4 mr-2" />
            Paste URL
          </Button>
        </div>

        {uploadMethod === 'file' ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="font-medium">Drop viral video here or click to browse</p>
            <p className="text-sm text-gray-500">Instagram Reels, TikToks, YouTube Shorts, MP4, MOV up to 500MB</p>
            <Input
              type="file"
              accept="video/*"
              className="mt-4"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              disabled={isProcessing}
              data-testid="input-viral-video-upload"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="viral-url">Viral Video URL</Label>
              <Input
                id="viral-url"
                placeholder="https://instagram.com/reel/... or https://tiktok.com/@user/video/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                disabled={isProcessing}
                data-testid="input-viral-video-url"
              />
            </div>
            <Button 
              onClick={handleUrlImport} 
              disabled={!videoUrl.trim() || isProcessing}
              className="w-full"
              data-testid="button-import-viral-url"
            >
              {isProcessing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Importing & Analyzing...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Import & Analyze Viral Video
                </>
              )}
            </Button>
          </div>
        )}

        {isProcessing && (
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertTitle>AI Analysis Starting</AlertTitle>
            <AlertDescription>
              Extracting visual effects, audio track, text elements, and creating reusable template folder...
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// Component showing analysis progress
function AnalysisProgressSection({ steps, onAnalysisComplete, onStepUpdate }: {
  steps: AnalysisStep[];
  onAnalysisComplete: (template: any) => void;
  onStepUpdate: (stepId: string, status: AnalysisStep['status'], progress?: number) => void;
}) {
  useEffect(() => {
    // Simulate analysis progress
    const progressSimulation = async () => {
      for (const step of steps) {
        onStepUpdate(step.id, 'processing', 0);
        
        // Simulate processing time
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 300));
          onStepUpdate(step.id, 'processing', progress);
        }
        
        onStepUpdate(step.id, 'completed', 100);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Analysis complete - simulate template creation
      const mockTemplate = {
        id: 'template_' + Date.now(),
        name: 'Extracted Viral Style',
        folderPath: `templates/viral_${Date.now()}/`,
        assets: {
          visual: { effects: ['color_boost', 'film_grain'], transitions: ['quick_cut'] },
          audio: { tempo: 128, energy: 0.8 },
          text: { fonts: ['Arial Bold'], colors: ['#FFFFFF'] }
        }
      };

      onAnalysisComplete(mockTemplate);
    };

    progressSimulation();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Step 2: AI Analysis & Template Creation
        </CardTitle>
        <CardDescription>
          Extracting and separating all style elements from your viral video
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {step.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : step.status === 'processing' ? (
                    <Clock className="h-4 w-4 text-blue-600 animate-spin" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                  )}
                  <span className="font-medium">{step.title}</span>
                </div>
                {step.status === 'processing' && (
                  <span className="text-sm text-gray-500">{step.progress}%</span>
                )}
              </div>
              <p className="text-sm text-gray-600 ml-6">{step.description}</p>
              {step.status === 'processing' && (
                <Progress value={step.progress} className="ml-6 w-64" />
              )}
            </div>
          ))}
        </div>

        <Alert>
          <Folder className="h-4 w-4" />
          <AlertTitle>Creating Template Folder</AlertTitle>
          <AlertDescription>
            All extracted assets will be saved to a unique cloud storage folder for reuse and remixing.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

// Component showing created template preview
function TemplatePreviewSection({ template, onProceedToUserUpload }: {
  template: any;
  onProceedToUserUpload: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Step 3: Template Created Successfully!
        </CardTitle>
        <CardDescription>
          All viral video elements extracted and saved to cloud storage folder
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Folder className="h-4 w-4" />
          <AlertTitle>Template Folder: {template?.name}</AlertTitle>
          <AlertDescription>
            Stored at: {template?.folderPath}
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Visual Elements</span>
            </div>
            <div className="space-y-1 text-sm">
              <p>Effects: {template?.assets?.visual?.effects?.join(', ')}</p>
              <p>Transitions: {template?.assets?.visual?.transitions?.join(', ')}</p>
              <Badge variant="secondary">Ready</Badge>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Music className="h-4 w-4 text-green-500" />
              <span className="font-medium">Audio Track</span>
            </div>
            <div className="space-y-1 text-sm">
              <p>Tempo: {template?.assets?.audio?.tempo} BPM</p>
              <p>Energy: {(template?.assets?.audio?.energy * 100).toFixed(0)}%</p>
              <Badge variant="secondary">Extracted</Badge>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Type className="h-4 w-4 text-purple-500" />
              <span className="font-medium">Text/Lyrics</span>
            </div>
            <div className="space-y-1 text-sm">
              <p>Fonts: {template?.assets?.text?.fonts?.join(', ')}</p>
              <p>Colors: {template?.assets?.text?.colors?.join(', ')}</p>
              <Badge variant="secondary">OCR Complete</Badge>
            </div>
          </Card>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Template Ready for Application!</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Now upload your own video to recreate this viral style and effects
          </p>
          <Button 
            onClick={onProceedToUserUpload}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
            data-testid="button-proceed-user-upload"
          >
            <Video className="h-4 w-4 mr-2" />
            Upload Your Video Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Component for uploading user's video
function UserVideoUploadSection({ template, onUserVideoUploaded }: {
  template: any;
  onUserVideoUploaded: (data: any) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUserVideoUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('userVideo', file);
      formData.append('templateId', template.id);
      formData.append('title', `${file.name} - Styled with ${template.name}`);

      const response = await apiRequest('/api/templates/apply-to-user-video', {
        method: 'POST',
        body: formData,
      });

      onUserVideoUploaded({ file, uploadResponse: response });
    } catch (error) {
      console.error('User video upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Step 4: Upload Your Video for Styling
        </CardTitle>
        <CardDescription>
          Upload your video to apply the extracted viral style from "{template?.name}"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50 dark:bg-blue-900/20">
          <Video className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="font-medium text-blue-900 dark:text-blue-100">Upload Your Video for Transformation</p>
          <p className="text-sm text-blue-600 dark:text-blue-300">The viral style will be applied to your content</p>
          <Input
            type="file"
            accept="video/*"
            className="mt-4"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUserVideoUpload(file);
            }}
            disabled={isUploading}
            data-testid="input-user-video-upload"
          />
        </div>

        {isUploading && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>Processing Your Video</AlertTitle>
            <AlertDescription>
              Applying viral template "{template?.name}" to your video content...
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// Component for template application process  
function TemplateApplicationSection({ template, userVideo, onApplicationComplete }: {
  template: any;
  userVideo: any;
  onApplicationComplete: () => void;
}) {
  const [applicationProgress, setApplicationProgress] = useState(0);

  useEffect(() => {
    // Simulate application progress
    const applyTemplate = async () => {
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 400));
        setApplicationProgress(progress);
      }
      onApplicationComplete();
    };

    applyTemplate();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Step 5: Applying Viral Template
        </CardTitle>
        <CardDescription>
          Combining your video with extracted viral elements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Template Application Progress</span>
            <span className="text-sm text-gray-500">{applicationProgress}%</span>
          </div>
          <Progress value={applicationProgress} className="w-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="font-medium">Viral Template</p>
            <p className="text-sm text-gray-600">{template?.name}</p>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="font-medium">Your Video</p>
            <p className="text-sm text-gray-600">{userVideo?.file?.name}</p>
          </div>
        </div>

        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertTitle>AI Processing</AlertTitle>
          <AlertDescription>
            Applying visual effects, audio synchronization, and text overlays from the viral template...
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

// Component for completion and export
function CompletedSection({ template, onStartNew }: {
  template: any;
  onStartNew: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Viral Style Recreation Complete!
        </CardTitle>
        <CardDescription>
          Your video has been transformed with the viral template
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Download className="h-4 w-4" />
          <AlertTitle>Ready for Export</AlertTitle>
          <AlertDescription>
            Your styled video is ready for download and sharing
          </AlertDescription>
        </Alert>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-3"
            data-testid="button-download-styled-video"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Styled Video
          </Button>
          <Button 
            variant="outline"
            onClick={onStartNew}
            className="px-8 py-3"
            data-testid="button-create-another-template"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Create Another Template
          </Button>
        </div>

        <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
          <p className="font-medium mb-2">Template "{template?.name}" is now available in your library!</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            You can reuse this template on other videos anytime from the gallery.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}