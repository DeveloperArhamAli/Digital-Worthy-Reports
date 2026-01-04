import React, { useState, useEffect } from 'react';
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
  Loader2,
  ArrowRight,
  Download,
  ExternalLink,
  RefreshCw
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

interface OrderStatus {
  status: 'pending' | 'processing' | 'success' | 'failed' | 'expired';
  reportUrl?: string;
  message?: string;
  transactionId?: string;
}

const PricingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [step, setStep] = useState<'select' | 'details' | 'review' | 'processing' | 'complete'>('select');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [pollingInterval, setPollingInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const MAX_POLLING_ATTEMPTS = 100; // ~5 minutes at 3-second intervals

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  
  const customerForm = useForm<CustomerInfo>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      vin: ''
    },
    mode: 'onChange'
  });

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Check for existing order in URL params (return from Stripe)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdFromUrl = urlParams.get('orderId');
    const paymentStatus = urlParams.get('status');

    if (orderIdFromUrl && (paymentStatus === 'success' || !paymentStatus)) {
      // User returned from Stripe - start polling for status
      setOrderId(orderIdFromUrl);
      setStep('processing');
      startPollingOrderStatus(orderIdFromUrl);
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const pricingPlans: PricingPlan[] = [
  {
    id: 1,
    name: 'Basic',
    price: 50,
    icon: FileText,
    color: 'from-blue-500 to-cyan-500',
    description: 'Verify your vehicle identity and basic information',
    features: [
      { title: "VIN Decoding & Validation", provided: true },
      { title: "Make, Model, Year Confirmation", provided: true },
      { title: "Vehicle Type Classification", provided: true },
      { title: "Manufacturing Plant Details", provided: true },
      { title: "Error & Accuracy Assessment", provided: true },
      { title: "Engine Specifications", provided: false },
      { title: "Performance Metrics", provided: false },
      { title: "Safety System Information", provided: false },
      { title: "Weight & Capacity Ratings", provided: false },
      { title: "Fuel & Drivetrain Details", provided: false },
      { title: "Market Value Estimate", provided: false },
      { title: "Comprehensive Technical Report", provided: false }
    ],
    isPopular: false,
  },
  {
    id: 2,
    name: 'Silver',
    price: 80,
    icon: Shield,
    color: 'from-green-400 to-teal-400',
    description: 'Get detailed technical specifications and performance data',
    features: [
      { title: "VIN Decoding & Validation", provided: true },
      { title: "Make, Model, Year Confirmation", provided: true },
      { title: "Vehicle Type Classification", provided: true },
      { title: "Manufacturing Plant Details", provided: true },
      { title: "Error & Accuracy Assessment", provided: true },
      { title: "Engine Specifications", provided: true },
      { title: "Performance Metrics", provided: true },
      { title: "Safety System Information", provided: true },
      { title: "Weight & Capacity Ratings", provided: true },
      { title: "Fuel & Drivetrain Details", provided: true },
      { title: "Market Value Estimate", provided: false },
      { title: "Comprehensive Technical Report", provided: false }
    ],
    isPopular: true,
  },
  {
    id: 3,
    name: 'Gold',
    price: 100,
    icon: TrendingUp,
    color: 'from-amber-500 to-orange-500',
    description: 'Complete analysis with market insights and full technical report',
    features: [
      { title: "VIN Decoding & Validation", provided: true },
      { title: "Make, Model, Year Confirmation", provided: true },
      { title: "Vehicle Type Classification", provided: true },
      { title: "Manufacturing Plant Details", provided: true },
      { title: "Error & Accuracy Assessment", provided: true },
      { title: "Engine Specifications", provided: true },
      { title: "Performance Metrics", provided: true },
      { title: "Safety System Information", provided: true },
      { title: "Weight & Capacity Ratings", provided: true },
      { title: "Fuel & Drivetrain Details", provided: true },
      { title: "Market Value Estimate", provided: true },
      { title: "Comprehensive Technical Report", provided: true }
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
      setError('Please enter a valid 17-digit VIN');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setStep('review');
  };

  const startPollingOrderStatus = (orderId: string) => {
    // Reset polling attempts
    setPollingAttempts(0);
    
    const interval = setInterval(async () => {
      try {
        setPollingAttempts(prev => prev + 1);
        
        // Stop polling after max attempts
        if (pollingAttempts >= MAX_POLLING_ATTEMPTS) {
          clearInterval(interval);
          setOrderStatus({
            status: 'failed',
            message: 'Payment verification timeout. Please contact support.'
          });
          return;
        }

        const response = await axios.get(`${backendUrl}/api/order-status/${orderId}`);
        
        if (response.data.success) {
          const { status, reportUrl, message, transactionId } = response.data;
          
          if (status === 'success' && !reportUrl) {
            // Payment successful but report not generated yet - trigger generation
            setOrderStatus({
              status: 'processing',
              message: 'Payment verified! Generating your report...'
            });
            
            try {
              const reportResponse = await axios.post(`${backendUrl}/api/process-payment`, {
                orderId
              });
              
              if (reportResponse.data.success && reportResponse.data.reportUrl) {
                // Report generated successfully
                setOrderStatus({
                  status: 'success',
                  reportUrl: reportResponse.data.reportUrl,
                  message: 'Your report is ready!',
                  transactionId: transactionId
                });
                
                clearInterval(interval);
                setPollingInterval(null);
                setStep('complete');
                
                // Send email notification (optional)
                await axios.post(`${backendUrl}/api/send-report`, {
                  orderId,
                  email: customerForm.getValues().email
                }).catch(err => console.log('Email notification failed:', err));
              }
            } catch (reportError: any) {
              console.error('Report generation error:', reportError);
              setOrderStatus({
                status: 'failed',
                message: reportError.response?.data?.error || 'Failed to generate report'
              });
            }
          } else if (status === 'success' && reportUrl) {
            // Report already generated
            setOrderStatus({
              status: 'success',
              reportUrl: reportUrl,
              message: message || 'Your report is ready!',
              transactionId: transactionId
            });
            
            clearInterval(interval);
            setPollingInterval(null);
            setStep('complete');
          } else if (status === 'failed' || status === 'expired') {
            // Payment failed or expired
            setOrderStatus({
              status: status,
              message: message || 'Payment failed. Please try again.'
            });
            clearInterval(interval);
            setPollingInterval(null);
          } else if (status === 'pending') {
            // Still pending
            setOrderStatus({
              status: 'pending',
              message: message || 'Waiting for payment confirmation...'
            });
          } else if (status === 'completed') {
            // Already completed
            setOrderStatus({
              status: 'success',
              reportUrl: reportUrl,
              message: 'Your report is ready!',
              transactionId: transactionId
            });
            clearInterval(interval);
            setPollingInterval(null);
            setStep('complete');
          }
        }
      } catch (error: any) {
        console.error('Error polling order status:', error);
        
        if (pollingAttempts > 10) {
          setOrderStatus({
            status: 'failed',
            message: error.response?.data?.error || 'Failed to verify payment status'
          });
        }
      }
    }, 3000); // Poll every 3 seconds

    setPollingInterval(interval);
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

      if (result.data.success) {
        const orderId = result.data.orderId;
        const stripeUrl = result.data.stripeUrl;
        
        setOrderId(orderId);
        localStorage.setItem('currentOrderId', orderId);
        
        // Start polling for order status
        startPollingOrderStatus(orderId);
        
        // Change step to processing
        setStep('processing');
        
        // Open Stripe in new tab
        const stripeWindow = window.open(stripeUrl, '_blank');
        
        // Focus back to our window
        if (stripeWindow) {
          window.focus();
        }
        
        // Update status message
        setOrderStatus({
          status: 'pending',
          message: 'Redirecting to payment...'
        });
      } else {
        setError(result.data.error || 'Failed to create order');
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      setError(error.response?.data?.error || 'Network error. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleBackToPlans = () => {
    setStep('select');
    setSelectedPlan(null);
    setError('');
  };

  const handleBackToForm = () => {
    setStep('details');
    setError('');
  };

  const handleDownloadReport = () => {
    if (orderStatus?.reportUrl) {
      window.open(orderStatus.reportUrl, '_blank');
    }
  };

  const handleRestart = () => {
    setStep('select');
    setSelectedPlan(null);
    setOrderStatus(null);
    setOrderId('');
    setError('');
    customerForm.reset();
    
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
    setPollingAttempts(0);
  };

  const handleRetryVerification = () => {
    if (orderId) {
      startPollingOrderStatus(orderId);
    }
  };

  const formatVIN = (vin: string) => {
    return vin.toUpperCase().replace(/(.{4})/g, '$1 ').trim();
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'select', label: 'Select Package', number: 1 },
      { key: 'details', label: 'Enter Details', number: 2 },
      { key: 'review', label: 'Review & Pay', number: 3 },
      { key: 'processing', label: 'Processing', number: 4 },
      { key: 'complete', label: 'Complete', number: 5 }
    ];

    const currentStepIndex = steps.findIndex(step => step.key);

    return (
      <div className="py-8 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center overflow-x-auto">
              {steps.map((stepItem, index) => {
                const isCompleted = index < currentStepIndex;
                const isActive = step === stepItem.key;
                
                return (
                  <React.Fragment key={stepItem.key}>
                    <div className={`flex items-center ${isCompleted || isActive ? 'text-green-400' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted || isActive ? 'bg-green-400/10 border border-green-400' : 'bg-gray-800 border border-gray-700'}`}>
                        {isCompleted ? <Check className="w-4 h-4" /> : stepItem.number}
                      </div>
                      <span className="ml-2 font-medium hidden md:inline">{stepItem.label}</span>
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className={`w-8 md:w-16 h-px mx-2 md:mx-4 ${isCompleted ? 'bg-green-400' : 'bg-gray-700'}`}></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="bg-black text-white min-h-screen">
      {/* Hero Section */}
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

      {/* Step Indicator */}
      {step !== 'select' && renderStepIndicator()}

      {/* Step 1: Select Plan */}
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

      {/* Step 2: Enter Details */}
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
                          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition-colors"
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
                          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition-colors"
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
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition-colors"
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
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition-colors uppercase font-mono"
                        placeholder="1HGCM82633A123456"
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
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
                  
                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-red-400">{error}</p>
                      </div>
                    </div>
                  )}
                  
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

      {/* Step 3: Review & Pay */}
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
                      <p className="text-white font-mono">{formatVIN(customerForm.watch('vin'))}</p>
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

      {/* Step 4: Processing Payment */}
      {step === 'processing' && (
        <section className="py-20 bg-linear-to-b from-black to-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-900 rounded-2xl p-8 text-center">
                <div className="mb-6">
                  <Loader2 className="w-16 h-16 text-green-400 animate-spin mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Processing Your Payment
                </h2>
                
                {orderStatus && (
                  <div className={`p-4 rounded-xl mb-6 ${
                    orderStatus.status === 'pending' ? 'bg-blue-500/10 border border-blue-500/30' :
                    orderStatus.status === 'processing' ? 'bg-yellow-500/10 border border-yellow-500/30' :
                    orderStatus.status === 'success' ? 'bg-green-500/10 border border-green-500/30' :
                    'bg-red-500/10 border border-red-500/30'
                  }`}>
                    <div className="flex items-center justify-center gap-3 mb-2">
                      {orderStatus.status === 'pending' && <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />}
                      {orderStatus.status === 'processing' && <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />}
                      {orderStatus.status === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
                      {orderStatus.status === 'failed' && <AlertCircle className="w-5 h-5 text-red-400" />}
                      <p className={`font-medium ${
                        orderStatus.status === 'pending' ? 'text-blue-400' :
                        orderStatus.status === 'processing' ? 'text-yellow-400' :
                        orderStatus.status === 'success' ? 'text-green-400' :
                        'text-red-400'
                      }`}>
                        {orderStatus.message || `Status: ${orderStatus.status}`}
                      </p>
                    </div>
                    
                    {orderId && (
                      <p className="text-sm text-gray-400 mt-2">
                        Order ID: <span className="font-mono">{orderId}</span>
                      </p>
                    )}
                    
                    {pollingAttempts > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Checking status... ({pollingAttempts}/100)
                      </p>
                    )}
                  </div>
                )}
                
                <div className="space-y-4">
                  <p className="text-gray-400">
                    {orderStatus?.status === 'pending' 
                      ? 'Please complete your payment in the Stripe window. Once payment is confirmed, we\'ll generate your vehicle history report.'
                      : orderStatus?.status === 'processing'
                      ? 'Payment confirmed! We\'re now generating your comprehensive vehicle history report.'
                      : 'If you\'re not automatically redirected back, you can close the Stripe tab and return here.'
                    }
                  </p>
                  
                  {orderStatus?.status === 'failed' && (
                    <div className="space-y-4">
                      <button
                        onClick={handleRetryVerification}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 mx-auto"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Retry Verification
                      </button>
                      <p className="text-sm text-gray-500">
                        If the issue persists, please contact support with your Order ID.
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-gray-800">
                    <button
                      onClick={handleRestart}
                      className="px-6 py-2 border border-gray-700 text-gray-400 rounded-lg hover:text-white hover:border-gray-600 transition-colors"
                    >
                      Start Over
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Step 5: Complete - Report Ready */}
      {step === 'complete' && orderStatus?.status === 'success' && (
        <section className="py-20 bg-linear-to-b from-black to-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-900 rounded-2xl p-8 text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Payment Successful!
                  </h2>
                  <p className="text-gray-400 mb-8">
                    Your vehicle history report has been generated.
                  </p>
                </div>

                <div className="mb-8 p-6 rounded-xl bg-green-400/5 border border-green-400/30">
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="text-left">
                      <p className="text-sm text-gray-400">Order ID</p>
                      <p className="text-white font-mono text-sm">{orderId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">VIN</p>
                      <p className="text-white font-mono text-sm">{formatVIN(customerForm.watch('vin'))}</p>
                    </div>
                  </div>
                  
                  {orderStatus.reportUrl && (
                    <div className="mt-6">
                      <button
                        onClick={handleDownloadReport}
                        className="w-full py-3 bg-green-400 text-black font-bold rounded-lg hover:bg-green-500 transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        Download Report Now
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <p className="text-gray-500 text-sm mt-2">
                        The report has also been sent to: <span className="text-gray-300">{customerForm.watch('email')}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                    <p className="text-blue-400 text-sm">
                      Your report will be available for download for 30 days. 
                      Check your email for the download link and backup.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleRestart}
                      className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Generate Another Report
                    </button>
                    {orderStatus.reportUrl && (
                      <button
                        onClick={handleDownloadReport}
                        className="px-6 py-2 border border-green-400 text-green-400 rounded-lg hover:bg-green-400/10 transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download Again
                      </button>
                    )}
                  </div>
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