

// server/routes/upload.ts

import express from "express";
import aws from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
// @ts-ignore
import type { SkifyAIProcessor as SkifyAIProcessorType } from "../ai-processor.js";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { SkifyAIProcessor }: { SkifyAIProcessor: typeof SkifyAIProcessorType } = require("../ai-processor.js");
const router = express.Router();

const BUCKET = process.env.S3_BUCKET;
const REGION = process.env.S3_REGION;
const EXP = parseInt(process.env.SIGNED_URL_EXPIRATION || "900", 10);

// Use correct env var names for Backblaze/S3
const s3 = new aws.S3({
  region: REGION,
  accessKeyId: process.env.S3_ACCESS_KEY || process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_KEY || process.env.S3_SECRET_ACCESS_KEY,
  endpoint: process.env.S3_ENDPOINT,
  signatureVersion: 'v4',
});

// POST /api/upload/sign
router.post("/sign", async (req, res) => {
  try {
    const { filename, size, mime } = req.body;
    if (!filename) return res.status(400).send("missing filename");
    const key = `uploads/${Date.now()}_${uuidv4()}_${filename}`;
    const params = {
      Bucket: BUCKET,
      Key: key,
      Expires: EXP,
      ContentType: mime,
      ACL: "private"
    };
    try {
      const url = await s3.getSignedUrlPromise("putObject", params);
      res.json({ url, key });
    } catch (err) {
      console.error('S3 sign error:', err);
      res.status(500).json({ error: "sign error", details: err instanceof Error ? err.message : String(err) });
    }
  } catch (err) {
    console.error('Unexpected error in /sign:', err);
    res.status(500).json({ error: "sign error", details: err instanceof Error ? err.message : String(err) });
  }
});

// POST /api/upload/complete
router.post("/complete", async (req, res) => {
  try {
    const { key, filename, size, mime } = req.body;
    if (!key || !filename) return res.status(400).json({ error: "Missing key or filename" });
    // Generate a signed GET URL for AI processor to access the uploaded file
    const getParams = {
      Bucket: BUCKET,
      Key: key,
      Expires: EXP
    };
    let s3url;
    try {
      s3url = await s3.getSignedUrlPromise("getObject", getParams);
    } catch (err) {
      console.error('S3 getObject sign error:', err);
      return res.status(500).json({ error: "S3 getObject sign error", details: err instanceof Error ? err.message : String(err) });
    }
    try {
      const analysis = await analyzeVideo({ s3url, filename, size, mime });
      res.json({ analysis });
    } catch (err) {
      console.error('AI analysis error:', err);
      res.status(500).json({ error: "complete failed", details: err instanceof Error ? err.message : 'Unknown error' });
    }
  } catch (err) {
    console.error('Unexpected error in /complete:', err);
    res.status(500).json({ error: "complete failed", details: err instanceof Error ? err.message : 'Unknown error' });
  }
});

export default router;


// Use SkifyAIProcessor for real video analysis
const aiProcessor = new SkifyAIProcessor();

async function analyzeVideo({s3url, filename, size, mime}: {s3url: string, filename: string, size: number, mime: string}) {
  // Download the video from S3 to a temp file
  // For simplicity, assume s3url is accessible via a signed URL (in production, generate a signed GET URL)
  // Here, you would implement S3 download logic if needed
  // For now, pass the s3url directly to the AI processor
  return await aiProcessor.processVideo(s3url, { filename, size, mime });
}