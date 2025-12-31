import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  ShieldCheck, 
  ChevronRight, 
  Check, 
  X, 
  Zap, 
  Shield, 
  FileText, 
  TrendingUp,
  Car,
  User,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  CreditCard,
  HelpCircle,
  ChevronDown,
  Loader2,
  ArrowRight
} from 'lucide-react';
import axios from 'axios';

interface PricingPlan {
  id: number;
  name: string;
  price: number;
  features: Array<{
    title: string;
    provided: boolean;
  }>;
  isPopular: boolean;
  description: string;
  icon: React.ElementType;
  color: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  vin: string;
}

const PricingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [step, setStep] = useState<'select' | 'details' | 'review'>('select');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
  
  const customerForm = useForm<CustomerInfo>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      vin: ''
    },
    mode: 'onChange'
  });

  const pricingPlans: PricingPlan[] = [
    {
      id: 1,
      name: 'Basic',
      price: 50,
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      description: 'Essential information and history for your vehicle',
      features: [
        { title: "1 Vehicle Report", provided: true },
        { title: "Ownership Costs", provided: true },
        { title: "Accident Information", provided: true },
        { title: "Market Value Range", provided: true },
        { title: "Owner's History", provided: true },
        { title: "Vehicle Specification", provided: false },
        { title: "Safety Recall Status", provided: false },
        { title: "Online Listing History", provided: false },
        { title: "Warranties", provided: false },
        { title: "Salvage Information", provided: false },
        { title: "Installed Equipment", provided: false }
      ],
      isPopular: false,
    },
    {
      id: 2,
      name: 'Silver',
      price: 80,
      icon: Shield,
      color: 'from-green-400 to-teal-400',
      description: 'Comprehensive report with additional insights',
      features: [
        { title: "1 Vehicle Report", provided: true },
        { title: "Ownership Costs", provided: true },
        { title: "Accident Information", provided: true },
        { title: "Market Value Range", provided: true },
        { title: "Owner's History", provided: true },
        { title: "Vehicle Specification", provided: true },
        { title: "Safety Recall Status", provided: true },
        { title: "Online Listing History", provided: false },
        { title: "Warranties", provided: false },
        { title: "Salvage Information", provided: false },
        { title: "Installed Equipment", provided: false }
      ],
      isPopular: true,
    },
    {
      id: 3,
      name: 'Gold',
      price: 100,
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-500',
      description: 'Complete vehicle analysis with premium features',
      features: [
        { title: "1 Vehicle Report", provided: true },
        { title: "Ownership Costs", provided: true },
        { title: "Accident Information", provided: true },
        { title: "Market Value Range", provided: true },
        { title: "Owner's History", provided: true },
        { title: "Vehicle Specification", provided: true },
        { title: "Safety Recall Status", provided: true },
        { title: "Online Listing History", provided: true },
        { title: "Warranties", provided: true },
        { title: "Salvage Information", provided: true },
        { title: "Installed Equipment", provided: true }
      ],
      isPopular: false,
    },
  ];

  const handlePlanSelect = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setStep('details');
    setTimeout(() => {
      document.getElementById('customer-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  const handleSubmitDetails = async (data: CustomerInfo) => {
    if (data.vin.length !== 17) {
      alert('Please enter a valid 17-digit VIN');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      alert('Please enter a valid email address');
      return;
    }

    setStep('review');
  };

  const handleProceedToPayment = async () => {
    if (!selectedPlan) return;

    setIsProcessing(true);
    setError('');

    const customerData = customerForm.getValues();
    
    try {
      const result = await axios.post(`${backendUrl}/api/create-order`, {
        plan: selectedPlan.name.toLowerCase(),
        vin: customerData.vin,
        customer: {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone
        }
      });

      console.log(result);

      setIsProcessing(false);

      if (result.data.success) {
        localStorage.setItem('currentOrderId', result.data.orderId);
        window.location.href = result.data.stripeUrl;
      } else {
        setError(result.data.error || 'Failed to create order');
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error('Error creating order:', error.message);
      setError('Network error. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleBackToPlans = () => {
    setStep('select');
    setSelectedPlan(null);
  };

  const handleBackToForm = () => {
    setStep('details');
  };

  return (
    <main className="bg-black text-white min-h-screen">
      <section className="relative bg-linear-to-b from-gray-900 to-black overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-green-400/5 via-transparent to-green-400/5"></div>
        
        <div className="container mx-auto px-4 relative py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-400/10 border border-green-400/30 mb-6">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">
                Get Your Vehicle History Report
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Choose Your Report
              </span>
              <br />
              <span className="bg-linear-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                Package
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Select your package, enter your VIN and contact information, and get your 
              comprehensive vehicle history report delivered to your email.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-green-400 to-transparent"></div>
      </section>

      {step !== 'select' && (
        <section className="py-8 bg-gray-900/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center">
                <div className={`flex items-center ${step === 'details' || step === 'review' ? 'text-green-400' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'details' || step === 'review' ? 'bg-green-400/10 border border-green-400' : 'bg-gray-800 border border-gray-700'}`}>
                    1
                  </div>
                  <span className="ml-2 font-medium">Select Package</span>
                </div>
                
                <div className={`w-16 h-px mx-4 ${step === 'details' || step === 'review' ? 'bg-green-400' : 'bg-gray-700'}`}></div>
                
                <div className={`flex items-center ${step === 'details' || step === 'review' ? 'text-green-400' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'details' || step === 'review' ? 'bg-green-400/10 border border-green-400' : 'bg-gray-800 border border-gray-700'}`}>
                    {step === 'review' ? <Check className="w-4 h-4" /> : 2}
                  </div>
                  <span className="ml-2 font-medium">Enter Details</span>
                </div>
                
                <div className={`w-16 h-px mx-4 ${step === 'review' ? 'bg-green-400' : 'bg-gray-700'}`}></div>
                
                <div className={`flex items-center ${step === 'review' ? 'text-green-400' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'review' ? 'bg-green-400/10 border border-green-400' : 'bg-gray-800 border border-gray-700'}`}>
                    3
                  </div>
                  <span className="ml-2 font-medium">Review & Pay</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {step === 'select' && (
        <section className="py-20 bg-linear-to-b from-black to-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-linear-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                  Choose Your Report Package
                </span>
              </h2>
              <p className="text-xl text-gray-400">
                Select the perfect plan for your needs
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingPlans.map((plan) => {
                const Icon = plan.icon;
                return (
                  <div 
                    key={plan.id}
                    className={`relative p-8 rounded-2xl border-2 transition-all duration-300 ${
                      selectedPlan?.id === plan.id 
                        ? 'border-green-400 bg-gray-900 scale-105 shadow-xl shadow-green-400/10' 
                        : plan.isPopular 
                          ? 'border-green-400 bg-gray-900/50 hover:scale-105' 
                          : 'border-gray-800 bg-gray-900/30 hover:scale-105 hover:border-green-400'
                    }`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="px-4 py-1 bg-green-400 text-black text-sm font-semibold rounded-full flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          MOST POPULAR
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-8">
                      <div className={`inline-flex p-3 rounded-xl bg-linear-to-br ${plan.color} mb-4`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                      <p className="text-gray-400 mb-4">{plan.description}</p>
                      <div className="flex items-baseline justify-center">
                        <span className="text-5xl font-bold text-white">${plan.price}</span>
                        <span className="text-gray-400 ml-2">/report</span>
                      </div>
                      <p className="text-gray-400 text-sm mt-2">One-time payment</p>
                    </div>

                    <div className="space-y-3 mb-8">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          {feature.provided ? (
                            <Check className="w-5 h-5 text-green-400 shrink-0" />
                          ) : (
                            <X className="w-5 h-5 text-red-500 shrink-0" />
                          )}
                          <span className={`${feature.provided ? 'text-white' : 'text-gray-600'} flex-1`}>
                            {feature.title}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePlanSelect(plan)}
                      className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                        plan.isPopular
                          ? 'bg-green-400 text-black hover:bg-green-500'
                          : 'bg-gray-800 text-white hover:bg-gray-700'
                      }`}
                    >
                      Select {plan.name} Package
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-16 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-green-400/10 border border-green-400/30">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">
                  All packages include our 100% satisfaction guarantee
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {step === 'details' && selectedPlan && (
        <section id="customer-form" className="py-20 bg-black">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <button
                  onClick={handleBackToPlans}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  ← Back to packages
                </button>
              </div>

              <div className="mb-8 p-6 rounded-xl bg-green-400/5 border border-green-400/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-green-400">Selected Package</h3>
                    <p className="text-2xl font-bold text-white">{selectedPlan.name} Report - ${selectedPlan.price}</p>
                  </div>
                  <button
                    onClick={handleBackToPlans}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Change
                  </button>
                </div>
              </div>

              <div className="bg-gray-900 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-green-400/10">
                    <User className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Enter Your Details</h2>
                    <p className="text-gray-400">We'll send your report to this email</p>
                  </div>
                </div>

                <form onSubmit={customerForm.handleSubmit(handleSubmitDetails)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          {...customerForm.register('name', { required: 'Name is required' })}
                          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
                          placeholder="John Doe"
                        />
                      </div>
                      {customerForm.formState.errors.name && (
                        <p className="mt-1 text-sm text-red-400">{customerForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="email"
                          {...customerForm.register('email', { 
                            required: 'Email is required',
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: 'Please enter a valid email address'
                            }
                          })}
                          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
                          placeholder="john@example.com"
                        />
                      </div>
                      {customerForm.formState.errors.email && (
                        <p className="mt-1 text-sm text-red-400">{customerForm.formState.errors.email.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="tel"
                        {...customerForm.register('phone')}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
                        placeholder="(123) 456-7890"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      17-digit Vehicle Identification Number (VIN) *
                    </label>
                    <div className="relative">
                      <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        {...customerForm.register('vin', { 
                          required: 'VIN is required',
                          minLength: {
                            value: 17,
                            message: 'VIN must be 17 characters'
                          },
                          maxLength: {
                            value: 17,
                            message: 'VIN must be 17 characters'
                          }
                        })}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-400 uppercase"
                        placeholder="1HGCM82633A123456"
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase();
                          customerForm.setValue('vin', value);
                        }}
                        maxLength={17}
                      />
                    </div>
                    {customerForm.formState.errors.vin && (
                      <p className="mt-1 text-sm text-red-400">{customerForm.formState.errors.vin.message}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Found on dashboard, door jamb, or registration documents
                    </p>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={customerForm.formState.isSubmitting}
                      className="w-full py-3 px-4 bg-green-400 text-black font-semibold rounded-lg hover:bg-green-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Continue to Review
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-800">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-gray-300 text-sm">
                        Your information is secure and will only be used to generate and deliver your vehicle history report.
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        By proceeding, you agree to our Terms of Service and Privacy Policy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {step === 'review' && selectedPlan && (
        <section className="py-20 bg-linear-to-b from-black to-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <button
                  onClick={handleBackToForm}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  ← Back to details
                </button>
              </div>

              <div className="bg-gray-900 rounded-2xl p-8 mb-6">
                <h2 className="text-2xl font-bold text-white mb-6">Review & Confirm</h2>
                
                <div className="mb-8 p-6 rounded-xl bg-gray-800/50">
                  <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium">{selectedPlan.name} Vehicle History Report</p>
                        <p className="text-gray-400 text-sm">One-time purchase</p>
                      </div>
                      <p className="text-xl font-bold text-green-400">${selectedPlan.price}</p>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-700">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total</span>
                        <span className="text-2xl font-bold text-white">${selectedPlan.price}.00</span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">All prices in USD</p>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Your Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Name</p>
                      <p className="text-white">{customerForm.watch('name')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white">{customerForm.watch('email')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <p className="text-white">{customerForm.watch('phone') || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">VIN</p>
                      <p className="text-white font-mono">{customerForm.watch('vin')}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">What's Included</h3>
                  <div className="space-y-2">
                    {selectedPlan.features.filter(f => f.provided).slice(0, 6).map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-gray-300">{feature.title}</span>
                      </div>
                    ))}
                    {selectedPlan.features.filter(f => f.provided).length > 6 && (
                      <p className="text-gray-400 text-sm">+ {selectedPlan.features.filter(f => f.provided).length - 6} more features</p>
                    )}
                  </div>
                </div>

                <div className="mb-8 p-6 rounded-xl bg-green-400/5 border border-green-400/30">
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="w-5 h-5 text-green-400" />
                    <h4 className="text-white font-semibold">Secure Payment</h4>
                  </div>
                  <p className="text-gray-300 text-sm">
                    You'll be redirected to Stripe for secure payment processing. 
                    After successful payment, your report will be generated and sent to your email within minutes.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-red-500 font-medium">Error</p>
                        <p className="text-red-400/80 text-sm mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <button
                    onClick={handleProceedToPayment}
                    disabled={isProcessing}
                    className="w-full py-4 bg-green-400 text-black font-bold rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Proceed to Secure Payment
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                  <p className="text-gray-500 text-sm text-center mt-3">
                    By clicking above, you'll be redirected to Stripe for payment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default PricingPage;