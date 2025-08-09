import React from 'react';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Loader2, CheckCircle, AlertCircle, Zap, Eye, Music, Type, Palette } from 'lucide-react';

interface ProcessingStage {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  estimatedTime?: string;
}

interface ProcessingStatusProps {
  stages: ProcessingStage[];
  overallProgress: number;
  currentStage?: string;
  onCancel?: () => void;
}

export function ProcessingStatus({ 
  stages, 
  overallProgress, 
  currentStage,
  onCancel 
}: ProcessingStatusProps) {
  const getStatusIcon = (status: ProcessingStage['status']) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusBadge = (status: ProcessingStage['status']) => {
    switch (status) {
      case 'processing':
        return <Badge variant="default" className="bg-blue-100 text-blue-700">Processing</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-700">Done</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Waiting</Badge>;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6" data-testid="processing-status">
      {/* Overall Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto">
              <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-2">Transforming Your Video</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI is extracting and applying viral styles
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Overall Progress</span>
                <span className="font-medium">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="w-full" data-testid="progress-overall" />
            </div>

            {overallProgress < 100 && onCancel && (
              <button
                onClick={onCancel}
                className="text-sm text-red-600 hover:text-red-700 underline"
                data-testid="button-cancel"
              >
                Cancel Processing
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Processing Stages */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Processing Stages</h3>
        
        {stages.map((stage) => (
          <Card
            key={stage.id}
            className={`transition-all duration-300 ${
              currentStage === stage.id 
                ? 'ring-2 ring-purple-500 ring-opacity-50 shadow-lg' 
                : 'hover:shadow-md'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {stage.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium truncate">{stage.name}</h4>
                    {getStatusBadge(stage.status)}
                  </div>
                  
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {stage.description}
                  </p>

                  {stage.status === 'processing' && (
                    <div className="space-y-1">
                      <Progress value={stage.progress} className="h-1" />
                      {stage.estimatedTime && (
                        <p className="text-xs text-gray-500">
                          Est. {stage.estimatedTime} remaining
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {getStatusIcon(stage.status)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Processing Tips */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Eye className="w-4 h-4 text-purple-600" />
            Processing Tips
          </h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Keep the app open for best performance</li>
            <li>• Processing time depends on video length and complexity</li>
            <li>• You'll get a notification when complete</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// Default processing stages for viral video transformation
export const defaultProcessingStages: ProcessingStage[] = [
  {
    id: 'extraction',
    name: 'Style Extraction',
    icon: <Eye className="w-5 h-5 text-purple-600" />,
    description: 'Analyzing viral video for timing, effects, and style',
    progress: 0,
    status: 'pending',
    estimatedTime: '30s'
  },
  {
    id: 'audio',
    name: 'Audio Analysis',
    icon: <Music className="w-5 h-5 text-blue-600" />,
    description: 'Extracting BPM, beat mapping, and music cues',
    progress: 0,
    status: 'pending',
    estimatedTime: '20s'
  },
  {
    id: 'text',
    name: 'Text & Overlays',
    icon: <Type className="w-5 h-5 text-green-600" />,
    description: 'Detecting text style, position, and animations',
    progress: 0,
    status: 'pending',
    estimatedTime: '15s'
  },
  {
    id: 'visual',
    name: 'Visual Effects',
    icon: <Palette className="w-5 h-5 text-orange-600" />,
    description: 'Analyzing color grading, transitions, and filters',
    progress: 0,
    status: 'pending',
    estimatedTime: '25s'
  },
  {
    id: 'application',
    name: 'Applying Style',
    icon: <Zap className="w-5 h-5 text-yellow-600" />,
    description: 'Transforming your media with extracted style',
    progress: 0,
    status: 'pending',
    estimatedTime: '45s'
  }
];