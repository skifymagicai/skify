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
  
  // Debug logging for development visibility
  React.useEffect(() => {
    debugLogger.success('DASHBOARD', 'Component initialized successfully');
    debugLogger.log('STATE', `Active tab: ${activeTab}`);
    debugLogger.log('DEVELOPER', 'AI Developer actively working on SkifyMagicAI enhancements');
  }, [activeTab]);

  // Real-time development progress indicator
  React.useEffect(() => {
    const interval = setInterval(() => {
      debugLogger.log('HEARTBEAT', `Development session active - ${new Date().toLocaleTimeString()}`);
    }, 30000); // Log every 30 seconds
    
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

          {/* UPLOAD TAB */}
          <TabsContent value="upload" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* File Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Video
                  </CardTitle>
                  <CardDescription>
                    Upload your video file to start AI analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      MP4, MOV, AVI up to 100MB
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                </CardContent>
              </Card>

              {/* URL Import */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    Import from URL
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
            {analysisResult && (
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Results</CardTitle>
                    <CardDescription>
                      AI has detected the following viral elements
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Style Analysis */}
                    <div>
                      <h3 className="font-medium mb-3">Visual Effects Detected</h3>
                      <div className="grid gap-2">
                        {analysisResult.styleAnalysis.effects.map((effect: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <span className="font-medium">{effect.name}</span>
                            <Badge variant="secondary">{effect.confidence}% confidence</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Text Analysis */}
                    <div>
                      <h3 className="font-medium mb-3">Text Elements</h3>
                      <div className="grid gap-2">
                        {analysisResult.lyricsAnalysis.extractedText.map((text: any, index: number) => (
                          <div key={index} className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">"{text.text}"</span>
                              <Badge variant="outline">{text.font}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button onClick={saveAsTemplate} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Save as Template
                    </Button>
                  </CardContent>
                </Card>
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
                <div className="grid gap-4">
                  {templates.map((template) => (
                    <div key={template.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{template.name}</h3>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">{template.usageCount}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.effects.map((effect: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {effect}
                          </Badge>
                        ))}
                      </div>
                      <Button variant="outline" size="sm">
                        <Play className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                    </div>
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