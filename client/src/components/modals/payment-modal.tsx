import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { initiatePayment } from "@/lib/payment";
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "watermark_removal" | "pro_subscription";
  amount: number;
  userId?: string;
  videoId?: string;
}

export default function PaymentModal({
  isOpen,
  onClose,
  type,
  amount,
  userId = "demo-user",
  videoId,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to proceed with payment",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await initiatePayment({
        type,
        amount,
        userId,
        videoId,
      });
      
      toast({
        title: "Payment Initiated",
        description: "Redirecting to payment gateway...",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getTitle = () => {
    return type === "watermark_removal" ? "Remove Watermark" : "Upgrade to Pro";
  };

  const getDescription = () => {
    return type === "watermark_removal" 
      ? "Get a clean export without any branding"
      : "Unlock unlimited exports and premium features";
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isProcessing && onClose()}>
      <DialogContent className="bg-card max-w-md" data-testid="payment-modal">
        <DialogHeader>
          <DialogTitle data-testid="payment-modal-title">{getTitle()}</DialogTitle>
        </DialogHeader>

        {/* Order Summary */}
        <div className="bg-muted rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" data-testid="payment-item-name">{getDescription()}</span>
            <span className="font-medium" data-testid="payment-amount">₹{amount}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Tax included</span>
            <span>Instant delivery</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3 mb-6">
          <h4 className="font-medium">Choose Payment Method</h4>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} data-testid="payment-methods">
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center cursor-pointer">
                <i className="fas fa-credit-card text-primary mr-3"></i>
                <span className="text-sm">Credit/Debit Card</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
              <RadioGroupItem value="upi" id="upi" />
              <Label htmlFor="upi" className="flex items-center cursor-pointer">
                <i className="fas fa-mobile-alt text-green-500 mr-3"></i>
                <span className="text-sm">UPI</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
              <RadioGroupItem value="wallet" id="wallet" />
              <Label htmlFor="wallet" className="flex items-center cursor-pointer">
                <i className="fas fa-wallet text-blue-500 mr-3"></i>
                <span className="text-sm">Digital Wallet</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            data-testid="payment-confirm-button"
          >
            {isProcessing ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Processing...
              </>
            ) : (
              <>
                <i className="fas fa-lock mr-2"></i>
                Pay ₹{amount} Securely
              </>
            )}
          </Button>
          <Button 
            onClick={onClose}
            disabled={isProcessing}
            variant="outline" 
            className="w-full"
            data-testid="payment-cancel-button"
          >
            Cancel
          </Button>
        </div>

        {/* Security Info */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            <i className="fas fa-shield-alt mr-1"></i>
            Secured by Razorpay • 256-bit SSL encryption
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
