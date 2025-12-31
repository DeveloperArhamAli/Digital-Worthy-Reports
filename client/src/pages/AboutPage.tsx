import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  ShieldCheck, 
  Clock, 
  FileText, 
  CheckCircle,
  XCircle,
  HelpCircle,
  ChevronRight,
  Loader2,
  Globe,
  Database,
  Shield,
  Users
} from 'lucide-react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

const AboutPage = () => {
  const [openFaqId, setOpenFaqId] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const contactForm = useForm({
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  });

  const faqs: FAQ[] = [
    {
      id: 1,
      question: 'How long does it take to receive my refund?',
      answer: 'Refunds are typically processed within 5-7 business days after approval. The time it takes for the refund to appear on your account depends on your bank or payment method provider.'
    },
    {
      id: 2,
      question: 'What if I purchased the wrong report type?',
      answer: 'If you purchased the wrong report type, contact our support team within 24 hours of purchase. We can usually upgrade or downgrade your report and refund the difference, or process a full refund if you prefer.'
    },
    {
      id: 3,
      question: 'Are there any exceptions to the refund policy?',
      answer: 'Yes, refunds are not available for reports that have already been fully downloaded or accessed more than once. Additionally, bulk purchases and enterprise accounts may have different refund terms.'
    },
    {
      id: 4,
      question: 'Can I get a refund if the report has incorrect information?',
      answer: 'If you believe a report contains inaccurate information, please contact our support team with details. We will investigate and if verified, we will provide a full refund or a replacement report.'
    },
  ];

  const handleContactSubmit = async (data: any) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      alert('Message sent successfully! We\'ll get back to you within 24 hours.');
      contactForm.reset();
      setIsSubmitting(false);
    }, 1500);
  };

  const handleFaqToggle = (id: number) => {
    setOpenFaqId(openFaqId === id ? 0 : id);
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
                Trusted Vehicle History Reports
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
                About Digital Worthy Reports
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Comprehensive vehicle history reports powered by trusted data sources 
              across North America.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-green-400 to-transparent"></div>
      </section>

      {/* About Digital Worthy Reports Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-linear-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                  Our Data Sources & Coverage
                </span>
              </h2>
              <p className="text-gray-400 max-w-3xl mx-auto">
                Digital Worthy Reports incorporates data from a wide range of local and international sources, 
                focusing primarily on the United States and Canada.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 mb-20">
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 rounded-xl bg-green-400/10">
                    <Globe className="w-8 h-8 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">North American Coverage</h3>
                    <p className="text-gray-400">United States & Canada</p>
                  </div>
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed">
                  Our database includes comprehensive data from service centers, vehicle inspection facilities, 
                  government agencies, databases of stolen vehicles, salvage yards, and more within these regions.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-gray-300">DMV and government agency records</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Insurance company databases</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Service and repair center records</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Auto auction and salvage yard data</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Stolen vehicle databases</span>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-blue-500/10">
                      <Database className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">24/7 Access</h4>
                      <p className="text-gray-400">Always available when you need us</p>
                    </div>
                  </div>
                  <p className="text-gray-300">
                    Digital Worthy Reports is accessible online 24/7. We are dedicated to ensuring our clients' 
                    satisfaction every day through reliable and comprehensive vehicle data.
                  </p>
                </div>

                <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-purple-500/10">
                      <Shield className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">Data Accuracy</h4>
                      <p className="text-gray-400">Trusted by thousands of customers</p>
                    </div>
                  </div>
                  <p className="text-gray-300">
                    We continuously update our databases and verify information from multiple sources 
                    to provide the most accurate vehicle history reports available.
                  </p>
                </div>

                <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-amber-500/10">
                      <Users className="w-8 h-8 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">Customer Support</h4>
                      <p className="text-gray-400">Here to help you understand your report</p>
                    </div>
                  </div>
                  <p className="text-gray-300">
                    Our dedicated support team is available to help you interpret your vehicle history 
                    report and answer any questions you may have about the data.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
              <div className="text-center p-6 rounded-xl bg-gray-900/50 border border-gray-800">
                <div className="text-3xl font-bold text-green-400 mb-2">50K+</div>
                <div className="text-gray-400">Reports Generated</div>
              </div>
              <div className="text-center p-6 rounded-xl bg-gray-900/50 border border-gray-800">
                <div className="text-3xl font-bold text-green-400 mb-2">99.8%</div>
                <div className="text-gray-400">Accuracy Rate</div>
              </div>
              <div className="text-center p-6 rounded-xl bg-gray-900/50 border border-gray-800">
                <div className="text-3xl font-bold text-green-400 mb-2">24/7</div>
                <div className="text-gray-400">Service Availability</div>
              </div>
              <div className="text-center p-6 rounded-xl bg-gray-900/50 border border-gray-800">
                <div className="text-3xl font-bold text-green-400 mb-2">2</div>
                <div className="text-gray-400">Countries Covered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Refund Policy Section */}
      <section className="py-20 bg-linear-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-400/10 border border-green-400/30 mb-6">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">
                  100% Satisfaction Guarantee
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-linear-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                  Our Refund Policy & Process
                </span>
              </h2>

              <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                We stand behind our vehicle history reports. If you're not satisfied, 
                we offer a straightforward refund process to ensure your peace of mind.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  <span className="bg-linear-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                    Money-Back Guarantee
                  </span>
                </h2>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  We're confident in the quality and accuracy of our vehicle history reports. 
                  That's why we offer a risk-free money-back guarantee on all our plans.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-green-400/10 mt-1">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">No Questions Asked</h4>
                      <p className="text-gray-400 text-sm">
                        If you're not satisfied with your report, we'll process your refund without hassle.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-green-400/10 mt-1">
                      <Clock className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Timely Processing</h4>
                      <p className="text-gray-400 text-sm">
                        Refunds are processed within 5-7 business days after approval.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-green-400/10 mt-1">
                      <FileText className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Full or Partial Refunds</h4>
                      <p className="text-gray-400 text-sm">
                        Depending on your situation, we offer both full and partial refunds.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-400/10 rounded-full mb-4 mx-auto">
                    <ShieldCheck className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Refund Timeline</h3>
                  <p className="text-gray-400">Our standard refund processing timeline</p>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center">
                      <span className="text-green-400 font-bold">1</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">Request Submitted</h4>
                      <p className="text-gray-400 text-sm">Submit refund request within eligible period</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center">
                      <span className="text-green-400 font-bold">2</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">Review & Approval</h4>
                      <p className="text-gray-400 text-sm">Our team reviews within 24-48 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center">
                      <span className="text-green-400 font-bold">3</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">Processing</h4>
                      <p className="text-gray-400 text-sm">Refund processed within 5-7 business days</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center">
                      <span className="text-green-400 font-bold">4</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">Completion</h4>
                      <p className="text-gray-400 text-sm">Funds appear in your account</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Refund Conditions */}
            <div className="grid md:grid-cols-2 gap-8 mb-20">
              <div className="p-8 rounded-2xl bg-green-400/5 border border-green-400/30">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <h3 className="text-xl font-bold text-white">Eligible for Refund</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Report not accessed or downloaded</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Within money-back guarantee period (varies by plan)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Technical issues preventing report access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Duplicate purchase</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-8 rounded-2xl bg-red-400/5 border border-red-400/30">
                <div className="flex items-center gap-3 mb-6">
                  <XCircle className="w-6 h-6 text-red-400" />
                  <h3 className="text-xl font-bold text-white">Not Eligible for Refund</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Report already downloaded or accessed</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Outside money-back guarantee period</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Bulk or enterprise purchases</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Suspected fraudulent activity</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* How to Request a Refund */}
            <div className="bg-gray-900/50 rounded-2xl p-8 mb-20">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">
                How to Request a Refund
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-400/10 rounded-full mb-4 mx-auto">
                    <span className="text-green-400 font-bold text-xl">1</span>
                  </div>
                  <h4 className="text-white font-semibold mb-2">Contact Support</h4>
                  <p className="text-gray-400 text-sm">
                    Email support@digitalworthy.com or use the contact form below
                  </p>
                </div>
                
                <div className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-400/10 rounded-full mb-4 mx-auto">
                    <span className="text-green-400 font-bold text-xl">2</span>
                  </div>
                  <h4 className="text-white font-semibold mb-2">Provide Details</h4>
                  <p className="text-gray-400 text-sm">
                    Include your order number and reason for refund request
                  </p>
                </div>
                
                <div className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-400/10 rounded-full mb-4 mx-auto">
                    <span className="text-green-400 font-bold text-xl">3</span>
                  </div>
                  <h4 className="text-white font-semibold mb-2">Wait for Review</h4>
                  <p className="text-gray-400 text-sm">
                    Our team will review and respond within 24-48 hours
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-400/10 border border-green-400/30 mb-6">
                  <HelpCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium">REFUND FAQ</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  <span className="bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Frequently Asked Questions
                  </span>
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Common questions about our refund policy and process
                </p>
              </div>

              <div className="space-y-4 max-w-3xl mx-auto">
                {faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/30"
                  >
                    <button
                      onClick={() => handleFaqToggle(faq.id)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-800/50 transition-colors duration-200"
                    >
                      <span className="text-lg font-semibold text-white pr-4">
                        {faq.question}
                      </span>
                      <ChevronRight
                        className={`w-5 h-5 text-green-400 transition-transform duration-300 ${
                          openFaqId === faq.id ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        openFaqId === faq.id ? 'max-h-96' : 'max-h-0'
                      }`}
                    >
                      <div className="p-6 pt-0">
                        <p className="text-gray-400 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-900 rounded-2xl p-8">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-white mb-2 text-center">
                  Need Help with a Refund?
                </h2>
                <p className="text-gray-400 mb-8 text-center">
                  Contact our support team for assistance with refund requests
                </p>
                
                <form onSubmit={contactForm.handleSubmit(handleContactSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        {...contactForm.register('name', { required: true })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        {...contactForm.register('email', { required: true })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      {...contactForm.register('subject', { required: true })}
                      placeholder="Refund Request - Order #12345"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Message
                    </label>
                    <textarea
                      {...contactForm.register('message', { required: true })}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
                      placeholder="Please include your order number and reason for refund request..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-green-400 text-black font-semibold rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending Message...
                      </>
                    ) : (
                      'Submit Refund Request'
                    )}
                  </button>
                  
                  <p className="text-gray-500 text-sm text-center">
                    We typically respond to refund requests within 24-48 hours.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;