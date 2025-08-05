// Video Downloader Service for Social Media Platforms
import ytdl from 'ytdl-core';
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

export interface DownloadResult {
  success: boolean;
  videoPath?: string;
  videoUrl?: string;
  title?: string;
  duration?: number;
  thumbnail?: string;
  error?: string;
}

export class VideoDownloaderService {
  private uploadDir = './uploads/downloaded';

  constructor() {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  // Main download method that detects platform and routes to appropriate downloader
  async downloadVideo(url: string): Promise<DownloadResult> {
    try {
      if (this.isYouTubeUrl(url)) {
        return await this.downloadYouTube(url);
      } else if (this.isInstagramUrl(url)) {
        return await this.downloadInstagram(url);
      } else if (this.isTikTokUrl(url)) {
        return await this.downloadTikTok(url);
      } else {
        return {
          success: false,
          error: 'Unsupported platform. Please use Instagram, TikTok, or YouTube URLs.'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to download video'
      };
    }
  }

  // YouTube/YouTube Shorts downloader using ytdl-core
  private async downloadYouTube(url: string): Promise<DownloadResult> {
    try {
      if (!ytdl.validateURL(url)) {
        return { success: false, error: 'Invalid YouTube URL' };
      }

      const info = await ytdl.getInfo(url);
      const videoTitle = info.videoDetails.title.replace(/[^\w\s-]/g, '').trim();
      const videoId = info.videoDetails.videoId;
      const duration = parseInt(info.videoDetails.lengthSeconds);
      const thumbnail = info.videoDetails.thumbnails[0]?.url;

      // Choose best quality format
      const format = ytdl.chooseFormat(info.formats, { 
        quality: 'highestvideo',
        filter: 'videoandaudio'
      });

      const filename = `youtube_${videoId}_${Date.now()}.mp4`;
      const filePath = path.join(this.uploadDir, filename);

      return new Promise((resolve) => {
        const stream = ytdl(url, { format });
        const writeStream = fs.createWriteStream(filePath);

        stream.pipe(writeStream);

        writeStream.on('finish', () => {
          resolve({
            success: true,
            videoPath: filePath,
            videoUrl: `/uploads/downloaded/${filename}`,
            title: videoTitle,
            duration: duration,
            thumbnail: thumbnail
          });
        });

        stream.on('error', (error) => {
          resolve({
            success: false,
            error: `YouTube download failed: ${error.message}`
          });
        });
      });
    } catch (error: any) {
      return {
        success: false,
        error: `YouTube download error: ${error.message}`
      };
    }
  }

  // Instagram Reels downloader (using web scraping approach)
  private async downloadInstagram(url: string): Promise<DownloadResult> {
    try {
      // In production, use a proper Instagram API or service like Apify
      // For now, we'll simulate the download process
      
      // Extract reel ID from URL
      const reelId = this.extractInstagramReelId(url);
      if (!reelId) {
        return { success: false, error: 'Invalid Instagram Reel URL' };
      }

      // Simulate download process for development
      const filename = `instagram_${reelId}_${Date.now()}.mp4`;
      const mockVideoPath = path.join(this.uploadDir, filename);
      
      // In production, implement actual Instagram downloading:
      // - Use Apify Instagram Downloader API
      // - Or use Instagram Graph API (requires app approval)
      // - Or use third-party services like RapidAPI Instagram Downloader
      
      // For development, create a placeholder file
      fs.writeFileSync(mockVideoPath, 'Mock Instagram video content');
      
      return {
        success: true,
        videoPath: mockVideoPath,
        videoUrl: `/uploads/downloaded/${filename}`,
        title: `Instagram Reel ${reelId}`,
        duration: 30, // Mock duration
        thumbnail: 'https://via.placeholder.com/400x300?text=Instagram+Reel'
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Instagram download error: ${error.message}`
      };
    }
  }

  // TikTok video downloader
  private async downloadTikTok(url: string): Promise<DownloadResult> {
    try {
      // Extract TikTok video ID
      const videoId = this.extractTikTokVideoId(url);
      if (!videoId) {
        return { success: false, error: 'Invalid TikTok URL' };
      }

      // In production, use a TikTok downloader API:
      // - Apify TikTok Scraper
      // - RapidAPI TikTok Downloader
      // - Or yt-dlp with TikTok support
      
      const filename = `tiktok_${videoId}_${Date.now()}.mp4`;
      const mockVideoPath = path.join(this.uploadDir, filename);
      
      // For development, create a placeholder file
      fs.writeFileSync(mockVideoPath, 'Mock TikTok video content');
      
      return {
        success: true,
        videoPath: mockVideoPath,
        videoUrl: `/uploads/downloaded/${filename}`,
        title: `TikTok Video ${videoId}`,
        duration: 15, // Mock duration
        thumbnail: 'https://via.placeholder.com/400x300?text=TikTok+Video'
      };
    } catch (error: any) {
      return {
        success: false,
        error: `TikTok download error: ${error.message}`
      };
    }
  }

  // URL validation methods
  private isYouTubeUrl(url: string): boolean {
    return /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/.test(url);
  }

  private isInstagramUrl(url: string): boolean {
    return /https?:\/\/(www\.)?instagram\.com\/(reel|p)\/[\w-]+/.test(url);
  }

  private isTikTokUrl(url: string): boolean {
    return /https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/.test(url);
  }

  // Helper methods to extract IDs
  private extractInstagramReelId(url: string): string | null {
    const match = url.match(/\/reel\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : null;
  }

  private extractTikTokVideoId(url: string): string | null {
    const match = url.match(/\/video\/(\d+)/);
    return match ? match[1] : null;
  }

  // Clean up downloaded file
  async cleanupFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Failed to cleanup file:', error);
    }
  }
}

export const videoDownloader = new VideoDownloaderService();