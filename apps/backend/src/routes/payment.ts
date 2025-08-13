import { Router } from 'express';
const router = Router();

// POST /api/payment
router.post('/', (req, res) => {
  // TODO: Payment processing logic
  res.json({ status: 'success', message: 'Payment processed.' });
});

export default router;
