import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Share2, Play, CheckCircle, Settings } from "lucide-react";

const QUALITY_OPTIONS = [
  { label: "4K Ultra HD", value: "4k", size: "~2.5GB", recommended: false },
  { label: "1080p Full HD", value: "1080p", size: "~800MB", recommended: true },
  { label: "720p HD", value: "720p", size: "~400MB", recommended: false },
];

export default function ComparisonExport() {
  const [, setLocation] = useLocation();
  const [selectedQuality, setSelectedQuality] = useState("1080p");
  const [isExporting, setIsExporting] = useState(false);

  const handleBack = () => {
    setLocation("/");
  };

  const handleCreateAnother = () => {
    setLocation("/");
  };

  const handleDownload = (withWatermark = true) => {
    setIsExporting(true);
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
    }, 3000);
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
              <h1 className="text-xl font-semibold text-gray-900">Preview & Export</h1>
              <p className="text-sm text-gray-500">Compare results and export your styled video</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-600 font-medium">Processing Complete</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Side-by-side Video Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Original Video */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Original Video</CardTitle>
              <p className="text-sm text-gray-600">Before styling</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450"
                  alt="Original video"
                  className="w-full h-full object-cover filter grayscale"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Button
                    size="lg"
                    className="bg-white/90 hover:bg-white text-gray-900 rounded-full w-16 h-16 p-0"
                    data-testid="play-original-button"
                  >
                    <Play className="h-8 w-8 ml-1" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600">Natural lighting</p>
              </div>
            </CardContent>
          </Card>

          {/* Styled Video */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Styled Video</CardTitle>
                  <p className="text-sm text-gray-600">After AI transformation</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Skify Watermark
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450"
                  alt="Styled video"
                  className="w-full h-full object-cover"
                  style={{ filter: 'sepia(20%) saturate(120%) hue-rotate(10deg) brightness(110%)' }}
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Button
                    size="lg"
                    className="bg-white/90 hover:bg-white text-gray-900 rounded-full w-16 h-16 p-0"
                    data-testid="play-styled-button"
                  >
                    <Play className="h-8 w-8 ml-1" />
                  </Button>
                </div>
                
                {/* Watermark overlay */}
                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded text-sm font-medium">
                  Skify
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600">Cinematic style applied</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Export Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Settings className="h-5 w-5" />
                Export Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Quality Options</h4>
                <div className="space-y-3">
                  {QUALITY_OPTIONS.map((option) => (
                    <div 
                      key={option.value}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedQuality === option.value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedQuality(option.value)}
                      data-testid={`quality-${option.value}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedQuality === option.value 
                              ? 'bg-blue-500 border-blue-500' 
                              : 'border-gray-300'
                          }`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{option.label}</span>
                              {option.recommended && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                  Recommended
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">{option.size}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-3">Additional Options</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                    <span className="text-sm text-gray-700">Include audio</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-sm text-gray-700">Add fade transitions</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-sm text-gray-700">Optimize for social media</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Download Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Download Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Free Download with Watermark */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Free Download</h4>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">Free</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Download with Skify watermark. Perfect for testing and preview purposes.
                </p>
                <Button 
                  onClick={() => handleDownload(true)}
                  disabled={isExporting}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                  data-testid="download-with-watermark"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isExporting ? "Exporting..." : "Download with Watermark"}
                </Button>
              </div>

              {/* Premium Download */}
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Premium Download</h4>
                  <Badge className="bg-blue-600 text-white">₹49</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Download without watermark in your selected quality. Perfect for professional use.
                </p>
                <Button 
                  onClick={() => handleDownload(false)}
                  disabled={isExporting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="download-premium"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Remove Watermark (₹49)
                </Button>
              </div>

              {/* Share Options */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Share Options</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="text-gray-700" data-testid="share-instagram">
                    Share to Instagram
                  </Button>
                  <Button variant="outline" className="text-gray-700" data-testid="share-youtube">
                    Share to YouTube
                  </Button>
                  <Button variant="outline" className="text-gray-700" data-testid="copy-link">
                    Copy Link
                  </Button>
                  <Button variant="outline" className="text-gray-700" data-testid="share-more">
                    <Share2 className="mr-2 h-4 w-4" />
                    More
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Another Video */}
        <div className="text-center mt-12 pt-8 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Love the results?</h3>
          <p className="text-gray-600 mb-6">Create more videos with different styles and templates.</p>
          <Button 
            onClick={handleCreateAnother}
            variant="outline" 
            className="px-8 py-3"
            data-testid="create-another-button"
          >
            Create Another Video
          </Button>
        </div>
      </div>
    </div>
  );
}