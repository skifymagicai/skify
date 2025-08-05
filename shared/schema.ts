import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  originalUrl: text("original_url"),
  styledUrl: text("styled_url"),
  templateId: varchar("template_id").references(() => templates.id),
  status: text("status").notNull().default("processing"), // processing, completed, failed
  duration: integer("duration"), // in seconds
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  colorPalette: jsonb("color_palette").notNull(), // array of hex colors
  effects: jsonb("effects").notNull(), // array of effect objects
  transitions: jsonb("transitions").notNull(), // array of transition objects
  colorGrading: jsonb("color_grading").notNull(), // color grading settings
  cameraMotion: jsonb("camera_motion"), // camera motion settings
  thumbnail: text("thumbnail"),
  usageCount: integer("usage_count").notNull().default(0),
  rating: integer("rating").notNull().default(0), // 1-5 stars
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const analysisResults = pgTable("analysis_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  videoId: varchar("video_id").references(() => videos.id),
  effects: jsonb("effects").notNull(),
  templates: jsonb("templates").notNull(),
  transitions: jsonb("transitions").notNull(),
  colorGrading: jsonb("color_grading").notNull(),
  cameraMotion: jsonb("camera_motion"),
  aiEdits: jsonb("ai_edits"),
  confidence: integer("confidence").notNull(), // 0-100
  processingTime: integer("processing_time"), // in milliseconds
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  videoId: varchar("video_id").references(() => videos.id),
  amount: integer("amount").notNull(), // in paise
  currency: text("currency").notNull().default("INR"),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  razorpayPaymentId: text("razorpay_payment_id"),
  razorpayOrderId: text("razorpay_order_id"),
  type: text("type").notNull(), // watermark_removal, pro_subscription
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const insertVideoSchema = createInsertSchema(videos).pick({
  title: true,
  originalUrl: true,
  templateId: true,
});

export const insertTemplateSchema = createInsertSchema(templates).pick({
  name: true,
  description: true,
  colorPalette: true,
  effects: true,
  transitions: true,
  colorGrading: true,
  cameraMotion: true,
  thumbnail: true,
  isPublic: true,
});

export const insertAnalysisResultSchema = createInsertSchema(analysisResults).pick({
  videoId: true,
  effects: true,
  templates: true,
  transitions: true,
  colorGrading: true,
  cameraMotion: true,
  aiEdits: true,
  confidence: true,
  processingTime: true,
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  userId: true,
  videoId: true,
  amount: true,
  type: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;
export type InsertAnalysisResult = z.infer<typeof insertAnalysisResultSchema>;
export type AnalysisResult = typeof analysisResults.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
