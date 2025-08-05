import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/header";
import { Zap, Camera, Play, Upload } from "lucide-react";

const SAMPLE_TEMPLATES = [
  {
    id: "cinematic-sunset",
    name: "Cinematic Sunset",
    description: "Warm tones, smooth transitions",
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    usageCount: 12500,
    rating: 5,
  },
  {
    id: "neon-vibes",
    name: "Neon Vibes",
    description: "Cyberpunk aesthetic, glitch effects",
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    usageCount: 8700,
    rating: 4,
  },
  {
    id: "clean-minimal",
    name: "Clean Minimal",
    description: "Soft lighting, elegant cuts",
    thumbnail: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    usageCount: 15200,
    rating: 5,
  },
  {
    id: "dynamic-sport",
    name: "Dynamic Sport",
    description: "High contrast, motion blur",
    thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    usageCount: 9300,
    rating: 4,
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "AI Style Analysis",
    description: "Advanced AI extracts effects, transitions, color grading, and camera movements.",
  },
  {
    icon: Camera,
    title: "Template Creation",
    description: "Generate reusable templates from any viral video for consistent styling.",
  },
  {
    icon: Play,
    title: "Instant Apply",
    description: "Apply extracted styles to your videos with one-click transformation.",
  },
];

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleUploadClick = () => {
    setLocation("/upload-apply");
  };

  const handleTemplateSelect = (templateId: string) => {
    setLocation("/template-preview");
  };

  const handleBrowseGallery = () => {
    setLocation("/gallery");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text" data-testid="hero-title">
            Transform Your Video with AI
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed" data-testid="hero-subtitle">
            Upload any viral video and instantly extract its style, effects, and magic. Apply those styles to your own content with AI-powered precision.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <button 
              onClick={handleUploadClick}
              className="btn-primary text-lg px-8 py-4 flex items-center gap-2" 
              data-testid="upload-video-button"
            >
              <Upload className="h-5 w-5" />
              Upload Viral Video
            </button>

            <button
              onClick={handleBrowseGallery}
              className="btn-secondary text-lg px-8 py-4"
              data-testid="browse-gallery-button"
            >
              Browse Gallery
            </button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {FEATURES.map((feature, index) => (
              <Card key={index} className="shadow-card border-gray-200" data-testid={`feature-card-${index}`}>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900" data-testid={`feature-title-${index}`}>
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

      {/* Sample Templates Gallery */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-gray-900" data-testid="sample-videos-title">
              Sample Styled Videos
            </h2>
            <Button 
              variant="outline" 
              onClick={handleBrowseGallery}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
              data-testid="view-all-templates"
            >
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {SAMPLE_TEMPLATES.map((template) => (
              <Card 
                key={template.id} 
                className="shadow-card cursor-pointer group overflow-hidden"
                onClick={() => handleTemplateSelect(template.id)}
                data-testid={`template-card-${template.id}`}
              >
                <div className="relative">
                  <img 
                    src={template.thumbnail} 
                    alt={template.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Button size="sm" className="mb-2 bg-white/20 hover:bg-white/30 text-white border-white/30">
                        Preview
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        Try Now
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-1" data-testid={`template-name-${template.id}`}>
                    {template.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2" data-testid={`template-description-${template.id}`}>
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{template.usageCount.toLocaleString()} uses</span>
                    <div className="flex items-center">
                      {"★".repeat(template.rating)}
                      <span className="ml-1">({template.rating})</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}