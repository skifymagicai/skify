import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, AuthenticatedRequest } from '../services/auth.js';
import { PaymentService } from '../services/payment.js';
import { db } from '../db/index.js';
import { auditLogs } from '../../shared/skify-schema.js';

const router = Router();

// Create payment order
router.post('/create-order', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { plan } = z.object({
      plan: z.enum(['pro_monthly', 'pro_yearly'])
    }).parse(req.body);

    const order = await PaymentService.createOrder(req.userId!, plan);

    // Log payment initiation
    await db.insert(auditLogs).values({
      userId: req.userId!,
      action: 'payment_initiated',
      resource: 'payment',
      resourceId: order.paymentId,
      details: { plan, amount: order.amount },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Verify payment
router.post('/verify', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = z.object({
      razorpayOrderId: z.string(),
      razorpayPaymentId: z.string(),
      razorpaySignature: z.string()
    }).parse(req.body);

    const result = await PaymentService.completePayment(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    // Log successful payment
    await db.insert(auditLogs).values({
      userId: req.userId!,
      action: 'payment_completed',
      resource: 'payment',
      resourceId: result.paymentId,
      details: { 
        plan: result.plan,
        razorpayPaymentId,
        tier: result.user?.tier 
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get payment history
router.get('/history', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const payments = await PaymentService.getPaymentHistory(req.userId!);

    res.json({
      success: true,
      data: { payments }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create watermark removal payment
router.post('/watermark-removal', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { videoId } = z.object({
      videoId: z.string().uuid()
    }).parse(req.body);

    const order = await PaymentService.createWatermarkRemovalPayment(req.userId!, videoId);

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Razorpay webhook handler
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.get('X-Razorpay-Signature');
    
    if (!signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing signature'
      });
    }

    await PaymentService.handleWebhook(signature, req.body);

    res.json({
      success: true,
      message: 'Webhook processed'
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({
      success: false,
      error: 'Webhook processing failed'
    });
  }
});

export default router;