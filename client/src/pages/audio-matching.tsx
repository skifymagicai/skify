import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Music, AudioWaveform, Play, Pause, Volume2, Clock, Zap, Target } from "lucide-react";

export default function AudioMatchingPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioSyncProgress, setAudioSyncProgress] = useState(0);
  const [audioMatched, setAudioMatched] = useState(false);
  const [enableAudioSync, setEnableAudioSync] = useState(true);

  const handleExtractAudio = () => {
    setIsProcessing(true);
    setAudioSyncProgress(0);
    
    // Simulate audio extraction progress
    const interval = setInterval(() => {
      setAudioSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setAudioMatched(true);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const sampleAudioAnalysis = {
    tempo: 128,
    key: "C Major",
    energy: 0.87,
    danceability: 0.92,
    vocals: true,
    instrumentalness: 0.15,
    genre: "Electronic Pop",
    mood: "Energetic"
  };

  const audioTimestamps = [
    { segment: "Intro", startTime: 0, endTime: 8, beatSync: true, intensity: 0.6 },
    { segment: "Main Drop", startTime: 8, endTime: 45, beatSync: true, intensity: 0.95 },
    { segment: "Breakdown", startTime: 45, endTime: 60, beatSync: false, intensity: 0.4 },
    { segment: "Final Drop", startTime: 60, endTime: 90, beatSync: true, intensity: 1.0 }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <Music className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">AI Audio Matching</h1>
            <p className="text-xl text-blue-100">
              Extract audio from viral videos and sync perfectly with your content
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="extraction" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="extraction" data-testid="tab-extraction">Audio Extraction</TabsTrigger>
            <TabsTrigger value="analysis" data-testid="tab-analysis">AI Analysis</TabsTrigger>
            <TabsTrigger value="synchronization" data-testid="tab-synchronization">Synchronization</TabsTrigger>
          </TabsList>

          {/* Audio Extraction Tab */}
          <TabsContent value="extraction" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AudioWaveform className="w-5 h-5" />
                  Audio Extraction Engine
                </CardTitle>
                <CardDescription>
                  Extract high-quality audio from any viral video with AI-powered processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Video Upload Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Music className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Upload Viral Video</h3>
                  <p className="text-gray-600 mb-4">Drop your TikTok, Reel, or YouTube Short here</p>
                  <Button variant="outline" data-testid="button-upload-viral">
                    Choose Video File
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">Supports MP4, MOV, AVI, WebM • Max 500MB</p>
                </div>

                {/* Audio Preview */}
                {audioMatched && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-semibold text-green-800">Audio Extracted Successfully</span>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Audio Matched From Source
                      </Badge>
                    </div>
                    
                    {/* Audio Waveform Visualization */}
                    <div className="bg-white rounded p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Play className="w-4 h-4" />
                        <span className="text-sm font-medium">extracted_audio.mp3</span>
                        <span className="text-xs text-gray-500">2:30 duration</span>
                      </div>
                      <div className="flex items-center gap-1 h-12">
                        {Array.from({ length: 50 }, (_, i) => (
                          <div
                            key={i}
                            className="bg-blue-500 rounded-sm flex-1"
                            style={{ height: `${Math.random() * 100}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button size="sm" data-testid="button-play-audio">
                          <Play className="w-4 h-4 mr-1" />
                          Play
                        </Button>
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4" />
                          <Slider defaultValue={[75]} max={100} className="w-20" />
                        </div>
                      </div>
                      <Button variant="outline" size="sm" data-testid="button-download-audio">
                        Download Audio
                      </Button>
                    </div>
                  </div>
                )}

                {/* Processing Progress */}
                {isProcessing && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Extracting audio with AI...</span>
                    </div>
                    <Progress value={audioSyncProgress} className="h-2" />
                    <p className="text-xs text-gray-600">
                      Using FFmpeg and AI audio analysis • Estimated time: 3-5 seconds
                    </p>
                  </div>
                )}

                {!audioMatched && !isProcessing && (
                  <Button onClick={handleExtractAudio} className="w-full" data-testid="button-extract-audio">
                    <Zap className="w-4 h-4 mr-2" />
                    Extract Audio with AI
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Audio Characteristics */}
              <Card>
                <CardHeader>
                  <CardTitle>Audio Analysis</CardTitle>
                  <CardDescription>AI-detected audio characteristics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Tempo</label>
                      <p className="text-2xl font-bold text-blue-600">{sampleAudioAnalysis.tempo} BPM</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Key</label>
                      <p className="text-2xl font-bold text-purple-600">{sampleAudioAnalysis.key}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Energy</label>
                      <div className="flex items-center gap-2">
                        <Progress value={sampleAudioAnalysis.energy * 100} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{Math.round(sampleAudioAnalysis.energy * 100)}%</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Danceability</label>
                      <div className="flex items-center gap-2">
                        <Progress value={sampleAudioAnalysis.danceability * 100} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{Math.round(sampleAudioAnalysis.danceability * 100)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-4">
                    <Badge variant={sampleAudioAnalysis.vocals ? "default" : "secondary"}>
                      {sampleAudioAnalysis.vocals ? "Has Vocals" : "Instrumental"}
                    </Badge>
                    <Badge variant="outline">{sampleAudioAnalysis.genre}</Badge>
                    <Badge variant="outline">{sampleAudioAnalysis.mood}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Audio Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Audio Timeline</CardTitle>
                  <CardDescription>Beat-synchronized segments for perfect matching</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {audioTimestamps.map((segment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${segment.beatSync ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <div>
                            <p className="font-medium">{segment.segment}</p>
                            <p className="text-sm text-gray-600">
                              {Math.floor(segment.startTime / 60)}:{(segment.startTime % 60).toString().padStart(2, '0')} - 
                              {Math.floor(segment.endTime / 60)}:{(segment.endTime % 60).toString().padStart(2, '0')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-sm font-medium">Intensity</p>
                            <Progress value={segment.intensity * 100} className="w-16 h-1" />
                          </div>
                          {segment.beatSync && (
                            <Badge variant="secondary" className="text-xs">Beat Sync</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Synchronization Tab */}
          <TabsContent value="synchronization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Audio Synchronization
                </CardTitle>
                <CardDescription>
                  Perfectly sync extracted audio with your target video using AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sync Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Source Video</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Music className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">viral_tiktok_dance.mp4</span>
                      </div>
                      <p className="text-sm text-gray-600">Duration: 2:30 • Audio extracted</p>
                      <Badge className="mt-2 bg-blue-100 text-blue-800">Ready for sync</Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Target Video</h4>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Clock className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Upload your video</p>
                      <Button variant="outline" size="sm" data-testid="button-upload-target">
                        Choose File
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Sync Settings */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Synchronization Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Enable Audio Matching</label>
                      <Switch 
                        checked={enableAudioSync} 
                        onCheckedChange={setEnableAudioSync}
                        data-testid="switch-audio-sync"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Beat Synchronization</label>
                      <Switch defaultChecked data-testid="switch-beat-sync" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Auto Stretch/Trim</label>
                      <Switch defaultChecked data-testid="switch-auto-adjust" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Preserve Quality</label>
                      <Switch defaultChecked data-testid="switch-quality" />
                    </div>
                  </div>
                </div>

                {/* Sync Process */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                  <h4 className="font-semibold mb-4">AI Audio Synchronization Process</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Extract audio characteristics (tempo, beats)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Analyze target video duration and timing</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm">Apply intelligent stretch/trim for perfect sync</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span className="text-sm text-gray-500">Overlay synchronized audio onto target video</span>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  disabled={!enableAudioSync}
                  data-testid="button-start-sync"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Start Audio Synchronization
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}