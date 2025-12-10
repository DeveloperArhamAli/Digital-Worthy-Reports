export interface PricingPlan {
  id: number;
  name: string;
  price: number;
  tagline?: string;
  features: string[];
  isPopular: boolean;
  moneyBackDays: number;
}

export interface Testimonial {
  id: number;
  stars: number;
  content: string;
  author: string;
  location: string;
}

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export interface Service {
  id: number;
  icon: string;
  title: string;
  description: string;
}