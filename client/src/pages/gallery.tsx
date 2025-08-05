import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, Play, ArrowLeft, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const GALLERY_TEMPLATES = [
  {
    id: "cinematic-travel",
    name: "Cinematic Travel Pack",
    description: "LUT, High Contrast, AI Edits",
    tags: ["#Cinematic", "#Nature", "#Travel"],
    views: "12.5K",
    hearts: "1.2K",
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    category: "Travel",
    duration: "2:45",
    isTrending: true,
  },
  {
    id: "urban-street",
    name: "Urban Street Vibes",
    description: "Color Pop, Motion Blur, Transitions",
    tags: ["#Urban", "#Street", "#Modern"],
    views: "8.7K",
    hearts: "890",
    thumbnail: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    category: "Urban",
    duration: "1:30",
    isTrending: false,
  },
  {
    id: "soft-aesthetic",
    name: "Soft Aesthetic",
    description: "Film Grain, Warm Tones, Smooth Cuts",
    tags: ["#Aesthetic", "#Soft", "#Vintage"],
    views: "15.2K",
    hearts: "2.1K",
    thumbnail: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    category: "Aesthetic",
    duration: "3:20",
    isTrending: true,
  },
  {
    id: "dynamic-sport",
    name: "Dynamic Sport Pack",
    description: "High Energy, Quick Cuts, Bold Colors",
    tags: ["#Sport", "#Energy", "#Action"],
    views: "9.3K",
    hearts: "756",
    thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    category: "Sport",
    duration: "2:10",
    isTrending: false,
  },
  {
    id: "retro-neon",
    name: "Retro Neon Style",
    description: "Synthwave, Purple Hues, Glow Effects",
    tags: ["#Retro", "#Neon", "#80s"],
    views: "11.8K",
    hearts: "1.5K",
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    category: "Retro",
    duration: "1:55",
    isTrending: true,
  },
  {
    id: "minimal-clean",
    name: "Minimal Clean",
    description: "Simple Cuts, White Space, Typography",
    tags: ["#Minimal", "#Clean", "#Corporate"],
    views: "6.2K",
    hearts: "543",
    thumbnail: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    category: "Corporate",
    duration: "2:30",
    isTrending: false,
  },
  {
    id: "dark-moody",
    name: "Dark & Moody",
    description: "Low Light, High Contrast, Dramatic",
    tags: ["#Dark", "#Moody", "#Cinematic"],
    views: "13.4K",
    hearts: "1.8K",
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    category: "Cinematic",
    duration: "3:45",
    isTrending: true,
  },
  {
    id: "bright-summer",
    name: "Bright Summer",
    description: "Saturated Colors, Sun Flares, Happy Vibes",
    tags: ["#Summer", "#Bright", "#Happy"],
    views: "7.9K",
    hearts: "672",
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    category: "Lifestyle",
    duration: "2:15",
    isTrending: false,
  },
];

const CATEGORIES = ["All", "Trending", "Travel", "Urban", "Aesthetic", "Sport", "Retro", "Corporate", "Cinematic", "Lifestyle"];

export default function Gallery() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteTemplates, setFavoriteTemplates] = useState<string[]>([]);

  const filteredTemplates = GALLERY_TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === "All" || 
                           (selectedCategory === "Trending" && template.isTrending) ||
                           template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (templateId: string) => {
    setFavoriteTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleTemplateClick = (templateId: string) => {
    setLocation(`/template-preview?id=${templateId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="text-gray-600 hover:text-gray-900"
                data-testid="button-back-home"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900" data-testid="text-page-title">
                Template Gallery
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="input-search-templates"
                />
              </div>
              <Button variant="outline" size="sm" data-testid="button-filter">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto" data-testid="container-category-tabs">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap ${
                selectedCategory === category 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              data-testid={`button-category-${category.toLowerCase()}`}
            >
              {category}
              {category === "Trending" && (
                <Badge variant="secondary" className="ml-2 bg-red-100 text-red-600 text-xs px-1.5 py-0.5">
                  Hot
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600" data-testid="text-results-count">
            {filteredTemplates.length} templates found
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory !== "All" && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="grid-templates">
          {filteredTemplates.map((template) => (
            <Card 
              key={template.id} 
              className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              onClick={() => handleTemplateClick(template.id)}
              data-testid={`card-template-${template.id}`}
            >
              <CardContent className="p-0">
                {/* Thumbnail */}
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                    data-testid={`img-template-thumbnail-${template.id}`}
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>

                  {/* Duration badge */}
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="secondary" className="bg-black bg-opacity-70 text-white text-xs" data-testid={`badge-duration-${template.id}`}>
                      {template.duration}
                    </Badge>
                  </div>

                  {/* Trending badge */}
                  {template.isTrending && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-red-500 text-white text-xs" data-testid={`badge-trending-${template.id}`}>
                        Trending
                      </Badge>
                    </div>
                  )}

                  {/* Favorite button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 p-1 h-8 w-8 bg-white bg-opacity-80 hover:bg-opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(template.id);
                    }}
                    data-testid={`button-favorite-${template.id}`}
                  >
                    <Heart 
                      className={`w-4 h-4 ${
                        favoriteTemplates.includes(template.id) 
                          ? "fill-red-500 text-red-500" 
                          : "text-gray-600"
                      }`} 
                    />
                  </Button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1" data-testid={`text-template-name-${template.id}`}>
                    {template.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2" data-testid={`text-template-description-${template.id}`}>
                    {template.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3" data-testid={`container-tags-${template.id}`}>
                    {template.tags.slice(0, 2).map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="outline" 
                        className="text-xs text-blue-600 border-blue-200"
                        data-testid={`badge-tag-${tag.replace('#', '')}-${template.id}`}
                      >
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs text-gray-500">
                        +{template.tags.length - 2}
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1" data-testid={`stats-views-${template.id}`}>
                        <Eye className="w-4 h-4" />
                        <span>{template.views}</span>
                      </div>
                      <div className="flex items-center space-x-1" data-testid={`stats-hearts-${template.id}`}>
                        <Heart className="w-4 h-4" />
                        <span>{template.hearts}</span>
                      </div>
                    </div>
                    
                    <Badge variant="outline" className="text-xs" data-testid={`badge-category-${template.id}`}>
                      {template.category}
                    </Badge>
                  </div>

                  {/* Apply button */}
                  <Button 
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTemplateClick(template.id);
                    }}
                    data-testid={`button-apply-template-${template.id}`}
                  >
                    Apply Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12" data-testid="container-empty-state">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter criteria to find more templates.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              data-testid="button-clear-filters"
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}