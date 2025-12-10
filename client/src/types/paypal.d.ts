declare module '@paypal/react-paypal-js' {
  import { ComponentType } from 'react';

  export interface PayPalScriptProviderProps {
    options: {
      clientId: string;
      currency?: string;
      intent?: string;
      [key: string]: any;
    };
    children: React.ReactNode;
  }

  export const PayPalScriptProvider: ComponentType<PayPalScriptProviderProps>;
  
  export interface PayPalButtonsProps {
    style?: {
      layout?: 'vertical' | 'horizontal';
      color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
      shape?: 'pill' | 'rect';
      label?: 'paypal' | 'checkout' | 'buynow' | 'pay' | 'installment';
      [key: string]: any;
    };
    createOrder?: (data: any, actions: any) => Promise<string>;
    onApprove?: (data: any, actions: any) => Promise<any>;
    onError?: (err: any) => void;
    [key: string]: any;
  }

  export const PayPalButtons: ComponentType<PayPalButtonsProps>;
}