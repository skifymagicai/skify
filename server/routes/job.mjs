// server/routes/job.mjs
import express from 'express';

const router = express.Router();

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const jobs = global.__SKIFY_JOBS || {};
  const job = jobs[id];
  if(!job) return res.status(404).json({ message: "job not found" });
  res.json(job);
});

export default router;