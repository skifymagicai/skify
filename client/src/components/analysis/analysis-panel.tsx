import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AnalysisComponent {
  id: string;
  name: string;
  icon: string;
  status: "pending" | "processing" | "complete" | "error";
  progress?: number;
  details?: string[];
}

interface AnalysisPanelProps {
  components: AnalysisComponent[];
  overallProgress: number;
  currentStage?: string;
}

export default function AnalysisPanel({ components, overallProgress, currentStage }: AnalysisPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete": return "text-green-400";
      case "processing": return "text-primary";
      case "error": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete": return "fas fa-check-circle";
      case "processing": return "fas fa-cog fa-spin";
      case "error": return "fas fa-exclamation-circle";
      default: return "fas fa-clock";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "complete": return "✓ Detected";
      case "processing": return "⏳ Processing";
      case "error": return "⚠ Error";
      default: return "⏳ Queue";
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Analysis Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-primary text-sm font-medium" data-testid="analysis-progress-percent">
              {overallProgress}%
            </span>
          </div>
          <Progress value={overallProgress} className="mb-3" data-testid="analysis-progress-bar" />
          {currentStage && (
            <div className="flex items-center text-sm text-muted-foreground">
              <i className="fas fa-cog fa-spin text-primary mr-2"></i>
              <span data-testid="analysis-current-stage">{currentStage}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">Extracted Components</h3>
        
        {components.map((component) => (
          <Card key={component.id} className="bg-card" data-testid={`analysis-component-${component.id}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <i className={`${component.icon} text-accent mr-2`}></i>
                  <span className="font-medium">{component.name}</span>
                </div>
                <span className={`text-sm ${getStatusColor(component.status)}`} data-testid={`component-status-${component.id}`}>
                  {getStatusText(component.status)}
                </span>
              </div>
              
              {component.status === "processing" && component.progress !== undefined && (
                <Progress value={component.progress} className="mb-2" />
              )}
              
              {component.details && component.status === "complete" && (
                <div className="space-y-1">
                  {component.details.map((detail, index) => (
                    <div key={index} className="text-sm text-muted-foreground" data-testid={`component-detail-${component.id}-${index}`}>
                      {detail}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
