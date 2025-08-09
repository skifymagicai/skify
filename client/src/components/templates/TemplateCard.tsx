import React from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Play, Download, Eye } from 'lucide-react';
import { Template } from '../../../../shared/types.js';
import { cn } from '@/lib/utils';

interface TemplateCardProps {
  template: Template & { isLiked?: boolean };
  onApply?: (templateId: string) => void;
  onLike?: (templateId: string) => void;
  onView?: (templateId: string) => void;
  className?: string;
  showActions?: boolean;
}

export function TemplateCard({ 
  template, 
  onApply, 
  onLike, 
  onView,
  className,
  showActions = true 
}: TemplateCardProps) {
  return (
    <Card className={cn("group cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]", className)}>
      <CardHeader className="p-0">
        <div 
          className="relative aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg overflow-hidden"
          onClick={() => onView?.(template.id)}
          data-testid={`template-card-${template.id}`}
        >
          {template.thumbnailUrl ? (
            <img
              src={template.thumbnailUrl}
              alt={template.name}
              className="w-full h-full object-cover"
              data-testid={`template-thumbnail-${template.id}`}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Play className="w-12 h-12 text-white opacity-80" />
            </div>
          )}
          
          {/* Overlay with play button */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="secondary" className="rounded-full">
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
            </div>
          </div>

          {/* Like button */}
          {onLike && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 bg-black/20 hover:bg-black/40 text-white rounded-full p-2"
              onClick={(e) => {
                e.stopPropagation();
                onLike(template.id);
              }}
              data-testid={`button-like-${template.id}`}
            >
              <Heart
                className={cn(
                  "w-4 h-4",
                  template.isLiked ? "fill-red-500 text-red-500" : "text-white"
                )}
              />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4" onClick={() => onView?.(template.id)}>
        <h3 className="font-semibold text-lg mb-2 line-clamp-1" data-testid={`template-name-${template.id}`}>
          {template.name}
        </h3>
        
        {template.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
            {template.description}
          </p>
        )}

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {template.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            <span>{template.likes || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            <span>{template.uses || 0} uses</span>
          </div>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="p-4 pt-0">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onApply?.(template.id);
            }}
            className="w-full"
            data-testid={`button-apply-${template.id}`}
          >
            Apply Template
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}