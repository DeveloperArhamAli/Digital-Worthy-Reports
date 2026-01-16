import React, { useState } from 'react';
import { 
  ChevronRight, 
  ShieldCheck, 
  Shield, 
  FileText, 
  TrendingUp, 
  Star, 
  Quote, 
  HelpCircle,
  ChevronDown,
  CheckCircle,
  CreditCard,
  Car,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Service {
  id: number;
  icon: React.ElementType;
  title: string;
  description: string;
  linear: string;
}

interface Testimonial {
  id: number;
  content: string;
  author: string;
  location: string;
  rating: number;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

const HomePage = () => {
  // State
  const [openFaqId, setOpenFaqId] = useState<number>(1);
  const [vin, setVin] = useState('')

  const services: Service[] = [
    {
      id: 1,
      icon: FileText,
      title: 'Comprehensive History',
      description: 'Our reports give you a detailed view of the vehicles\'s title, accident history, and service records.',
      linear: 'from-blue-500 to-cyan-500',
    },
    {
      id: 2,
      icon: Shield,
      title: 'Buy or Avoid Verdict',
      description: 'Our unique rating system gives you a verdict that considers history and condition.',
      linear: 'from-neon-green/75 to-emerald-500',
    },
    {
      id: 3,
      icon: TrendingUp,
      title: 'Market Comparison',
      description: 'Gain insights and compare your vehicle to similar vehicles by pricing and reliability.',
      linear: 'from-purple-500 to-pink-500',
    },
  ];

  const testimonials: Testimonial[] = [
    {
      id: 1,
      content: 'The report revealed critical information including a lien on the vehicle. This saved me a major headache and thousands of dollars.',
      author: 'David A.',
      location: 'Gilbert, AZ',
      rating: 5,
    },
    {
      id: 2,
      content: 'I was about to buy a used vehicle that seemed perfect, but the CarReport showed it had been in a major accident. Thank you!',
      author: 'Sarah M.',
      location: 'Austin, TX',
      rating: 5,
    },
    {
      id: 3,
      content: 'The market comparison feature helped me negotiate a better price. I saved $1,500 on my purchase!',
      author: 'James K.',
      location: 'Miami, FL',
      rating: 5,
    },
  ];

  const faqs: FAQ[] = [
    {
      id: 1,
      question: 'How Can My CarReport Help Me?',
      answer: 'CarReport provides comprehensive vehicle history information that can help you avoid buying a vehicle with hidden problems like accidents, flood damage, or odometer rollbacks. Our reports give you the confidence to make an informed purchasing decision.'
    },
    {
      id: 2,
      question: 'What is CarReport?',
      answer: 'CarReport is a vehicle history reporting service that compiles data from various sources including DMVs, insurance companies, and auto auctions to provide a complete history of a vehicle. We help buyers make informed decisions when purchasing used vehicles.'
    },
    {
      id: 3,
      question: 'How accurate is the information in the report?',
      answer: 'Our reports are compiled from reliable sources including state DMVs, insurance companies, and auto auctions. While we strive for 100% accuracy, we cannot guarantee that all information is complete as some incidents may go unreported to official sources.'
    },
    {
      id: 4,
      question: 'What if I can\'t find the VIN number?',
      answer: 'The VIN can typically be found on the driver\'s side dashboard visible through the windshield, on the driver\'s side door jamb, or on vehicle registration and insurance documents. If you\'re having trouble locating it, contact the seller or dealer for assistance.'
    },
  ];

  const handleFaqToggle = (id: number) => {
    setOpenFaqId(openFaqId === id ? 0 : id);
  };

  return (
    <main className="bg-black text-white">
      {/* Hero Section */}
      <section className="relative bg-linear-to-b from-primary-dark to-black overflow-hidden">
        {/* Neon green linear background */}
        <div className="absolute inset-0 bg-linear-to-r from-neon-green/5 via-transparent to-neon-green/5"></div>
        
        <div className="container mx-auto px-4 relative py-20 md:py-28 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge - Using neon green */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/30 mb-6">
              <ShieldCheck className="w-4 h-4 text-neon-green" />
              <span className="text-sm font-medium text-neon-green">
                Trusted by 50,000+ Customers
              </span>
            </div>

            {/* Title with neon green linear */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Get Your Complete Vehicle
              </span>
              <br />
              <span className="bg-linear-to-r from-neon-green to-accent-teal bg-clip-text text-transparent">
                History Report
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Unlock the full history of any vehicle with our comprehensive reports. 
              Make informed decisions with confidence using data from trusted sources.
            </p>

            {/* CTA Buttons with neon green */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a href="#pricing-cta">
                <button 
                  className="group inline-flex items-center justify-center px-8 py-3 text-sm font-semibold text-black bg-neon-green rounded-full hover:bg-neon-green/75 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-neon-green/25"
                >
                  Get Free Preview
                </button>
              </a>

            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="text-center p-4 rounded-xl bg-gray-900/50 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">50K+</div>
                <div className="text-sm text-gray-400">Reports Generated</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gray-900/50 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">99.8%</div>
                <div className="text-sm text-gray-400">Accuracy Rate</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gray-900/50 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-sm text-gray-400">Support</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gray-900/50 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">5</div>
                <div className="text-sm text-gray-400">Trust Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom neon green line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-neon-green to-transparent"></div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.id}
                  className="group relative p-8 rounded-2xl bg-linear-to-br from-gray-900 to-black border border-gray-800 hover:border-neon-green/50 transition-all duration-300 hover:scale-105"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-linear-to-br ${service.linear} mb-6`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-4">
                    {service.title}
                  </h3>

                  <p className="text-gray-400 mb-6">
                    {service.description}
                  </p>

                  <div className="absolute bottom-0 left-8 right-8 h-0.5 bg-linear-to-r from-transparent via-neon-green to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-linear-to-b from-primary-dark to-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
                What Our Users Say
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Join thousands of satisfied customers who made better vehicle buying decisions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-neon-green/50 transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-neon-green/30 mb-4" />
                <p className="text-gray-300 italic mb-6">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-white">{testimonial.author}</p>
                  <p className="text-gray-400 text-sm">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-linear-to-br from-black via-gray-900 to-black" id="pricing-cta">
        <div className="container mx-auto px-4">

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/30 mb-6">
                  <span className="text-neon-green font-semibold">STEP 2: ENTER VIN</span>
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

                <form className="space-y-6">
                  <div>
                    <label htmlFor="vin" className="block text-sm font-medium text-gray-400 mb-2">
                      17-digit Vehicle Identification Number
                    </label>
                    <input
                      type="text"
                      id="vin"
                      placeholder="1HGCM82633A123456"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
                      value={vin}
                      onChange={(e) => setVin(e.target.value)}
                      maxLength={17}
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Found on dashboard or registration documents
                    </p>
                  </div>

                  <Link
                    to={`/preview/?vin=${vin}`}
                    className="w-full py-3 px-4 bg-neon-green text-black font-semibold rounded-lg hover:bg-green-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                      Get Free Preview
                  </Link>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-800">
                  <p className="text-gray-500 text-sm text-center">
                    Preview is free. You'll only pay for the full report after seeing what's available.
                  </p>
                </div>
              </div>
            </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className=" pb-10 bg-black">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/30 mb-6">
              <HelpCircle className="w-4 h-4 text-neon-green" />
              <span className="text-neon-green font-medium">FAQ</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h2>
            <p className="text-gray-400">
              Get answers to common questions about our vehicle history reports
            </p>
          </div>

          <div className="space-y-4">
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
                  <ChevronDown
                    className={`w-5 h-5 text-neon-green transition-transform duration-300 ${
                      openFaqId === faq.id ? 'rotate-180' : ''
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

          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-4">
              Still have questions? We're here to help!
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 text-neon-green border border-neon-green rounded-full hover:bg-neon-green/10 transition-colors duration-200">
              Contact Support
              <span>→</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;