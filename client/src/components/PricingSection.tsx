import React from 'react';
import PricingCard from './PricingCard';
import { PricingPlan } from '../types';
import { Shield } from 'lucide-react';

const PricingSection: React.FC = () => {
  const pricingPlans: PricingPlan[] = [
    {
      id: 1,
      name: 'Bronze',
      price: 40,
      features: [
        'Basic Vehicle History',
        'Title Information',
        'Odometer Check',
        'Theft Records',
      ],
      isPopular: false,
      moneyBackDays: 30,
    },
    {
      id: 2,
      name: 'Silver',
      price: 60,
      features: [
        'Everything in Bronze',
        '+ Accident History',
        '+ Service Records',
        '+ Recall Information',
      ],
      isPopular: true,
      moneyBackDays: 60,
    },
    {
      id: 3,
      name: 'Gold',
      price: 90,
      features: [
        'Everything in Silver',
        '+ Market Value',
        '+ Ownership Cost',
        '+ Buy or Avoid Verdict',
      ],
      isPopular: false,
      moneyBackDays: 90,
    },
  ];

  const handlePlanSelect = (planId: number) => {
    console.log('Selected plan:', planId);
    // Handle plan selection logic here
  };

  return (
    <section className="py-20 bg-linear-to-b from-black to-primary-dark">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-linear-to-r from-neon-green to-accent-teal bg-clip-text text-transparent">
              Choose Your Report
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            Select the perfect report that matches your needs and budget
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              onClick={handlePlanSelect}
            />
          ))}
        </div>

        {/* Guarantee */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-neon-green/10 border border-neon-green/30">
            <Shield className="w-5 h-5 text-neon-green" />
            <span className="text-neon-green font-medium">
              All plans come with our 100% satisfaction guarantee
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;