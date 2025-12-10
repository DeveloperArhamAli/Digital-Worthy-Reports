import React, { useState } from 'react';
import { Car, CheckCircle, CreditCard } from 'lucide-react';
import ReportPreview from './ReportPreview';
import CheckoutModal from './CheckoutModal';
import PaymentSuccess from './PaymentSuccess';
import { usePayment } from '../hooks/usePayment';
import { CustomerInfo } from '../types/payment';

const PricingCTA: React.FC = () => {
  const [step, setStep] = useState<'initial' | 'preview' | 'checkout' | 'success'>('initial');
  const [vin, setVin] = useState('');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    vin: ''
  });
  const [selectedReport, setSelectedReport] = useState<'bronze' | 'silver' | 'gold'>('bronze');
  
  const {
    isProcessing,
    error,
    preview,
    paymentResult,
    reset
  } = usePayment();

  const handleGetPreview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (vin.length !== 17) {
      alert('Please enter a valid 17-digit VIN');
      return;
    }

    try {
      setCustomerInfo(prev => ({ ...prev, vin }));
      setStep('preview');
    } catch (err) {
      console.error('Failed to generate preview:', err);
    }
  };

  const handleContinueToCheckout = () => {
    setStep('checkout');
  };

  const handlePaymentSuccess = () => {
    setStep('success');
  };

  const paymentDetails = {
    amount: selectedReport === 'bronze' ? 40 : selectedReport === 'silver' ? 60 : 90,
    currency: 'USD',
    description: `${selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} Vehicle History Report`,
    reportType: selectedReport
  };

  return (
    <section className="py-20 bg-linear-to-br from-black via-gray-900 to-black">
      <div className="container-custom">
        {step === 'initial' && (
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/30 mb-6">
                <span className="text-neon-green font-semibold">INSTANT ACCESS</span>
              </div>
              
              <h2 className="text-5xl font-bold mb-4">
                <span className="text-white">Get Your </span>
                <span className="text-neon-green">Vehicle Report</span>
              </h2>
              
              <h3 className="text-2xl font-semibold text-gray-300 mb-6">
                Enter your VIN for a free preview
              </h3>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-neon-green" />
                  <span className="text-gray-300">Free preview with basic information</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-neon-green" />
                  <span className="text-gray-300">Full report after secure payment</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-neon-green" />
                  <span className="text-gray-300">Report sent to your email instantly</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-8">
                <p className="text-gray-400 mb-3">Accepted Payment Methods:</p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">Credit/Debit</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50">
                    <span className="text-gray-300">PayPal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="p-8 rounded-2xl bg-linear-to-br from-gray-900 to-black border border-gray-800 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-neon-green/10">
                  <Car className="w-6 h-6 text-neon-green" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Enter Your VIN</h3>
                  <p className="text-gray-400 text-sm">Get a free preview instantly</p>
                </div>
              </div>

              <form onSubmit={handleGetPreview} className="space-y-6">
                <div>
                  <label htmlFor="vin" className="block text-sm font-medium text-gray-400 mb-2">
                    17-digit Vehicle Identification Number
                  </label>
                  <input
                    type="text"
                    id="vin"
                    value={vin}
                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                    placeholder="1HGCM82633A123456"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
                    maxLength={17}
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Found on dashboard or registration documents
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || vin.length !== 17}
                  className="w-full py-3 px-4 bg-neon-green text-black font-semibold rounded-lg hover:bg-neon-green-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Generating Preview...' : 'Get Free Preview'}
                </button>
              </form>

              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-800">
                <p className="text-gray-500 text-sm text-center">
                  Preview is free. You'll only pay for the full report after seeing what's available.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 'preview' && preview && (
          <div>
            <div className="mb-8">
              <button
                onClick={() => {
                  setStep('initial');
                  reset();
                }}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                ← Back to VIN entry
              </button>
            </div>
            
            <ReportPreview
              preview={preview}
              reportType={selectedReport}
              onContinue={handleContinueToCheckout}
            />

            {/* Report Type Selection */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-white mb-4">Select Report Type</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {(['bronze', 'silver', 'gold'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedReport(type)}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      selectedReport === type
                        ? 'border-neon-green bg-neon-green/5'
                        : 'border-gray-800 bg-gray-900/30 hover:border-gray-700'
                    }`}
                  >
                    <div className="text-left">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-lg font-semibold text-white">
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                        <span className="text-2xl font-bold text-neon-green">
                          ${type === 'bronze' ? 40 : type === 'silver' ? 60 : 90}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {type === 'bronze' && 'Basic history, title check, theft records'}
                        {type === 'silver' && 'Everything in Bronze + accidents, service records'}
                        {type === 'gold' && 'Everything in Silver + market value, verdict'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'checkout' && (
          <CheckoutModal
            isOpen={true}
            onClose={() => setStep('preview')}
            paymentDetails={paymentDetails}
            customerInfo={customerInfo}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}

        {step === 'success' && paymentResult && (
          <PaymentSuccess result={paymentResult} />
        )}
      </div>
    </section>
  );
};

export default PricingCTA;