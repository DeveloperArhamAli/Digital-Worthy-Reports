import React, { useState } from 'react';
import { X, Shield, Lock } from 'lucide-react';
import PaymentForm from './PaymentForm';
import { CustomerInfo, PaymentDetails } from '../types/payment';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentDetails: PaymentDetails;
  customerInfo: CustomerInfo;
  onPaymentSuccess: (result: any) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  paymentDetails,
  customerInfo,
  onPaymentSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'stripe' | 'paypal'>('stripe');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-linear-to-br from-gray-900 to-black rounded-2xl border border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Complete Your Purchase
                </h2>
                <p className="text-gray-400">
                  Secure payment for your vehicle history report
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Order Summary */}
            <div className="mb-8 p-4 rounded-xl bg-gray-800/30 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Report Type</span>
                  <span className="text-white font-medium">
                    {paymentDetails.reportType.charAt(0).toUpperCase() + paymentDetails.reportType.slice(1)} Report
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vehicle VIN</span>
                  <span className="text-white font-medium">{customerInfo.vin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-2xl font-bold text-neon-green">
                    ${paymentDetails.amount}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info Display */}
            <div className="mb-8 p-4 rounded-xl bg-gray-800/30 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Your Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Name</p>
                  <p className="text-white font-medium">{customerInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white font-medium">{customerInfo.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <p className="text-white font-medium">{customerInfo.phone}</p>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <div className="flex border-b border-gray-800">
                <button
                  onClick={() => setActiveTab('stripe')}
                  className={`flex-1 py-3 text-center font-medium ${
                    activeTab === 'stripe'
                      ? 'text-neon-green border-b-2 border-neon-green'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Credit/Debit Card
                </button>
                <button
                  onClick={() => setActiveTab('paypal')}
                  className={`flex-1 py-3 text-center font-medium ${
                    activeTab === 'paypal'
                      ? 'text-neon-green border-b-2 border-neon-green'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  PayPal
                </button>
              </div>
            </div>

            {/* Payment Form */}
            <PaymentForm
              paymentMethod={activeTab}
              paymentDetails={paymentDetails}
              customerInfo={customerInfo}
              onSuccess={onPaymentSuccess}
            />

            {/* Security Badges */}
            <div className="mt-8 pt-6 border-t border-gray-800">
              <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-400">SSL Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-400">PCI Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-400">256-bit Encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;