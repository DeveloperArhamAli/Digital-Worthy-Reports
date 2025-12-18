import React, { useState, useEffect } from 'react';
import { Car, CheckCircle, CreditCard, AlertCircle } from 'lucide-react';
import ReportPreview from './ReportPreview';
import CheckoutModal from './CheckoutModal';
import PaymentSuccess from './PaymentSuccess';
import { usePayment } from '../hooks/usePayment';
import { CustomerInfo, ReportPreview as ReportPreviewType } from '../types/payment';

const PricingCTA: React.FC = () => {
  const [step, setStep] = useState<'initial' | 'preview' | 'checkout' | 'success'>('initial');
  const [vin, setVin] = useState('');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    address: null,
    city: null,
    state: null,
    postalCode: null,
    country: '',
    name: '',
    email: '',
    phone: '',
    vin: ''
  });
  const [selectedReport, setSelectedReport] = useState<'bronze' | 'silver' | 'gold'>('bronze');
  const [showPlanWarning, setShowPlanWarning] = useState(false);
  
  const {
    isProcessing,
    error,
    preview,
    paymentResult,
    generatePreview,
    processPayment,
    reset
  } = usePayment();

  // Load selected plan from localStorage on mount
  useEffect(() => {
    const savedPlan = localStorage.getItem('selectedPlan');
    if (savedPlan) {
      const plan = JSON.parse(savedPlan);
      setSelectedReport(plan.name.toLowerCase());
    }
  }, []);

  const getSelectedPlanPrice = () => {
    const prices = {
      bronze: 50,
      silver: 80,
      gold: 100
    };
    return prices[selectedReport];
  };

  const handleGetPreview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if VIN is valid
    if (vin.length !== 17) {
      alert('Please enter a valid 17-digit VIN');
      return;
    }

    // Check if a plan is selected
    const savedPlan = localStorage.getItem('selectedPlan');
    if (!savedPlan) {
      setShowPlanWarning(true);
      
      // Scroll to pricing section
      const pricingSection = document.getElementById('pricing-section');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    try {
      const previewData = await generatePreview(vin);
      setCustomerInfo(prev => ({ ...prev, ...previewData.customerInfo }));
      setStep('preview');
    } catch (err) {
      console.error('Failed to generate preview:', err);
    }
  };

  const handleContinueToCheckout = () => {
    // Double-check plan is selected
    const savedPlan = localStorage.getItem('selectedPlan');
    if (!savedPlan) {
      setShowPlanWarning(true);
      return;
    }
    
    setStep('checkout');
  };

  const handlePaymentSuccess = (result: any) => {
    // Clear selected plan after successful payment
    localStorage.removeItem('selectedPlan');
    setStep('success');
  };

  const paymentDetails = {
    amount: getSelectedPlanPrice(),
    currency: 'USD',
    description: `${selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} Vehicle History Report`,
    reportType: selectedReport,
    vin: vin
  };

  // Get selected plan name
  const getSelectedPlanName = () => {
    const savedPlan = localStorage.getItem('selectedPlan');
    if (savedPlan) {
      const plan = JSON.parse(savedPlan);
      return plan.name;
    }
    return 'Bronze'; // default
  };

  return (
    <section className="py-20 bg-linear-to-br from-black via-gray-900 to-black" id="pricing-cta">
      <div className="container-custom">
        {step === 'initial' && (
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/30 mb-6">
                <span className="text-neon-green font-semibold">STEP 2: ENTER VIN</span>
              </div>
              
              <h2 className="text-5xl font-bold mb-4">
                <span className="text-white">Get Your </span>
                <span className="text-neon-green">Vehicle Report</span>
              </h2>
              
              {/* Selected Plan Display */}
              {localStorage.getItem('selectedPlan') && (
                <div className="mb-6 p-4 rounded-xl bg-neon-green/5 border border-neon-green/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Selected Plan</p>
                      <p className="text-xl font-bold text-neon-green">
                        {getSelectedPlanName()} Report - ${getSelectedPlanPrice()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        localStorage.removeItem('selectedPlan');
                        window.location.reload();
                      }}
                      className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}

              {showPlanWarning && (
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-yellow-500 font-medium">Please select a report plan first</p>
                      <p className="text-yellow-400/80 text-sm mt-1">
                        Choose a plan from the pricing section above before entering your VIN.
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
            
            {/* Selected Plan Reminder */}
            <div className="mb-6 p-4 rounded-xl bg-neon-green/5 border border-neon-green/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Selected Plan</p>
                  <p className="text-xl font-bold text-neon-green">
                    {getSelectedPlanName()} Report - ${getSelectedPlanPrice()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('selectedPlan');
                    window.location.href = '#pricing-section';
                    setTimeout(() => window.location.reload(), 100);
                  }}
                  className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Change Plan
                </button>
              </div>
            </div>
            
            <ReportPreview
              preview={preview}
              reportType={selectedReport}
              onContinue={handleContinueToCheckout}
            />
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