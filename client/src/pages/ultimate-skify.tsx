import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Eye,
  ArrowRight,
  RefreshCw
} from "lucide-react";

// ===== TYPES =====

interface VideoData {
  id: string;
  title: string;
  originalUrl: string;
  styledUrl?: string;
  status: string;
  duration?: number;
}

interface TemplateData {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  videoId: string;
  cloudFolder: string;
  assets: {
    visual: string[];
    audio: string[];
    text: string[];
  };
}

interface JobStatus {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  stage?: string;
}

interface AnalysisResult {
  visual: {
    effects: Array<{ name: string; confidence: number; timestamp: string }>;
    transitions: Array<{ type: string; confidence: number; timestamp: string }>;
    colorGrading: { lut: string; contrast: number; saturation: number };
    cameraMotion: Array<{ type: string; confidence: number; timestamp: string }>;
  };
  audio: {
    tempo: number;
    key: string;
    energy: number;
    danceability: number;
    extractedFile: string;
  };
  text: {
    extractedTexts: Array<{
      text: string;
      position: { x: number; y: number };
      fontFamily: string;
      fontSize: number;
      color: string;
      animation: string;
      timing: { start: number; end: number };
    }>;
  };
}

// ===== ULTIMATE SKIFY API CLIENT =====

class UltimateSkifyAPI {
  private static async request(method: string, url: string, data?: any): Promise<any> {
    const isFormData = data instanceof FormData;
    
    const headers: Record<string, string> = {
      'x-user-id': 'user_001'
    };
    
    if (!isFormData && data) {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(url, {
      method,
      headers,
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }
    
    return response.json();
  }

  // ===== UPLOAD ENDPOINTS =====
  
  static async uploadViral(file: File): Promise<{ success: boolean; video: VideoData; jobId: string }> {
    const formData = new FormData();
    formData.append('viralVideo', file);
    formData.append('title', `Viral Video - ${file.name}`);
    
    return this.request('POST', '/api/upload/viral', formData);
  }

  static async uploadUser(file: File, templateId?: string): Promise<{ success: boolean; video: VideoData }> {
    const formData = new FormData();
    formData.append('userVideo', file);
    formData.append('title', `User Video - ${file.name}`);
    if (templateId) formData.append('templateId', templateId);
    
    return this.request('POST', '/api/upload/user', formData);
  }

  // ===== IMPORT ENDPOINT =====
  
  static async importFromUrl(url: string): Promise<{ success: boolean; video: VideoData; jobId: string }> {
    return this.request('POST', '/api/import', { url, title: `Imported from ${url}` });
  }

  // ===== AI ANALYSIS ENDPOINT =====
  
  static async analyzeVideo(videoId: string): Promise<{ success: boolean; jobId: string }> {
    return this.request('POST', '/api/analyze', { videoId });
  }

  // ===== TEMPLATE ENDPOINTS =====
  
  static async saveTemplate(videoId: string, name: string, description: string): Promise<{ success: boolean; template: TemplateData; jobId: string }> {
    return this.request('POST', '/api/template/save', {
      videoId,
      templateName: name,
      templateDescription: description,
      makePublic: true
    });
  }

  // ===== APPLICATION ENDPOINT =====
  
  static async applyTemplate(userVideoId: string, templateId: string): Promise<{ success: boolean; jobId: string }> {
    return this.request('POST', '/api/apply', {
      userVideoId,
      templateId,
      applyVisual: true,
      applyAudio: true,
      applyText: true
    });
  }

  // ===== EXPORT & DOWNLOAD ENDPOINTS =====
  
  static async exportVideo(videoId: string, watermark: boolean = true): Promise<{ success: boolean; jobId: string }> {
    return this.request('POST', '/api/export', { videoId, watermark });
  }

  static async getDownloadUrl(videoId: string): Promise<{ success: boolean; downloadUrl: string }> {
    return this.request('GET', `/api/download/${videoId}`);
  }

  // ===== STATUS POLLING =====
  
  static async getJobStatus(jobId: string): Promise<JobStatus> {
    const response = await this.request('GET', `/api/status/${jobId}`);
    return response.job;
  }

  static async pollJobUntilComplete(jobId: string, onProgress?: (job: JobStatus) => void): Promise<JobStatus> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const job = await this.getJobStatus(jobId);
          
          if (onProgress) onProgress(job);
          
          if (job.status === 'completed') {
            resolve(job);
          } else if (job.status === 'failed') {
            reject(new Error(job.message || 'Job failed'));
          } else {
            setTimeout(poll, 2000); // Poll every 2 seconds
          }
        } catch (error) {
          reject(error);
        }
      };
      
