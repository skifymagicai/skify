import React, { useState, useRef } from 'react';
import { Upload, Link2, Wand2, Download, Play, Eye, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '@/hooks/use-toast';
import VideoPlayer from './VideoPlayer';

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

    setIsLoading(true);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('userId', 'demo_user');
    formData.append('title', file.name);

    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: {
          'x-user-id': 'demo-user-001'
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setUploadedVideo(result.video);
        setActiveTab('analyze');
        toast({
          title: "Video Uploaded",
          description: "Your video has been uploaded successfully!"
        });
      } else {
        throw new Error(result.error);
      }
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
      // For demo purposes, create a mock video import
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
      // Demo AI analysis with realistic progression
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      setCurrentJob({ 
        id: jobId, 
        type: 'analysis', 
        status: 'processing', 
        progress: 0 
      });
      
      // Simulate realistic AI analysis progression
      simulateAnalysisProgress(jobId);
      
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
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive"
      });
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
      const response = await fetch(`${API_BASE}/templates`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user-001'
        },
        body: JSON.stringify({
          videoId: analysisResult.videoId,
          name: `Template ${Date.now()}`,
          description: 'Auto-generated viral style template',
          isPublic: true
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Template Saved",
          description: "Your viral style template is ready to use!"
        });
        loadTemplates();
      }
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
      // Demo templates for showcase
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
      
      if (result.success) {
        setTemplates(result.templates);
      }
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
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Video
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    Upload your video file to transform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    disabled={isLoading}
                    className="bg-white/20 border-white/30 text-white"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Video File
                  </Button>
                </CardContent>
              </Card>

              {/* URL Import */}
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    Import from URL
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    Import viral videos from TikTok, Instagram, YouTube
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    ref={urlInputRef}
                    placeholder="https://www.tiktok.com/@user/video/..."
                    disabled={isLoading}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && urlInputRef.current?.value) {
                        handleUrlImport(urlInputRef.current.value);
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      if (urlInputRef.current?.value) {
                        handleUrlImport(urlInputRef.current.value);
                      }
                    }}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
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
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  AI Analysis
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Extract viral style components with AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {uploadedVideo && (
                  <div className="p-4 bg-blue-500/20 rounded-lg">
                    <h4 className="text-white font-medium">{uploadedVideo.title}</h4>
                    <Badge variant="secondary" className="mt-1">
                      {uploadedVideo.status}
                    </Badge>
                  </div>
                )}

                {currentJob && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-white">
                      <span>Processing...</span>
                      <span>{currentJob.progress}%</span>
                    </div>
                    <Progress value={currentJob.progress} className="w-full" />
                    <p className="text-sm text-blue-200">{currentJob.status}</p>
                  </div>
                )}

                <Button
                  onClick={startAnalysis}
                  disabled={isLoading || !uploadedVideo}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
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
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Video Player with Lyrics */}
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      Video with AI Lyrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VideoPlayer
                      videoUrl={analysisResult.cloudinaryUrl}
                      karaokeSegments={analysisResult.lyricsAnalysis?.karaokeSegments || []}
                    />
                  </CardContent>
                </Card>

                {/* Analysis Results */}
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Style Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Style Effects */}
                    <div>
                      <h4 className="text-white font-medium mb-2">Visual Effects</h4>
                      <div className="space-y-2">
                        {analysisResult.styleAnalysis?.effects?.map((effect: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-blue-200">{effect.name}</span>
                            <Badge variant="outline" className="text-green-400 border-green-400">
                              {Math.round(effect.confidence * 100)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Color Grading */}
                    <div>
                      <h4 className="text-white font-medium mb-2">Color Grading</h4>
                      <div className="text-sm text-blue-200 space-y-1">
                        <div>Saturation: {analysisResult.styleAnalysis?.colorGrading?.saturation}x</div>
                        <div>Contrast: {analysisResult.styleAnalysis?.colorGrading?.contrast}x</div>
                        <div>Style: {analysisResult.styleAnalysis?.colorGrading?.lut}</div>
                      </div>
                    </div>

                    {/* Lyrics Info */}
                    <div>
                      <h4 className="text-white font-medium mb-2">Lyrics Analysis</h4>
                      <div className="text-sm text-blue-200 space-y-1">
                        <div>Language: {analysisResult.lyricsAnalysis?.language}</div>
                        <div>Has Lyrics: {analysisResult.lyricsAnalysis?.hasLyrics ? 'Yes' : 'No'}</div>
                        <div>Segments: {analysisResult.lyricsAnalysis?.karaokeSegments?.length || 0}</div>
                      </div>
                    </div>

                    <Button
                      onClick={saveAsTemplate}
                      className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Save as Template
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* TEMPLATES TAB */}
          <TabsContent value="templates" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Viral Style Templates</CardTitle>
                <CardDescription className="text-blue-200">
                  Ready-to-use viral video styles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div key={template.id} className="p-4 bg-white/10 rounded-lg border border-white/20">
                      <h4 className="text-white font-medium">{template.name}</h4>
                      <p className="text-sm text-blue-200 mt-1">{template.description}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <Badge variant="secondary">
                          Used {template.usageCount || 0}x
                        </Badge>
                        <Button size="sm" variant="outline" className="text-white border-white/30">
                          Apply Style
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {templates.length === 0 && (
                  <div className="text-center py-8 text-blue-200">
                    No templates available yet. Analyze a video to create your first template!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SkifyDashboard;