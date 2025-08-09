import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

// Mock user data for development
const mockUser = {
  id: '1',
  email: 'user@skify.app',
  username: 'SkifyUser',
  tier: 'pro', // 'free' or 'pro'
  avatar: '/api/placeholder/32/32',
  quotas: {
    videosProcessed: 5,
    videosLimit: 50,
    templatesCreated: 3,
    templatesLimit: 100
  },
  preferences: {
    autoSave: true,
    notifications: true,
    theme: 'dark'
  }
};

export function useAuth() {
  const [user, setUser] = useState(mockUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const { toast } = useToast();

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate auth check delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In development, always authenticated
      setIsAuthenticated(true);
      setUser(mockUser);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      // Simulate login API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsAuthenticated(true);
      setUser(mockUser);
      
      toast({
        title: "Welcome to Skify!",
        description: "You've successfully logged in."
      });

      return { success: true };
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate logout API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsAuthenticated(false);
      setUser(null);
      
      toast({
        title: "Logged out",
        description: "You've been successfully logged out."
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const register = useCallback(async (email, password, username) => {
    setIsLoading(true);
    try {
      // Simulate registration API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newUser = {
        ...mockUser,
        email,
        username,
        tier: 'free' // New users start with free tier
      };

      setIsAuthenticated(true);
      setUser(newUser);
      
      toast({
        title: "Account created!",
        description: "Welcome to Skify! Your account has been created successfully."
      });

      return { success: true };
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please try again later.",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateProfile = useCallback(async (updates) => {
    setIsLoading(true);
    try {
      // Simulate profile update API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUser(prev => ({ ...prev, ...updates }));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });

      return { success: true };
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Please try again later.",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const upgradeToPro = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate upgrade API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setUser(prev => ({
        ...prev,
        tier: 'pro',
        quotas: {
          ...prev.quotas,
          videosLimit: 1000,
          templatesLimit: 500
        }
      }));
      
      toast({
        title: "Upgraded to Pro!",
        description: "You now have access to 4K exports and unlimited processing."
      });

      return { success: true };
    } catch (error) {
      toast({
        title: "Upgrade failed",
        description: "Please try again later.",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    user,
    isAuthenticated,
    isLoading,
    checkAuth,
    login,
    logout,
    register,
    updateProfile,
    upgradeToPro
  };
}