import { Router, Request, Response } from 'express';
const router = Router();

// POST /api/payment
router.post('/', (req: Request, res: Response) => {
  // TODO: Payment processing logic
  res.json({ status: 'success', message: 'Payment processed.' });
});

export default router;
