import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, CheckCircle, Upload, Link2, Wand2, Music, Type, Download } from "lucide-react";
import { useLocation } from "wouter";

const EXAMPLE_VIDEOS = [
  {
    id: "cinematic-travel",
    title: "Cinematic Travel Pack",
    description: "Full studio-style makeover with advanced color grading, smooth transitions, camera pans, AI-matched music, and extracted lyric overlays.",
    videoUrl: "/assets/demo/cinematic-travel-demo.mp4",
    thumbnailUrl: "/assets/demo/cinematic-travel-thumb.jpg",
    duration: "0:45",
    category: "Travel",
    features: [
      { icon: Wand2, label: "AI Video Style Transfer", color: "bg-purple-100 text-purple-800" },
      { icon: Music, label: "Auto Audio Matching", color: "bg-blue-100 text-blue-800" },
      { icon: Type, label: "Lyrical OCR Overlay", color: "bg-green-100 text-green-800" },
      { icon: Link2, label: "Imported via URL", color: "bg-orange-100 text-orange-800" },
      { icon: Download, label: "HD Export Ready", color: "bg-gray-100 text-gray-800" }
    ],
    sourceType: "Instagram Reel",
    transformations: [
      "Color grading: Warm cinematic tones",
      "Transitions: Smooth cross-dissolves",
      "Audio: Travel vlog soundtrack matched",
      "Text: Adventure quotes with custom fonts"
    ]
  },
  {
    id: "urban-street",
    title: "Urban Street Vibes",
    description: "High contrast styling with quick transitions, trending audio synchronization, and dynamic text overlays with viral font recreation.",
    videoUrl: "/assets/demo/urban-street-demo.mp4",
    thumbnailUrl: "/assets/demo/urban-street-thumb.jpg",
    duration: "0:30",
    category: "Lifestyle",
    features: [
      { icon: Wand2, label: "Street Style Filter", color: "bg-purple-100 text-purple-800" },
      { icon: Music, label: "Trending Beat Sync", color: "bg-blue-100 text-blue-800" },
      { icon: Type, label: "Dynamic Text Effects", color: "bg-green-100 text-green-800" },
      { icon: Link2, label: "TikTok Import", color: "bg-orange-100 text-orange-800" }
    ],
    sourceType: "TikTok Video",
    transformations: [
      "Style: Urban high contrast + shadows",
      "Tempo: Fast-paced beat synchronization",
      "Typography: Bold street-style fonts",
      "Effects: Glitch transitions"
    ]
  },
  {
    id: "nature-documentary",
    title: "Nature Documentary",
    description: "Professional documentary styling with natural color correction, ambient audio matching, and informational text overlays.",
    videoUrl: "/assets/demo/nature-doc-demo.mp4",
    thumbnailUrl: "/assets/demo/nature-doc-thumb.jpg",
    duration: "1:15",
    category: "Educational",
    features: [
      { icon: Wand2, label: "Doc-Style Grading", color: "bg-purple-100 text-purple-800" },
      { icon: Music, label: "Ambient Soundscape", color: "bg-blue-100 text-blue-800" },
      { icon: Type, label: "Info Text Overlays", color: "bg-green-100 text-green-800" },
      { icon: Link2, label: "YouTube Import", color: "bg-orange-100 text-orange-800" }
    ],
    sourceType: "YouTube Shorts",
    transformations: [
      "Color: Natural earth tones",
      "Audio: Nature ambience matching",
      "Text: Educational captions",
      "Pacing: Contemplative timing"
    ]
  },
  {
    id: "fitness-motivation",
    title: "Fitness Motivation",
    description: "High-energy workout styling with motivational text animations, pump-up music sync, and dynamic color enhancement.",
    videoUrl: "/assets/demo/fitness-demo.mp4",
    thumbnailUrl: "/assets/demo/fitness-thumb.jpg",
    duration: "0:35",
    category: "Fitness",
    features: [
      { icon: Wand2, label: "Energy Enhancement", color: "bg-purple-100 text-purple-800" },
      { icon: Music, label: "Workout Beat Match", color: "bg-blue-100 text-blue-800" },
      { icon: Type, label: "Motivational Text", color: "bg-green-100 text-green-800" },
      { icon: Link2, label: "Instagram Import", color: "bg-orange-100 text-orange-800" }
    ],
    sourceType: "Instagram Reel",
    transformations: [
      "Energy: High contrast + saturation",
      "Rhythm: Workout music alignment",
      "Motivation: Animated quote overlays",
      "Movement: Dynamic zoom effects"
    ]
  }
];

