import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface VideoPlayerProps {
  src?: string;
  thumbnail?: string;
  title?: string;
  className?: string;
  showControls?: boolean;
  autoPlay?: boolean;
}

export default function VideoPlayer({
  src,
  thumbnail,
  title,
  className = "",
  showControls = true,
  autoPlay = false,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={`video-container bg-black rounded-lg relative overflow-hidden ${className}`}>
      {thumbnail && (
        <img 
          src={thumbnail} 
          alt={title || "Video thumbnail"} 
          className="w-full h-full object-cover"
          data-testid="video-thumbnail"
        />
      )}
      
      <div className="absolute inset-0 flex items-center justify-center">
        <Button
          onClick={togglePlay}
          className="w-16 h-16 bg-primary/80 rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
          data-testid="video-play-button"
        >
          <i className={`fas ${isPlaying ? "fa-pause" : "fa-play"} text-white text-xl ${!isPlaying ? "ml-1" : ""}`}></i>
        </Button>
      </div>

      {showControls && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-black/60 rounded-lg p-2">
            <div className="flex items-center justify-between text-sm mb-2">
              <span data-testid="video-current-time">0:15</span>
              <div className="flex-1 mx-3">
                <Slider
                  value={[progress]}
                  onValueChange={(value) => setProgress(value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                  data-testid="video-progress-slider"
                />
              </div>
              <span data-testid="video-duration">0:45</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="ghost" className="text-white">
                  <i className="fas fa-step-backward"></i>
                </Button>
                <Button size="sm" variant="ghost" className="text-white" onClick={togglePlay}>
                  <i className={`fas ${isPlaying ? "fa-pause" : "fa-play"}`}></i>
                </Button>
                <Button size="sm" variant="ghost" className="text-white">
                  <i className="fas fa-step-forward"></i>
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-volume-up text-white"></i>
                <Slider
                  value={[volume]}
                  onValueChange={(value) => setVolume(value[0])}
                  max={100}
                  step={1}
                  className="w-20"
                  data-testid="video-volume-slider"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
