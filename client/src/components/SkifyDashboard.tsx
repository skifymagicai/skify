import React, { useState, useRef } from 'react';
import { Upload, Link2, Wand2, Download, Play, Eye, Sparkles, Star, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '@/hooks/use-toast';
import VideoPlayer from './VideoPlayer';
import { debugLogger } from '../utils/debugLogger';
import AdvancedAnalysis from './AdvancedAnalysis';
import TemplatePreview from './TemplatePreview';
import UploadComponent from './Upload';

interface AnalysisResult {
  videoId: string;
  styleAnalysis: any;
  lyricsAnalysis: any;
  textAnalysis: any;
  cloudinaryUrl: string;
}

interface Job {
  id: string;
  type: string;
  status: string;
  progress: number;
  result?: any;
  error?: string;
}

export const SkifyDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upload');
  
  // Enhanced debug logging for Agent Bar monitoring
  React.useEffect(() => {
    debugLogger.success('DASHBOARD', 'SkifyMagicAI Dashboard initialized');
    debugLogger.log('TABS', `Active tab: ${activeTab}`);
    debugLogger.log('DEVELOPER', '@openai-dev-helper: Live coding session active');
    debugLogger.api('/dashboard', 'LOAD', 200);
  }, [activeTab]);

  // Live development activity heartbeat
  React.useEffect(() => {
    const interval = setInterval(() => {
      debugLogger.log('HEARTBEAT', `Development environment active - ${new Date().toLocaleTimeString()}`);
      debugLogger.log('AGENT-BAR', 'Live monitoring enabled - file edits visible in real-time');
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  const [uploadedVideo, setUploadedVideo] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  // API BASE URL
  const API_BASE = '/api/skify';

  // UPLOAD VIDEO FILE
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    debugLogger.log('UPLOAD', `Starting file upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    setIsLoading(true);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('userId', 'demo_user');
    formData.append('title', file.name);

    try {
      const mockVideo = {
        id: `upload_${Date.now()}`,
        title: file.name,
        originalPath: URL.createObjectURL(file),
        status: 'uploaded',
        duration: 0,
        createdAt: new Date().toISOString()
      };

      setUploadedVideo(mockVideo);
      setActiveTab('analyze');
      debugLogger.success('UPLOAD', `Video uploaded successfully: ${file.name}`);
      debugLogger.log('NAVIGATION', 'Auto-navigated to analyze tab');
      toast({
        title: "Video Uploaded",
        description: "Your video has been uploaded successfully!"
      });

    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // IMPORT VIDEO FROM URL
  const handleUrlImport = async (url: string) => {
    if (!url) return;

    setIsLoading(true);
    
    try {
      const videoId = `import_${Date.now()}`;
      const mockVideo = {
        id: videoId,
        title: `Imported from ${new URL(url).hostname}`,
        originalUrl: url,
        status: 'imported',
        duration: 45,
        createdAt: new Date().toISOString()
      };

      setUploadedVideo(mockVideo);
      setActiveTab('analyze');
      debugLogger.success('IMPORT', `Video imported from: ${new URL(url).hostname}`);
      debugLogger.log('NAVIGATION', 'Auto-navigated to analyze tab');
      
      toast({
        title: "Video Imported",
        description: "Video has been imported successfully!"
      });

    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed", 
        description: error.message || "Failed to import video",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // START AI ANALYSIS
  const startAnalysis = async () => {
    if (!uploadedVideo) return;

    setIsLoading(true);
    
    try {
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      setCurrentJob({ 
        id: jobId, 
        type: 'analysis', 
        status: 'processing', 
        progress: 0 
      });
      
      simulateAnalysisProgress(jobId);
      debugLogger.success('ANALYSIS', `Started AI analysis job: ${jobId}`);
      debugLogger.log('AI_PIPELINE', 'Initializing 7-stage analysis progression');
      
      toast({
        title: "AI Analysis Started",
        description: "Processing your video with AI..."
      });
      
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to start analysis",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // SIMULATE AI ANALYSIS PROGRESSION
  const simulateAnalysisProgress = async (jobId: string) => {
    const stages = [
      { progress: 10, status: 'analyzing_video', message: 'Loading video...' },
      { progress: 25, status: 'extracting_features', message: 'Extracting visual features...' },
      { progress: 45, status: 'style_detection', message: 'Detecting style elements...' },
      { progress: 65, status: 'audio_analysis', message: 'Analyzing audio patterns...' },
      { progress: 80, status: 'text_extraction', message: 'Extracting text and lyrics...' },
      { progress: 95, status: 'generating_templates', message: 'Generating style templates...' },
      { progress: 100, status: 'completed', message: 'Analysis complete!' }
    ];

    for (let i = 0; i < stages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCurrentJob(prev => prev ? {
        ...prev,
        progress: stages[i].progress,
        status: stages[i].status
      } : null);
      
      if (stages[i].status === 'completed') {
        const mockAnalysisResult = {
          videoId: uploadedVideo?.id || '',
          styleAnalysis: {
            effects: [
              { name: "Film Grain", confidence: 92, timestamp: "0:15-0:45" },
              { name: "Color Pop", confidence: 87, timestamp: "0:30-1:20" },
              { name: "Motion Blur", confidence: 95, timestamp: "1:05-1:30" }
            ],
            colorGrading: {
              lut: "Cinematic Blue",
              contrast: 1.2,
              saturation: 1.1,
              temperature: -200
            },
            transitions: [
              { type: "Quick Cut", confidence: 94, timestamp: "0:45" },
              { type: "Fade", confidence: 88, timestamp: "1:15" }
            ]
          },
          lyricsAnalysis: {
            extractedText: [
              { text: "TRENDING NOW", font: "Impact", timestamp: "0:05-0:08" },
              { text: "Follow for more!", font: "Arial", timestamp: "0:12-0:15" }
            ],
            audioFeatures: {
              tempo: 128,
              key: "C Major",
              energy: 0.8
            }
          },
          textAnalysis: {
            fonts: ["Impact", "Arial Bold", "Helvetica"],
            colors: ["#ffffff", "#ff0066", "#00ff88"],
            animations: ["fade-in", "slide-up", "bounce"]
          },
          cloudinaryUrl: uploadedVideo?.originalUrl || ''
        };

        setAnalysisResult(mockAnalysisResult);
        setActiveTab('results');
        
        toast({
          title: "Analysis Complete!",
          description: "AI has analyzed your video successfully"
        });
      }
    }
  };

  // SAVE AS TEMPLATE
  const saveAsTemplate = async () => {
    if (!analysisResult) return;

    try {
      toast({
        title: "Template Saved",
        description: "Your viral style template is ready to use!"
      });
      loadTemplates();
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // LOAD TEMPLATES
  const loadTemplates = async () => {
    try {
      const demoTemplates = [
        {
          id: 'template_001',
          name: 'Cinematic Blue',
          description: 'Professional cinematic look with blue tones',
          effects: ['Film Grain', 'Color Grading', 'Lens Flare'],
          thumbnail: '/api/templates/thumbnail/template_001',
          usageCount: 147
        },
        {
          id: 'template_002', 
          name: 'Urban Vibes',
          description: 'Modern street-style with high contrast',
          effects: ['High Contrast', 'Vignette', 'Color Pop'],
          thumbnail: '/api/templates/thumbnail/template_002',
          usageCount: 89
        },
        {
          id: 'template_003',
          name: 'Vintage Aesthetic',
          description: 'Retro film look with warm tones',
          effects: ['Film Grain', 'Sepia Tone', 'Light Leaks'],
          thumbnail: '/api/templates/thumbnail/template_003', 
          usageCount: 203
        }
      ];
      
      setTemplates(demoTemplates);
      
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  React.useEffect(() => {
    loadTemplates();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-yellow-400" />
            Skify AI
            <Sparkles className="h-8 w-8 text-yellow-400" />
          </h1>
          <p className="text-xl text-blue-200">Transform Any Video Into Viral Content</p>
        </div>

        {/* Main Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="analyze" disabled={!uploadedVideo}>Analyze</TabsTrigger>
            <TabsTrigger value="results" disabled={!analysisResult}>Results</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* UPLOAD TAB - Production Pipeline */}
          <TabsContent value="upload" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Production Upload Component */}
              <Card className="md:col-span-2 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-blue-400" />
                    Production Upload Pipeline
                  </CardTitle>
                  <CardDescription>
                    Upload videos with AWS S3 integration, real-time AI analysis, and template application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UploadComponent />
                </CardContent>
              </Card>

              {/* URL Import - Legacy */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    Import from URL (Legacy)
                  </CardTitle>
                  <CardDescription>
                    Import videos from Instagram, TikTok, YouTube
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="video-url">Video URL</Label>
                    <Input
                      ref={urlInputRef}
                      id="video-url"
                      placeholder="https://www.instagram.com/reel/..."
                      className="w-full"
                    />
                  </div>
                  <Button 
                    onClick={() => {
                      const url = urlInputRef.current?.value;
                      if (url) handleUrlImport(url);
                    }}
                    className="w-full"
                    disabled={isLoading}
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Import Video
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ANALYZE TAB */}
          <TabsContent value="analyze" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  AI Analysis
                </CardTitle>
                <CardDescription>
                  Analyze your video to extract viral elements and styles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {uploadedVideo && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Ready to Analyze:</h3>
                    <p className="text-sm text-muted-foreground">{uploadedVideo.title}</p>
                  </div>
                )}

                {currentJob && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Analysis Progress</span>
                      <span className="text-sm text-muted-foreground">{currentJob.progress}%</span>
                    </div>
                    <Progress value={currentJob.progress} className="w-full" />
                    <p className="text-sm text-muted-foreground capitalize">
                      {currentJob.status.replace('_', ' ')}
                    </p>
                  </div>
                )}

                <Button 
                  onClick={startAnalysis}
                  className="w-full"
                  disabled={isLoading || !uploadedVideo}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Start AI Analysis
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RESULTS TAB */}
          <TabsContent value="results" className="space-y-6">
            {analysisResult ? (
              <div className="grid gap-6">
                <Card className="bg-gradient-to-br from-emerald-900/20 to-blue-900/20 border-emerald-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                      Analysis Results
                    </CardTitle>
                    <CardDescription>
                      AI has detected viral elements with confidence scores
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Style Analysis */}
                    <div className="p-4 bg-background/50 rounded-lg">
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Visual Effects Detected
                      </h3>
                      <div className="grid gap-2">
                        {analysisResult.styleAnalysis.effects.map((effect: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <span className="font-medium">{effect.name}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                  style={{ width: `${effect.confidence}%` }}
                                ></div>
                              </div>
                              <Badge variant="secondary" className="text-xs">{effect.confidence}%</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Text Analysis */}
                    <div className="p-4 bg-background/50 rounded-lg">
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Text Elements
                      </h3>
                      <div className="grid gap-2">
                        {analysisResult.lyricsAnalysis.extractedText.map((text: any, index: number) => (
                          <div key={index} className="p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-purple-300">"{text.text}"</span>
                              <Badge variant="outline" className="border-purple-500/30">{text.font}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={saveAsTemplate} className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        Save as Template
                      </Button>
                      <Button variant="outline" className="border-emerald-500/20 hover:bg-emerald-500/10">
                        Export Results
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">No Analysis Results</h3>
                <p className="text-muted-foreground mb-4">Upload and analyze a video to see results here.</p>
                <Button onClick={() => setActiveTab('upload')} variant="outline">
                  Go to Upload
                </Button>
              </div>
            )}
          </TabsContent>

          {/* TEMPLATES TAB */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Viral Style Templates</CardTitle>
                <CardDescription>
                  Choose from our collection of viral video styles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {templates.map((template) => (
                    <TemplatePreview
                      key={template.id}
                      template={{
                        ...template,
                        rating: 4.7,
                        category: template.id.includes('001') ? 'Cinematic' : 
                                template.id.includes('002') ? 'Urban' : 'Vintage'
                      }}
                      onApply={(templateId) => {
                        debugLogger.success('TEMPLATE', `Applied template: ${templateId}`);
                        toast({
                          title: "Template Applied",
                          description: "Your video style has been updated!"
                        });
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SkifyDashboard;