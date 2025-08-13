import { Router, Request, Response } from 'express';
const router = Router();

// POST /api/moderate
router.post('/', (req: Request, res: Response) => {
  // TODO: Content moderation logic
  res.json({ status: 'passed' });
});

export default router;
