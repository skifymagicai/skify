import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, Download, Edit3, Palette } from "lucide-react";

const COLOR_PALETTE = [
  { name: "Primary", color: "#3B82F6", editable: true },
  { name: "Secondary", color: "#8B5CF6", editable: true },
  { name: "Accent", color: "#F59E0B", editable: true },
  { name: "Neutral", color: "#6B7280", editable: true },
  { name: "Background", color: "#F9FAFB", editable: true },
];

export default function TemplatePreview() {
  const [, setLocation] = useLocation();
  const [selectedColor, setSelectedColor] = useState(null);

  const handleBack = () => {
    setLocation("/");
  };

  const handleApplyToVideo = () => {
    setLocation("/upload-apply");
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
              <h1 className="text-xl font-semibold text-gray-900">Template Preview</h1>
              <p className="text-sm text-gray-500">Customize and preview your selected template</p>
            </div>
          </div>
          
          <Button
            onClick={handleApplyToVideo}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="apply-to-video-button"
          >
            Apply to My Video
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Video Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Template Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450"
                    alt="Template preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Button
                      size="lg"
                      className="bg-white/90 hover:bg-white text-gray-900 rounded-full w-16 h-16 p-0"
                      data-testid="preview-play-button"
                    >
                      <Play className="h-8 w-8 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Template Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Cinematic Travel Pack</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Effects Applied</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">Film Grain</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">Color Grading</span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Smooth Transitions</span>
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">Vignette</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Style Description</h4>
                    <p className="text-gray-600 text-sm">
                      Cinematic travel aesthetic with warm color grading, smooth camera movements, 
                      and professional film grain effects. Perfect for adventure and lifestyle content.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Usage Count:</span>
                      <span className="font-medium text-gray-900 ml-2" data-testid="usage-count">12.5K</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Rating:</span>
                      <span className="font-medium text-gray-900 ml-2" data-testid="rating">4.8/5</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Color Palette Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Palette className="h-5 w-5" />
                  Color Palette
                </CardTitle>
                <p className="text-sm text-gray-600">Customize the color scheme for your template</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {COLOR_PALETTE.map((colorItem, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors" data-testid={`color-${colorItem.name.toLowerCase()}`}>
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-12 h-12 rounded-lg border-2 border-white shadow-sm cursor-pointer"
                        style={{ backgroundColor: colorItem.color }}
                        onClick={() => setSelectedColor(colorItem.name)}
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{colorItem.name}</h4>
                        <p className="text-sm text-gray-500 uppercase font-mono">{colorItem.color}</p>
                      </div>
                    </div>
                    
                    {colorItem.editable && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-600 border-gray-300"
                        data-testid={`edit-${colorItem.name.toLowerCase()}`}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Template Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Template Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Intensity:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Strong</span>
                    <Button variant="outline" size="sm" data-testid="adjust-intensity">Adjust</Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Auto</span>
                    <Button variant="outline" size="sm" data-testid="adjust-duration">Adjust</Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Transitions:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Smooth</span>
                    <Button variant="outline" size="sm" data-testid="adjust-transitions">Adjust</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleApplyToVideo}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                data-testid="apply-template-button"
              >
                Apply Template to Video
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="py-3"
                  data-testid="save-template-button"
                >
                  Save Template
                </Button>
                <Button 
                  variant="outline" 
                  className="py-3"
                  data-testid="download-template-button"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}