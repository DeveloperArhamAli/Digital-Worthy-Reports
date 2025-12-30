import { useState } from 'react';
import { CardElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { CreditCard, Loader, Lock, Shield, CheckCircle } from 'lucide-react';
import { CustomerInfo, PaymentDetails } from '../types/payment';
import axios from 'axios';

// Load Stripe promise (this won't initialize until used)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentFormProps {
  paymentMethod: 'stripe' | 'paypal';
  paymentDetails: PaymentDetails;
  customerInfo: CustomerInfo;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

// Stripe Elements options
const stripeOptions = {
  appearance: {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#00ff88',
      colorBackground: '#1a1a1a',
      colorText: '#e0e0e0',
      colorDanger: '#ff4444',
      fontFamily: 'Inter, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px'
    }
  }
};

// Payment Summary Component
const PaymentSummary = ({ paymentDetails }: { paymentDetails: PaymentDetails }) => {
  const getReportColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'basic': return 'text-amber-500';
      case 'silver': return 'text-gray-300';
      case 'gold': return 'text-yellow-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
      <h4 className="text-lg font-semibold text-white mb-3">Order Summary</h4>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Report Type:</span>
          <span className={`font-semibold ${getReportColor(paymentDetails.reportType)}`}>
            {paymentDetails.reportType.charAt(0).toUpperCase() + paymentDetails.reportType.slice(1)} Report
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Vehicle VIN:</span>
          <span className="font-mono text-white">{paymentDetails.vin}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Report Price:</span>
          <span className="text-xl font-bold text-neon-green">
            ${paymentDetails.amount.toFixed(2)}
          </span>
        </div>
        
        <div className="flex justify-between items-center border-t border-gray-700 pt-3 mt-3">
          <span className="text-gray-400">Total Amount:</span>
          <span className="text-2xl font-bold text-neon-green">
            ${paymentDetails.amount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

// Stripe-specific form component
const StripeForm = ({ 
  paymentDetails, 
  customerInfo, 
  onSuccess,
  onError
}: Omit<PaymentFormProps, 'paymentMethod'>) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const stripe = useStripe();
  const elements = useElements();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const handleStripeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setCardError('Card element not found');
      return;
    }

    if (!cardComplete) {
      setCardError('Please complete your card details');
      return;
    }

    setIsProcessing(true);
    setCardError(null);

    try {
      // Step 1: Create Payment Intent on your server
      const paymentIntentResponse = await axios.post(`${API_URL}/create-payment-intent`, {
        amount: paymentDetails.amount * 100, // Convert to cents
        currency: paymentDetails.currency.toLowerCase(),
        customer: {
          name: "Arham",
          email: "arham@arham.com",
          reportType: paymentDetails.reportType,
          vin: paymentDetails.vin
        },
        reportType: paymentDetails.reportType,
        vin: paymentDetails.vin,
        metadata: {
          reportType: paymentDetails.reportType,
          vin: paymentDetails.vin,
          customerEmail: customerInfo.email
        }
      });

      const { clientSecret, paymentIntentId } = paymentIntentResponse.data;

      if (!clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Step 2: Confirm the payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: customerInfo.name,
              email: customerInfo.email,
              phone: customerInfo.phone,
              address: {
                line1: customerInfo.address,
                city: customerInfo.city,
                state: customerInfo.state,
                postal_code: customerInfo.postalCode,
                country: customerInfo.country || 'US'
              }
            }
          },
          return_url: `${window.location.origin}/payment-success?session_id=${paymentIntentId}`
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed');
      }

      if (paymentIntent?.status === 'succeeded') {
        // Step 3: Verify payment on your server
        const verificationResponse = await axios.post(`${API_URL}/verify-payment`, {
          paymentIntentId: paymentIntent.id,
          reportType: paymentDetails.reportType,
          vin: paymentDetails.vin,
          customer: customerInfo
        });

        if (verificationResponse.data.success) {
          // Step 4: Generate and deliver the report
          const reportResponse = await axios.post(`${API_URL}/generate-report`, {
            paymentIntentId: paymentIntent.id,
            reportType: paymentDetails.reportType,
            vin: paymentDetails.vin,
            customer: customerInfo,
            paymentMethod: 'stripe'
          });

          // Step 5: Call success callback with all data
          onSuccess({
            success: true,
            paymentIntent,
            report: reportResponse.data.report,
            downloadUrl: reportResponse.data.downloadUrl,
            reportId: reportResponse.data.reportId,
            message: `Your ${paymentDetails.reportType} report has been generated successfully!`
          });
        } else {
          throw new Error('Payment verification failed');
        }
      } else {
        throw new Error(`Payment status: ${paymentIntent?.status}`);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Payment failed. Please try again.';
      setCardError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardChange = (event: any) => {
    setCardComplete(event.complete);
    setCardError(event.error ? event.error.message : null);
  };

  return (
    <div className="space-y-6">
      <PaymentSummary paymentDetails={paymentDetails} />
      
      <form onSubmit={handleStripeSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Card Details
          </label>
          <div className={`p-4 border rounded-lg transition-colors ${
            cardError ? 'border-red-500 bg-red-500/5' : 'border-gray-700 bg-gray-800/30'
          }`}>
            <CardElement
              onChange={handleCardChange}
              options={{
                style: {
                  base: {
                    color: '#e0e0e0',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    '::placeholder': {
                      color: '#666'
                    },
                    iconColor: '#00ff88' 
                  },
                  invalid: {
                    color: '#ff4444',
                    iconColor: '#ff4444'
                  }
                },
                hidePostalCode: true
              }}
            />
          </div>
          {cardError && (
            <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
              <Shield className="w-4 h-4" />
              {cardError}
            </p>
          )}
        </div>

        <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-neon-green/10">
              <Lock className="w-5 h-5 text-neon-green" />
            </div>
            <div className="flex-1">
              <h5 className="text-sm font-medium text-white mb-1">Secure Payment</h5>
              <p className="text-xs text-gray-400">
                Your payment is processed securely through Stripe. We never store your card details.
                All transactions are encrypted with 256-bit SSL.
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || !cardComplete || isProcessing}
          className="w-full py-3 px-4 bg-neon-green text-black font-semibold rounded-lg hover:bg-neon-green-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-neon-green/20"
        >
          {isProcessing ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay ${paymentDetails.amount.toFixed(2)}
            </>
          )}
        </button>
        
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            256-bit SSL
          </span>
          <span className="flex items-center gap-1">
            <Shield className="w-4 h-4 text-blue-500" />
            PCI Compliant
          </span>
          <span className="flex items-center gap-1">
            <Lock className="w-4 h-4 text-purple-500" />
            Secure
          </span>
        </div>
      </form>
    </div>
  );
};

