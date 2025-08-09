import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Crown, Check, Zap, CreditCard } from 'lucide-react';
import { apiClient } from '../../lib/api.js';
import { useAuth } from '../../hooks/useAuth.js';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PaymentDialog({ open, onOpenChange }: PaymentDialogProps) {
  const { user, refreshUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'pro_monthly' | 'pro_yearly'>('pro_monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const plans = {
    pro_monthly: {
      name: 'Pro Monthly',
      price: 999,
      displayPrice: '₹999',
      period: 'month',
      savings: null
    },
    pro_yearly: {
      name: 'Pro Yearly',
      price: 9999,
      displayPrice: '₹9,999',
      period: 'year',
      savings: '2 months free'
    }
  };

  const proFeatures = [
    'Unlimited video uploads',
    '4K Ultra HD exports',
    'No watermarks',
    'Priority processing',
    'Advanced templates',
    'Commercial usage rights',
    'Premium support'
  ];

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError('');

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Payment gateway not available');
      }

      // Create order
      const orderResponse = await apiClient.createPaymentOrder(selectedPlan);
      const order = orderResponse.data;

      // Configure Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mock',
        amount: order.amount,
        currency: order.currency,
        name: 'SkifyMagicAI',
        description: `${plans[selectedPlan].name} Subscription`,
        order_id: order.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            const verifyResponse = await apiClient.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            if (verifyResponse.data.success) {
              // Update user state
              await refreshUser();
              onOpenChange(false);
              
              // Show success message (could be a toast)
              alert('Payment successful! Your account has been upgraded to Pro.');
            }
          } catch (error: any) {
            setError(error.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user?.username,
          email: user?.email,
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error: any) {
      setError(error.message || 'Payment initialization failed');
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            Upgrade to Pro
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {user?.tier === 'pro' ? (
            <Alert>
              <Crown className="w-4 h-4" />
              <AlertDescription>
                You're already a Pro user! Enjoy unlimited access to all features.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Plan Selection */}
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(plans).map(([planKey, plan]) => (
                  <Card
                    key={planKey}
                    className={`cursor-pointer transition-all ${
                      selectedPlan === planKey
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedPlan(planKey as 'pro_monthly' | 'pro_yearly')}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        {plan.savings && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            {plan.savings}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-3xl font-bold">{plan.displayPrice}</div>
                        <div className="text-gray-500">per {plan.period}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Features List */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Pro Features</h3>
                <div className="grid md:grid-cols-2 gap-2">
                  {proFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current vs Pro Comparison */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Comparison</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="font-medium">Feature</div>
                  <div className="font-medium text-center">Free</div>
                  <div className="font-medium text-center">Pro</div>
                  
                  <div>Daily uploads</div>
                  <div className="text-center">5</div>
                  <div className="text-center text-green-600">Unlimited</div>
                  
                  <div>Resolution</div>
                  <div className="text-center">1080p</div>
                  <div className="text-center text-green-600">4K</div>
                  
                  <div>Watermark</div>
                  <div className="text-center">Yes</div>
                  <div className="text-center text-green-600">Removed</div>
                  
                  <div>Processing</div>
                  <div className="text-center">Standard</div>
                  <div className="text-center text-green-600">Priority</div>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Payment Button */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isProcessing ? (
                    <>
                      <Zap className="w-4 h-4 mr-2 animate-pulse" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Upgrade Now - {plans[selectedPlan].displayPrice}
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Secure payment powered by Razorpay. Cancel anytime.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}