      poll();
    });
  }
}

// ===== MAIN COMPONENT =====

export default function UltimateSkifyPage() {
  // ===== STATE =====
  
  const [currentStep, setCurrentStep] = useState<
    'upload_viral' | 'analyzing' | 'template_created' | 'upload_user' | 'applying' | 'exporting' | 'completed'
  >('upload_viral');
  
  const [viralVideo, setViralVideo] = useState<VideoData | null>(null);
  const [userVideo, setUserVideo] = useState<VideoData | null>(null);
  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  const [currentJob, setCurrentJob] = useState<JobStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);

  const viralFileRef = useRef<HTMLInputElement>(null);
  const userFileRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // ===== HELPERS =====
  
  const clearMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  const showError = (message: string) => {
    setError(message);
    setIsLoading(false);
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  // ===== STEP 1: VIRAL VIDEO UPLOAD/IMPORT =====
  
  const handleViralUpload = async (file: File) => {
    clearMessages();
    setIsLoading(true);
    setCurrentStep('upload_viral');
    setProgress(0);
    
    try {
      showSuccess('Uploading viral video...');
      const response = await UltimateSkifyAPI.uploadViral(file);
      
      if (response.success) {
        setViralVideo(response.video);
        showSuccess('Viral video uploaded! Starting AI analysis...');
        
        // Auto-proceed to analysis
        setTimeout(() => handleAnalyzeVideo(response.video.id), 1000);
      }
    } catch (error: any) {
      showError(`Upload failed: ${error.message}`);
      console.error('Viral video upload failed:', error);
    }
  };

  const handleViralImport = async (url: string) => {
    clearMessages();
    setIsLoading(true);
    setCurrentStep('upload_viral');
    setProgress(0);
    
    try {
      showSuccess('Importing viral video from URL...');
      const response = await UltimateSkifyAPI.importFromUrl(url);
      
      if (response.success) {
        setViralVideo(response.video);
        
        // Poll import job
        await UltimateSkifyAPI.pollJobUntilComplete(response.jobId, (job) => {
          setCurrentJob(job);
          setProgress(job.progress);
        });
        
        showSuccess('Viral video imported! Starting AI analysis...');
        
        // Auto-proceed to analysis
        setTimeout(() => handleAnalyzeVideo(response.video.id), 1000);
      }
    } catch (error: any) {
      showError(`Import failed: ${error.message}`);
    }
  };

  // ===== STEP 2: AI ANALYSIS =====
  
  const handleAnalyzeVideo = async (videoId: string) => {
    clearMessages();
    setIsLoading(true);
    setCurrentStep('analyzing');
    setProgress(0);
    
    try {
      showSuccess('Starting comprehensive AI analysis...');
      const response = await UltimateSkifyAPI.analyzeVideo(videoId);
      
      if (response.success) {
        // Poll analysis job with detailed progress
        await UltimateSkifyAPI.pollJobUntilComplete(response.jobId, (job) => {
          setCurrentJob(job);
          setProgress(job.progress);
          
          if (job.stage) {
            showSuccess(`AI Analysis: ${job.stage}... (${job.progress}%)`);
          }
        });
        
        showSuccess('AI analysis completed! Saving template...');
        
        // Auto-proceed to template save
        setTimeout(() => handleSaveTemplate(videoId), 1000);
      }
    } catch (error: any) {
      showError(`Analysis failed: ${error.message}`);
    }
  };

  // ===== STEP 3: SAVE TEMPLATE =====
  
  const handleSaveTemplate = async (videoId: string) => {
    clearMessages();
    setIsLoading(true);
    setProgress(0);
    
    try {
      showSuccess('Creating template from analysis...');
      const response = await UltimateSkifyAPI.saveTemplate(
        videoId,
        `Viral Template ${Date.now()}`,
        'Auto-generated template from viral video analysis'
      );
      
      if (response.success) {
        setTemplate(response.template);
        
        // Poll template creation job
        await UltimateSkifyAPI.pollJobUntilComplete(response.jobId, (job) => {
          setCurrentJob(job);
          setProgress(job.progress);
        });
        
        setCurrentStep('template_created');
        showSuccess('Template created successfully! Now upload your video to apply the viral style.');
        setIsLoading(false);
      }
    } catch (error: any) {
      showError(`Template creation failed: ${error.message}`);
    }
  };

  // ===== STEP 4: USER VIDEO UPLOAD =====
  
  const handleUserUpload = async (file: File) => {
    if (!template) {
      showError('No template available. Complete viral analysis first.');
      return;
    }
    
    clearMessages();
    setIsLoading(true);
    setCurrentStep('upload_user');
    setProgress(0);
    
    try {
      showSuccess('Uploading your video...');
      const response = await UltimateSkifyAPI.uploadUser(file, template.id);
      
      if (response.success) {
        setUserVideo(response.video);
        showSuccess('Your video uploaded! Applying viral style...');
        
        // Auto-proceed to template application
        setTimeout(() => handleApplyTemplate(response.video.id), 1000);
      }
    } catch (error: any) {
      showError(`User video upload failed: ${error.message}`);
    }
  };

  // ===== STEP 5: APPLY TEMPLATE =====
  
  const handleApplyTemplate = async (userVideoId: string) => {
    if (!template) {
      showError('No template available.');
      return;
    }
    
    clearMessages();
    setIsLoading(true);
    setCurrentStep('applying');
    setProgress(0);
    
    try {
      showSuccess('Applying viral style to your video...');
      const response = await UltimateSkifyAPI.applyTemplate(userVideoId, template.id);
      
      if (response.success) {
        // Poll application job
        await UltimateSkifyAPI.pollJobUntilComplete(response.jobId, (job) => {
          setCurrentJob(job);
          setProgress(job.progress);
          
          if (job.stage) {
            showSuccess(`Styling: ${job.stage}... (${job.progress}%)`);
          }
        });
        
        showSuccess('Style applied successfully! Preparing export...');
        
        // Auto-proceed to export
        setTimeout(() => handleExportVideo(userVideoId), 1000);
      }
    } catch (error: any) {
      showError(`Style application failed: ${error.message}`);
    }
  };

  // ===== STEP 6: EXPORT & DOWNLOAD =====
  
  const handleExportVideo = async (videoId: string) => {
    clearMessages();
    setIsLoading(true);
    setCurrentStep('exporting');
    setProgress(0);
    
    try {
      showSuccess('Exporting styled video...');
      const response = await UltimateSkifyAPI.exportVideo(videoId, true); // With watermark
      
      if (response.success) {
        // Poll export job
        await UltimateSkifyAPI.pollJobUntilComplete(response.jobId, (job) => {
          setCurrentJob(job);
          setProgress(job.progress);
        });
        
        setCurrentStep('completed');
        showSuccess('Video export completed! Ready for download.');
        setIsLoading(false);
      }
    } catch (error: any) {
      showError(`Export failed: ${error.message}`);
    }
  };

  const handleDownload = async () => {
    if (!userVideo) return;
    
    try {
      const response = await UltimateSkifyAPI.getDownloadUrl(userVideo.id);
      
      if (response.success) {
        // Trigger download
        const link = document.createElement('a');
        link.href = response.downloadUrl;
        link.download = `skify-styled-${userVideo.title}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccess('Download started!');
      }
    } catch (error: any) {
      showError(`Download failed: ${error.message}`);
    }
  };

  // ===== RENDER =====
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Skify Ultimate
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Complete Full-Stack AI Video Transformation Platform
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">
            Upload viral video → AI analysis → Template creation → Apply to your video → Export & download
          </p>
        </div>

        {/* Progress Indicator */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Workflow Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {currentStep === 'upload_viral' && 'Step 1: Upload/Import Viral Video'}
                  {currentStep === 'analyzing' && 'Step 2: AI Analysis & Extraction'}
                  {currentStep === 'template_created' && 'Step 3: Template Created - Upload Your Video'}
                  {currentStep === 'upload_user' && 'Step 4: Upload Your Video'}
                  {currentStep === 'applying' && 'Step 5: Applying Viral Style'}
                  {currentStep === 'exporting' && 'Step 6: Exporting Styled Video'}
                  {currentStep === 'completed' && 'Step 7: Completed - Ready for Download'}
                </span>
                <Badge variant={
                  currentStep === 'completed' ? 'default' :
                  isLoading ? 'secondary' : 'outline'
                }>
                  {currentStep === 'completed' ? 'Complete' :
                   isLoading ? 'Processing' : 'Ready'}
                </Badge>
              </div>
              
              {isLoading && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-gray-500">
                    {currentJob?.message || `Processing... ${progress}%`}
                  </p>
                </div>
              )}
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

        {/* Main Content Sections */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left Column: Viral Video Upload/Import */}
          {currentStep === 'upload_viral' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Step 1: Upload or Import Viral Video
                </CardTitle>
                <CardDescription>
                  Upload a viral video file or import from social media URL for comprehensive AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Upload File</TabsTrigger>
                    <TabsTrigger value="import">Import URL</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload" className="mt-6">
                    <div className="space-y-4">
                      <Label htmlFor="viral-upload">Select Viral Video File</Label>
                      <Input
                        id="viral-upload"
                        ref={viralFileRef}
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleViralUpload(file);
                        }}
                        disabled={isLoading}
                        data-testid="input-viral-upload"
                      />
                      <p className="text-sm text-gray-500">
                        Supports MP4, MOV, AVI, WebM (max 500MB)
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="import" className="mt-6">
                    <div className="space-y-4">
                      <Label htmlFor="viral-url">Social Media URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="viral-url"
                          ref={urlInputRef}
                          placeholder="https://instagram.com/reel/... or TikTok/YouTube URL"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && urlInputRef.current?.value) {
                              handleViralImport(urlInputRef.current.value);
                            }
                          }}
                          disabled={isLoading}
                          data-testid="input-viral-url"
                        />
                        <Button 
                          onClick={() => {
                            if (urlInputRef.current?.value) {
                              handleViralImport(urlInputRef.current.value);
                            }
                          }}
                          disabled={isLoading}
                          data-testid="button-import-viral"
                        >
                          <Link2 className="h-4 w-4 mr-2" />
                          Import
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">
                        Instagram Reels, TikTok, YouTube Shorts supported
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* User Video Upload (Step 3) */}
          {currentStep === 'template_created' && template && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Step 3: Upload Your Video
                </CardTitle>
                <CardDescription>
                  Upload your video to apply the extracted viral style
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                    Template Ready: {template.name}
                  </h4>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    {template.description}
                  </p>
                </div>
                
                <Label htmlFor="user-upload">Select Your Video File</Label>
                <Input
                  id="user-upload"
                  ref={userFileRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUserUpload(file);
                  }}
                  disabled={isLoading}
                  data-testid="input-user-upload"
                />
                <p className="text-sm text-gray-500">
                  Your video will be styled with the extracted viral template
                </p>
              </CardContent>
            </Card>
          )}

          {/* Right Column: Status and Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Process Status & Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Video Status */}
              {viralVideo && (
                <div>
                  <h4 className="font-medium mb-2">Viral Video</h4>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm">{viralVideo.title}</p>
                    <Badge variant="secondary" className="mt-1">
                      {viralVideo.status}
                    </Badge>
                  </div>
                </div>
              )}

              {template && (
                <div>
                  <h4 className="font-medium mb-2">Generated Template</h4>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium">{template.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {template.description}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">
                        <Palette className="h-3 w-3 mr-1" />
                        Visual Effects
                      </Badge>
                      <Badge variant="outline">
                        <Music className="h-3 w-3 mr-1" />
                        Audio Style
                      </Badge>
                      <Badge variant="outline">
                        <Type className="h-3 w-3 mr-1" />
                        Text/Lyrics
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {userVideo && (
                <div>
                  <h4 className="font-medium mb-2">Your Video</h4>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm">{userVideo.title}</p>
                    <Badge variant="secondary" className="mt-1">
                      {userVideo.status}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Download Section */}
              {currentStep === 'completed' && userVideo && (
                <div className="pt-4 border-t">
                  <Button 
                    onClick={handleDownload}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    data-testid="button-download"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Styled Video
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Premium features available with Skify Pro
                  </p>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* Processing Steps Visualization */}
        {(currentStep === 'analyzing' || currentStep === 'applying' || currentStep === 'exporting') && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                AI Processing Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Palette className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium">Visual Analysis</p>
                  <p className="text-xs text-gray-500">Effects, transitions, color grading</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Music className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium">Audio Extraction</p>
                  <p className="text-xs text-gray-500">Tempo, style, synchronization</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Type className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium">Text/Lyrics OCR</p>
                  <p className="text-xs text-gray-500">Font, timing, animations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}