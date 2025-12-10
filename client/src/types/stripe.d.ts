declare module '@stripe/stripe-js' {
  export interface Stripe {
    confirmCardPayment: (
      clientSecret: string,
      data?: any
    ) => Promise<{
      error?: { message: string };
      paymentIntent?: { id: string; status: string };
    }>;
  }
}

declare module '@stripe/react-stripe-js' {
  import { Stripe } from '@stripe/stripe-js';
  import { ComponentType } from 'react';

  export interface ElementsProps {
    stripe: Stripe | null;
    children: React.ReactNode;
  }

  export const Elements: ComponentType<ElementsProps>;
  
  export interface CardElementProps {
    options?: any;
    onChange?: (event: any) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    onReady?: () => void;
  }

  export const CardElement: ComponentType<CardElementProps>;
  
  export const useStripe: () => Stripe | null;
  export const useElements: () => any;
}