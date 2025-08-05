import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Camera, Play, Upload, Heart, Eye, Link } from "lucide-react";
import VideoShowcase from "@/components/video-showcase";

const SAMPLE_TEMPLATES = [
  {
    id: "cinematic-travel",
    name: "Cinematic Travel Pack",
    description: "LUT, High Contrast, AI Edits",
    tags: ["#Cinematic", "#Nature", "#Travel"],
    views: "12.5K",
    hearts: "1.2K",
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
  },
  {
    id: "urban-street",
    name: "Urban Street Vibes",
    description: "Color Pop, Motion Blur, Transitions",
    tags: ["#Urban", "#Street", "#Modern"],
    views: "8.7K",
    hearts: "890",
    thumbnail: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
  },
  {
    id: "soft-aesthetic",
    name: "Soft Aesthetic",
    description: "Film Grain, Warm Tones, Smooth Cuts",
    tags: ["#Aesthetic", "#Soft", "#Vintage"],
    views: "15.2K",
    hearts: "2.1K",
    thumbnail: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
  },
  {
    id: "dynamic-sport",
    name: "Dynamic Sport Pack",
    description: "High Energy, Quick Cuts, Bold Colors",
    tags: ["#Sport", "#Energy", "#Action"],
    views: "9.3K",
    hearts: "756",
    thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
  },
];

const FEATURES = [
  {
    title: "AI Style Analysis",
    description: "Advanced AI extracts effects, transitions, color grading, and camera movements.",
    icon: Sparkles,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Template Creation",
    description: "Generate reusable templates from any viral video for consistent styling.",
    icon: Camera,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Instant Apply",
    description: "Apply extracted styles to your videos with one-click transformation.",
    icon: Play,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
];

export default function Landing() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("Home");

  const handleUploadClick = () => {
    setLocation("/upload-apply");
  };

  const handleBrowseGallery = () => {
    setLocation("/gallery");
  };

  const handleLinkFetch = () => {
    setLocation("/link-fetch");
  };

  const handleTemplateSelect = (templateId: string) => {
    setLocation("/template-preview");
  };

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    switch(tab) {
      case "Gallery":
        setLocation("/gallery");
        break;
      case "Analysis":
        setLocation("/analysis");
        break;
      case "Templates":
        setLocation("/template-preview");
        break;
      case "Upload":
        setLocation("/upload-apply");
        break;
      case "Preview":
        setLocation("/comparison-export");
        break;
      default:
        setLocation("/");
    }
  };

  const navTabs = ["Home", "Gallery", "Analysis", "Templates", "Upload", "Preview"];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900" data-testid="logo">Skify</h1>
            <span className="text-sm text-gray-500" data-testid="tagline">AI Video Transform</span>
          </div>
          
          <div className="flex items-center space-x-8">
            {navTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleNavClick(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                data-testid={`nav-${tab.toLowerCase()}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text mb-6" data-testid="main-heading">
            Transform Your Video with AI
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto" data-testid="main-subtext">
            Upload any viral video and instantly extract its style, effects, and magic. 
            Apply those styles to your own content with AI-powered precision.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleLinkFetch}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-3 text-lg"
              data-testid="paste-link-button"
            >
              <Link className="mr-2 h-5 w-5" />
              Paste Video Link
            </Button>
            <Button 
              onClick={handleUploadClick}
              className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg"
              data-testid="upload-viral-video-button"
            >
              <Upload className="mr-2 h-5 w-5" />
              Upload Viral Video
            </Button>
            <Button 
              variant="outline" 
              onClick={handleBrowseGallery}
              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-lg"
              data-testid="browse-gallery-button"
            >
              Browse Gallery
            </Button>
          </div>
        </div>
      </section>

      {/* Three Feature Cards */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow" data-testid={`feature-card-${index}`}>
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4" data-testid={`feature-title-${index}`}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed" data-testid={`feature-description-${index}`}>
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Showcase Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <VideoShowcase />
        </div>
      </section>
    </div>
  );
}