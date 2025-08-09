import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '../../hooks/useAuth.js';
import { User, Settings, Crown, LogOut, Shield } from 'lucide-react';

export function ProfileSettings() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });

  const handleSave = async () => {
    // In a real app, this would update the profile
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Account Status</Label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={user?.tier === 'pro' ? 'default' : 'secondary'}>
                  {user?.tier === 'pro' ? (
                    <>
                      <Crown className="w-3 h-3 mr-1" />
                      Pro
                    </>
                  ) : (
                    'Free'
                  )}
                </Badge>
                {user?.isActive && (
                  <Badge variant="outline" className="text-green-600">
                    Active
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave}>Save Changes</Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ username: user?.username || '', email: user?.email || '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Username</Label>
                  <p className="font-medium">{user?.username}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <Label>Member Since</Label>
                  <p className="font-medium">
                    {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label>Last Login</Label>
                  <p className="font-medium">
                    {user?.lastLoginAt ? formatDate(user.lastLoginAt) : 'N/A'}
                  </p>
                </div>
              </div>
              <Button onClick={() => setIsEditing(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Upload Quota</Label>
              <div className="mt-1">
                <div className="flex justify-between text-sm mb-1">
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
                <p className="text-xs text-gray-500 mt-1">
                  Resets: {user?.resetDate ? formatDate(user.resetDate) : 'N/A'}
                </p>
              </div>
            </div>
            <div>
              <Label>Subscription</Label>
              <p className="font-medium capitalize">{user?.tier} Plan</p>
              {user?.subscriptionId && (
                <p className="text-xs text-gray-500">ID: {user.subscriptionId}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Account Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Need help? Contact our support team at support@skifymagicai.gmail.com
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}