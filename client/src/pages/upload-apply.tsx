import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, Wand2 } from "lucide-react";
import { Link } from "wouter";

export default function UploadApply() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" data-testid="link-back">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Upload & Apply Style
          </h1>
        </div>

        <div className="space-y-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Upload Your Video</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center hover:border-purple-400 transition-colors">
                <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-300 mb-2" data-testid="text-upload-instruction">
                  Drag and drop your video here
                </p>
                <p className="text-gray-500 mb-4">
                  or click to browse files
                </p>
                <Button className="bg-purple-600 hover:bg-purple-700" data-testid="button-browse">
                  Browse Files
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Selected Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg">
                <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Wand2 className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white" data-testid="text-selected-template">Cinematic Noir</h3>
                  <p className="text-gray-400">Dark, moody color grading with smooth transitions</p>
                </div>
                <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700" data-testid="button-change-template">
                  Change Template
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-12"
              data-testid="button-apply-style"
            >
              <Wand2 className="mr-2 h-5 w-5" />
              Apply Style to Video
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}