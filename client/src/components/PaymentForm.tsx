import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { CreditCard, Loader } from 'lucide-react';
import { CustomerInfo, PaymentDetails } from '../types/payment';

interface PaymentFormProps {
  paymentMethod: 'stripe' | 'paypal';
  paymentDetails: PaymentDetails;
  customerInfo: CustomerInfo;
  onSuccess: (result: any) => void;
}

const PaymentForm = ({
  paymentMethod,
  paymentDetails,
  customerInfo,
  onSuccess
}: PaymentFormProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stripe = useStripe();
  const elements = useElements();

  const handleStripeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Create payment intent on backend
      const paymentIntentResponse = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: paymentDetails.amount * 100, // Convert to cents
          currency: paymentDetails.currency,
          customer: customerInfo,
          reportType: paymentDetails.reportType
        })
      });

      if (!paymentIntentResponse.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await paymentIntentResponse.json();

      // 2. Confirm card payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: customerInfo.name,
              email: customerInfo.email,
              phone: customerInfo.phone
            }
          }
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // 3. Send payment success to backend
        await fetch('/api/process-payment-success', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            amount: paymentDetails.amount,
            customer: customerInfo,
            reportType: paymentDetails.reportType
          })
        });

        onSuccess({
          success: true,
          transactionId: paymentIntent.id,
          customer: customerInfo,
          message: 'Payment successful! Your report is being generated.'
        });
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const paypalOptions = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
    currency: paymentDetails.currency,
    intent: 'capture'
  };

  const createPayPalOrder = async () => {
    try {
      const response = await fetch('/api/create-paypal-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: paymentDetails.amount,
          currency: paymentDetails.currency,
          description: paymentDetails.description,
          customer: customerInfo,
          reportType: paymentDetails.reportType
        })
      });

      if (!response.ok) throw new Error('Failed to create order');
      
      const { orderId } = await response.json();
      return orderId;
    } catch (error) {
      throw error;
    }
  };

  const onPayPalApprove = async (data: { orderID: string }) => {
    try {
      const response = await fetch('/api/capture-paypal-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: data.orderID,
          customer: customerInfo,
          reportType: paymentDetails.reportType
        })
      });

      if (!response.ok) throw new Error('Failed to capture payment');

      const result = await response.json();
      
      onSuccess({
        success: true,
        transactionId: result.transactionId,
        customer: customerInfo,
        message: 'Payment successful! Your report is being generated.'
      });

      return result;
    } catch (error) {
      setError('Payment capture failed');
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {paymentMethod === 'stripe' ? (
        <form onSubmit={handleStripeSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Card Details
            </label>
            <div className="p-4 border border-gray-700 rounded-lg bg-gray-800/30">
              <CardElement
                options={{
                  style: {
                    base: {
                      color: '#e0e0e0',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      '::placeholder': {
                        color: '#666'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full py-3 px-4 bg-neon-green text-black font-semibold rounded-lg hover:bg-neon-green-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay ${paymentDetails.amount}
              </>
            )}
          </button>
        </form>
      ) : (
        <PayPalScriptProvider options={paypalOptions}>
          <div className="space-y-4">
            <PayPalButtons
              style={{
                layout: 'vertical',
                color: 'gold',
                shape: 'pill',
                label: 'paypal'
              }}
              createOrder={createPayPalOrder}
              onApprove={onPayPalApprove}
              onError={(err) => {
                console.error('PayPal error:', err);
                setError('PayPal payment failed. Please try another method.');
              }}
            />
            <p className="text-xs text-gray-500 text-center">
              You will be redirected to PayPal to complete your payment securely.
            </p>
          </div>
        </PayPalScriptProvider>
      )}

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Your payment is secured with 256-bit SSL encryption. We never store your card details.
        </p>
      </div>
    </div>
  );
};

export default PaymentForm;