import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import SkifyApiClient, { type JobStatus, type VideoData, type TemplateData } from "@/lib/api-client";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
}

export default function FullStackViralAnalysisPage() {
  const [currentPhase, setCurrentPhase] = useState<
    'upload_viral' | 'analyzing' | 'template_created' | 'upload_user' | 'applying' | 'exporting' | 'completed'
  >('upload_viral');
  
  const [viralVideo, setViralVideo] = useState<VideoData | null>(null);
  const [userVideo, setUserVideo] = useState<VideoData | null>(null);
  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [currentJob, setCurrentJob] = useState<JobStatus | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    {
      id: 'viral_upload',
      title: 'Upload Viral Video',
      description: 'Upload or import viral video for analysis',
      status: 'pending'
    },
    {
      id: 'ai_analysis',
      title: 'AI Analysis',
      description: 'Extract visual, audio, and text elements',
      status: 'pending'
    },
    {
      id: 'template_save',
      title: 'Save Template',
      description: 'Create reusable template from analysis',
      status: 'pending'
    },
    {
      id: 'user_upload',
      title: 'Upload Your Video',
      description: 'Upload your video for styling',
      status: 'pending'
    },
    {
      id: 'apply_style',
      title: 'Apply Style',
      description: 'Apply viral template to your video',
      status: 'pending'
    },
    {
      id: 'export_download',
      title: 'Export & Download',
      description: 'Export and download styled video',
      status: 'pending'
    }
  ]);

  const updateStepStatus = (stepId: string, status: WorkflowStep['status'], progress?: number) => {
    setWorkflowSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, progress } : step
    ));
  };

  const clearMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  // ===== VIRAL VIDEO UPLOAD =====
  
  const handleViralVideoUpload = async (file: File) => {
    clearMessages();
    setIsLoading(true);
    updateStepStatus('viral_upload', 'processing');
    
    try {
      const response = await SkifyApiClient.uploadViralVideo(file, `Viral Video - ${file.name}`);
      
      if (response.success) {
        setViralVideo(response.video);
        setSuccessMessage('Viral video uploaded successfully!');
        updateStepStatus('viral_upload', 'completed');
        
        // Auto-start analysis
        setTimeout(() => handleAnalyzeVideo(response.video.id), 1000);
      }
    } catch (error: any) {
      setError(`Upload failed: ${error.message}`);
      updateStepStatus('viral_upload', 'failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViralVideoImport = async (url: string) => {
    clearMessages();
    setIsLoading(true);
    updateStepStatus('viral_upload', 'processing');
    
    try {
      const response = await SkifyApiClient.importFromUrl(url, `Imported Viral Video`);
      
      if (response.success) {
        setViralVideo(response.video);
        
        // Poll import job
        await SkifyApiClient.pollJobUntilComplete(response.jobId, (job) => {
          updateStepStatus('viral_upload', 'processing', job.progress);
        });
        
        setSuccessMessage('Viral video imported successfully!');
        updateStepStatus('viral_upload', 'completed');
        
        // Auto-start analysis
        setTimeout(() => handleAnalyzeVideo(response.video.id), 1000);
      }
    } catch (error: any) {
      setError(`Import failed: ${error.message}`);
      updateStepStatus('viral_upload', 'failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ===== AI ANALYSIS =====
  
  const handleAnalyzeVideo = async (videoId: string) => {
    clearMessages();
    setIsLoading(true);
    updateStepStatus('ai_analysis', 'processing');
    setCurrentPhase('analyzing');
    
    try {
      const response = await SkifyApiClient.analyzeVideo(videoId);
      
      if (response.success) {
        // Poll analysis job
        await SkifyApiClient.pollJobUntilComplete(response.jobId, (job) => {
          updateStepStatus('ai_analysis', 'processing', job.progress);
          setCurrentJob(job);
        });
        
        setSuccessMessage('AI analysis completed successfully!');
        updateStepStatus('ai_analysis', 'completed');
        
        // Auto-save template
        setTimeout(() => handleSaveTemplate(videoId, 'Auto Template'), 1000);
      }
    } catch (error: any) {
      setError(`Analysis failed: ${error.message}`);
      updateStepStatus('ai_analysis', 'failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ===== TEMPLATE SAVE =====
  
  const handleSaveTemplate = async (videoId: string, templateName: string) => {
    clearMessages();
    setIsLoading(true);
    updateStepStatus('template_save', 'processing');
    
    try {
      const response = await SkifyApiClient.saveTemplate(
        videoId, 
        templateName, 
        'Template extracted from viral video analysis',
        false
      );
      
      if (response.success) {
        setTemplate(response.template);
        setSuccessMessage('Template saved successfully!');
        updateStepStatus('template_save', 'completed');
        setCurrentPhase('template_created');
      }
    } catch (error: any) {
      setError(`Template save failed: ${error.message}`);
      updateStepStatus('template_save', 'failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ===== USER VIDEO UPLOAD =====
  
  const handleUserVideoUpload = async (file: File) => {
    if (!template) {
      setError('No template available. Complete viral analysis first.');
      return;
    }
    
    clearMessages();
    setIsLoading(true);
    updateStepStatus('user_upload', 'processing');
    setCurrentPhase('upload_user');
    
    try {
      const response = await SkifyApiClient.uploadUserVideo(
        file, 
        `${file.name} - Styled with ${template.name}`,
        template.id
      );
      
      if (response.success) {
        setUserVideo(response.video);
        setSuccessMessage('User video uploaded successfully!');
        updateStepStatus('user_upload', 'completed');
        
        // Auto-apply template
        setTimeout(() => handleApplyTemplate(response.video.id, template.id), 1000);
      }
    } catch (error: any) {
      setError(`User video upload failed: ${error.message}`);
      updateStepStatus('user_upload', 'failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ===== APPLY TEMPLATE =====
  
  const handleApplyTemplate = async (userVideoId: string, templateId: string) => {
    clearMessages();
    setIsLoading(true);
    updateStepStatus('apply_style', 'processing');
    setCurrentPhase('applying');
    
    try {
      const response = await SkifyApiClient.applyTemplate(userVideoId, templateId, {
        applyVisual: true,
        applyAudio: true,
        applyText: true
      });
      
      if (response.success) {
        // Poll application job
        await SkifyApiClient.pollJobUntilComplete(response.jobId, (job) => {
          updateStepStatus('apply_style', 'processing', job.progress);
          setCurrentJob(job);
        });
        
        setSuccessMessage('Template applied successfully!');
        updateStepStatus('apply_style', 'completed');
        
        // Auto-export
        setTimeout(() => handleExportVideo(userVideoId), 1000);
      }
    } catch (error: any) {
      setError(`Template application failed: ${error.message}`);
      updateStepStatus('apply_style', 'failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ===== EXPORT VIDEO =====
  
  const handleExportVideo = async (videoId: string) => {
    clearMessages();
    setIsLoading(true);
    updateStepStatus('export_download', 'processing');
    setCurrentPhase('exporting');
    
    try {
      const response = await SkifyApiClient.exportVideo(videoId, 'HD', true);
      
      if (response.success) {
        // Poll export job
        await SkifyApiClient.pollJobUntilComplete(response.jobId, (job) => {
          updateStepStatus('export_download', 'processing', job.progress);
          setCurrentJob(job);
        });
        
        setSuccessMessage('Video exported successfully!');
        updateStepStatus('export_download', 'completed');
        setCurrentPhase('completed');
      }
    } catch (error: any) {
      setError(`Export failed: ${error.message}`);
      updateStepStatus('export_download', 'failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ===== DOWNLOAD VIDEO =====
  
  const handleDownloadVideo = async () => {
    if (!userVideo) return;
    
    try {
      const response = await SkifyApiClient.getDownloadUrl(userVideo.id);
      
      if (response.success) {
        // In production, this would trigger actual download
        window.open(response.downloadUrl, '_blank');
        setSuccessMessage('Download ready!');
      }
    } catch (error: any) {
      setError(`Download failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Skify AI Video Transformation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Complete Full-Stack Viral Video Analysis & Style Transfer Pipeline
          </p>
        </div>

        {/* Workflow Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Workflow Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-6 gap-4">
              {workflowSteps.map((step, index) => (
                <div key={step.id} className="text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    step.status === 'completed' ? 'bg-green-500 text-white' :
                    step.status === 'processing' ? 'bg-blue-500 text-white' :
                    step.status === 'failed' ? 'bg-red-500 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {step.status === 'completed' ? <CheckCircle className="h-6 w-6" /> :
                     step.status === 'processing' ? <Clock className="h-6 w-6" /> :
                     step.status === 'failed' ? <AlertCircle className="h-6 w-6" /> :
                     index + 1}
                  </div>
                  <p className="text-sm font-medium">{step.title}</p>
                  {step.status === 'processing' && step.progress && (
                    <Progress value={step.progress} className="mt-2" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Step 1: Viral Video Upload/Import */}
          {currentPhase === 'upload_viral' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Step 1: Upload or Import Viral Video
                </CardTitle>
                <CardDescription>
                  Upload a viral video file or import from URL for AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* File Upload */}
                <div>
                  <Label htmlFor="viral-upload">Upload Video File</Label>
                  <Input
                    id="viral-upload"
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleViralVideoUpload(file);
                    }}
                    disabled={isLoading}
                    data-testid="input-viral-upload"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-sm text-gray-500">OR</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                
                {/* URL Import */}
                <div>
                  <Label htmlFor="viral-url">Import from URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="viral-url"
                      placeholder="https://instagram.com/reel/... or TikTok/YouTube URL"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const url = e.currentTarget.value;
                          if (url) handleViralVideoImport(url);
                        }
                      }}
                      disabled={isLoading}
                      data-testid="input-viral-url"
                    />
                    <Button 
                      onClick={() => {
                        const input = document.getElementById('viral-url') as HTMLInputElement;
                        const url = input?.value;
                        if (url) handleViralVideoImport(url);
                      }}
                      disabled={isLoading}
                      data-testid="button-import-viral"
                    >
                      <Link2 className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                  </div>
                </div>
                
              </CardContent>
            </Card>
          )}

          {/* Step 2: Analysis Progress */}
          {currentPhase === 'analyzing' && currentJob && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  AI Analysis in Progress
                </CardTitle>
                <CardDescription>
                  Extracting visual, audio, and text elements from viral video
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={currentJob.progress} />
                  <p className="text-center text-sm text-gray-600">
                    {currentJob.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Template Created */}
          {currentPhase === 'template_created' && template && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  Template Created Successfully
                </CardTitle>
                <CardDescription>
                  Viral video analyzed and template saved to cloud storage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {template.description}
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => setCurrentPhase('upload_user')}
                    className="w-full"
                    data-testid="button-proceed-user-upload"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Your Video for Styling
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: User Video Upload */}
          {currentPhase === 'upload_user' && template && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Step 4: Upload Your Video
                </CardTitle>
                <CardDescription>
                  Upload your video to apply the extracted viral style
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUserVideoUpload(file);
                  }}
                  disabled={isLoading}
                  data-testid="input-user-upload"
                />
              </CardContent>
            </Card>
          )}

          {/* Step 5: Template Application Progress */}
          {currentPhase === 'applying' && currentJob && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Applying Template to Your Video
                </CardTitle>
                <CardDescription>
                  Merging viral style with your content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={currentJob.progress} />
                  <p className="text-center text-sm text-gray-600">
                    {currentJob.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 6: Export Progress */}
          {currentPhase === 'exporting' && currentJob && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Exporting Styled Video
                </CardTitle>
                <CardDescription>
                  Rendering final video with applied style
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={currentJob.progress} />
                  <p className="text-center text-sm text-gray-600">
                    {currentJob.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 7: Completed */}
          {currentPhase === 'completed' && userVideo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Transformation Complete!
                </CardTitle>
                <CardDescription>
                  Your video has been styled with the viral template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-green-800 dark:text-green-200">
                      ✅ Video processed successfully<br />
                      ✅ Viral style applied<br />
                      ✅ Ready for download
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleDownloadVideo}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    data-testid="button-download-video"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Styled Video
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

      </div>
    </div>
  );
}