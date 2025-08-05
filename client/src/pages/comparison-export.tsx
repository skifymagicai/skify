import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Share2, Play } from "lucide-react";
import { Link } from "wouter";

export default function ComparisonExport() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" data-testid="link-back">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Compare & Export
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Original Video</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <Play className="h-16 w-16 text-gray-400" />
              </div>
              <Button variant="outline" className="w-full border-gray-600 text-white hover:bg-gray-700" data-testid="button-play-original">
                <Play className="mr-2 h-4 w-4" />
                Play Original
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Styled Video</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gradient-to-br from-purple-800 to-pink-800 rounded-lg flex items-center justify-center mb-4">
                <Play className="h-16 w-16 text-white" />
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700" data-testid="button-play-styled">
                <Play className="mr-2 h-4 w-4" />
                Play Styled Version
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-800/50 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Processing Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-green-400 font-semibold" data-testid="text-status">
                ✓ Video transformation completed successfully
              </div>
              <p className="text-gray-300">
                Your video has been enhanced with the selected style template.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-download"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Video
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-gray-600 text-white hover:bg-gray-700"
                  data-testid="button-share"
                >
                  <Share2 className="mr-2 h-5 w-5" />
                  Share Video
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/" data-testid="link-create-another">
            <Button variant="ghost" className="text-purple-400 hover:bg-purple-400/10">
              Create Another Video
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}