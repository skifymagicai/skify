import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Play, Download, Star, Eye, Wand2, Share } from 'lucide-react';
import { debugLogger } from '../utils/debugLogger';

interface TemplatePreviewProps {
  template: {
    id: string;
    name: string;
    description: string;
    effects: string[];
    thumbnail?: string;
    usageCount: number;
    rating?: number;
    category?: string;
  };
  onApply: (templateId: string) => void;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({ 
  template, 
  onApply 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const playPreview = () => {
    setIsPlaying(true);
    debugLogger.log('TEMPLATE_PREVIEW', `Playing preview: ${template.name}`);
    
    // Simulate preview playback
    setTimeout(() => {
      setIsPlaying(false);
      debugLogger.success('TEMPLATE_PREVIEW', 'Preview playback completed');
    }, 3000);
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    debugLogger.log('TEMPLATE_INTERACTION', `Template ${isLiked ? 'unliked' : 'liked'}: ${template.name}`);
  };

  const applyTemplate = () => {
    debugLogger.success('TEMPLATE_APPLY', `Applying template: ${template.name}`);
    onApply(template.id);
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {template.description}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Star className={`h-4 w-4 ${isLiked ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
            <span className="text-xs text-muted-foreground">{template.rating || 4.7}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Preview Area */}
        <div className="relative bg-black rounded-lg aspect-video flex items-center justify-center overflow-hidden">
          {isPlaying ? (
            <div className="flex items-center gap-2 text-white">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              <span className="text-sm">Playing Preview...</span>
            </div>
          ) : (
            <div className="text-white/80 text-center">
              <div className="mb-2 text-4xl">🎬</div>
              <p className="text-sm">Template Preview</p>
            </div>
          )}
          
          {/* Play Overlay */}
          {!isPlaying && (
            <button
              onClick={playPreview}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
            >
              <Play className="h-12 w-12 text-white group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>

        {/* Effects */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Effects Included:</h4>
          <div className="flex flex-wrap gap-1">
            {template.effects.map((effect, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {effect}
              </Badge>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{template.usageCount}</span>
            </div>
            {template.category && (
              <Badge variant="outline" className="text-xs">
                {template.category}
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={applyTemplate}
            className="flex-1"
            size="sm"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Apply Template
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleLike}
          >
            <Star className={`h-4 w-4 ${isLiked ? 'text-yellow-500 fill-current' : ''}`} />
          </Button>
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplatePreview;