import { ReactNode } from "react";

export interface CustomerInfo {
  address: string | null | undefined;
  city: string | null | undefined;
  state: string | null | undefined;
  postalCode: string | null | undefined;
  country: string;
  name: string;
  email: string;
  phone: string;
  vin: string;
}

export interface PaymentDetails {
  vin: ReactNode;
  amount: number;
  currency: string;
  description: string;
  reportType: 'basic' | 'silver' | 'gold';
}

export interface ReportPreview {
  vehicleType: string;
  country: string;
  vin: string;
  year: string;
  make: string;
  model: string;
  manufacturer: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  customer?: CustomerInfo;
  reportUrl?: string;
  message?: string;
}