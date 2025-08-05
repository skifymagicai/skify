import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Type, Eye, Clock, Palette, Wand2, Play, Edit3 } from "lucide-react";

const EXTRACTED_TEXTS = [
  {
    id: "text-1",
    text: "When the beat drops",
    startTime: 15.5,
    endTime: 18.2,
    position: { x: 50, y: 200, width: 300, height: 60 },
    fontFamily: "Montserrat",
    fontSize: 42,
    fontWeight: "bold",
    color: "#FFFFFF",
    backgroundColor: "rgba(0,0,0,0.5)",
    animation: "fade",
    confidence: 94
  },
  {
    id: "text-2", 
    text: "Feel the rhythm in your soul",
    startTime: 18.5,
    endTime: 21.0,
    position: { x: 75, y: 350, width: 250, height: 50 },
    fontFamily: "Montserrat",
    fontSize: 36,
    fontWeight: "regular",
    color: "#FFD700",
    animation: "slide",
    confidence: 89
  },
  {
    id: "text-3",
    text: "Dance like nobody's watching",
    startTime: 22.0,
    endTime: 25.5,
    position: { x: 100, y: 150, width: 400, height: 45 },
    fontFamily: "Arial",
    fontSize: 38,
    fontWeight: "bold",
    color: "#FF6B6B",
    animation: "typewriter",
    confidence: 91
  }
];

const DETECTED_FONTS = [
  {
    family: "Montserrat",
    weight: "bold",
    style: "normal",
    usage: "primary",
    confidence: 92
  },
  {
    family: "Arial",
    weight: "bold", 
    style: "normal",
    usage: "secondary",
    confidence: 85
  }
];

export default function LyricalAnalysisPage() {
  const [, setLocation] = useLocation();
  const [customLyrics, setCustomLyrics] = useState("");
  const [preserveOriginal, setPreserveOriginal] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const handleBack = () => {
    setLocation("/analysis");
  };

  const handleEditText = (textId: string) => {
    setEditingTextId(textId);
  };

  const handleApplyLyricalTemplate = () => {
    setIsProcessing(true);
    setProcessingProgress(0);

    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setLocation("/comparison-export");
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
              <h1 className="text-xl font-semibold text-gray-900">Lyrical Text Analysis</h1>
              <p className="text-sm text-gray-500">Extract and customize text overlays from viral videos</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Video Preview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Video Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center text-white">
                    <Play className="w-12 h-12 mx-auto mb-2 opacity-70" />
                    <p className="text-sm opacity-70">Original Video</p>
                  </div>
                </div>
                
                {/* Lyrical Analysis Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Text Elements:</span>
                    <span className="font-medium" data-testid="total-text-elements">12</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Primary Font:</span>
                    <span className="font-medium" data-testid="primary-font">Montserrat</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Language:</span>
                    <span className="font-medium" data-testid="detected-language">English</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <Badge variant="outline" className="text-xs" data-testid="text-category">Lyrics</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detected Fonts */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Detected Fonts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {DETECTED_FONTS.map((font, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900" style={{ fontFamily: font.family }}>
                        {font.family}
                      </h4>
                      <p className="text-sm text-gray-500">{font.weight} • {font.usage}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {font.confidence}%
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Center - Extracted Text Elements */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Extracted Text Elements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {EXTRACTED_TEXTS.map((textElement) => (
                  <div key={textElement.id} className="border rounded-lg p-4 hover:border-blue-200 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 
                          className="font-medium text-gray-900 mb-1"
                          style={{ 
                            fontFamily: textElement.fontFamily,
                            fontSize: `${Math.min(textElement.fontSize / 2, 18)}px`,
                            color: textElement.color,
                            fontWeight: textElement.fontWeight
                          }}
                          data-testid={`text-content-${textElement.id}`}
                        >
                          "{textElement.text}"
                        </h4>
                        <div className="flex items-center text-xs text-gray-500 space-x-3">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTimestamp(textElement.startTime)} - {formatTimestamp(textElement.endTime)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {textElement.animation}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditText(textElement.id)}
                        data-testid={`edit-text-${textElement.id}`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Font: {textElement.fontFamily} {textElement.fontSize}px {textElement.fontWeight}</div>
                      <div>Position: x:{textElement.position.x} y:{textElement.position.y}</div>
                      <div>Confidence: {textElement.confidence}%</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Customization Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Text Customization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Custom Lyrics/Text
                  </label>
                  <Textarea
                    placeholder="Enter your custom lyrics or leave blank to use original text..."
                    value={customLyrics}
                    onChange={(e) => setCustomLyrics(e.target.value)}
                    className="min-h-[120px]"
                    data-testid="custom-lyrics-input"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Preserve Original Timing
                  </label>
                  <Switch
                    checked={preserveOriginal}
                    onCheckedChange={setPreserveOriginal}
                    data-testid="preserve-timing-switch"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Font Styling</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" data-testid="font-size-button">
                      Size: 42px
                    </Button>
                    <Button variant="outline" size="sm" data-testid="font-color-button">
                      Color: #FFF
                    </Button>
                    <Button variant="outline" size="sm" data-testid="font-weight-button">
                      Bold
                    </Button>
                    <Button variant="outline" size="sm" data-testid="animation-button">
                      Fade In
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Processing Status */}
            {isProcessing && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Processing Video</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress value={processingProgress} className="h-3" />
                    <p className="text-sm text-gray-600">
                      Applying lyrical template with custom styling... {processingProgress}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Apply Button */}
            <Button 
              onClick={handleApplyLyricalTemplate}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3"
              data-testid="apply-lyrical-template-button"
            >
              <Wand2 className="mr-2 h-5 w-5" />
              {isProcessing ? "Processing..." : "Apply Lyrical Template"}
            </Button>

            {!isProcessing && (
              <p className="text-xs text-gray-500 text-center">
                Create studio-quality lyrical videos with precise timing and styling
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}