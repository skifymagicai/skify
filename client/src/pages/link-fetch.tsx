import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Download, Link, CheckCircle, AlertCircle, Play, Instagram, Youtube } from "lucide-react";
import { SiTiktok } from "react-icons/si";

const SUPPORTED_PLATFORMS = [
  {
    name: "Instagram Reels",
    icon: Instagram,
    color: "text-pink-600",
    example: "https://www.instagram.com/reel/..."
  },
  {
    name: "TikTok",
    icon: SiTiktok,
    color: "text-black",
    example: "https://www.tiktok.com/@user/video/..."
  },
  {
    name: "YouTube Shorts",
    icon: Youtube,
    color: "text-red-600",
    example: "https://youtube.com/shorts/..."
  }
];

export default function LinkFetchPage() {
  const [, setLocation] = useLocation();
  const [videoUrl, setVideoUrl] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "downloading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [downloadedVideoId, setDownloadedVideoId] = useState<string | null>(null);

  const handleBack = () => {
    setLocation("/");
  };

  const validateUrl = (url: string): boolean => {
    const patterns = [
      /https?:\/\/(www\.)?instagram\.com\/reel\/[\w-]+/,
      /https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/,
      /https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/,
      /https?:\/\/youtu\.be\/[\w-]+/
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  const handleFetchVideo = async () => {
    if (!videoUrl.trim()) {
      setErrorMessage("Please enter a video URL");
      setStatus("error");
      return;
    }

    if (!validateUrl(videoUrl)) {
      setErrorMessage("Invalid URL format. Please enter a valid Instagram, TikTok, or YouTube URL.");
      setStatus("error");
      return;
    }

    setIsDownloading(true);
    setStatus("downloading");
    setDownloadProgress(0);
    setErrorMessage("");

    try {
      // Start download process
      const response = await fetch("/api/videos/fetch-from-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: videoUrl }),
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const data = await response.json();
      const jobId = data.jobId;

      // Poll for progress
      const pollProgress = setInterval(async () => {
        try {
          const progressResponse = await fetch(`/api/jobs/${jobId}/status`);
          const progressData = await progressResponse.json();

          setDownloadProgress(progressData.progress || 0);

          if (progressData.status === "completed") {
            clearInterval(pollProgress);
            setStatus("success");
            setDownloadedVideoId(progressData.videoId);
            setIsDownloading(false);
          } else if (progressData.status === "failed") {
            clearInterval(pollProgress);
            setStatus("error");
            setErrorMessage(progressData.error || "Download failed");
            setIsDownloading(false);
          }
        } catch (error) {
          clearInterval(pollProgress);
          setStatus("error");
          setErrorMessage("Failed to check download progress");
          setIsDownloading(false);
        }
      }, 1000);

    } catch (error: any) {
      setStatus("error");
      setErrorMessage(error.message || "Failed to download video");
      setIsDownloading(false);
    }
  };

  const handleAnalyzeVideo = () => {
    if (downloadedVideoId) {
      setLocation(`/analysis?videoId=${downloadedVideoId}`);
    }
  };

  const getPlatformFromUrl = (url: string) => {
    if (url.includes("instagram.com")) return "Instagram";
    if (url.includes("tiktok.com")) return "TikTok";
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "YouTube";
    return "Unknown";
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
              <h1 className="text-xl font-semibold text-gray-900">Fetch Video from Link</h1>
              <p className="text-sm text-gray-500">Download videos from Instagram, TikTok, and YouTube</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - URL Input */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="w-5 h-5" />
                  Paste Video URL
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Video URL
                  </label>
                  <Input
                    placeholder="Paste Instagram Reel, TikTok, or YouTube Shorts URL..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full"
                    disabled={isDownloading}
                    data-testid="video-url-input"
                  />
                </div>

                {/* Status Messages */}
                {status === "error" && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                {status === "success" && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Video downloaded successfully! Ready for analysis.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Progress Bar */}
                {isDownloading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Downloading from {getPlatformFromUrl(videoUrl)}...</span>
                      <span className="font-medium">{downloadProgress}%</span>
                    </div>
                    <Progress value={downloadProgress} className="h-3" />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    onClick={handleFetchVideo}
                    disabled={isDownloading || !videoUrl.trim()}
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-3"
                    data-testid="fetch-video-button"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    {isDownloading ? "Downloading..." : "Fetch Video"}
                  </Button>

                  {status === "success" && (
                    <Button 
                      onClick={handleAnalyzeVideo}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3"
                      data-testid="analyze-downloaded-video-button"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Analyze Downloaded Video
                    </Button>
                  )}
                </div>

                {/* Legal Notice */}
                <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-1">Important Notice:</p>
                  <p>Only download videos you have rights to use. Respect copyright laws and platform terms of service.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Supported Platforms */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Supported Platforms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {SUPPORTED_PLATFORMS.map((platform, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <platform.icon className={`w-6 h-6 ${platform.color} mt-1`} />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{platform.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {platform.example}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                  <p className="text-sm text-gray-700">Paste video URL from any supported platform</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                  <p className="text-sm text-gray-700">AI downloads and processes the video</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
                  <p className="text-sm text-gray-700">Analyze effects, audio, and text elements</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">4</div>
                  <p className="text-sm text-gray-700">Apply extracted styles to your videos</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}