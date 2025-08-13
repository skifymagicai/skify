import { Router } from 'express';
const router = Router();

// POST /api/export
import { jobQueue } from '../jobs/queue';
router.post('/', async (req, res) => {
  // Enqueue export job
  const job = await jobQueue.add('export', req.body);
  res.json({ status: 'processing', jobId: job.id });
});

export default router;
