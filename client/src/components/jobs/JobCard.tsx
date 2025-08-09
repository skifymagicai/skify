import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Download, X, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { RenderJob } from '../../../../shared/types.js';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: RenderJob;
  onDownload?: (resultUrl: string) => void;
  onCancel?: (jobId: string) => void;
  className?: string;
}

export function JobCard({ job, onDownload, onCancel, className }: JobCardProps) {
  const getStatusIcon = () => {
    switch (job.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return (
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        );
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const renderSettings = job.renderSettings as any;

  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-lg">
                Render Job #{job.id.slice(-8)}
              </CardTitle>
              <p className="text-sm text-gray-500">
                Created {formatTimeAgo(job.createdAt)}
              </p>
            </div>
          </div>
          
          <Badge className={getStatusColor()}>
            {job.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress bar for processing jobs */}
        {(job.status === 'processing' || job.status === 'queued') && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{job.progress}%</span>
            </div>
            <Progress value={job.progress} className="h-2" />
            {job.status === 'processing' && job.estimatedDuration && (
              <p className="text-xs text-gray-500">
                Estimated time remaining: {Math.ceil(job.estimatedDuration / 60)} minutes
              </p>
            )}
          </div>
        )}

        {/* Error message */}
        {job.status === 'failed' && job.errorMessage && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-300">
              {job.errorMessage}
            </p>
          </div>
        )}

        {/* Render settings */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Resolution:</span>
            <span className="ml-2">{renderSettings?.resolution || 'N/A'}</span>
          </div>
          <div>
            <span className="font-medium">Quality:</span>
            <span className="ml-2">{renderSettings?.quality || 'N/A'}</span>
          </div>
          <div>
            <span className="font-medium">Format:</span>
            <span className="ml-2">{renderSettings?.format || 'MP4'}</span>
          </div>
          <div>
            <span className="font-medium">Watermark:</span>
            <span className="ml-2">
              {renderSettings?.watermark ? 'Yes' : 'No'}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          {job.status === 'completed' && job.resultUrl && (
            <Button
              onClick={() => onDownload?.(job.resultUrl!)}
              className="flex-1"
              data-testid={`button-download-${job.id}`}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
          
          {(job.status === 'queued' || job.status === 'processing') && onCancel && (
            <Button
              onClick={() => onCancel(job.id)}
              variant="outline"
              className="flex-1"
              data-testid={`button-cancel-${job.id}`}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
          
          {job.status === 'failed' && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                // Could implement retry functionality here
                console.log('Retry job:', job.id);
              }}
            >
              Retry
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}