import React, { useState } from 'react';
import { 
  Play, 
  Trash2, 
  Edit3, 
  Share2, 
  Copy, 
  MoreVertical,
  Search,
  Filter,
  Grid3X3,
  List,
  Star
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { useToast } from '../../hooks/use-toast';

interface Template {
  id: string;
  name: string;
  thumbnailUrl: string;
  duration: string;
  createdAt: string;
  uses: number;
  rating: number;
  tags: string[];
  metadata: {
    aspectRatio: string;
    effects: number;
    textOverlays: number;
    sourceVideo: string;
  };
}

interface MyTemplatesProps {
  templates: Template[];
  onApplyTemplate: (templateId: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  onRenameTemplate: (templateId: string, newName: string) => void;
  onShareTemplate: (templateId: string) => void;
  isLoading?: boolean;
}

export function MyTemplates({
  templates,
  onApplyTemplate,
  onDeleteTemplate,
  onRenameTemplate,
  onShareTemplate,
  isLoading = false
}: MyTemplatesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'uses' | 'rating'>('recent');
  const { toast } = useToast();

  const filteredTemplates = templates
    .filter(template => 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'uses':
          return b.uses - a.uses;
        case 'rating':
          return b.rating - a.rating;
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const handleRename = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const newName = prompt('Enter new template name:', template.name);
    if (newName && newName.trim() !== template.name) {
      onRenameTemplate(templateId, newName.trim());
    }
  };

  const handleDelete = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    if (confirm(`Delete "${template.name}"? This action cannot be undone.`)) {
      onDeleteTemplate(templateId);
      toast({
        title: "Template deleted",
        description: `${template.name} has been removed from your templates.`
      });
    }
  };

  const handleDuplicate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      onRenameTemplate(templateId, `${template.name} (Copy)`);
      toast({
        title: "Template duplicated",
        description: "A copy has been created in your templates."
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-0">
                <div className="aspect-[9/16] bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6" data-testid="my-templates">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">My Templates</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {templates.length} saved template{templates.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-sort">
                <Filter className="w-4 h-4 mr-2" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy('recent')}>
                Most Recent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('name')}>
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('uses')}>
                Most Used
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('rating')}>
                Highest Rated
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode */}
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
              data-testid="button-grid-view"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
              data-testid="button-list-view"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Templates Grid/List */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No templates found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery 
              ? 'Try adjusting your search terms'
              : 'Create your first template by transforming a viral video'
            }
          </p>
          {searchQuery && (
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
            : 'space-y-4'
        }>
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              viewMode={viewMode}
              onApply={() => onApplyTemplate(template.id)}
              onRename={() => handleRename(template.id)}
              onDelete={() => handleDelete(template.id)}
              onShare={() => onShareTemplate(template.id)}
              onDuplicate={() => handleDuplicate(template.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TemplateCardProps {
  template: Template;
  viewMode: 'grid' | 'list';
  onApply: () => void;
  onRename: () => void;
  onDelete: () => void;
  onShare: () => void;
  onDuplicate: () => void;
}

function TemplateCard({ 
  template, 
  viewMode, 
  onApply, 
  onRename, 
  onDelete, 
  onShare, 
  onDuplicate 
}: TemplateCardProps) {
  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-24 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={template.thumbnailUrl}
                alt={template.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold truncate mb-1">{template.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{template.duration}</span>
                    <span>{template.uses} uses</span>
                    <span>★ {template.rating.toFixed(1)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={onApply} data-testid={`button-apply-${template.id}`}>
                    <Play className="w-4 h-4 mr-2" />
                    Apply
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" data-testid={`button-menu-${template.id}`}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={onRename}>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onDuplicate}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onShare}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onDelete} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {template.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-0">
        <div className="relative">
          <div className="aspect-[9/16] bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
            <img
              src={template.thumbnailUrl}
              alt={template.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg flex items-center justify-center">
            <Button onClick={onApply} data-testid={`button-apply-${template.id}`}>
              <Play className="w-4 h-4 mr-2" />
              Apply Template
            </Button>
          </div>

          {/* Menu Button */}
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 bg-black/50 hover:bg-black/70 backdrop-blur-sm p-0"
                  data-testid={`button-menu-${template.id}`}
                >
                  <MoreVertical className="w-4 h-4 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onRename}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="p-3">
          <h3 className="font-semibold truncate mb-2">{template.name}</h3>
          
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>{template.duration}</span>
            <span>★ {template.rating.toFixed(1)}</span>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{template.tags.length - 2}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}