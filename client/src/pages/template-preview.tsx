import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import Header from "@/components/layout/header";
import { useLocation } from "wouter";
import { 
  Play, 
  Palette, 
  ArrowRightLeft, 
  Sparkles, 
  Clock,
  Edit,
  Download
} from "lucide-react";

const COLOR_SWATCHES = [
  { name: "Primary", color: "#3B82F6", hex: "#3B82F6" },
  { name: "Secondary", color: "#8B5CF6", hex: "#8B5CF6" },
  { name: "Accent", color: "#F59E0B", hex: "#F59E0B" },
  { name: "Background", color: "#1F2937", hex: "#1F2937" },
];

const TRANSITIONS = [
  { name: "Fade In/Out", duration: "0.5s", timing: "0:00, 0:15, 0:30" },
  { name: "Quick Cut", duration: "0.1s", timing: "0:05, 0:10, 0:25" },
  { name: "Zoom Transition", duration: "1.2s", timing: "0:20" },
];

const EFFECTS = [
  { name: "Film Grain", intensity: "Medium", coverage: "Full video" },
  { name: "Glow Effect", intensity: "Low", coverage: "Text overlay" },
  { name: "Color Boost", intensity: "High", coverage: "Full video" },
];

export default function TemplatePreview() {
  const [, setLocation] = useLocation();
  const [templateName, setTemplateName] = useState("Cinematic Noir");
  const [description, setDescription] = useState("Dark, moody color grading with smooth transitions and professional effects");
  const [isPublic, setIsPublic] = useState(false);
  const [activeTab, setActiveTab] = useState("color");

  const handleSaveTemplate = () => {
    setLocation("/comparison-export");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Template Preview</h1>
          <p className="text-gray-600">Customize and save your video style template</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Video Preview & Template Info */}
          <div className="space-y-6">
            {/* Video Preview */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Play className="h-5 w-5 text-blue-600" />
                  <span>Template Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden mb-4">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                      <Play className="h-8 w-8 text-white ml-1" />
                    </button>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white px-2 py-1 rounded text-sm">
                    Preview Mode
                  </div>
                </div>
                <Button 
                  className="w-full btn-primary"
                  onClick={handleSaveTemplate}
                  data-testid="save-template-button"
                >
                  Save Template
                </Button>
              </CardContent>
            </Card>

            {/* Template Information */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Template Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name
                  </label>
                  <Input 
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-full"
                    data-testid="template-name-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full"
                    rows={3}
                    data-testid="template-description-input"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Make template public
                  </label>
                  <Switch 
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                    data-testid="public-template-switch"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tabbed Interface */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Template Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 bg-gray-100 rounded-lg p-1">
                  <TabsTrigger 
                    value="color" 
                    className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                    data-testid="tab-color"
                  >
                    <Palette className="h-4 w-4" />
                    <span className="hidden sm:inline">Color</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="transitions"
                    className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                    data-testid="tab-transitions"
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Transitions</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="effects"
                    className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                    data-testid="tab-effects"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">Effects</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="timeline"
                    className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                    data-testid="tab-timeline"
                  >
                    <Clock className="h-4 w-4" />
                    <span className="hidden sm:inline">Timeline</span>
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-4">
                  <TabsContent value="color" className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Color Palette</h3>
                    {COLOR_SWATCHES.map((swatch, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-8 h-8 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: swatch.color }}
                          />
                          <div>
                            <p className="font-medium text-gray-900">{swatch.name}</p>
                            <p className="text-sm text-gray-500">{swatch.hex}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="text-blue-600 border-blue-600">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="transitions" className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Transition Effects</h3>
                    {TRANSITIONS.map((transition, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">{transition.name}</p>
                          <Button size="sm" variant="outline" className="text-blue-600 border-blue-600">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Duration: {transition.duration}</p>
                          <p>Timing: {transition.timing}</p>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="effects" className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Visual Effects</h3>
                    {EFFECTS.map((effect, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">{effect.name}</p>
                          <Button size="sm" variant="outline" className="text-blue-600 border-blue-600">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Intensity: {effect.intensity}</p>
                          <p>Coverage: {effect.coverage}</p>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="timeline" className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Timeline Settings</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">0:30</p>
                          <p className="text-sm text-gray-600">Duration</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">8</p>
                          <p className="text-sm text-gray-600">Effects</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-600">5</p>
                          <p className="text-sm text-gray-600">Transitions</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}