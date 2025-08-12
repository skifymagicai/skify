// TypeScript declaration for SkifyAIProcessor JS class
declare module "../ai-processor.js" {
  export class SkifyAIProcessor {
    constructor();
    processVideo(videoUrl: string, options?: { filename?: string; size?: number; mime?: string }): Promise<any>;
  }
}
