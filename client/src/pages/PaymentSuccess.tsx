import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, Mail, Download, Home, Loader2 } from 'lucide-react';
import axios from 'axios';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId) {
        setError('No order ID found in URL');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Verify payment with backend
        const result = await axios.get(`${backendUrl}/api/verify-payment/${orderId}`);
        console.log("Verification result:", result.data.reportUrl);
        
        if (result.data.success && result.data.verified) {
          setOrderDetails({
            transactionId: result.data.transactionId,
            reportUrl: result.data.reportUrl,
          });

          // If report is generated, clear local storage
          if (result.data.payment?.reportUrl) {
            localStorage.removeItem('currentOrderId');
          }

          window.close();
        } else {
          setError('Payment verification failed or payment is still pending');
        }
      } catch (error) {
        setError('Failed to verify payment. Please try again later.');
        console.error('Error verifying payment:', error);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [orderId]);

  return (
    <main className="bg-black text-white min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-900 rounded-2xl p-8 text-center">
            {loading ? (
              <div className="py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-400/10 rounded-full mb-6 mx-auto">
                  <Loader2 className="w-10 h-10 text-green-400 animate-spin" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  <span className="bg-linear-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                    Verifying Payment...
                  </span>
                </h1>
                <p className="text-gray-400 mb-8">
                  Please wait while we verify your payment and generate your report.
                </p>
              </div>
            ) : error ? (
              <div className="py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-400/10 rounded-full mb-6 mx-auto">
                  <CheckCircle className="w-10 h-10 text-red-400" />
                </div>
                <h1 className="text-3xl font-bold mb-4">
                  <span className="bg-linear-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                    Verification Failed
                  </span>
                </h1>
                <p className="text-gray-400 mb-8">{error}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="/pricing"
                    className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Back to Pricing
                  </a>
                  <a 
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-green-400 border-2 border-green-400 rounded-full hover:bg-green-400/10 transition-colors"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-400/10 rounded-full mb-6 mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  <span className="bg-linear-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                    Payment Successful!
                  </span>
                </h1>
                
                <p className="text-gray-400 mb-8">
                  {orderDetails?.reportGenerated 
                    ? 'Your vehicle history report has been generated and sent to your email.'
                    : 'Your payment was successful. Your report is being generated and will be sent to your email shortly.'}
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 justify-center">
                    <Mail className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">
                      {orderDetails?.reportGenerated 
                        ? 'Report sent to your email'
                        : 'Report will be sent to your email within 5 minutes'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 justify-center">
                    <Download className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Download link available for 30 days</span>
                  </div>
                </div>

                {orderDetails?.reportUrl && (
                  <div className="mb-8">
                    <a 
                      href={orderDetails.reportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-8 py-3 text-sm font-semibold text-black bg-green-400 rounded-full hover:bg-green-500 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Report Now
                    </a>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-green-400 border-2 border-green-400 rounded-full hover:bg-green-400/10 transition-colors"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Back to Home
                  </a>
                  <a 
                    href="/pricing"
                    className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-black bg-green-400 rounded-full hover:bg-green-500 transition-colors"
                  >
                    Generate Another Report
                  </a>
                </div>

                <p className="text-gray-500 text-sm mt-8">
                  If you don't receive the email within 15 minutes, please check your spam folder 
                  or <a href="/contact" className="text-green-400 hover:underline">contact support</a>.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default PaymentSuccess;