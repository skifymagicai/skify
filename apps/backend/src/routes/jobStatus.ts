import { Router, Request, Response } from 'express';
import { jobQueue } from '../jobs/queue';
const router = Router();

// GET /api/status/:jobId
router.get('/:jobId', async (req: Request, res: Response) => {
  const job = await jobQueue.getJob(req.params.jobId);
  if (!job) return res.status(404).json({ code: 'JOB_NOT_FOUND', message: 'Job not found.' });
  const state = await job.getState();
  const progress = job.progress;
  const result = job.returnvalue;
  res.json({ jobId: job.id, status: state, progress, result });
});

export default router;
