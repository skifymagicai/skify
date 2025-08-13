import { Router, Request, Response } from 'express';
const router = Router();

// GET /api/my-templates
router.get('/my-templates', (req: Request, res: Response) => {
  // TODO: Fetch user templates
  res.json({ templates: [] });
});

// POST /api/apply-template/:templateId
router.post('/apply-template/:templateId', (req: Request, res: Response) => {
  // TODO: Apply template logic
  res.json({ status: 'processing', jobId: 'job_123' });
});

export default router;
