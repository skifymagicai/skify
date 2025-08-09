import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Zap, Crown, Settings } from 'lucide-react';
import { UploadDropzone } from '../components/ui/upload-dropzone.js';
import { useAuth } from '../hooks/useAuth.js';
import { AuthDialog } from '../components/auth/AuthDialog.js';
import { TemplateGallery } from '../components/templates/TemplateGallery.js';
import { JobsManager } from '../components/jobs/JobsManager.js';
import { PaymentDialog } from '../components/payments/PaymentDialog.js';
import { ProfileSettings } from '../components/profile/ProfileSettings.js';

export function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');

  const handleUploadComplete = (uploadId: string) => {
    console.log('Upload completed:', uploadId);
    // Could show a success toast or redirect
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    // Could show error toast
  };

  const handleUpgrade = () => {
    if (!isAuthenticated) {
      setAuthOpen(true);
    } else {
      setPaymentOpen(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SkifyMagicAI
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Transform your videos into viral content using AI-powered style transfer. 
                Extract styles from trending videos and apply them to your own footage.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Upload & Analyze</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Upload any viral video and our AI extracts its style components
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <Zap className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Apply Templates</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Apply extracted styles to your own videos with one click
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Export & Share</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Download your transformed videos ready for social media
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Button 
                size="lg" 
                onClick={() => setAuthOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                data-testid="button-get-started"
              >
                Get Started Free
              </Button>
              <p className="text-sm text-gray-500">
                Free tier: 5 uploads per day • Pro: Unlimited + 4K exports
              </p>
            </div>
          </div>
        </div>

        <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SkifyMagicAI
            </h1>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant={user?.tier === 'pro' ? 'default' : 'secondary'}>
                  {user?.tier === 'pro' ? '👑 Pro' : '🆓 Free'}
                </Badge>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.username}
                </span>
              </div>
              
              {user?.tier !== 'pro' && (
                <Button 
                  onClick={handleUpgrade}
                  size="sm"
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  data-testid="button-upgrade"
                >
                  <Crown className="w-4 h-4 mr-1" />
                  Upgrade
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload" data-testid="tab-upload">Upload</TabsTrigger>
            <TabsTrigger value="templates" data-testid="tab-templates">My Templates</TabsTrigger>
            <TabsTrigger value="jobs" data-testid="tab-jobs">My Renders</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Video for Analysis</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload a viral video to extract its style components and create a template.
                </p>
              </CardHeader>
              <CardContent>
                <UploadDropzone
                  onUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                />
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Quota</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used this period</span>
                    <span>{user?.uploadsUsed || 0} / {user?.uploadLimit || 5}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${((user?.uploadsUsed || 0) / (user?.uploadLimit || 5)) * 100}%` 
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Resets daily • Upgrade to Pro for unlimited uploads
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <TemplateGallery showUserTemplates />
          </TabsContent>

          <TabsContent value="jobs">
            <JobsManager />
          </TabsContent>

          <TabsContent value="settings">
            <ProfileSettings />
          </TabsContent>
        </Tabs>
      </main>

      <PaymentDialog open={paymentOpen} onOpenChange={setPaymentOpen} />
    </div>
  );
}