// PayPal component
const PayPalForm = ({ 
  paymentDetails, 
  customerInfo, 
  onSuccess,
  onError
}: Omit<PaymentFormProps, 'paymentMethod'>) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paypalError, setPaypalError] = useState<string | null>(null);

  const paypalOptions = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
    currency: paymentDetails.currency,
    intent: 'capture',
    components: 'buttons',
    disableFunding: 'card,venmo'
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const createPayPalOrder = async (): Promise<string> => {
    setIsProcessing(true);
    setPaypalError(null);

    try {
      const response = await axios.post(`${API_URL}/create-paypal-order`, {
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        customer: {
          ...customerInfo,
          reportType: paymentDetails.reportType,
          vin: paymentDetails.vin
        },
        reportType: paymentDetails.reportType,
        vin: paymentDetails.vin,
        metadata: {
          customerEmail: customerInfo.email,
          reportType: paymentDetails.reportType
        }
      });

      if (!response.data.orderID) {
        throw new Error('Failed to create PayPal order');
      }

      return response.data.orderID;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create PayPal order';
      setPaypalError(errorMessage);
      onError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const onPayPalApprove = async (data: { orderID: string }) => {
    setIsProcessing(true);
    setPaypalError(null);

    try {
      // Step 1: Capture PayPal order
      const captureResponse = await axios.post(`${API_URL}/capture-paypal-order`, {
        orderId: data.orderID,
        customer: customerInfo,
        reportType: paymentDetails.reportType,
        vin: paymentDetails.vin
      });

      const { capture, orderID } = captureResponse.data;

      if (capture.status !== 'COMPLETED') {
        throw new Error('Payment was not completed successfully');
      }

      // Step 2: Generate and deliver the report
      const reportResponse = await axios.post(`${API_URL}/generate-report`, {
        orderId: orderID,
        reportType: paymentDetails.reportType,
        vin: paymentDetails.vin,
        customer: customerInfo,
        paymentMethod: 'paypal',
        transactionId: capture.id
      });

      // Step 3: Call success callback
      onSuccess({
        success: true,
        orderId: orderID,
        capture,
        report: reportResponse.data.report,
        downloadUrl: reportResponse.data.downloadUrl,
        reportId: reportResponse.data.reportId,
        message: `Your ${paymentDetails.reportType} report has been generated successfully!`
      });

    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to capture PayPal order';
      setPaypalError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const onPayPalError = (err: any) => {
    const errorMessage = err.message || 'PayPal payment failed. Please try another method.';
    setPaypalError(errorMessage);
    onError(errorMessage);
  };

  return (
    <div className="space-y-6">
      <PaymentSummary paymentDetails={paymentDetails} />
      
      <PayPalScriptProvider options={paypalOptions}>
        <div className="space-y-4">
          {isProcessing && (
            <div className="text-center py-4">
              <Loader className="w-8 h-8 animate-spin text-neon-green mx-auto mb-2" />
              <p className="text-gray-400">Processing PayPal payment...</p>
            </div>
          )}
          
          {paypalError && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400">{paypalError}</p>
            </div>
          )}
          
          {!isProcessing && (
            <>
              <PayPalButtons
                style={{
                  layout: 'vertical',
                  color: 'gold',
                  shape: 'pill',
                  label: 'paypal',
                  height: 48
                }}
                createOrder={createPayPalOrder}
                onApprove={onPayPalApprove}
                onError={onPayPalError}
                onCancel={() => {
                  setPaypalError('Payment was cancelled');
                  onError('Payment was cancelled');
                }}
                disabled={isProcessing}
              />
              
              <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Shield className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-white mb-1">PayPal Protection</h5>
                    <p className="text-xs text-gray-400">
                      Your payment is protected by PayPal's buyer protection. You'll be redirected to PayPal's secure site to complete your payment.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
          
          <p className="text-xs text-gray-500 text-center">
            You will be redirected to PayPal to complete your payment securely.
          </p>
        </div>
      </PayPalScriptProvider>
    </div>
  );
};

// Main PaymentForm component
const PaymentForm = (props: PaymentFormProps) => {
  const [error, setError] = useState<string | null>(null);

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    props.onError(errorMessage);
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Indicator */}
      <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            props.paymentMethod === 'stripe' 
              ? 'bg-blue-500/10 border border-blue-500/30' 
              : 'bg-yellow-500/10 border border-yellow-500/30'
          }`}>
            {props.paymentMethod === 'stripe' ? (
              <CreditCard className="w-6 h-6 text-blue-400" />
            ) : (
              <svg className="w-6 h-6 text-yellow-400" viewBox="0 0 24 24">
                <path fill="currentColor" d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.208-.613c-.604-1.558-1.965-2.274-3.67-2.274h-4.88a.64.64 0 0 0-.633.535l-.57 3.63a.641.641 0 0 0 .633.74h2.782c4.17 0 7.04-1.972 7.34-6.404.015-.213.024-.413.024-.614z"/>
              </svg>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {props.paymentMethod === 'stripe' ? 'Credit/Debit Card' : 'PayPal'}
            </h3>
            <p className="text-sm text-gray-400">
              {props.paymentMethod === 'stripe' 
                ? 'Pay securely with your card' 
                : 'Pay with your PayPal account'}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          props.paymentMethod === 'stripe' 
            ? 'bg-blue-500/20 text-blue-400' 
            : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {props.paymentMethod === 'stripe' ? 'Secure' : 'Protected'}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {props.paymentMethod === 'stripe' && stripePromise ? (
        <Elements stripe={stripePromise} options={stripeOptions}>
          <StripeForm {...props} onError={handleError} />
        </Elements>
      ) : (
        <PayPalForm {...props} onError={handleError} />
      )}

      {/* Payment Guarantee */}
      <div className="p-4 bg-neon-green/5 border border-neon-green/20 rounded-xl">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-neon-green" />
          <div>
            <h4 className="font-semibold text-white">Payment Guarantee</h4>
            <p className="text-sm text-gray-400">
              Your payment is 100% secure. We offer a {props.paymentDetails.reportType === 'basic' ? '30' : 
                props.paymentDetails.reportType === 'silver' ? '60' : '90'}-day money-back guarantee.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;