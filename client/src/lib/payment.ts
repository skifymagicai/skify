import { RAZORPAY_CONFIG } from "./constants";

interface PaymentOptions {
  type: "watermark_removal" | "pro_subscription";
  amount: number;
  userId: string;
  videoId?: string;
}

export async function initiatePayment(options: PaymentOptions) {
  try {
    // Create order on backend
    const response = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error("Failed to create payment order");
    }

    const order = await response.json();

    // Open Razorpay payment link
    const paymentLink = options.type === "watermark_removal" 
      ? RAZORPAY_CONFIG.WATERMARK_REMOVAL_LINK
      : RAZORPAY_CONFIG.PRO_SUBSCRIPTION_LINK;

    window.open(paymentLink, "_blank");

    return order;
  } catch (error) {
    console.error("Payment initiation failed:", error);
    throw error;
  }
}

export async function verifyPayment(paymentId: string, orderId: string) {
  try {
    const response = await fetch("/api/payments/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentId, orderId }),
    });

    if (!response.ok) {
      throw new Error("Payment verification failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Payment verification failed:", error);
    throw error;
  }
}
