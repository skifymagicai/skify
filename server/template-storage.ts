// import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs/promises';
import { execSync } from 'child_process';

// Template Storage Manager for cloud-based template assets
export class TemplateStorageManager {
  private storage: any; // Storage interface placeholder
  private bucketName: string;

  constructor() {
    // Initialize storage - simplified for development
    this.storage = null; // Will implement when cloud storage is configured
    this.bucketName = process.env.STORAGE_BUCKET_NAME || 'skify-templates';
  }

  /**
   * Create a unique template folder from analyzed viral video
   */
  async createTemplateFolder(templateId: string, templateName: string): Promise<string> {
    const folderPath = `templates/${templateId}/`;
    
    // Create template metadata
    const metadata = {
      id: templateId,
      name: templateName,
      createdAt: new Date().toISOString(),
      version: "1.0",
      type: "viral_analysis"
    };

    // Upload metadata file
    await this.uploadFile(
      `${folderPath}metadata.json`,
      JSON.stringify(metadata, null, 2),
      'application/json'
    );

    return folderPath;
  }

  /**
   * Store separated visual components
   */
  async storeVisualComponents(templateId: string, visualData: any): Promise<string> {
    const filePath = `templates/${templateId}/visual_components.json`;
    
    const visualComponents = {
      effects: visualData.effects || [],
      transitions: visualData.transitions || [],
      colorGrading: visualData.colorGrading || {},
      cameraMotion: visualData.cameraMotion || {},
      luts: visualData.luts || [],
      aiEdits: visualData.aiEdits || [],
      extractedAt: new Date().toISOString()
    };

    await this.uploadFile(
      filePath,
      JSON.stringify(visualComponents, null, 2),
      'application/json'
    );

    return filePath;
  }

  /**
   * Store separated audio track
   */
  async storeAudioTrack(templateId: string, audioBuffer: Buffer, audioMetadata: any): Promise<string> {
    const audioPath = `templates/${templateId}/audio_track.mp3`;
    const metadataPath = `templates/${templateId}/audio_metadata.json`;

    // Upload audio file
    await this.uploadBuffer(audioPath, audioBuffer, 'audio/mpeg');

    // Upload audio metadata
    const audioData = {
      duration: audioMetadata.duration,
      tempo: audioMetadata.tempo,
      key: audioMetadata.key,
      energy: audioMetadata.energy,
      danceability: audioMetadata.danceability,
      audioFeatures: audioMetadata.audioFeatures || {},
      extractedAt: new Date().toISOString()
    };

    await this.uploadFile(
      metadataPath,
      JSON.stringify(audioData, null, 2),
      'application/json'
    );

    return audioPath;
  }

  /**
   * Store OCR'd lyrics/text with formatting
   */
  async storeLyricsText(templateId: string, textData: any): Promise<string> {
    const textPath = `templates/${templateId}/lyrics_text.json`;

    const lyricsData = {
      textElements: textData.textElements || [],
      fonts: textData.fonts || [],
      colors: textData.colors || [],
      positions: textData.positions || [],
      animations: textData.animations || [],
      timecodes: textData.timecodes || [],
      extractedAt: new Date().toISOString()
    };

    await this.uploadFile(
      textPath,
      JSON.stringify(lyricsData, null, 2),
      'application/json'
    );

    return textPath;
  }

  /**
   * Store thumbnail/preview assets
   */
  async storeThumbnail(templateId: string, thumbnailBuffer: Buffer): Promise<string> {
    const thumbnailPath = `templates/${templateId}/thumbnail.jpg`;
    
    await this.uploadBuffer(thumbnailPath, thumbnailBuffer, 'image/jpeg');
    
    return thumbnailPath;
  }

