import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search, Filter } from 'lucide-react';
import { TemplateCard } from './TemplateCard.js';
import { ApplyTemplateDialog } from './ApplyTemplateDialog.js';
import { apiClient } from '../../lib/api.js';
import { Template } from '../../../../shared/types.js';

interface TemplateGalleryProps {
  showUserTemplates?: boolean;
}

export function TemplateGallery({ showUserTemplates = false }: TemplateGalleryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);

  const { data: templatesData, isLoading, error, refetch } = useQuery({
    queryKey: showUserTemplates ? ['my-templates'] : ['templates'],
    queryFn: () => showUserTemplates ? apiClient.getMyTemplates() : apiClient.getTemplates(),
  });

  const templates = templatesData?.data?.templates || [];
  
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleApplyTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setApplyDialogOpen(true);
  };

  const handleLikeTemplate = async (templateId: string) => {
    try {
      await apiClient.likeTemplate(templateId);
      refetch(); // Refresh to update like status
    } catch (error) {
      console.error('Failed to like template:', error);
    }
  };

  const handleViewTemplate = (templateId: string) => {
    // Could open a detailed template view
    console.log('View template:', templateId);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">
            Failed to load templates. Please try again.
          </p>
          <Button onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {showUserTemplates ? 'My Templates' : 'Template Gallery'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {showUserTemplates 
              ? 'Templates you\'ve created from your uploaded videos'
              : 'Discover and apply viral video styles to your content'
            }
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading templates...</span>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            {searchTerm ? (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No templates found matching "{searchTerm}"
                </p>
                <Button 
                  onClick={() => setSearchTerm('')} 
                  variant="outline"
                >
                  Clear Search
                </Button>
              </>
            ) : showUserTemplates ? (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You haven't created any templates yet.
                </p>
                <p className="text-sm text-gray-500">
                  Upload a viral video to create your first template!
                </p>
              </>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                No public templates available yet.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onApply={handleApplyTemplate}
              onLike={!showUserTemplates ? handleLikeTemplate : undefined}
              onView={handleViewTemplate}
              showActions={!showUserTemplates}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {filteredTemplates.length > 0 && filteredTemplates.length % 12 === 0 && (
        <div className="text-center">
          <Button variant="outline" onClick={() => refetch()}>
            Load More Templates
          </Button>
        </div>
      )}

      {/* Apply Template Dialog */}
      <ApplyTemplateDialog
        open={applyDialogOpen}
        onOpenChange={setApplyDialogOpen}
        templateId={selectedTemplate}
      />
    </div>
  );
}