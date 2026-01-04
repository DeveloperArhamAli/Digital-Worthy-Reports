import React from 'react';
import { Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import Logo from './Logo';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const quickLinks = [
    { label: 'Home', to: '/' },
    { label: 'About Us', to: '/about' },
    { label: 'Pricing', to: '/pricing' },
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

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Logo />
            </div>
            <p className="text-gray-400 mb-6 text-sm lg:text-base">
              Providing comprehensive vehicle history reports to help you make informed decisions when buying or selling a vehicle.
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
            <h3 className="text-lg font-semibold text-white mb-6">Quick Links</h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-neon-green transition-colors duration-200 flex items-center gap-3 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-green opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    <span className="text-sm lg:text-base">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Contact Us</h3>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-neon-green mt-0.5 shrink-0" />
                <span className="text-gray-400 text-sm lg:text-base">
                  1200 New Jersey Avenue, SE Washington, DC 20590
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-neon-green shrink-0" />
                <a 
                  href="mailto:info@digitalworthyreports.com" 
                  target='_blank'
                  className="text-gray-400 hover:text-neon-green transition-colors text-sm lg:text-base break-all"
                >
                  info@digitalworthyreports.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-900">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              Copyright © {new Date().getFullYear()} DigitalWorthyReports. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;