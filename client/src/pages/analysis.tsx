import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, ArrowLeft, Wand2, Clock, Upload } from "lucide-react";

const DETECTED_EFFECTS = [
  {
    id: "film-grain",
    name: "Film Grain",
    confidence: 92,
    color: "bg-orange-500",
    timestamp: "0:05 - 2:00",
  },
  {
    id: "color-pop",
    name: "Color Pop",
    confidence: 87,
    color: "bg-pink-500",
    timestamp: "0:10 - 1:45",
  },
  {
    id: "motion-blur",
    name: "Motion Blur",
    confidence: 94,
    color: "bg-blue-500",
    timestamp: "0:15 - 0:45",
  },
  {
    id: "vignette",
    name: "Vignette",
    confidence: 78,
    color: "bg-purple-500",
    timestamp: "0:00 - 2:00",
  },
  {
    id: "color-grading",
    name: "Color Grading",
    confidence: 96,
    color: "bg-green-500",
    timestamp: "0:00 - 2:00",
  },
  {
    id: "smooth-transitions",
    name: "Smooth Transitions",
    confidence: 89,
    color: "bg-indigo-500",
    timestamp: "0:20, 0:35, 1:10",
  },
];

export default function Analysis() {
  const [, setLocation] = useLocation();
  const [currentTime, setCurrentTime] = useState("0:45");
  const [totalDuration] = useState("2:00");
  const [isPlaying, setIsPlaying] = useState(false);

  const handleBack = () => {
    setLocation("/");
  };

  const handleGenerateTemplate = () => {
    setLocation("/template-preview");
  };

  const handleApplyToMyVideo = () => {
    // Navigate to upload page with the extracted template context
    setLocation("/upload-apply?from=analysis");
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-900"
              data-testid="back-button"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Video Style Analysis</h1>
              <p className="text-sm text-gray-500">AI-powered effect detection and style extraction</p>
            </div>
          </div>
          
          <Button
            onClick={handleGenerateTemplate}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="generate-template-button"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            Generate Template
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Video Preview */}
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Video Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
                  <img 
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450"
                    alt="Video preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Button
                      onClick={handlePlayPause}
                      size="lg"
                      className="bg-white/90 hover:bg-white text-gray-900 rounded-full w-16 h-16 p-0"
                      data-testid="play-button"
                    >
                      <Play className="h-8 w-8 ml-1" />
                    </Button>
                  </div>
                  
                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <div className="flex items-center justify-between text-white text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span data-testid="video-time">{currentTime}</span>
                        <span>/</span>
                        <span data-testid="video-duration">{totalDuration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">Analysis: 94% Complete</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Different Video */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Want to analyze a different video?</h3>
                <p className="text-sm text-gray-600 mb-4">Upload another viral video to extract its unique style and effects.</p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  data-testid="upload-different-button"
                >
                  Upload Different Video
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Detected Effects */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Detected Effects & Styles</CardTitle>
                <p className="text-sm text-gray-600">AI has identified the following effects and styling elements</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {DETECTED_EFFECTS.map((effect) => (
                  <div key={effect.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors" data-testid={`effect-${effect.id}`}>
                    <div className={`w-4 h-4 rounded-full ${effect.color}`}></div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900" data-testid={`effect-name-${effect.id}`}>
                          {effect.name}
                        </h4>
                        <span className="text-sm font-medium text-gray-700" data-testid={`effect-confidence-${effect.id}`}>
                          {effect.confidence}%
                        </span>
                      </div>
                      
                      <Progress 
                        value={effect.confidence} 
                        className="h-2 mb-2"
                        data-testid={`effect-progress-${effect.id}`}
                      />
                      
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span data-testid={`effect-timestamp-${effect.id}`}>{effect.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Analysis Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Effects Detected:</span>
                    <span className="font-semibold text-gray-900" data-testid="total-effects">6</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Confidence:</span>
                    <span className="font-semibold text-gray-900" data-testid="avg-confidence">89%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Processing Time:</span>
                    <span className="font-semibold text-gray-900" data-testid="processing-time">2.3s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Style Category:</span>
                    <span className="font-semibold text-blue-600" data-testid="style-category">Cinematic Travel</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleGenerateTemplate}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                data-testid="create-template-button"
              >
                <Wand2 className="mr-2 h-5 w-5" />
                Create Template from Analysis
              </Button>
              
              <Button 
                onClick={handleApplyToMyVideo}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3"
                data-testid="apply-to-my-video-button"
              >
                <Upload className="mr-2 h-5 w-5" />
                Apply Style to My Video
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full py-3"
                data-testid="download-report-button"
              >
                Download Analysis Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}