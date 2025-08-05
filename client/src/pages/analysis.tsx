import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/layout/header";
import { 
  Sparkles, 
  Layers, 
  ArrowRightLeft, 
  Palette, 
  Camera, 
  Zap,
  Play,
  Pause,
  Clock
} from "lucide-react";

const ANALYSIS_TABS = [
  { id: "effects", label: "Effects", icon: Sparkles },
  { id: "templates", label: "Templates", icon: Layers },
  { id: "transitions", label: "Transitions", icon: ArrowRightLeft },
  { id: "color", label: "Color", icon: Palette },
  { id: "camera", label: "Camera", icon: Camera },
  { id: "ai-edits", label: "AI Edits", icon: Zap },
];

const DETECTED_EFFECTS = {
  effects: [
    {
      id: "glow-effect",
      name: "Glow Effect",
      description: "Soft luminous edge enhancement",
      confidence: 95,
      timestamp: "0:05-0:15",
      icon: Sparkles
    },
    {
      id: "film-grain",
      name: "Film Grain",
      description: "Vintage texture overlay",
      confidence: 88,
      timestamp: "0:00-0:30",
      icon: Sparkles
    },
  ],
  templates: [
    {
      id: "portrait-layout",
      name: "Portrait Layout",
      description: "9:16 aspect ratio optimization",
      confidence: 92,
      icon: Layers
    },
    {
      id: "center-focus",
      name: "Center Focus",
      description: "Subject-centered composition",
      confidence: 89,
      icon: Layers
    },
  ],
  transitions: [
    {
      id: "fade-in",
      name: "Fade In",
      description: "Smooth opacity transition",
      confidence: 96,
      timestamp: "0:00-0:02",
      icon: ArrowRightLeft
    },
    {
      id: "quick-cut",
      name: "Quick Cut",
      description: "Instant scene change",
      confidence: 94,
      timestamp: "0:15-0:16",
      icon: ArrowRightLeft
    },
  ],
  color: [
    {
      id: "warm-grading",
      name: "Warm Color Grading",
      description: "Enhanced orange/yellow tones",
      confidence: 91,
      icon: Palette
    },
    {
      id: "high-contrast",
      name: "High Contrast",
      description: "Increased luminance difference",
      confidence: 87,
      icon: Palette
    },
  ],
  camera: [
    {
      id: "smooth-pan",
      name: "Smooth Pan",
      description: "Horizontal camera movement",
      confidence: 84,
      timestamp: "0:10-0:20",
      icon: Camera
    },
  ],
  "ai-edits": [
    {
      id: "auto-crop",
      name: "Auto Crop",
      description: "AI-optimized framing",
      confidence: 90,
      icon: Zap
    },
    {
      id: "noise-reduction",
      name: "Noise Reduction",
      description: "AI-powered cleanup",
      confidence: 86,
      icon: Zap
    },
  ],
};

export default function Analysis() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("effects");
  const [analysisProgress, setAnalysisProgress] = useState(78);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("0:12");
  const [duration] = useState("0:30");

  useEffect(() => {
    // Simulate analysis progress
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleGenerateTemplate = () => {
    setLocation("/template-preview");
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analysis Progress */}
        <Card className="mb-8 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Video Style Analysis</h2>
              <div className="text-sm text-gray-600">
                {analysisProgress}% Complete
              </div>
            </div>
            <Progress value={analysisProgress} className="mb-2" />
            <p className="text-sm text-gray-600">
              {analysisProgress < 100 ? "Analyzing video style components..." : "Analysis complete!"}
            </p>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-gray-100 rounded-lg p-1">
            {ANALYSIS_TABS.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Video Preview */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Play className="h-5 w-5 text-blue-600" />
                  <span>Video Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={togglePlayback}
                      className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                      data-testid="play-pause-button"
                    >
                      {isPlaying ? (
                        <Pause className="h-8 w-8 text-white" />
                      ) : (
                        <Play className="h-8 w-8 text-white ml-1" />
                      )}
                    </button>
                  </div>
                  
                  {/* Video Controls Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <div className="flex items-center space-x-4 text-white">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-mono" data-testid="video-time">
                        {currentTime} / {duration}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    onClick={handleGenerateTemplate}
                    className="btn-primary"
                    data-testid="generate-template-button"
                  >
                    Generate Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ANALYSIS_TABS.find(tab => tab.id === activeTab)?.icon className="h-5 w-5 text-blue-600" />
                  <span>Detected {ANALYSIS_TABS.find(tab => tab.id === activeTab)?.label}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ANALYSIS_TABS.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id} className="space-y-4 mt-0">
                    {DETECTED_EFFECTS[tab.id as keyof typeof DETECTED_EFFECTS]?.map((effect, index) => (
                      <Card key={effect.id} className="border border-gray-200" data-testid={`effect-card-${effect.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <effect.icon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-gray-900" data-testid={`effect-name-${effect.id}`}>
                                  {effect.name}
                                </h3>
                                <span className="text-sm font-medium text-green-600" data-testid={`effect-confidence-${effect.id}`}>
                                  {effect.confidence}%
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2" data-testid={`effect-description-${effect.id}`}>
                                {effect.description}
                              </p>
                              {effect.timestamp && (
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  <span data-testid={`effect-timestamp-${effect.id}`}>{effect.timestamp}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                ))}
              </CardContent>
            </Card>
          </div>
        </Tabs>
      </div>
    </div>
  );
}