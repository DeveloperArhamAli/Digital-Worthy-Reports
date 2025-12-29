import React from 'react';
import PricingCard from './PricingCard';
import { PricingPlan } from '../types';
import { Shield } from 'lucide-react';
import { usePlan } from '../contexts/PlanContext';

const PricingSection: React.FC = () => {
  const { selectedPlan, selectPlan } = usePlan();

  const pricingPlans: PricingPlan[] = [
    {
      id: 1,
      name: 'Basic',
      price: 50,
      features: [
        'Basic Vehicle History',
        'Title Information',
        'Odometer Check',
        'Theft Records',
      ],
      isPopular: false,
      moneyBackDays: 3,
    },
    {
      id: 2,
      name: 'Silver',
      price: 80,
      features: [
        'Everything in Bronze',
        '+ Accident History',
        '+ Service Records',
        '+ Recall Information',
      ],
      isPopular: true,
      moneyBackDays: 5,
    },
    {
      id: 3,
      name: 'Gold',
      price: 100,
      features: [
        'Everything in Silver',
        '+ Market Value',
        '+ Ownership Cost',
        '+ Buy or Avoid Verdict',
      ],
      isPopular: false,
      moneyBackDays: 7,
    },
  ];

  const handlePlanSelect = (planId: number) => {
    const selectedPlan = pricingPlans.find(plan => plan.id === planId);
    if (selectedPlan) {
      selectPlan(selectedPlan);
      
      // Scroll to VIN entry section
      setTimeout(() => {
        const vinSection = document.getElementById('pricing-cta');
        if (vinSection) {
          vinSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  };

  return (
    <section id="pricing-section" className="py-20 bg-linear-to-b from-black to-gray-900">
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

        {/* Selected Plan Indicator */}
        {selectedPlan && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-neon-green/5 border border-neon-green/30 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  ✓ Selected: {selectedPlan.name} Report - ${selectedPlan.price}
                </h3>
                <p className="text-gray-400 text-sm">
                  Continue below to enter your VIN
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Ready to proceed?</span>
                <a 
                  href="#pricing-cta"
                  className="px-3 py-1 text-sm bg-neon-green text-black font-medium rounded hover:bg-neon-green-dark transition-colors"
                >
                  Enter VIN
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              onClick={handlePlanSelect}
              isSelected={selectedPlan?.id === plan.id}
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