// server/routes/template.mjs
import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.post("/apply", async (req, res) => {
  try {
    const { templateId, sourceKey } = req.body;
    if(!templateId || !sourceKey) return res.status(400).json({ message: "Missing fields" });
    const jobId = `job_${Date.now()}_${uuidv4()}`;
    fakeStartRender(jobId, { templateId, sourceKey });
    res.json({ status: "processing", jobId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "apply failed", details: err.message });
  }
});

function fakeStartRender(jobId, payload) {
  global.__SKIFY_JOBS = global.__SKIFY_JOBS || {};
  global.__SKIFY_JOBS[jobId] = { status: "processing", progress: 0 };
  let p = 0;
  const t = setInterval(() => {
    p += 20;
    global.__SKIFY_JOBS[jobId].progress = p;
    if(p >= 100) {
      clearInterval(t);
      global.__SKIFY_JOBS[jobId] = {
        status: "completed",
        progress: 100,
        resultUrl: `https://cdn.example.com/outputs/${jobId}.mp4`
      };
    }
  }, 1000);
}

export default router;