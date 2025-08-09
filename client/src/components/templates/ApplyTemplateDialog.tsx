import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Crown, Zap } from 'lucide-react';
import { apiClient } from '../../lib/api.js';
import { useAuth } from '../../hooks/useAuth.js';

interface ApplyTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string | null;
}

export function ApplyTemplateDialog({ open, onOpenChange, templateId }: ApplyTemplateDialogProps) {
  const { user } = useAuth();
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [renderSettings, setRenderSettings] = useState({
    resolution: '1080p' as '720p' | '1080p' | '4K',
    quality: 'standard' as 'draft' | 'standard' | 'high' | 'ultra',
    watermark: user?.tier !== 'pro',
    format: 'mp4' as 'mp4' | 'mov',
    applyLayers: {
      timing: true,
      visual: true,
      audio: true,
      text: true,
      background: false
    }
  });
  const [isApplying, setIsApplying] = useState(false);

  const { data: uploadsData } = useQuery({
    queryKey: ['uploads'],
    queryFn: () => apiClient.getUploads(),
    enabled: open
  });

  const { data: templateData } = useQuery({
    queryKey: ['template', templateId],
    queryFn: () => templateId ? apiClient.getTemplate(templateId) : null,
    enabled: open && !!templateId
  });

  const availableUploads = uploadsData?.data?.uploads?.filter(
    upload => upload.status === 'analyzed'
  ) || [];

  const template = templateData?.data;

  useEffect(() => {
    // Reset settings when dialog opens
    if (open) {
      setSelectedMedia([]);
      setRenderSettings(prev => ({
        ...prev,
        watermark: user?.tier !== 'pro'
      }));
    }
  }, [open, user?.tier]);

  const handleApplyTemplate = async () => {
    if (!templateId || selectedMedia.length === 0) return;

    setIsApplying(true);
    try {
      const result = await apiClient.applyTemplate(templateId, selectedMedia, renderSettings);
      console.log('Template applied:', result);
      onOpenChange(false);
      // Could show success toast or redirect to jobs page
    } catch (error) {
      console.error('Failed to apply template:', error);
      // Could show error toast
    } finally {
      setIsApplying(false);
    }
  };

  const toggleMediaSelection = (mediaId: string) => {
    setSelectedMedia(prev =>
      prev.includes(mediaId)
        ? prev.filter(id => id !== mediaId)
        : [...prev, mediaId]
    );
  };

  const isPro = user?.tier === 'pro';
  const canUse4K = isPro;
  const canRemoveWatermark = isPro;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Apply Template: {template?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pro upgrade notice */}
          {!isPro && (
            <Alert>
              <Crown className="w-4 h-4" />
              <AlertDescription>
                Upgrade to Pro to unlock 4K resolution, remove watermarks, and get unlimited uploads.
              </AlertDescription>
            </Alert>
          )}

          {/* Select Media */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Your Media</Label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose the videos or images you want to apply this template to.
            </p>
            
            {availableUploads.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    No analyzed uploads available. Upload and analyze a video first.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableUploads.map((upload) => (
                  <Card 
                    key={upload.id}
                    className={`cursor-pointer transition-all ${
                      selectedMedia.includes(upload.id) 
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => toggleMediaSelection(upload.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          checked={selectedMedia.includes(upload.id)}
                          readOnly
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{upload.filename}</p>
                          <p className="text-xs text-gray-500">
                            {upload.duration ? `${upload.duration}s` : 'Image'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Render Settings */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Resolution */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Resolution</Label>
              <RadioGroup
                value={renderSettings.resolution}
                onValueChange={(value: '720p' | '1080p' | '4K') => 
                  setRenderSettings(prev => ({ ...prev, resolution: value }))
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="720p" id="720p" />
                  <Label htmlFor="720p">720p HD</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1080p" id="1080p" />
                  <Label htmlFor="1080p">1080p Full HD</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4K" id="4K" disabled={!canUse4K} />
                  <Label htmlFor="4K" className="flex items-center gap-2">
                    4K Ultra HD
                    {!canUse4K && <Crown className="w-4 h-4 text-yellow-500" />}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Quality */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Quality</Label>
              <RadioGroup
                value={renderSettings.quality}
                onValueChange={(value: 'draft' | 'standard' | 'high' | 'ultra') => 
                  setRenderSettings(prev => ({ ...prev, quality: value }))
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="draft" id="draft" />
                  <Label htmlFor="draft">Draft (Fast)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="standard" id="standard" />
                  <Label htmlFor="standard">Standard</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high">High Quality</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ultra" id="ultra" />
                  <Label htmlFor="ultra">Ultra (Slow)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Watermark Setting */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-1">
              <Label>Watermark</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {canRemoveWatermark ? 'Remove Skify watermark' : 'Skify watermark will be added'}
              </p>
            </div>
            <Switch
              checked={renderSettings.watermark}
              onCheckedChange={(checked) => 
                setRenderSettings(prev => ({ ...prev, watermark: checked }))
              }
              disabled={!canRemoveWatermark}
            />
          </div>

          {/* Apply Layers */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Style Layers to Apply</Label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(renderSettings.applyLayers).map(([layer, enabled]) => (
                <div key={layer} className="flex items-center space-x-2">
                  <Checkbox
                    checked={enabled}
                    onCheckedChange={(checked) =>
                      setRenderSettings(prev => ({
                        ...prev,
                        applyLayers: {
                          ...prev.applyLayers,
                          [layer]: checked === true
                        }
                      }))
                    }
                  />
                  <Label className="capitalize">{layer}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApplyTemplate}
              disabled={selectedMedia.length === 0 || isApplying}
              className="flex-1"
            >
              {isApplying ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-pulse" />
                  Applying...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Apply Template
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}