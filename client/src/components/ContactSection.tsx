import React from 'react';
import { MessageCircle, Phone, Mail } from 'lucide-react';
import ChatToggle from './ChatToggle';

const ContactSection: React.FC = () => {
  return (
    <section id="contact" className="py-20 bg-linear-to-b from-black to-gray-900">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-linear-to-r from-neon-green to-accent-teal bg-clip-text text-transparent">
              Need Help?
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our support team is here to help you with any questions about vehicle reports
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Live Chat */}
          <div className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800 text-center">
            <div className="inline-flex p-3 rounded-xl bg-neon-green/10 mb-6">
              <MessageCircle className="w-8 h-8 text-neon-green" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Live Chat</h3>
            <p className="text-gray-400 mb-6">
              Get instant answers from our support team
            </p>
            <ChatToggle />
            <p className="text-sm text-gray-500 mt-4">
              Average response time: <span className="text-neon-green">2 minutes</span>
            </p>
          </div>

          {/* Phone Support */}
          <div className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800 text-center">
            <div className="inline-flex p-3 rounded-xl bg-blue-500/10 mb-6">
              <Phone className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Phone Support</h3>
            <p className="text-gray-400 mb-6">
              Speak directly with our experts
            </p>
            <a
              href="tel:+15551234567"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 hover:bg-blue-500/20 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="font-medium">+1 (555) 123-4567</span>
            </a>
            <p className="text-sm text-gray-500 mt-4">
              Mon-Fri: 9AM-6PM EST
            </p>
          </div>

          {/* Email Support */}
          <div className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800 text-center">
            <div className="inline-flex p-3 rounded-xl bg-purple-500/10 mb-6">
              <Mail className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Email Support</h3>
            <p className="text-gray-400 mb-6">
              Send us detailed questions or requests
            </p>
            <a
              href="mailto:support@digitalworthyreports.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 hover:bg-purple-500/20 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span className="font-medium">Email Us</span>
            </a>
            <p className="text-sm text-gray-500 mt-4">
              Response within 24 hours
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;