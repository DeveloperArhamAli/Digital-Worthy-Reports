import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PricingPlan } from '../types';

interface PlanContextType {
  selectedPlan: PricingPlan | null;
  selectPlan: (plan: PricingPlan) => void;
  clearPlan: () => void;
  getPlanPrice: () => number;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};

interface PlanProviderProps {
  children: ReactNode;
}

export const PlanProvider: React.FC<PlanProviderProps> = ({ children }) => {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedPlan = localStorage.getItem('selectedPlan');
    if (savedPlan) {
      setSelectedPlan(JSON.parse(savedPlan));
    }
  }, []);

  const selectPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    localStorage.setItem('selectedPlan', JSON.stringify(plan));
  };

  const clearPlan = () => {
    setSelectedPlan(null);
    localStorage.removeItem('selectedPlan');
  };

  const getPlanPrice = () => {
    return selectedPlan?.price || 0;
  };

  return (
    <PlanContext.Provider value={{ selectedPlan, selectPlan, clearPlan, getPlanPrice }}>
      {children}
    </PlanContext.Provider>
  );
};