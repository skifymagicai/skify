// Simple in-memory storage for demo
// In production, use PostgreSQL/MongoDB

class SkifyStorage {
  constructor() {
    this.videos = new Map();
    this.analyses = new Map();
    this.templates = new Map();
    this.styledVideos = new Map();
  }

  // VIDEO OPERATIONS
  async saveVideo(videoData) {
    const video = {
      ...videoData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.videos.set(video.id, video);
    return video;
  }

  async getVideo(videoId) {
    return this.videos.get(videoId);
  }

  async updateVideo(videoId, updates) {
    const video = this.videos.get(videoId);
    if (video) {
      const updatedVideo = {
        ...video,
        ...updates,
        updatedAt: new Date()
      };
      this.videos.set(videoId, updatedVideo);
      return updatedVideo;
    }
    return null;
  }

  async getUserVideos(userId) {
    return Array.from(this.videos.values())
      .filter(video => video.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // ANALYSIS OPERATIONS
  async saveAnalysis(analysisData) {
    const analysis = {
      ...analysisData,
      savedAt: new Date()
    };
    this.analyses.set(analysisData.videoId, analysis);
    return analysis;
  }

  async getAnalysis(videoId) {
    return this.analyses.get(videoId);
  }

  // TEMPLATE OPERATIONS
  async saveTemplate(templateData) {
    const template = {
      ...templateData,
      createdAt: new Date(),
      usageCount: 0
    };
    this.templates.set(template.id, template);
    return template;
  }

  async getTemplate(templateId) {
    return this.templates.get(templateId);
  }

  async getTemplates(filters = {}) {
    let templates = Array.from(this.templates.values());

    if (filters.userId) {
      templates = templates.filter(t => t.userId === filters.userId || t.isPublic);
    }

    if (filters.isPublic !== undefined) {
      templates = templates.filter(t => t.isPublic === filters.isPublic);
    }

    return templates.sort((a, b) => b.createdAt - a.createdAt);
  }

  async incrementTemplateUsage(templateId) {
    const template = this.templates.get(templateId);
    if (template) {
      template.usageCount = (template.usageCount || 0) + 1;
      this.templates.set(templateId, template);
    }
  }

  // STYLED VIDEO OPERATIONS
  async saveStyledVideo(styledVideoData) {
    const styledVideo = {
      ...styledVideoData,
      createdAt: new Date()
    };
    this.styledVideos.set(styledVideo.id, styledVideo);
    
    // Increment template usage
    await this.incrementTemplateUsage(styledVideo.templateId);
    
    return styledVideo;
  }

  async getStyledVideo(styledVideoId) {
    return this.styledVideos.get(styledVideoId);
  }

  async getUserStyledVideos(userId) {
    return Array.from(this.styledVideos.values())
      .filter(video => video.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // ANALYTICS
  async getStats() {
    return {
      totalVideos: this.videos.size,
      totalAnalyses: this.analyses.size,
      totalTemplates: this.templates.size,
      totalStyledVideos: this.styledVideos.size,
      publicTemplates: Array.from(this.templates.values())
        .filter(t => t.isPublic).length
    };
  }

  // CLEANUP (for demo)
  async clearData() {
    this.videos.clear();
    this.analyses.clear();
    this.templates.clear();
    this.styledVideos.clear();
  }
}

export const storage = new SkifyStorage();