interface VideoShowcaseProps {
  compact?: boolean;
}

export default function VideoShowcase({ compact = false }: VideoShowcaseProps) {
  const [currentVideo, setCurrentVideo] = useState(EXAMPLE_VIDEOS[0]);
  const [, setLocation] = useLocation();

  const handleTryOnYourVideo = () => {
    setLocation("/upload");
  };

  const handleTryWithLink = () => {
    setLocation("/link-fetch");
  };

  if (compact) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {EXAMPLE_VIDEOS.slice(0, 4).map((video) => (
          <Card key={video.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Play className="w-12 h-12 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <Badge className="absolute top-2 right-2 text-xs">{video.duration}</Badge>
            </div>
            <CardContent className="p-3">
              <h4 className="font-semibold text-sm mb-1">{video.title}</h4>
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{video.description}</p>
              <div className="flex flex-wrap gap-1">
                {video.features.slice(0, 2).map((feature, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs px-1 py-0">
                    <feature.icon className="w-3 h-3 mr-1" />
                    {feature.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">See How Skify Works!</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Explore sample videos showcasing our complete AI transformation suite. 
          Every demo video demonstrates real Skify features applied to viral content.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Video Player Section */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Demo Video Player</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Production videos would showcase actual transformations
                  </p>
                </div>
              </div>
              
              {/* Video Overlay Info */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{currentVideo.title}</h3>
                    <Badge className="bg-white/20 text-white">{currentVideo.duration}</Badge>
                  </div>
                  <p className="text-sm text-white/90 mb-3">{currentVideo.description}</p>
                  <div className="flex items-center text-xs text-white/80">
                    <span className="bg-green-500 w-2 h-2 rounded-full mr-2"></span>
                    Original: {currentVideo.sourceType}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Features Applied */}
          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-3">AI Features Applied:</h4>
            <div className="grid sm:grid-cols-2 gap-3">
              {currentVideo.features.map((feature, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full ${feature.color}`}>
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transformations Details */}
          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-3">Transformations Applied:</h4>
            <div className="space-y-2">
              {currentVideo.transformations.map((transform, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{transform}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleTryOnYourVideo}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3"
              data-testid="try-upload-button"
            >
              <Upload className="mr-2 h-5 w-5" />
              Try on Your Video
            </Button>
            <Button 
              onClick={handleTryWithLink}
              variant="outline"
              className="flex-1 py-3"
              data-testid="try-link-button"
            >
              <Link2 className="mr-2 h-5 w-5" />
              Try with Link
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              All features in these samples are available for your content
            </p>
          </div>
        </div>

        {/* Video List Sidebar */}
        <div className="lg:col-span-1">
          <h4 className="font-semibold text-gray-900 mb-4">Sample Gallery</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {EXAMPLE_VIDEOS.map((video) => (
              <Card 
                key={video.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  currentVideo.id === video.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setCurrentVideo(video)}
                data-testid={`sample-video-${video.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex space-x-3">
                    <div className="w-16 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center flex-shrink-0">
                      <Play className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm text-gray-900 truncate">{video.title}</h5>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{video.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="secondary" className="text-xs">{video.category}</Badge>
                        <span className="text-xs text-gray-500">{video.duration}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}