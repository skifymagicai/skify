// server/routes/upload.js
const express = require("express");
const aws = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

const BUCKET = process.env.S3_BUCKET;
const REGION = process.env.S3_REGION;
const EXP = parseInt(process.env.SIGNED_URL_EXPIRATION||"900", 10);

const s3 = new aws.S3({
  region: REGION,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  signatureVersion: 'v4'
});

// POST /api/upload/sign
router.post("/sign", async (req, res) => {
  try {
    const { filename, size, mime } = req.body;
    if(!filename) return res.status(400).send("missing filename");
    const key = `uploads/${Date.now()}_${uuidv4()}_${filename}`;
    const params = {
      Bucket: BUCKET,
      Key: key,
      Expires: EXP,
      ContentType: mime,
      ACL: "private"
    };
    const url = await s3.getSignedUrlPromise("putObject", params);
    res.json({url, key});
  } catch (err) {
    console.error(err);
    res.status(500).send("sign error");
  }
});

// POST /api/upload/complete
router.post("/complete", async (req, res) => {
  try {
    const { key, filename, size, mime } = req.body;
    const s3url = `s3://${BUCKET}/${key}`;
    const analysis = await analyzeVideo({s3url, filename, size, mime});
    res.json({ analysis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "complete failed", details: err.message });
  }
});

module.exports = router;

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