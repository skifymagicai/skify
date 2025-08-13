import { Router } from 'express';
import multer from 'multer';
const router = Router();
const upload = multer({ dest: 'uploads/' });

// POST /api/upload/viral
import { jobQueue } from '../jobs/queue';
// POST /api/upload/viral
router.post('/viral', upload.single('file'), async (req, res) => {
  // Compliance & moderation stubs
  // TODO: Real checks
  const passedModeration = true;
  if (!passedModeration) return res.status(400).json({ code: 'MODERATION_FAILED', message: 'Content failed moderation.' });

  // Enqueue analyze job
  const job = await jobQueue.add('analyze', { file: req.file });
  res.json({ status: 'uploaded', jobId: job.id });
});

export default router;
