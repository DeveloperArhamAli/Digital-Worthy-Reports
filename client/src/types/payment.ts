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
  reportType: 'bronze' | 'silver' | 'gold';
}

export interface ReportPreview {
  vis: string;
  wmi: string;
  vds: string;
  class: string;
  region: string;
  country: string;
  vehicleInfo: any;
  vin: string;
  year: string;
  make: string;
  model: string;
  previewData: {
    accidents: number;
    owners: number;
    lastOdometer: string;
    titleStatus: string;
  };
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  customer?: CustomerInfo;
  reportUrl?: string;
  message?: string;
}