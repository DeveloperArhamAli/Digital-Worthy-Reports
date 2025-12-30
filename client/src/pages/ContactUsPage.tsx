import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  MessageSquare,
  User,
  Send,
  Loader2,
  ShieldCheck,
  HelpCircle,
  ChevronRight,
  FileText
} from 'lucide-react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

const   ContactPage = () => {
  const [openFaqId, setOpenFaqId] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const contactForm = useForm({
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      inquiryType: 'general'
    }
  });

  const faqs: FAQ[] = [
    {
      id: 1,
      question: 'What is your response time for customer inquiries?',
      answer: 'We typically respond to all customer inquiries within 24 hours. For urgent matters, please call our support line during business hours for immediate assistance.'
    },
    {
      id: 2,
      question: 'Do you offer phone support?',
      answer: 'Yes, we offer phone support Monday through Friday from 9 AM to 6 PM EST. For technical issues or complex inquiries, phone support often provides the quickest resolution.'
    },
    {
      id: 3,
      question: 'Can I get help with interpreting my vehicle report?',
      answer: 'Absolutely! Our support team is trained to help you understand every aspect of your vehicle history report. Just share your report ID or order number with us.'
    },
    {
      id: 4,
      question: 'Do you have a physical office I can visit?',
      answer: 'We operate as a fully remote company to provide the most efficient service nationwide. All support is handled through our digital channels and phone support.'
    },
  ];

  const handleContactSubmit = async (data: any) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitSuccess(true);
      contactForm.reset();
      setIsSubmitting(false);
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
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
              <MessageSquare className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">
                24/7 Customer Support
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Get in Touch
              </span>
              <br />
              <span className="bg-linear-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                With Our Team
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Have questions about your vehicle report? Need help with your purchase?
              Our support team is here to help you make informed decisions.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-green-400 to-transparent"></div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-linear-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8 mb-20">
              <div className="text-center p-8 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-green-400/50 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-400/10 rounded-full mb-6 mx-auto">
                  <Mail className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Email Support</h3>
                <p className="text-gray-400 mb-4">For general inquiries and non-urgent matters</p>
                <a 
                  href="mailto:support@carreport.com" 
                  className="text-green-400 font-semibold hover:text-green-500 transition-colors"
                >
                  support@carreport.com
                </a>
                <p className="text-gray-500 text-sm mt-2">Response time: Within 24 hours</p>
              </div>
              
              <div className="text-center p-8 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-green-400/50 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-400/10 rounded-full mb-6 mx-auto">
                  <Phone className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Phone Support</h3>
                <p className="text-gray-400 mb-4">For urgent matters and immediate assistance</p>
                <a 
                  href="tel:+18885551234" 
                  className="text-green-400 font-semibold hover:text-green-500 transition-colors"
                >
                  (888) 555-1234
                </a>
                <p className="text-gray-500 text-sm mt-2">Mon-Fri: 9 AM - 6 PM EST</p>
              </div>
              
              <div className="text-center p-8 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-green-400/50 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-400/10 rounded-full mb-6 mx-auto">
                  <MapPin className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Mailing Address</h3>
                <p className="text-gray-400 mb-4">For written correspondence and official documents</p>
                <div className="text-gray-300">
                  <p>CarReport Inc.</p>
                  <p>123 Vehicle Lane</p>
                  <p>Detroit, MI 48201</p>
                </div>
              </div>
            </div>

            {/* Business Hours & Support */}
            <div className="grid lg:grid-cols-2 gap-12 mb-20">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  <span className="bg-linear-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                    Support Hours
                  </span>
                </h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Our dedicated support team is available to assist you with any questions 
                  about your vehicle history reports, purchases, or technical issues.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900/50">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-green-400/10">
                        <Clock className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">Phone Support</h4>
                        <p className="text-gray-400 text-sm">Immediate assistance</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">9 AM - 6 PM EST</p>
                      <p className="text-gray-400 text-sm">Monday - Friday</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900/50">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-green-400/10">
                        <Mail className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">Email Support</h4>
                        <p className="text-gray-400 text-sm">All inquiries</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">24/7</p>
                      <p className="text-gray-400 text-sm">Response within 24 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900/50">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-green-400/10">
                        <ShieldCheck className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">Urgent Support</h4>
                        <p className="text-gray-400 text-sm">Critical issues</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">24/7</p>
                      <p className="text-gray-400 text-sm">Emergency contact available</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Contact Form */}
              <div className="bg-gray-900 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>
                
                {submitSuccess && (
                  <div className="mb-6 p-4 bg-green-400/10 border border-green-400/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-green-400 font-medium">Message sent successfully!</p>
                        <p className="text-green-400/80 text-sm mt-1">
                          We'll get back to you within 24 hours.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={contactForm.handleSubmit(handleContactSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          {...contactForm.register('name', { required: true })}
                          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="email"
                          {...contactForm.register('email', { required: true })}
                          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Inquiry Type
                    </label>
                    <select
                      {...contactForm.register('inquiryType', { required: true })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-400"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="refund">Refund Request</option>
                      <option value="technical">Technical Support</option>
                      <option value="report">Report Interpretation</option>
                      <option value="billing">Billing Question</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      {...contactForm.register('subject', { required: true })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
                      placeholder="How can we help you?"
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
                      placeholder="Please provide as much detail as possible..."
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
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                  
                  <p className="text-gray-500 text-sm text-center">
                    By submitting this form, you agree to our Privacy Policy and Terms of Service.
                  </p>
                </form>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-400/10 border border-green-400/30 mb-6">
                  <HelpCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium">CONTACT FAQ</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  <span className="bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Frequently Asked Questions
                  </span>
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Common questions about contacting our support team
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

            {/* Quick Support Links */}
            <div className="bg-gray-900/50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Quick Support Links
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <a 
                  href="/about" 
                  className="group p-6 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-green-400/50 transition-all duration-300 hover:scale-105 text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-400/10 rounded-full mb-4 mx-auto group-hover:bg-green-400/20 transition-colors">
                    <ShieldCheck className="w-6 h-6 text-green-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Refund Policy</h4>
                  <p className="text-gray-400 text-sm">
                    Learn about our money-back guarantee
                  </p>
                </a>
                
                <a 
                  href="#" 
                  className="group p-6 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-green-400/50 transition-all duration-300 hover:scale-105 text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-400/10 rounded-full mb-4 mx-auto group-hover:bg-green-400/20 transition-colors">
                    <FileText className="w-6 h-6 text-green-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Report Guide</h4>
                  <p className="text-gray-400 text-sm">
                    How to read your vehicle history report
                  </p>
                </a>
                
                <a 
                  href="#" 
                  className="group p-6 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-green-400/50 transition-all duration-300 hover:scale-105 text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-400/10 rounded-full mb-4 mx-auto group-hover:bg-green-400/20 transition-colors">
                    <HelpCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Knowledge Base</h4>
                  <p className="text-gray-400 text-sm">
                    Browse our help articles and guides
                  </p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;