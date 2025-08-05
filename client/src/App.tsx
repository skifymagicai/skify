import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/use-language";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Gallery from "@/pages/gallery";
import Analysis from "@/pages/analysis";
import TemplatePreview from "@/pages/template-preview";
import UploadApply from "@/pages/upload-apply";
import ComparisonExport from "@/pages/comparison-export";
import AudioMatching from "@/pages/audio-matching";
import LyricalAnalysis from "@/pages/lyrical-analysis";
import LinkFetch from "@/pages/link-fetch";
import AIWorkflow from "@/pages/ai-workflow";
import FloatingNavigation from "@/components/layout/floating-navigation";

function Router() {
  return (
    <div className="min-h-screen bg-dark text-white">
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/analysis" component={Analysis} />
        <Route path="/template-preview" component={TemplatePreview} />
        <Route path="/upload-apply" component={UploadApply} />
        <Route path="/comparison-export" component={ComparisonExport} />
        <Route path="/audio-matching" component={AudioMatching} />
        <Route path="/lyrical-analysis" component={LyricalAnalysis} />
        <Route path="/link-fetch" component={LinkFetch} />
        <Route path="/ai-workflow" component={AIWorkflow} />
        <Route component={NotFound} />
      </Switch>
      <FloatingNavigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
