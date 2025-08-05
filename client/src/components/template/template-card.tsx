import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TemplateCardProps {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  usageCount: number;
  rating: number;
  onTryNow?: (id: string) => void;
  className?: string;
}

export default function TemplateCard({
  id,
  name,
  description,
  thumbnail,
  usageCount,
  rating,
  onTryNow,
  className = "",
}: TemplateCardProps) {
  const formatUsageCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <Card className={`bg-card rounded-xl overflow-hidden card-hover cursor-pointer ${className}`} data-testid={`template-card-${id}`}>
      <div className="video-container bg-gradient-to-b from-orange-400 to-purple-600 relative">
        <img 
          src={thumbnail} 
          alt={`${name} template`} 
          className="w-full h-full object-cover"
          data-testid={`template-thumbnail-${id}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <Button 
          size="sm"
          className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full p-0"
          data-testid={`template-preview-${id}`}
        >
          <i className="fas fa-play text-white text-xs"></i>
        </Button>
      </div>
      <CardContent className="p-4">
        <h4 className="font-semibold mb-1" data-testid={`template-name-${id}`}>{name}</h4>
        <p className="text-muted-foreground text-sm mb-2" data-testid={`template-description-${id}`}>{description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-accent text-sm font-medium" data-testid={`template-usage-${id}`}>
              {formatUsageCount(usageCount)} uses
            </span>
            <div className="flex items-center" data-testid={`template-rating-${id}`}>
              <div className="flex text-yellow-400 text-xs mr-1">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className={`fas fa-star ${i < rating ? "" : "opacity-30"}`}></i>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{rating}</span>
            </div>
          </div>
          <Button 
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => onTryNow?.(id)}
            data-testid={`template-try-${id}`}
          >
            Try Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
