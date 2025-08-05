import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/header";
import TemplateCard from "@/components/template/template-card";
import { useLanguage } from "@/hooks/use-language";

const SAMPLE_TEMPLATES = [
  {
    id: "cinematic-sunset",
    name: "Cinematic Sunset",
    description: "Warm tones, smooth transitions",
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
    usageCount: 12500,
    rating: 5,
  },
  {
    id: "neon-vibes",
    name: "Neon Vibes",
    description: "Cyberpunk aesthetic, glitch effects",
    thumbnail: "https://pixabay.com/get/g2e4fbb90929d45fe2bbd14840853c2245110f6588426727fb17819edbfa7e0a6d0ee9f916ce82df3d1625efda1de2e970848ea193a630d6259bd5776a447ebf3_1280.jpg",
    usageCount: 8700,
    rating: 4,
  },
  {
    id: "clean-minimal",
    name: "Clean Minimal",
    description: "Soft lighting, elegant cuts",
    thumbnail: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
    usageCount: 15200,
    rating: 5,
  },
  {
    id: "dynamic-sport",
    name: "Dynamic Sport",
    description: "High contrast, motion blur",
    thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
    usageCount: 9300,
    rating: 4,
  },
];

const FEATURES = [
  {
    icon: "fas fa-brain",
    title: "AI Style Analysis",
    description: "Advanced AI extracts effects, transitions, color grading, and camera movements.",
    color: "primary",
  },
  {
    icon: "fas fa-magic",
    title: "Template Creation",
    description: "Generate reusable templates from any viral video for consistent styling.",
    color: "secondary",
  },
  {
    icon: "fas fa-play",
    title: "Instant Apply",
    description: "Apply extracted styles to your videos with one-click transformation.",
    color: "accent",
  },
];

export default function Landing() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  const handleUploadClick = () => {
    setLocation("/analysis");
  };

  const handleTemplateSelect = (templateId: string) => {
    setLocation("/template-preview");
  };

  const handleBrowseGallery = () => {
    setLocation("/template-preview");
  };

  return (
    <div className="min-h-screen bg-dark text-white">
      <Header />

      {/* Hero Section */}
      <div className="gradient-bg px-4 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gradient" data-testid="hero-title">
            {t("landing.hero.title")}
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto" data-testid="hero-subtitle">
            {t("landing.hero.subtitle")}
          </p>
          
          {/* Upload Zone */}
          <div 
            className="bg-card border-2 border-dashed border-primary/40 rounded-2xl p-8 mb-8 max-w-md mx-auto hover:border-primary/60 transition-colors cursor-pointer"
            onClick={handleUploadClick}
            data-testid="upload-zone"
          >
            <i className="fas fa-cloud-upload-alt text-4xl text-primary mb-4"></i>
            <h3 className="text-lg font-semibold mb-2">{t("landing.upload.title")}</h3>
            <p className="text-muted-foreground text-sm mb-4">{t("landing.upload.subtitle")}</p>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              data-testid="choose-file-button"
            >
              <i className="fas fa-plus mr-2"></i>Choose File
            </Button>
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={handleBrowseGallery}
            className="mb-8"
            data-testid="browse-gallery-button"
          >
            Browse Gallery
          </Button>
        </div>
      </div>

      {/* Template Gallery */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold" data-testid="trending-templates-title">Trending Templates</h3>
          <Button 
            variant="link" 
            className="text-primary hover:text-primary/80"
            data-testid="view-all-templates"
          >
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {SAMPLE_TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              {...template}
              onTryNow={handleTemplateSelect}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h3 className="text-2xl font-bold text-center mb-12" data-testid="features-title">Powered by AI Magic</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => (
            <Card key={index} className="bg-card text-center border-0" data-testid={`feature-card-${index}`}>
              <CardContent className="p-6">
                <div className={`w-16 h-16 bg-${feature.color}/20 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <i className={`${feature.icon} text-${feature.color} text-2xl`}></i>
                </div>
                <h4 className="text-lg font-semibold mb-2" data-testid={`feature-title-${index}`}>{feature.title}</h4>
                <p className="text-muted-foreground" data-testid={`feature-description-${index}`}>{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
