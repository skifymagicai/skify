import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, RefreshCw } from 'lucide-react';
import { JobCard } from './JobCard.js';
import { apiClient } from '../../lib/api.js';
import { RenderJob } from '../../../../shared/types.js';

export function JobsManager() {
  const [activeTab, setActiveTab] = useState('all');

  const { data: jobsData, isLoading, error, refetch } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => apiClient.getJobs(),
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  const jobs = jobsData?.data?.jobs || [];

  const filterJobsByStatus = (status?: string) => {
    if (!status || status === 'all') return jobs;
    return jobs.filter(job => job.status === status);
  };

  const handleDownload = (resultUrl: string) => {
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = `skify-render-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCancel = async (jobId: string) => {
    try {
      await apiClient.cancelJob(jobId);
      refetch(); // Refresh jobs list
    } catch (error) {
      console.error('Failed to cancel job:', error);
      // Could show error toast
    }
  };

  const getTabCounts = () => {
    return {
      all: jobs.length,
      processing: jobs.filter(j => j.status === 'processing' || j.status === 'queued').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length
    };
  };

  const counts = getTabCounts();

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 mb-4">
            Failed to load render jobs. Please try again.
          </p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Renders</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track your video rendering jobs and download completed files
          </p>
        </div>
        
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="processing">
            Processing ({counts.processing})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({counts.completed})
          </TabsTrigger>
          <TabsTrigger value="failed">
            Failed ({counts.failed})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <JobsList
            jobs={filterJobsByStatus('all')}
            isLoading={isLoading}
            onDownload={handleDownload}
            onCancel={handleCancel}
          />
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          <JobsList
            jobs={filterJobsByStatus('processing').concat(filterJobsByStatus('queued'))}
            isLoading={isLoading}
            onDownload={handleDownload}
            onCancel={handleCancel}
          />
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <JobsList
            jobs={filterJobsByStatus('completed')}
            isLoading={isLoading}
            onDownload={handleDownload}
            onCancel={handleCancel}
          />
        </TabsContent>

        <TabsContent value="failed" className="space-y-4">
          <JobsList
            jobs={filterJobsByStatus('failed')}
            isLoading={isLoading}
            onDownload={handleDownload}
            onCancel={handleCancel}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface JobsListProps {
  jobs: RenderJob[];
  isLoading: boolean;
  onDownload: (resultUrl: string) => void;
  onCancel: (jobId: string) => void;
}

function JobsList({ jobs, isLoading, onDownload, onCancel }: JobsListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading render jobs...</span>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No render jobs found.
          </p>
          <p className="text-sm text-gray-500">
            Apply a template to your videos to start rendering!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onDownload={onDownload}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
}