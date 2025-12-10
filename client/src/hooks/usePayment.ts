import { useState, useCallback } from 'react';
import { CustomerInfo, PaymentDetails, ReportPreview, PaymentResult } from '../types/payment';
import paymentService from '../services/paymentService';
import emailService from '../services/emailService';

export const usePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ReportPreview | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

  const generatePreview = useCallback(async (vin: string) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      const data = await paymentService.generatePreview(vin);
      setPreview(data);
      
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate preview');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const processPayment = useCallback(async (
    paymentMethod: 'stripe' | 'paypal',
    paymentDetails: PaymentDetails,
    customerInfo: CustomerInfo
  ) => {
    try {
      setIsProcessing(true);
      setError(null);

      let result;
      
      if (paymentMethod === 'stripe') {
        // Process Stripe payment
        const paymentIntent = await paymentService.createPaymentIntent(
          paymentDetails.amount,
          paymentDetails.currency,
          customerInfo,
          paymentDetails.reportType
        );
        
        // Note: Actual Stripe confirmation happens in PaymentForm component
        result = {
          success: true,
          transactionId: paymentIntent.id
        };
      } else {
        // Process PayPal payment
        const order = await paymentService.createPayPalOrder(
          paymentDetails.amount,
          paymentDetails.currency,
          customerInfo,
          paymentDetails.reportType
        );
        
        result = {
          success: true,
          transactionId: order.id
        };
      }

      // Send processing notification
      await emailService.sendProcessingNotification(
        customerInfo.email,
        customerInfo.name,
        customerInfo.vin,
        '2-3 minutes'
      );

      // Generate full report
      const reportData = await paymentService.generateFullReport(
        result.transactionId!,
        customerInfo,
        paymentDetails.reportType
      );

      // Send report email
      await emailService.sendReportEmail(
        customerInfo.email,
        customerInfo.name,
        customerInfo.vin,
        reportData.reportUrl,
        paymentDetails.reportType
      );

      // Send payment confirmation
      await emailService.sendPaymentConfirmation(
        customerInfo.email,
        customerInfo.name,
        paymentDetails.amount,
        result.transactionId!
      );

      const finalResult: PaymentResult = {
        ...result,
        customer: customerInfo,
        reportUrl: reportData.reportUrl,
        message: 'Report generated and sent to your email!'
      };

      setPaymentResult(finalResult);
      return finalResult;
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment processing failed');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setPreview(null);
    setPaymentResult(null);
    setError(null);
    setIsProcessing(false);
  }, []);

  return {
    isProcessing,
    error,
    preview,
    paymentResult,
    generatePreview,
    processPayment,
    reset
  };
};