import React, { useState } from 'react';
import { Upload, Sparkles, Download, CreditCard, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Template {
  id: string;
  name: string;
  thumbnailUrl: string;
  duration: string;
  uses: number;
  rating: number;
  tags: string[];
}

interface JobStatus {
  jobId: string;
  status: 'queued' | 'active' | 'completed' | 'failed';
  progress: number;
  data?: any;
}

interface TemplatesResponse {
  templates: Template[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export default function SkifyMagic() {
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<'free' | 'pro'>('free');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templatesData } = useQuery<{ data: TemplatesResponse }>({
    queryKey: ['/api/templates'],
    enabled: true
  });

  // Job status polling
  const { data: jobStatus } = useQuery<{ data: JobStatus }>({
    queryKey: ['/api/job', currentJobId],
    enabled: !!currentJobId,
    refetchInterval: currentJobId ? 2000 : false
  });

  // Analyze video mutation
  const analyzeVideoMutation = useMutation({
    mutationFn: async (data: { videoUrl: string }) => {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentJobId(data.data.jobId);
      toast({
        title: 'Analysis Started',
        description: 'Your viral video is being analyzed...'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Analysis Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Apply template mutation
  const applyTemplateMutation = useMutation({
    mutationFn: (data: { templateId: string; userMedia: File[]; quality?: string }) => {
      const formData = new FormData();
      formData.append('templateId', data.templateId);
      formData.append('quality', userTier === 'pro' ? '4k' : 'hd');
      
      data.userMedia.forEach((file, index) => {
        formData.append('userMedia', file);
      });

      return fetch('/api/templates/apply', {
        method: 'POST',
        body: formData
      }).then(res => res.json());
    },
    onSuccess: (data) => {
      setCurrentJobId(data.data.jobId);
      toast({
        title: 'Template Applied',
        description: 'Creating your viral video...'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Template Application Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Payment mutation
  const createOrderMutation = useMutation({
    mutationFn: async (plan: string) => {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Initialize Razorpay checkout
      const options = {
        ...data.data.options,
        handler: (response: any) => {
          // Verify payment
          verifyPaymentMutation.mutate(response);
        },
        modal: {
          ondismiss: () => {
            toast({
              title: 'Payment Cancelled',
              description: 'You can upgrade to Pro anytime.'
            });
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    }
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      return response.json();
    },
    onSuccess: (data) => {
      setUserTier('pro');
      toast({
        title: 'Pro Activated!',
        description: '4K exports and premium features unlocked.'
      });
    }
  });

  const handleAnalyze = () => {
    if (!videoUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid video URL',
        variant: 'destructive'
      });
      return;
    }

    analyzeVideoMutation.mutate({ videoUrl: videoUrl.trim() });
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplate || uploadedFiles.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select a template and upload your media',
        variant: 'destructive'
      });
      return;
    }

    applyTemplateMutation.mutate({
      templateId: selectedTemplate,
      userMedia: uploadedFiles
    });
  };

  const handleUpgradeToPro = () => {
    createOrderMutation.mutate('pro');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              SkifyMagicAI
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Transform any video into viral content with AI-powered style transfer
          </p>
          <div className="flex items-center justify-center space-x-2">
            <Badge variant={userTier === 'pro' ? 'default' : 'secondary'}>
              {userTier.toUpperCase()} Plan
            </Badge>
            {userTier === 'free' && (
              <Button onClick={handleUpgradeToPro} size="sm" className="ml-2">
                <CreditCard className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            )}
          </div>
        </div>

        {/* Step 1: Video Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Step 1: Analyze Viral Video</span>
            </CardTitle>
            <CardDescription>
              Paste a link to any viral video to extract its style components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="https://www.tiktok.com/@user/video/123... or Instagram/YouTube URL"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleAnalyze}
                disabled={analyzeVideoMutation.isPending}
                data-testid="button-analyze"
              >
                {analyzeVideoMutation.isPending ? 'Analyzing...' : 'Analyze'}
              </Button>
            </div>

            {jobStatus?.data && jobStatus.data.status !== 'completed' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Analysis Progress</span>
                  <span>{jobStatus.data.progress}%</span>
                </div>
                <Progress value={jobStatus.data.progress} />
                <p className="text-sm text-gray-500">
                  Status: {jobStatus.data.status}
                </p>
              </div>
            )}

            {jobStatus?.data?.status === 'completed' && jobStatus.data.data && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                  ✅ Analysis Complete
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Duration:</span> {jobStatus.data.data?.timing?.duration}s
                  </div>
                  <div>
                    <span className="font-medium">BPM:</span> {jobStatus.data.data?.audio?.bpm}
                  </div>
                  <div>
                    <span className="font-medium">Effects:</span> {jobStatus.data.data?.visual?.effects?.length || 0}
                  </div>
                  <div>
                    <span className="font-medium">Text Overlays:</span> {jobStatus.data.data?.text?.overlays?.length || 0}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5" />
              <span>Step 2: Choose Template Style</span>
            </CardTitle>
            <CardDescription>
              Select from our library of extracted viral templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templatesData?.data?.templates?.map((template: Template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all ${
                    selectedTemplate === template.id
                      ? 'ring-2 ring-purple-600 bg-purple-50 dark:bg-purple-900/20'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                  data-testid={`card-template-${template.id}`}
                >
                  <CardContent className="p-4">
                    <div className="aspect-[9/16] bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="font-medium text-sm mb-2">{template.name}</h4>
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>{template.duration}</span>
                      <span>★ {template.rating}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Upload & Apply */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Step 3: Upload Your Media</span>
            </CardTitle>
            <CardDescription>
              Upload your photos/videos to apply the viral template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => setUploadedFiles(Array.from(e.target.files || []))}
                className="hidden"
                id="file-upload"
                data-testid="input-file"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports images and videos up to 100MB
                </p>
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Uploaded Files:</h4>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <span className="flex-1">{file.name}</span>
                    <span className="text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex space-x-4">
              <Button
                onClick={handleApplyTemplate}
                disabled={!selectedTemplate || uploadedFiles.length === 0 || applyTemplateMutation.isPending}
                className="flex-1"
                data-testid="button-apply"
              >
                {applyTemplateMutation.isPending ? 'Processing...' : 'Apply Template'}
              </Button>
              
              {userTier === 'pro' && (
                <Badge className="px-3 py-2">
                  4K Export Enabled
                </Badge>
              )}
            </div>

            {jobStatus?.data && applyTemplateMutation.isSuccess && jobStatus.data.status !== 'completed' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing Progress</span>
                  <span>{jobStatus.data.progress}%</span>
                </div>
                <Progress value={jobStatus.data.progress} />
                <p className="text-sm text-gray-500">
                  Creating your viral video... This may take a few minutes.
                </p>
              </div>
            )}

            {jobStatus?.data?.status === 'completed' && applyTemplateMutation.isSuccess && (
              <Card className="bg-green-50 dark:bg-green-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-200">
                        🎉 Your viral video is ready!
                      </h4>
                      <p className="text-sm text-green-600 dark:text-green-300">
                        Quality: {userTier === 'pro' ? '4K Ultra HD' : 'HD 720p'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" data-testid="button-download">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Pro Features */}
        {userTier === 'free' && (
          <Card className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold">Upgrade to SkifyMagicAI Pro</h3>
                <p className="text-purple-100">
                  Unlock 4K exports, unlimited templates, and premium AI models
                </p>
                <div className="flex justify-center space-x-8 text-sm">
                  <div>✅ 4K Ultra HD Export</div>
                  <div>✅ No Watermark</div>
                  <div>✅ Priority Processing</div>
                  <div>✅ Premium Templates</div>
                </div>
                <Button 
                  onClick={handleUpgradeToPro} 
                  variant="secondary" 
                  size="lg"
                  data-testid="button-upgrade"
                >
                  Upgrade for ₹29.99/month
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  );
}