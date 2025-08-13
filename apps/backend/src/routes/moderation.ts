import { Router } from 'express';
const router = Router();

// POST /api/moderate
router.post('/', (req, res) => {
  // TODO: Content moderation logic
  res.json({ status: 'passed' });
});

export default router;
