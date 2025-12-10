import React from 'react';
import { PricingPlan } from '../types';
import { Check } from 'lucide-react';

interface PricingCardProps {
  plan: PricingPlan;
  onClick: (planId: number) => void;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, onClick }) => {
  const handleClick = () => {
    onClick(plan.id);
  };

  return (
    <div className={`relative p-6 rounded-2xl transition-all duration-300 hover:scale-105 ${
      plan.isPopular 
        ? 'bg-linear-to-br from-gray-900 to-black border-2 border-neon-green shadow-neon-md'
        : 'bg-gray-900/50 border border-gray-800 hover:border-neon-green/50'
    }`}>
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="px-4 py-1 bg-neon-green text-black text-xs font-bold rounded-full">
            MOST POPULAR
          </span>
        </div>
      )}

      {/* Plan Header */}
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-white mb-2">{plan.name} Report</h3>
        <div className="flex items-center justify-center mb-2">
          <span className="text-4xl font-bold text-white">${plan.price}</span>
          <span className="text-gray-400 ml-1">/report</span>
        </div>
        <p className="text-gray-400 text-sm">One-time payment</p>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="w-5 h-5 text-neon-green mr-3 shrink-0 mt-0.5" />
            <span className="text-gray-300">{feature}</span>
          </li>
        ))}
        <li className="flex items-start">
          <Check className="w-5 h-5 text-neon-green mr-3 shrink-0 mt-0.5" />
          <span className="text-gray-300">
            {plan.moneyBackDays}-Day Money Back Guarantee
          </span>
        </li>
      </ul>

      {/* CTA Button */}
      <button
        onClick={handleClick}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
          plan.isPopular
            ? 'bg-neon-green text-black hover:bg-neon-green-dark hover:shadow-neon'
            : 'bg-gray-800 text-white hover:bg-gray-700'
        }`}
      >
        {plan.isPopular ? 'Choose Plan' : 'Get Started'}
      </button>
    </div>
  );
};

export default PricingCard;