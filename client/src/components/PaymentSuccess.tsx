import React from 'react';
import { CheckCircle, Mail, Download, Clock } from 'lucide-react';
import { PaymentResult } from '../types/payment';

interface PaymentSuccessProps {
  result: PaymentResult;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ result }) => {
  return (
    <div className="max-w-2xl mx-auto text-center py-12">
      <div className="inline-flex p-4 rounded-full bg-green-500/10 mb-6">
        <CheckCircle className="w-16 h-16 text-green-500" />
      </div>

      <h2 className="text-3xl font-bold text-white mb-4">
        Payment Successful! 🎉
      </h2>
      
      <p className="text-xl text-gray-300 mb-6">
        Your vehicle history report is being processed
      </p>

      <div className="space-y-4 mb-8">
        <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Transaction ID</span>
            <code className="text-neon-green font-mono">
              {result.transactionId?.slice(0, 12)}...
            </code>
          </div>
        </div>

        {result.customer && (
          <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-400">Name</p>
                <p className="text-white font-medium">{result.customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white font-medium">{result.customer.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">VIN</p>
                <p className="text-white font-medium">{result.customer.vin}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-xl bg-gray-800/30 border border-gray-700">
          <div className="inline-flex p-3 rounded-lg bg-blue-500/10 mb-4">
            <Mail className="w-6 h-6 text-blue-500" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">
            Check Your Email
          </h4>
          <p className="text-gray-400">
            Your report will be sent to {result.customer?.email} within 5 minutes
          </p>
        </div>

        <div className="p-6 rounded-xl bg-gray-800/30 border border-gray-700">
          <div className="inline-flex p-3 rounded-lg bg-green-500/10 mb-4">
            <Download className="w-6 h-6 text-green-500" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">
            Download Report
          </h4>
          <p className="text-gray-400">
            Access your report from the email link or your account dashboard
          </p>
        </div>

        <div className="p-6 rounded-xl bg-gray-800/30 border border-gray-700">
          <div className="inline-flex p-3 rounded-lg bg-yellow-500/10 mb-4">
            <Clock className="w-6 h-6 text-yellow-500" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">
            Processing Time
          </h4>
          <p className="text-gray-400">
            Reports are typically generated within 2-3 minutes after payment
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => window.location.href = '/account'}
          className="w-full py-3 px-4 bg-neon-green text-black font-semibold rounded-lg hover:bg-neon-green-dark transition-all duration-300"
        >
          Go to My Account
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 px-4 border border-gray-700 text-gray-300 font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          Generate Another Report
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-800">
        <p className="text-gray-500">
          Need help? <a href="#" className="text-neon-green hover:underline">Contact Support</a> or call (555) 123-4567
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;