  /**
   * Get template folder contents (local storage fallback)
   */
  async getTemplateAssets(templateId: string): Promise<any> {
    const folderPath = path.join(process.cwd(), 'storage', 'templates', templateId);
    
    try {
      const assets = {
        metadata: null,
        visualComponents: null,
        audioTrack: null,
        audioMetadata: null,
        lyricsText: null,
        thumbnail: null
      };

      // Check if template folder exists
      try {
        await fs.access(folderPath);
      } catch {
        return null; // Template doesn't exist
      }

      // Read each asset file if it exists
      const files = await fs.readdir(folderPath);
      
      for (const fileName of files) {
        const filePath = path.join(folderPath, fileName);
        
        try {
          if (fileName === 'metadata.json') {
            const content = await fs.readFile(filePath, 'utf-8');
            assets.metadata = JSON.parse(content);
          } else if (fileName === 'visual_components.json') {
            const content = await fs.readFile(filePath, 'utf-8');
            assets.visualComponents = JSON.parse(content);
          } else if (fileName === 'audio_metadata.json') {
            const content = await fs.readFile(filePath, 'utf-8');
            assets.audioMetadata = JSON.parse(content);
          } else if (fileName === 'lyrics_text.json') {
            const content = await fs.readFile(filePath, 'utf-8');
            assets.lyricsText = JSON.parse(content);
          } else if (fileName === 'audio_track.mp3') {
            assets.audioTrack = `/storage/templates/${templateId}/audio_track.mp3`;
          } else if (fileName === 'thumbnail.jpg') {
            assets.thumbnail = `/storage/templates/${templateId}/thumbnail.jpg`;
          }
        } catch (fileError) {
          console.error(`Error reading ${fileName}:`, fileError);
        }
      }

      return assets;
    } catch (error) {
      console.error('Error fetching template assets:', error);
      return null;
    }
  }

  /**
   * List all available templates (local storage fallback)
   */
  async listTemplates(): Promise<any[]> {
    try {
      const templatesDir = path.join(process.cwd(), 'storage', 'templates');
      
      try {
        await fs.access(templatesDir);
      } catch {
        return []; // No templates directory
      }

      const templateFolders = await fs.readdir(templatesDir);
      const templates = [];

      for (const templateId of templateFolders) {
        try {
          const assets = await this.getTemplateAssets(templateId);
          if (assets && assets.metadata) {
            templates.push({
              id: templateId,
              ...assets.metadata,
              thumbnail: assets.thumbnail,
              hasAudio: !!assets.audioTrack,
              hasText: !!assets.lyricsText,
              hasVisuals: !!assets.visualComponents
            });
          }
        } catch (error) {
          console.error(`Error loading template ${templateId}:`, error);
        }
      }

      return templates;
    } catch (error) {
      console.error('Error listing templates:', error);
      return [];
    }
  }

  /**
   * Delete template folder and all assets
   */
  async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      const folderPath = `templates/${templateId}/`;
      const [files] = await this.storage.bucket(this.bucketName).getFiles({
        prefix: folderPath
      });

      for (const file of files) {
        await file.delete();
      }

      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      return false;
    }
  }

  /**
   * Helper method to save file content locally (development fallback)
   */
  private async uploadFile(filePath: string, content: string, mimeType: string): Promise<void> {
    // Local storage fallback for development
    const localPath = path.join(process.cwd(), 'storage', filePath);
    const dir = path.dirname(localPath);
    
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(localPath, content);
  }

  /**
   * Helper method to save buffer content locally (development fallback)
   */
  private async uploadBuffer(filePath: string, buffer: Buffer, mimeType: string): Promise<void> {
    // Local storage fallback for development
    const localPath = path.join(process.cwd(), 'storage', filePath);
    const dir = path.dirname(localPath);
    
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(localPath, buffer);
  }

  /**
   * Get public URL for a template asset (local storage fallback)
   */
  async getAssetUrl(templateId: string, assetName: string): Promise<string> {
    // Return local file URL for development
    return `/storage/templates/${templateId}/${assetName}`;
  }
}

export const templateStorage = new TemplateStorageManager();