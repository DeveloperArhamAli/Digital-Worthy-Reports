import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import LogoImage from "../assets/images/logo.png";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'Car Report', href: '#' },
    { label: 'Boat Report', href: '#' },
    { label: 'Report Pricing', href: '#' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-primary-dark/95 backdrop-blur-md border-b border-neon-green/20">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 flex items-center justify-center bg-neon-green/10 rounded-lg">
              <img src={LogoImage} alt="Digital Worthy Reports Logo" />
            </div>
            <span className="text-xl font-bold text-neon-green tracking-tight">
              DigitalWorthyReports
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-gray-300 hover:text-neon-green transition-colors duration-200 relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neon-green group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-neon-green hover:bg-gray-800"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-neon-green hover:bg-gray-800 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;