import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/layout/header";
import { useLocation } from "wouter";
import { 
  Upload, 
  Wand2, 
  FileVideo,
  CheckCircle,
  Clock,
  ArrowRight
} from "lucide-react";

export default function UploadApply() {
  const [, setLocation] = useLocation();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [selectedTemplate] = useState({
    name: "Cinematic Noir",
    description: "Dark, moody color grading with smooth transitions and professional effects",
    thumbnail: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            setIsUploaded(true);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const handleApplyStyle = () => {
    setLocation("/comparison-export");
  };

  const handleChangeTemplate = () => {
    setLocation("/template-preview");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload & Apply Style</h1>
          <p className="text-gray-600">Upload your video and apply your selected style template</p>
        </div>

        <div className="space-y-8">
          {/* Upload Section */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileVideo className="h-5 w-5 text-blue-600" />
                <span>Upload Your Video</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isUploaded ? (
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
                    {isUploading ? (
                      <div className="space-y-4">
                        <Upload className="h-16 w-16 text-blue-600 mx-auto animate-pulse" />
                        <div className="space-y-2">
                          <p className="text-lg text-gray-700" data-testid="upload-progress-text">
                            Uploading video... {uploadProgress}%
                          </p>
                          <Progress value={uploadProgress} className="w-full max-w-sm mx-auto" />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-16 w-16 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-xl text-gray-700 mb-2" data-testid="upload-instruction">
                            Drag and drop your video here
                          </p>
                          <p className="text-gray-500 mb-4">
                            or click to browse files (MP4, MOV, AVI supported)
                          </p>
                          <div className="relative">
                            <input
                              type="file"
                              accept="video/*"
                              onChange={handleFileUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              data-testid="file-input"
                            />
                            <Button className="btn-primary" data-testid="browse-files-button">
                              Browse Files
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-800" data-testid="upload-success">
                      Video uploaded successfully!
                    </h3>
                    <p className="text-green-700 text-sm">Ready to apply style template</p>
                  </div>
                  <div className="text-sm text-green-600">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Duration: 0:30
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Template */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wand2 className="h-5 w-5 text-blue-600" />
                <span>Selected Template</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 p-4 border border-gray-200 rounded-lg">
                <div className="w-24 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src={selectedTemplate.thumbnail} 
                    alt={selectedTemplate.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1" data-testid="selected-template-name">
                    {selectedTemplate.name}
                  </h3>
                  <p className="text-gray-600 text-sm" data-testid="selected-template-description">
                    {selectedTemplate.description}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleChangeTemplate}
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  data-testid="change-template-button"
                >
                  Change Template
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Apply Button */}
          <div className="flex justify-center">
            <Button 
              size="lg" 
              onClick={handleApplyStyle}
              disabled={!isUploaded}
              className={`px-12 py-4 text-lg ${
                isUploaded 
                  ? "btn-primary" 
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              data-testid="apply-style-button"
            >
              <Wand2 className="mr-2 h-5 w-5" />
              Apply Style to Video
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {!isUploaded && (
            <p className="text-center text-gray-500 text-sm">
              Upload a video to enable style application
            </p>
          )}
        </div>
      </div>
    </div>
  );
}