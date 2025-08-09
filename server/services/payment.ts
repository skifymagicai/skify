import Razorpay from 'razorpay';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { payments, users } from '../../shared/skify-schema.js';
import { eq } from 'drizzle-orm';
import { AuthService } from './auth.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret'
});

export class PaymentService {
  // Create Razorpay order
  static async createOrder(userId: string, plan: 'pro_monthly' | 'pro_yearly') {
    const amounts = {
      pro_monthly: 99900, // ₹999 in paisa
      pro_yearly: 999900  // ₹9999 in paisa (2 months free)
    };

    const amount = amounts[plan];
    const currency = 'INR';

    try {
      const order = await razorpay.orders.create({
        amount,
        currency,
        receipt: `receipt_${userId}_${Date.now()}`,
        notes: {
          userId,
          plan,
          upgradeType: 'subscription'
        }
      });

      // Create payment record
      const [payment] = await db.insert(payments).values({
        userId,
        razorpayOrderId: order.id,
        amount,
        currency,
        plan,
        status: 'pending',
        metadata: { order }
      }).returning();

      return {
        orderId: order.id,
        amount,
        currency,
        plan,
        paymentId: payment.id
      };
    } catch (error) {
      console.error('Razorpay order creation failed:', error);
      
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        const mockOrderId = `order_mock_${Date.now()}`;
        
        const [payment] = await db.insert(payments).values({
          userId,
          razorpayOrderId: mockOrderId,
          amount,
          currency,
          plan,
          status: 'pending',
          metadata: { mock: true, amount, plan }
        }).returning();

        return {
          orderId: mockOrderId,
          amount,
          currency,
          plan,
          paymentId: payment.id
        };
      }
      
      throw new Error('Payment order creation failed');
    }
  }

  // Verify payment signature
  static verifySignature(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): boolean {
    if (process.env.NODE_ENV === 'development' && razorpayOrderId.includes('mock')) {
      return true; // Skip verification for mock payments
    }

    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'mock_secret')
      .update(body.toString())
      .digest('hex');

    return expectedSignature === razorpaySignature;
  }

  // Complete payment and upgrade user
  static async completePayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) {
    // Verify signature
    if (!this.verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      throw new Error('Invalid payment signature');
    }

    // Find payment record
    const [payment] = await db.select()
      .from(payments)
      .where(eq(payments.razorpayOrderId, razorpayOrderId))
      .limit(1);

    if (!payment) {
      throw new Error('Payment record not found');
    }

    if (payment.status === 'completed') {
      throw new Error('Payment already processed');
    }

    try {
      // Update payment record
      await db.update(payments)
        .set({
          razorpayPaymentId,
          razorpaySignature,
          status: 'completed',
          updatedAt: new Date()
        })
        .where(eq(payments.id, payment.id));

      // Upgrade user to pro
      await AuthService.updateUserTier(payment.userId, 'pro', `sub_${razorpayPaymentId}`);

      // Get updated user
      const user = await AuthService.getUserById(payment.userId);

      return {
        success: true,
        paymentId: payment.id,
        user,
        plan: payment.plan
      };
    } catch (error) {
      // Rollback payment status on failure
      await db.update(payments)
        .set({
          status: 'failed',
          metadata: { error: error.message, ...payment.metadata }
        })
        .where(eq(payments.id, payment.id));

      throw error;
    }
  }

  // Handle webhook (for production)
  static async handleWebhook(signature: string, body: any) {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'mock_secret')
      .update(JSON.stringify(body))
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new Error('Invalid webhook signature');
    }

    const { event, payload } = body;

    switch (event) {
      case 'payment.captured':
        await this.handlePaymentCaptured(payload.payment.entity);
        break;
      case 'payment.failed':
        await this.handlePaymentFailed(payload.payment.entity);
        break;
      case 'subscription.cancelled':
        await this.handleSubscriptionCancelled(payload.subscription.entity);
        break;
    }
  }

  private static async handlePaymentCaptured(payment: any) {
    // Update payment status
    await db.update(payments)
      .set({
        status: 'completed',
        webhook: payment,
        updatedAt: new Date()
      })
      .where(eq(payments.razorpayPaymentId, payment.id));
  }

  private static async handlePaymentFailed(payment: any) {
    await db.update(payments)
      .set({
        status: 'failed',
        webhook: payment,
        updatedAt: new Date()
      })
      .where(eq(payments.razorpayPaymentId, payment.id));
  }

  private static async handleSubscriptionCancelled(subscription: any) {
    // Downgrade user back to free
    const [payment] = await db.select()
      .from(payments)
      .where(eq(payments.razorpayPaymentId, subscription.id))
      .limit(1);

    if (payment) {
      await AuthService.updateUserTier(payment.userId, 'free');
    }
  }

  // Get payment history for user
  static async getPaymentHistory(userId: string) {
    return await db.select({
      id: payments.id,
      amount: payments.amount,
      currency: payments.currency,
      status: payments.status,
      plan: payments.plan,
      createdAt: payments.createdAt
    })
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(payments.createdAt);
  }

  // Check if payment is for watermark removal (single purchase)
  static async createWatermarkRemovalPayment(userId: string, videoId: string) {
    const amount = 9900; // ₹99 for watermark removal
    
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `watermark_${videoId}_${Date.now()}`,
      notes: {
        userId,
        videoId,
        type: 'watermark_removal'
      }
    });

    const [payment] = await db.insert(payments).values({
      userId,
      razorpayOrderId: order.id,
      amount,
      currency: 'INR',
      plan: 'watermark_removal' as any,
      status: 'pending',
      metadata: { videoId, type: 'watermark_removal' }
    }).returning();

    return {
      orderId: order.id,
      amount,
      paymentId: payment.id
    };
  }
}