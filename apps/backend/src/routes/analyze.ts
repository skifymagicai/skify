import { Router, Request, Response } from 'express';
const router = Router();

// POST /api/analyze
import { jobQueue } from '../jobs/queue.js';
router.post('/', async (req: Request, res: Response) => {
  // Enqueue analyze job
  const job = await jobQueue.add('analyze', req.body);
  res.json({ status: 'processing', jobId: job.id });
});

export default router;
