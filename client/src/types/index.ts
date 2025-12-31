export interface PricingPlan {
  id: number;
  name: string;
  price: number;
  tagline?: string;
  features: {
    title: string;
    provided: boolean;
  }[];
  isPopular: boolean;
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