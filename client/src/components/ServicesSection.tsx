import React from 'react';
import { FileText, Shield, TrendingUp } from 'lucide-react';

const ServicesSection: React.FC = () => {
  const services = [
    {
      id: 1,
      icon: FileText,
      title: 'Comprehensive History',
      description: 'Our reports give you a detailed view of the car\'s title, accident history, and service records.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 2,
      icon: Shield,
      title: 'Buy or Avoid Verdict',
      description: 'Our unique rating system gives you a verdict that considers history and condition.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      id: 3,
      icon: TrendingUp,
      title: 'Market Comparison',
      description: 'Gain insights and compare your vehicle to similar vehicles by pricing and reliability.',
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <section className="py-20 bg-black">
      <div className="container-custom">
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="group relative p-8 rounded-2xl bg-linear-to-br from-gray-900 to-black border border-gray-800 hover:border-neon-green/50 transition-all duration-300 hover:scale-105"
            >
              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl bg-linear-to-br ${service.gradient} mb-6`}>
                <service.icon className="w-6 h-6 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-4">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-gray-400 mb-6">
                {service.description}
              </p>

              {/* Hover effect line */}
              <div className="absolute bottom-0 left-8 right-8 h-0.5 bg-linear-to-r from-transparent via-neon-green to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;