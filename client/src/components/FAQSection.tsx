import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQSection: React.FC = () => {
  const [openFaqId, setOpenFaqId] = useState<number | null>(1);

  const faqs = [
    {
      id: 1,
      question: 'How Can My CarReport Help Me?',
      answer: 'CarReport provides comprehensive vehicle history information that can help you avoid buying a car with hidden problems like accidents, flood damage, or odometer rollbacks. Our reports give you the confidence to make an informed purchasing decision.'
    },
    {
      id: 2,
      question: 'What is CarReport?',
      answer: 'CarReport is a vehicle history reporting service that compiles data from various sources including DMVs, insurance companies, and auto auctions to provide a complete history of a vehicle. We help buyers make informed decisions when purchasing used cars.'
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

  const handleToggle = (id: number) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <section className="py-20 bg-black">
      <div className="container-custom max-w-4xl">
        {/* Header */}
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

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/30"
            >
              <button
                onClick={() => handleToggle(faq.id)}
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

        {/* Additional Help */}
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
  );
};

export default FAQSection;