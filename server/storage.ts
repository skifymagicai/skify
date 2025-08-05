import { 
  users, 
  videos, 
  templates, 
  analysisResults, 
  payments, 
  subscriptions,
  templateLikes,
  videoProcessingJobs,
  templateAnalytics,
  type User, 
  type InsertUser,
  type Video,
  type InsertVideo,
  type Template,
  type InsertTemplate,
  type AnalysisResult,
  type InsertAnalysisResult,
  type Payment,
  type InsertPayment,
  type Subscription,
  type InsertSubscription,
  type TemplateLike,
  type InsertTemplateLike,
  type VideoProcessingJob,
  type InsertVideoProcessingJob,
  type TemplateAnalytics,
  type InsertTemplateAnalytics
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Video management
  createVideo(video: InsertVideo): Promise<Video>;
  getVideo(id: string): Promise<Video | undefined>;
  getUserVideos(userId: string): Promise<Video[]>;
  updateVideoStatus(id: string, status: string, styledUrl?: string): Promise<void>;
  
  // Template management
  createTemplate(template: InsertTemplate): Promise<Template>;
  getTemplate(id: string): Promise<Template | undefined>;
  getPublicTemplates(): Promise<Template[]>;
  getTrendingTemplates(): Promise<Template[]>;
  getUserTemplates(userId: string): Promise<Template[]>;
  incrementTemplateUsage(id: string): Promise<void>;
  
  // Analysis results
  createAnalysisResult(analysis: InsertAnalysisResult): Promise<AnalysisResult>;
  getAnalysisResult(videoId: string): Promise<AnalysisResult | undefined>;
  
  // Payment management
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: string, status: string, razorpayPaymentId?: string): Promise<void>;
  getPayment(id: string): Promise<Payment | undefined>;
  
  // Subscription management
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getUserSubscription(userId: string): Promise<Subscription | undefined>;
  updateSubscriptionStatus(id: string, status: string): Promise<void>;
  
  // Template likes
  likeTemplate(userId: string, templateId: string): Promise<void>;
  unlikeTemplate(userId: string, templateId: string): Promise<void>;
  getTemplateLikeCount(templateId: string): Promise<number>;
  isTemplateLiked(userId: string, templateId: string): Promise<boolean>;
  
  // Video processing jobs
  createProcessingJob(job: InsertVideoProcessingJob): Promise<VideoProcessingJob>;
  updateJobProgress(id: string, progress: number, status?: string): Promise<void>;
  getProcessingJob(id: string): Promise<VideoProcessingJob | undefined>;
  
  // Template analytics
  updateTemplateAnalytics(analytics: InsertTemplateAnalytics): Promise<void>;
  getTemplateAnalytics(templateId: string): Promise<TemplateAnalytics | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User management
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Video management
  async createVideo(video: InsertVideo): Promise<Video> {
    const [newVideo] = await db
      .insert(videos)
      .values(video)
      .returning();
    return newVideo;
  }

  async getVideo(id: string): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video || undefined;
  }

  async getUserVideos(userId: string): Promise<Video[]> {
    return await db.select().from(videos).where(eq(videos.userId, userId)).orderBy(desc(videos.createdAt));
  }

  async updateVideoStatus(id: string, status: string, styledUrl?: string): Promise<void> {
    const updateData: any = { status };
    if (styledUrl) updateData.styledUrl = styledUrl;
    
    await db.update(videos).set(updateData).where(eq(videos.id, id));
  }

  // Template management
  async createTemplate(template: InsertTemplate): Promise<Template> {
    const [newTemplate] = await db
      .insert(templates)
      .values(template)
      .returning();
    return newTemplate;
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async getPublicTemplates(): Promise<Template[]> {
    return await db.select().from(templates).where(eq(templates.isPublic, true)).orderBy(desc(templates.createdAt));
  }

  async getTrendingTemplates(): Promise<Template[]> {
    return await db.select().from(templates)
      .where(eq(templates.isPublic, true))
      .orderBy(desc(templates.usageCount))
      .limit(20);
  }

  async getUserTemplates(userId: string): Promise<Template[]> {
    return await db.select().from(templates).where(eq(templates.userId, userId)).orderBy(desc(templates.createdAt));
  }

  async incrementTemplateUsage(id: string): Promise<void> {
    await db.update(templates)
      .set({ usageCount: sql`${templates.usageCount} + 1` })
      .where(eq(templates.id, id));
  }

  // Analysis results
  async createAnalysisResult(analysis: InsertAnalysisResult): Promise<AnalysisResult> {
    const [result] = await db
      .insert(analysisResults)
      .values(analysis)
      .returning();
    return result;
  }

  async getAnalysisResult(videoId: string): Promise<AnalysisResult | undefined> {
    const [result] = await db.select().from(analysisResults).where(eq(analysisResults.videoId, videoId));
    return result || undefined;
  }

  // Payment management
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db
      .insert(payments)
      .values(payment)
      .returning();
    return newPayment;
  }

  async updatePaymentStatus(id: string, status: string, razorpayPaymentId?: string): Promise<void> {
    const updateData: any = { status };
    if (razorpayPaymentId) updateData.razorpayPaymentId = razorpayPaymentId;
    
    await db.update(payments).set(updateData).where(eq(payments.id, id));
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  // Subscription management
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSub] = await db
      .insert(subscriptions)
      .values(subscription)
      .returning();
    return newSub;
  }

  async getUserSubscription(userId: string): Promise<Subscription | undefined> {
    const [sub] = await db.select().from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, 'active')))
      .orderBy(desc(subscriptions.createdAt));
    return sub || undefined;
  }

  async updateSubscriptionStatus(id: string, status: string): Promise<void> {
    await db.update(subscriptions).set({ status }).where(eq(subscriptions.id, id));
  }

  // Template likes
  async likeTemplate(userId: string, templateId: string): Promise<void> {
    await db.insert(templateLikes).values({ userId, templateId });
  }

  async unlikeTemplate(userId: string, templateId: string): Promise<void> {
    await db.delete(templateLikes)
      .where(and(eq(templateLikes.userId, userId), eq(templateLikes.templateId, templateId)));
  }

  async getTemplateLikeCount(templateId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(templateLikes)
      .where(eq(templateLikes.templateId, templateId));
    return result[0]?.count || 0;
  }

  async isTemplateLiked(userId: string, templateId: string): Promise<boolean> {
    const [like] = await db.select().from(templateLikes)
      .where(and(eq(templateLikes.userId, userId), eq(templateLikes.templateId, templateId)));
    return !!like;
  }

  // Video processing jobs
  async createProcessingJob(job: InsertVideoProcessingJob): Promise<VideoProcessingJob> {
    const [newJob] = await db
      .insert(videoProcessingJobs)
      .values(job)
      .returning();
    return newJob;
  }

  async updateJobProgress(id: string, progress: number, status?: string): Promise<void> {
    const updateData: any = { progress };
    if (status) updateData.status = status;
    
    await db.update(videoProcessingJobs).set(updateData).where(eq(videoProcessingJobs.id, id));
  }

  async getProcessingJob(id: string): Promise<VideoProcessingJob | undefined> {
    const [job] = await db.select().from(videoProcessingJobs).where(eq(videoProcessingJobs.id, id));
    return job || undefined;
  }

  // Template analytics
  async updateTemplateAnalytics(analytics: InsertTemplateAnalytics): Promise<void> {
    await db.insert(templateAnalytics).values(analytics)
      .onConflictDoUpdate({
        target: templateAnalytics.templateId,
        set: {
          views: analytics.views || sql`${templateAnalytics.views}`,
          likes: analytics.likes || sql`${templateAnalytics.likes}`,
          applications: analytics.applications || sql`${templateAnalytics.applications}`,
          averageRating: analytics.averageRating || sql`${templateAnalytics.averageRating}`,
          trendingScore: analytics.trendingScore || sql`${templateAnalytics.trendingScore}`,
          lastUpdated: sql`now()`
        }
      });
  }

  async getTemplateAnalytics(templateId: string): Promise<TemplateAnalytics | undefined> {
    const [analytics] = await db.select().from(templateAnalytics).where(eq(templateAnalytics.templateId, templateId));
    return analytics || undefined;
  }
}

export const storage = new DatabaseStorage();
