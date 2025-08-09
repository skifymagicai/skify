import { pgTable, text, varchar, integer, timestamp, uuid, boolean, jsonb, decimal } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table - Enhanced for SkifyMagicAI
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: text('password').notNull(),
  tier: varchar('tier', { length: 10 }).notNull().default('free'), // 'free', 'pro'
  subscriptionId: varchar('subscription_id', { length: 100 }),
  uploadLimit: integer('upload_limit').default(5).notNull(), // daily limit for free users
  uploadsUsed: integer('uploads_used').default(0).notNull(),
  resetDate: timestamp('reset_date').defaultNow().notNull(), // when usage resets
  isActive: boolean('is_active').default(true).notNull(),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Video uploads table
export const videoUploads = pgTable('video_uploads', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalUrl: text('original_url'), // if uploaded via URL
  s3Key: varchar('s3_key', { length: 500 }).notNull(),
  s3Url: text('s3_url').notNull(),
  size: integer('size').notNull(), // bytes
  mimeType: varchar('mime_type', { length: 50 }).notNull(),
  duration: decimal('duration', { precision: 10, scale: 3 }), // seconds
  width: integer('width'),
  height: integer('height'),
  frameRate: decimal('frame_rate', { precision: 5, scale: 2 }),
  bitrate: integer('bitrate'),
  status: varchar('status', { length: 20 }).notNull().default('uploading'),
  metadata: jsonb('metadata'), // additional video metadata
  analysisResult: jsonb('analysis_result'), // AI analysis output
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Style analysis results
export const styleAnalyses = pgTable('style_analyses', {
  id: uuid('id').defaultRandom().primaryKey(),
  videoId: uuid('video_id').references(() => videoUploads.id).notNull(),
  timing: jsonb('timing').notNull(), // TimingAnalysis
  visual: jsonb('visual').notNull(), // VisualAnalysis  
  audio: jsonb('audio').notNull(), // AudioAnalysis
  text: jsonb('text').notNull(), // TextAnalysis
  confidence: decimal('confidence', { precision: 3, scale: 2 }).notNull(),
  version: varchar('version', { length: 10 }).default('1.0').notNull(),
  processingTime: integer('processing_time'), // seconds
  aiModel: varchar('ai_model', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Templates table - Enhanced
export const templates = pgTable('templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  thumbnailUrl: text('thumbnail_url'),
  sourceVideoId: uuid('source_video_id').references(() => videoUploads.id).notNull(),
  styleAnalysisId: uuid('style_analysis_id').references(() => styleAnalyses.id).notNull(),
  tags: text('tags').array().default([]).notNull(),
  isPublic: boolean('is_public').default(false).notNull(),
  likes: integer('likes').default(0).notNull(),
  uses: integer('uses').default(0).notNull(),
  version: varchar('version', { length: 10 }).default('1.0').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Render jobs for async processing
export const renderJobs = pgTable('render_jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  templateId: uuid('template_id').references(() => templates.id).notNull(),
  sourceMediaIds: text('source_media_ids').array().notNull(), // array of video/image IDs
  status: varchar('status', { length: 20 }).notNull().default('queued'),
  progress: integer('progress').default(0).notNull(),
  resultUrl: text('result_url'),
  errorMessage: text('error_message'),
  renderSettings: jsonb('render_settings').notNull(), // RenderSettings
  priority: integer('priority').default(5).notNull(),
  estimatedDuration: integer('estimated_duration'), // seconds
  actualDuration: integer('actual_duration'), // seconds
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Payments table - Razorpay integration
export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  razorpayPaymentId: varchar('razorpay_payment_id', { length: 100 }),
  razorpayOrderId: varchar('razorpay_order_id', { length: 100 }),
  razorpaySignature: text('razorpay_signature'),
  amount: integer('amount').notNull(), // in paisa (INR)
  currency: varchar('currency', { length: 3 }).default('INR').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  plan: varchar('plan', { length: 20 }).notNull(), // 'pro_monthly', 'pro_yearly'
  metadata: jsonb('metadata'),
  webhook: jsonb('webhook_data'), // raw webhook payload
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Template likes
export const templateLikes = pgTable('template_likes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  templateId: uuid('template_id').references(() => templates.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Audit logs for compliance and debugging
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 50 }).notNull(),
  resource: varchar('resource', { length: 50 }).notNull(),
  resourceId: varchar('resource_id', { length: 100 }).notNull(),
  details: jsonb('details'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp').defaultNow().notNull()
});

// Moderation queue
export const moderationItems = pgTable('moderation_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  resourceType: varchar('resource_type', { length: 20 }).notNull(),
  resourceId: uuid('resource_id').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  reason: text('reason'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Zod validation schemas
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  tier: z.enum(['free', 'pro']).default('free')
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resetDate: true,
  isActive: true,
  lastLoginAt: true
});

export const insertVideoUploadSchema = createInsertSchema(videoUploads, {
  filename: z.string().min(1).max(255),
  s3Key: z.string().min(1),
  s3Url: z.string().url(),
  size: z.number().positive(),
  mimeType: z.string().regex(/^video\//)
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertTemplateSchema = createInsertSchema(templates, {
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  tags: z.array(z.string()).default([])
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  likes: true,
  uses: true
});

export const insertRenderJobSchema = createInsertSchema(renderJobs, {
  sourceMediaIds: z.array(z.string().uuid()),
  renderSettings: z.object({
    resolution: z.enum(['720p', '1080p', '4K']),
    quality: z.enum(['draft', 'standard', 'high', 'ultra']),
    watermark: z.boolean(),
    format: z.enum(['mp4', 'mov']),
    applyLayers: z.object({
      timing: z.boolean(),
      visual: z.boolean(),
      audio: z.boolean(),
      text: z.boolean(),
      background: z.boolean()
    })
  }),
  priority: z.number().min(1).max(10).default(5)
}).omit({
  id: true,
  createdAt: true,
  progress: true,
  startedAt: true,
  completedAt: true
});

export const insertPaymentSchema = createInsertSchema(payments, {
  amount: z.number().positive(),
  currency: z.string().length(3).default('INR'),
  plan: z.enum(['pro_monthly', 'pro_yearly'])
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type VideoUpload = typeof videoUploads.$inferSelect;
export type InsertVideoUpload = z.infer<typeof insertVideoUploadSchema>;

export type StyleAnalysis = typeof styleAnalyses.$inferSelect;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type RenderJob = typeof renderJobs.$inferSelect;
export type InsertRenderJob = z.infer<typeof insertRenderJobSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type ModerationItem = typeof moderationItems.$inferSelect;