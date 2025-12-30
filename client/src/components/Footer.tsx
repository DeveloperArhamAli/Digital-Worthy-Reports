import React, { useState } from 'react';
import { Car, Mail, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin, Send } from 'lucide-react';
import Logo from './Logo';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      console.log('Newsletter subscription:', email);
      setEmail('');
      alert('Thank you for subscribing to our newsletter!');
    }
  };

  const quickLinks = [
    { label: 'Home', to: '/' },
    { label: 'About Us', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ];

  const socialLinks = [
    { icon: Facebook, label: 'Facebook', href: '#' },
    { icon: Twitter, label: 'Twitter', href: '#' },
    { icon: Instagram, label: 'Instagram', href: '#' },
    { icon: Linkedin, label: 'LinkedIn', href: '#' },
  ];

  return (
    <footer className="bg-black border-t border-gray-900">
      <div className="container-custom py-12">
        <div className="flex justify-between gap-8">
          {/* Brand Column */}
          <div className='w-1/3'>
            <Logo />
            <p className="text-gray-400 my-6">
              Providing comprehensive vehicle history reports to help you make informed decisions when buying or selling a car.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="p-2 rounded-lg bg-gray-900 text-gray-400 hover:text-neon-green hover:bg-gray-800 transition-colors duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-neon-green transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-neon-green opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-neon-green mt-0.5" />
                <span className="text-gray-400">
                  123 Auto Street, Motor City, MC 12345
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-neon-green" />
                <a href="tel:+15551234567" className="text-gray-400 hover:text-neon-green transition-colors">
                  +1 (555) 123-4567
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-neon-green" />
                <a href="mailto:info@digitalworthyreports.com" className="text-gray-400 hover:text-neon-green transition-colors">
                  info@digitalworthyreports.com
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-900">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <p className="text-gray-500 text-sm">
              Copyright © {new Date().getFullYear()} DigitalWorthyReports. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;