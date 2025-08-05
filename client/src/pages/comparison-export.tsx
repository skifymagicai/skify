import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import { useLocation } from "wouter";
import { 
  Play, 
  Download, 
  Share2, 
  Heart, 
  RefreshCw,
  Monitor,
  Smartphone,
  Tv,
  Check
} from "lucide-react";

const EXPORT_SIZES = [
  {
    name: "4K Ultra HD",
    resolution: "3840 × 2160",
    fileSize: "~2.5 GB",
    icon: Tv,
    recommended: false
  },
  {
    name: "1080p Full HD",
    resolution: "1920 × 1080", 
    fileSize: "~850 MB",
    icon: Monitor,
    recommended: true
  },
  {
    name: "720p HD",
    resolution: "1280 × 720",
    fileSize: "~350 MB", 
    icon: Smartphone,
    recommended: false
  }
];

export default function ComparisonExport() {
  const [, setLocation] = useLocation();
  const [selectedSize, setSelectedSize] = useState("1080p Full HD");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDownload = (withWatermark = true) => {
    setIsProcessing(true);
    // Simulate download process
    setTimeout(() => {
      setIsProcessing(false);
      alert(withWatermark ? "Download started with watermark!" : "Download started without watermark!");
    }, 2000);
  };

  const handleShare = () => {
    setLocation("/");
  };

  const handleTryAnother = () => {
    setLocation("/");
  };

  const handleSaveToFavorites = () => {
    alert("Saved to favorites!");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare & Export</h1>
          <p className="text-gray-600">Review your styled video and export in your preferred quality</p>
        </div>

        {/* Video Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Original Video</span>
                <Badge variant="outline" className="text-gray-600">Source</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    <Play className="h-8 w-8 text-white ml-1" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 bg-black/60 text-white px-2 py-1 rounded text-sm">
                  Original
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4 border-gray-300 hover:bg-gray-50"
                data-testid="play-original-button"
              >
                <Play className="mr-2 h-4 w-4" />
                Play Original
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Styled Video</span>
                <Badge className="bg-green-100 text-green-800">Enhanced</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    <Play className="h-8 w-8 text-white ml-1" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 bg-black/60 text-white px-2 py-1 rounded text-sm">
                  Styled
                </div>
                <div className="absolute bottom-4 right-4 bg-blue-600/80 text-white px-2 py-1 rounded text-xs">
                  Skify Watermark
                </div>
              </div>
              <Button 
                className="w-full mt-4 btn-primary"
                data-testid="play-styled-button"
              >
                <Play className="mr-2 h-4 w-4" />
                Play Styled Version
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Processing Status */}
        <Card className="shadow-card mb-8 bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800 mb-1" data-testid="processing-status">
                  Video transformation completed successfully!
                </h3>
                <p className="text-green-700">
                  Your video has been enhanced with the selected style template. Ready for export.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Settings */}
        <Card className="shadow-card mb-8">
          <CardHeader>
            <CardTitle>Export Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">Choose Export Quality</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {EXPORT_SIZES.map((size) => (
                  <Card 
                    key={size.name}
                    className={`cursor-pointer transition-all border-2 ${
                      selectedSize === size.name 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedSize(size.name)}
                    data-testid={`export-size-${size.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-3">
                        <size.icon className={`h-8 w-8 ${
                          selectedSize === size.name ? "text-blue-600" : "text-gray-400"
                        }`} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-center space-x-2">
                          <h4 className="font-semibold text-gray-900">{size.name}</h4>
                          {size.recommended && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{size.resolution}</p>
                        <p className="text-xs text-gray-500">{size.fileSize}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Actions */}
        <div className="space-y-6">
          {/* Primary Export Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="btn-primary px-8 py-4 text-lg"
              onClick={() => handleDownload(true)}
              disabled={isProcessing}
              data-testid="download-with-watermark-button"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Download with Watermark (Free)
                </>
              )}
            </Button>

            <Card className="border-2 border-orange-200 bg-orange-50">
              <CardContent className="p-4 text-center">
                <p className="text-orange-800 font-semibold mb-2">Remove Watermark</p>
                <Button 
                  size="lg"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3"
                  onClick={() => handleDownload(false)}
                  disabled={isProcessing}
                  data-testid="remove-watermark-button"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Remove Watermark (₹49)
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleShare}
              className="border-gray-300 hover:bg-gray-50"
              data-testid="share-video-button"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Video
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleTryAnother}
              className="border-gray-300 hover:bg-gray-50"
              data-testid="try-another-style-button"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Another Style
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleSaveToFavorites}
              className="border-gray-300 hover:bg-gray-50"
              data-testid="save-to-favorites-button"
            >
              <Heart className="mr-2 h-4 w-4" />
              Save to Favorites
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}