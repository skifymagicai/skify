import { Router } from 'express';
const router = Router();

// GET /api/my-templates
router.get('/my-templates', (req, res) => {
  // TODO: Fetch user templates
  res.json({ templates: [] });
});

// POST /api/apply-template/:templateId
router.post('/apply-template/:templateId', (req, res) => {
  // TODO: Apply template logic
  res.json({ status: 'processing', jobId: 'job_123' });
});

export default router;
