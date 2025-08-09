// server/routes/upload.mjs
import express from 'express';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const BUCKET = process.env.S3_BUCKET || 'demo-bucket';
const REGION = process.env.S3_REGION || 'us-east-1';
const EXP = parseInt(process.env.SIGNED_URL_EXPIRATION || "900", 10);

const s3 = new AWS.S3({
  region: REGION,
  accessKeyId: process.env.S3_ACCESS_KEY_ID || 'demo-key',
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'demo-secret',
  signatureVersion: 'v4'
});

// POST /api/upload/sign
router.post("/sign", async (req, res) => {
  try {
    const { filename, size, mime } = req.body;
    if(!filename) return res.status(400).send("missing filename");
    
    // For demo purposes, return a mock signed URL
    const key = `uploads/${Date.now()}_${uuidv4()}_${filename}`;
    const mockUrl = `https://demo-bucket.s3.amazonaws.com/${key}?signed=true`;
    
    res.json({ url: mockUrl, key });
  } catch (err) {
    console.error(err);
    res.status(500).send("sign error");
  }
});

// POST /api/upload/complete
router.post("/complete", async (req, res) => {
  try {
    const { key, filename, size, mime } = req.body;
    const s3url = `s3://demo-bucket/${key}`;
    const analysis = await analyzeVideo({s3url, filename, size, mime});
    res.json({ analysis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "complete failed", details: err.message });
  }
});

async function analyzeVideo({s3url, filename, size, mime}) {
  return {
    overall: 0.93,
    effects: [
      { name: "Film Grain", confidence: 0.92 },
      { name: "Color Pop", confidence: 0.87 },
      { name: "Motion Blur", confidence: 0.95 }
    ],
    textOverlays: ["TRENDING NOW", "Follow for more!"]
  };
}

export default router;