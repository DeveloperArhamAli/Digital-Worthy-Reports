import React from 'react';
import { ChevronRight, ShieldCheck } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-linear-to-b from-primary-dark to-black overflow-hidden">
      {/* Background linear effect */}
      <div className="absolute inset-0 bg-linear-to-r from-neon-green/5 via-transparent to-neon-green/5"></div>
      
      <div className="container-custom relative py-20 md:py-28 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/30 mb-6">
            <ShieldCheck className="w-4 h-4 text-neon-green" />
            <span className="text-sm font-medium text-neon-green">
              Trusted by 50,000+ Customers
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Get Your Complete Vehicle
            </span>
            <br />
            <span className="bg-linear-to-r from-neon-green to-accent-teal bg-clip-text text-transparent">
              History Report
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Unlock the full history of any vehicle with our comprehensive reports. 
            Make informed decisions with confidence using data from trusted sources.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="group inline-flex items-center justify-center px-8 py-3 text-sm font-semibold text-black bg-neon-green rounded-full hover:bg-neon-green-dark transition-all duration-300 hover:scale-105 hover:shadow-neon-md">
              Get Your Report Now
              <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="inline-flex items-center justify-center px-8 py-3 text-sm font-semibold text-neon-green border-2 border-neon-green rounded-full hover:bg-neon-green/10 transition-all duration-300 hover:scale-105">
              How It Works
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
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
          </div>
        </div>
      </div>

      {/* Bottom linear line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-neon-green to-transparent"></div>
    </section>
  );
};

export default Hero;