import { Router, Request, Response } from 'express';
const router = Router();

// POST /api/export
import { jobQueue } from '../jobs/queue.js';
router.post('/', async (req: Request, res: Response) => {
  // Enqueue export job
  const job = await jobQueue.add('export', req.body);
  res.json({ status: 'processing', jobId: job.id });
});

export default router;
