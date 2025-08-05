import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, Download } from "lucide-react";
import { Link } from "wouter";

export default function TemplatePreview() {
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
            Template Preview
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Template Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <Play className="h-16 w-16 text-purple-400" />
              </div>
              <div className="flex gap-4">
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700" data-testid="button-preview">
                  <Play className="mr-2 h-4 w-4" />
                  Preview Template
                </Button>
                <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700" data-testid="button-download">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Template Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-purple-400 mb-2">Style Name</h3>
                  <p className="text-gray-300" data-testid="text-template-name">Cinematic Noir</p>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-400 mb-2">Effects</h3>
                  <p className="text-gray-300" data-testid="text-effects">Color grading, transitions, camera motion</p>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-400 mb-2">Usage Count</h3>
                  <p className="text-gray-300" data-testid="text-usage">1,234 videos created</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}