import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, Home } from 'lucide-react';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  const handleRetryPayment = () => {
    if (orderId && localStorage.getItem('currentOrderId') === orderId) {
      // You could implement a retry logic here
      // For now, just go back to pricing
      window.location.href = '/pricing';
    } else {
      window.location.href = '/pricing';
    }
  };

  return (
    <main className="bg-black text-white min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-900 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-400/10 rounded-full mb-6 mx-auto">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4">
              <span className="bg-linear-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Payment Cancelled
              </span>
            </h1>
            
            <p className="text-gray-400 mb-6">
              Your payment was cancelled. No charges were made to your account.
            </p>

            {orderId && (
              <div className="mb-6 p-4 rounded-xl bg-gray-800/30">
                <p className="text-gray-300 text-sm">
                  <span className="text-gray-400">Order ID:</span>{' '}
                  <span className="font-mono">{orderId}</span>
                </p>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleRetryPayment}
                className="w-full inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Pricing
              </button>
              
              <a 
                href="/"
                className="w-full inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-green-400 border-2 border-green-400 rounded-full hover:bg-green-400/10 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </a>
              
              <p className="text-gray-500 text-sm pt-4 border-t border-gray-800">
                Need help?{' '}
                <a href="/contact" className="text-green-400 hover:underline">
                  Contact our support team
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PaymentCancel;