import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Dashboard } from './pages/Dashboard.js';
import { MobileApp } from './pages/MobileApp.js';
import { EndToEndFlow } from './components/viral/EndToEndFlow.js';
import SkifyMagic from './pages/SkifyMagic.js';
import { useAuth } from './hooks/useAuth.js';
import { Loader2 } from 'lucide-react';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function App() {
  const { isLoading, checkAuth } = useAuth();

  useEffect(() => {
    // Check authentication status on app load
    checkAuth();
  }, [checkAuth]);

  // Detect if mobile device
  const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading Skify...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Routes>
            <Route path="/" element={<SkifyMagic />} />
            <Route path="/magic" element={<SkifyMagic />} />
            <Route path="/mobile" element={<MobileApp />} />
            <Route path="/desktop" element={<Dashboard />} />
            <Route path="/viral" element={<EndToEndFlow />} />
            <Route path="*" element={<SkifyMagic />} />
          </Routes>
          <Toaster />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}