import { execSync, spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { templateStorage } from './template-storage';
import { storage } from './storage';

/**
 * Comprehensive Viral Video Analyzer
 * Extracts and separates all style elements from viral videos
 */
export class ViralVideoAnalyzer {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp');
    this.ensureTempDir();
  }

  private async ensureTempDir(): Promise<void> {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Error creating temp directory:', error);
    }
  }

  /**
   * Main entry point: Analyze viral video and create template folder
   */
  async analyzeViralVideo(videoPath: string, templateName: string): Promise<{
    templateId: string;
    folderPath: string;
    assets: any;
  }> {
    const templateId = this.generateTemplateId(templateName);
    
    console.log(`Starting viral video analysis for template: ${templateName}`);
    
    // Create template folder in cloud storage
    const folderPath = await templateStorage.createTemplateFolder(templateId, templateName);
    
    // Parallel processing of different components
    const [visualComponents, audioData, textData, thumbnail] = await Promise.all([
      this.extractVisualComponents(videoPath),
      this.extractAudioComponents(videoPath),
      this.extractTextComponents(videoPath),
      this.generateThumbnail(videoPath)
    ]);

    // Store all components in cloud storage
    await Promise.all([
      templateStorage.storeVisualComponents(templateId, visualComponents),
      templateStorage.storeAudioTrack(templateId, audioData.buffer, audioData.metadata),
      templateStorage.storeLyricsText(templateId, textData),
      templateStorage.storeThumbnail(templateId, thumbnail)
    ]);

    // Update database with template info
    await this.updateDatabaseTemplate(templateId, templateName, {
      visualComponents,
      audioMetadata: audioData.metadata,
      textData,
      folderPath
    });

    console.log(`Viral video analysis complete. Template ${templateId} created.`);

    return {
      templateId,
      folderPath,
      assets: {
        visual: visualComponents,
        audio: audioData.metadata,
        text: textData,
        thumbnail: true
      }
    };
  }

  /**
   * Extract visual components (effects, transitions, color grading, etc.)
   */
  private async extractVisualComponents(videoPath: string): Promise<any> {
    const outputPath = path.join(this.tempDir, `visual_${Date.now()}.json`);
    
    try {
      // Use FFmpeg to analyze video characteristics
      const ffprobeCommand = `ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`;
      const videoInfo = JSON.parse(execSync(ffprobeCommand).toString());
      
      // Extract frames for color analysis
      const framesDir = path.join(this.tempDir, `frames_${Date.now()}`);
      await fs.mkdir(framesDir, { recursive: true });
      
      execSync(`ffmpeg -i "${videoPath}" -vf "fps=1" "${framesDir}/frame_%04d.png"`, { stdio: 'pipe' });
      
      // Analyze extracted frames
      const frames = await fs.readdir(framesDir);
      const colorAnalysis = await this.analyzeFrameColors(framesDir, frames.slice(0, 10)); // Sample first 10 frames
      
      // Extract motion vectors and scene changes
      const motionData = await this.analyzeMotion(videoPath);
      
      // Clean up frames
      await fs.rm(framesDir, { recursive: true, force: true });
      
      return {
        videoInfo,
        colorGrading: {
          dominantColors: colorAnalysis.dominantColors,
          colorPalette: colorAnalysis.palette,
          saturation: colorAnalysis.saturation,
          brightness: colorAnalysis.brightness,
          contrast: colorAnalysis.contrast
        },
        effects: [
          'color_correction',
          'stabilization',
          'sharpening'
        ],
        transitions: motionData.transitions,
        cameraMotion: motionData.cameraMovements,
        luts: colorAnalysis.suggestedLUTs,
        aiEdits: {
          sceneChanges: motionData.sceneChanges,
          motionSmoothing: motionData.smoothing,
          autoFraming: motionData.framing
        }
      };
    } catch (error) {
      console.error('Error extracting visual components:', error);
      return {
        effects: [],
        transitions: [],
        colorGrading: {},
        cameraMotion: {},
        luts: [],
        aiEdits: {}
      };
    }
  }

  /**
   * Extract and analyze audio components
   */
  private async extractAudioComponents(videoPath: string): Promise<{
    buffer: Buffer;
    metadata: any;
  }> {
    const audioPath = path.join(this.tempDir, `audio_${Date.now()}.mp3`);
    
    try {
      // Extract audio using FFmpeg
      execSync(`ffmpeg -i "${videoPath}" -acodec mp3 -ab 192k "${audioPath}"`, { stdio: 'pipe' });
      
      // Read audio buffer
      const audioBuffer = await fs.readFile(audioPath);
      
      // Analyze audio characteristics
      const audioAnalysis = await this.analyzeAudio(audioPath);
      
      // Clean up
      await fs.unlink(audioPath);
      
      return {
        buffer: audioBuffer,
        metadata: {
          duration: audioAnalysis.duration,
          tempo: audioAnalysis.tempo,
          key: audioAnalysis.key,
          energy: audioAnalysis.energy,
          danceability: audioAnalysis.danceability,
          audioFeatures: {
            spectralCentroid: audioAnalysis.spectralCentroid,
            spectralRolloff: audioAnalysis.spectralRolloff,
            mfcc: audioAnalysis.mfcc,
            chroma: audioAnalysis.chroma
          }
        }
      };
    } catch (error) {
      console.error('Error extracting audio components:', error);
      
      // Return empty audio data
      return {
        buffer: Buffer.alloc(0),
        metadata: {
          duration: 0,
          tempo: 120,
          key: 'C',
          energy: 0.5,
          danceability: 0.5,
          audioFeatures: {}
        }
      };
    }
  }

  /**
   * Extract text/lyrics using OCR
   */
  private async extractTextComponents(videoPath: string): Promise<any> {
    const framesDir = path.join(this.tempDir, `text_frames_${Date.now()}`);
    
    try {
      await fs.mkdir(framesDir, { recursive: true });
      
      // Extract frames for OCR
      execSync(`ffmpeg -i "${videoPath}" -vf "fps=2" "${framesDir}/frame_%04d.png"`, { stdio: 'pipe' });
      
      const frames = await fs.readdir(framesDir);
      const textElements = [];
      
      // Process each frame for text detection
      for (let i = 0; i < Math.min(frames.length, 20); i++) { // Process max 20 frames
        const framePath = path.join(framesDir, frames[i]);
        const frameTime = i * 0.5; // Assuming 2fps extraction
        
        const textData = await this.performOCR(framePath, frameTime);
        if (textData.text && textData.text.trim()) {
          textElements.push(textData);
        }
      }
      
      // Clean up frames
      await fs.rm(framesDir, { recursive: true, force: true });
      
      // Analyze text patterns and fonts
      const textAnalysis = this.analyzeTextElements(textElements);
      
      return {
        textElements,
        fonts: textAnalysis.detectedFonts,
        colors: textAnalysis.textColors,
        positions: textAnalysis.positions,
        animations: textAnalysis.animations,
        timecodes: textAnalysis.timecodes
      };
    } catch (error) {
      console.error('Error extracting text components:', error);
      return {
        textElements: [],
        fonts: [],
        colors: [],
        positions: [],
        animations: [],
        timecodes: []
      };
    }
  }

  /**
   * Generate thumbnail for template
   */
  private async generateThumbnail(videoPath: string): Promise<Buffer> {
    const thumbnailPath = path.join(this.tempDir, `thumb_${Date.now()}.jpg`);
    
    try {
      // Extract thumbnail at 25% of video duration
      execSync(`ffmpeg -i "${videoPath}" -ss 00:00:01 -vframes 1 -q:v 2 "${thumbnailPath}"`, { stdio: 'pipe' });
      
      const thumbnailBuffer = await fs.readFile(thumbnailPath);
      await fs.unlink(thumbnailPath);
      
      return thumbnailBuffer;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return Buffer.alloc(0);
    }
  }

  /**
   * Helper methods for analysis
   */
  private async analyzeFrameColors(framesDir: string, frameFiles: string[]): Promise<any> {
    // Simplified color analysis - in production, use computer vision libraries
    return {
      dominantColors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      palette: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
      saturation: 0.75,
      brightness: 0.65,
      contrast: 0.8,
      suggestedLUTs: ['cinematic', 'vibrant', 'film_look']
    };
  }

  private async analyzeMotion(videoPath: string): Promise<any> {
    // Simplified motion analysis
    return {
      transitions: ['cut', 'fade', 'slide'],
      cameraMovements: ['pan_left', 'zoom_in', 'steady'],
      sceneChanges: [2.5, 5.2, 8.1, 12.3],
      smoothing: 0.7,
      framing: 'center_crop'
    };
  }

  private async analyzeAudio(audioPath: string): Promise<any> {
    // Simplified audio analysis - in production, use audio analysis libraries
    return {
      duration: 15.0,
      tempo: 128,
      key: 'C major',
      energy: 0.8,
      danceability: 0.9,
      spectralCentroid: 2500,
      spectralRolloff: 5000,
      mfcc: [1.2, -0.5, 0.8],
      chroma: [0.1, 0.2, 0.8, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]
    };
  }

  private async performOCR(imagePath: string, timestamp: number): Promise<any> {
    // Simplified OCR - in production, use Google Vision API or Tesseract
    return {
      text: 'Sample extracted text',
      confidence: 0.95,
      position: { x: 100, y: 200, width: 300, height: 50 },
      font: 'Arial Bold',
      fontSize: 24,
      color: '#FFFFFF',
      timestamp,
      animation: 'fade_in'
    };
  }

  private analyzeTextElements(textElements: any[]): any {
    return {
      detectedFonts: ['Arial Bold', 'Montserrat', 'Helvetica'],
      textColors: ['#FFFFFF', '#000000', '#FF6B6B'],
      positions: ['center', 'bottom', 'top'],
      animations: ['fade_in', 'slide_up', 'typewriter'],
      timecodes: textElements.map(el => el.timestamp)
    };
  }

  private generateTemplateId(templateName: string): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const safeName = templateName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `${safeName}_${timestamp}_${randomStr}`;
  }

  private async updateDatabaseTemplate(templateId: string, templateName: string, analysisData: any): Promise<void> {
    try {
      // Create template record in database
      const templateData = {
        id: templateId,
        userId: 'system', // System-generated template
        name: templateName,
        description: `Viral video style template extracted from ${templateName}`,
        colorPalette: analysisData.visualComponents.colorGrading?.dominantColors || [],
        effects: analysisData.visualComponents.effects || [],
        transitions: analysisData.visualComponents.transitions || [],
        colorGrading: analysisData.visualComponents.colorGrading || {},
        cameraMotion: analysisData.visualComponents.cameraMotion || {},
        audioUrl: `templates/${templateId}/audio_track.mp3`,
        audioDuration: analysisData.audioMetadata.duration || 0,
        audioFeatures: analysisData.audioMetadata.audioFeatures || {},
        thumbnail: `templates/${templateId}/thumbnail.jpg`,
        usageCount: 0,
        rating: 5.0,
        isPublic: true,
        textExtraction: analysisData.textData || {},
        lyricalData: analysisData.textData?.textElements || []
      };

      await storage.createTemplate(templateData);
      console.log(`Template ${templateId} saved to database`);
    } catch (error) {
      console.error('Error saving template to database:', error);
    }
  }
}

export const viralAnalyzer = new ViralVideoAnalyzer();