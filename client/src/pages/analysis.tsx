import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VideoPlayer from "@/components/video/video-player";
import AnalysisPanel from "@/components/analysis/analysis-panel";

const MOCK_ANALYSIS_COMPONENTS = [
  {
    id: "effects",
    name: "Effects",
    icon: "fas fa-star",
    status: "complete" as const,
    details: ["Glow Effect", "Blur Effect", "Overlay Effect"],
  },
  {
    id: "templates",
    name: "Templates",
    icon: "fas fa-layer-group",
    status: "complete" as const,
    details: ["Layout: Portrait 9:16", "Composition: Center Focus"],
  },
  {
    id: "transitions",
    name: "Transitions",
    icon: "fas fa-exchange-alt",
    status: "complete" as const,
    details: ["0:05 - Fade In (0.5s)", "0:15 - Quick Cut (0.1s)", "0:25 - Zoom (1.2s)"],
  },
  {
    id: "color-grading",
    name: "Color Grading",
    icon: "fas fa-palette",
    status: "processing" as const,
    progress: 78,
  },
  {
    id: "camera-motion",
    name: "Camera Motion",
    icon: "fas fa-video",
    status: "pending" as const,
  },
  {
    id: "ai-edits",
    name: "AI Edits",
    icon: "fas fa-robot",
    status: "pending" as const,
  },
];

export default function Analysis() {
  const [, setLocation] = useLocation();
  const [overallProgress, setOverallProgress] = useState(45);
  const [currentStage, setCurrentStage] = useState("Processing color grading...");
  const [components, setComponents] = useState(MOCK_ANALYSIS_COMPONENTS);

  useEffect(() => {
    // Simulate analysis progress
    const interval = setInterval(() => {
      setOverallProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setCurrentStage("Analysis complete!");
          return 100;
        }
        return prev + 2;
      });
    }, 200);

    // Update component statuses based on progress
    const statusInterval = setInterval(() => {
      setComponents((prev) => {
        const updated = [...prev];
        if (overallProgress >= 60) {
          const colorGradingIndex = updated.findIndex(c => c.id === "color-grading");
          if (colorGradingIndex !== -1 && updated[colorGradingIndex].status !== "complete") {
            updated[colorGradingIndex] = {
              id: updated[colorGradingIndex].id,
              name: updated[colorGradingIndex].name,
              icon: updated[colorGradingIndex].icon,
              status: "complete" as const,
              details: ["Temperature: Warm (+15)", "Contrast: Enhanced (+20)"],
            };
          }
        }
        if (overallProgress >= 80) {
          const cameraMotionIndex = updated.findIndex(c => c.id === "camera-motion");
          if (cameraMotionIndex !== -1 && updated[cameraMotionIndex].status === "pending") {
            updated[cameraMotionIndex] = {
              id: updated[cameraMotionIndex].id,
              name: updated[cameraMotionIndex].name,
              icon: updated[cameraMotionIndex].icon,
              status: "processing" as const,
              progress: 60,
            };
          }
        }
        return updated;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(statusInterval);
    };
  }, [overallProgress]);

  const handleBack = () => {
    setLocation("/");
  };

  const handleGenerateTemplate = () => {
    setLocation("/template-preview");
  };

  return (
    <div className="min-h-screen bg-dark text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-muted-foreground hover:text-white"
            data-testid="back-button"
          >
            <i className="fas fa-arrow-left mr-2"></i>Back
          </Button>
          <h2 className="text-xl font-bold" data-testid="page-title">AI Analysis</h2>
          <div className="w-16"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Video Preview */}
          <div className="space-y-4">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Uploaded Video</CardTitle>
              </CardHeader>
              <CardContent>
                <VideoPlayer
                  thumbnail="https://images.unsplash.com/photo-1611162616475-46b635cb6868?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800"
                  title="Sample uploaded video for AI analysis"
                  showControls={true}
                />
              </CardContent>
            </Card>
          </div>

          {/* Analysis Results */}
          <div className="space-y-4">
            <AnalysisPanel
              components={components}
              overallProgress={overallProgress}
              currentStage={currentStage}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2">
          <Button
            size="lg"
            onClick={handleGenerateTemplate}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-300 hover:scale-105"
            data-testid="generate-template-button"
          >
            <i className="fas fa-magic mr-2"></i>Generate Template
          </Button>
        </div>
      </div>
    </div>
  );
}
