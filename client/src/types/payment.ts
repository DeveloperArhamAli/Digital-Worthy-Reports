export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  vin: string;
}

export interface PaymentDetails {
  amount: number;
  currency: string;
  description: string;
  reportType: 'bronze' | 'silver' | 'gold';
}

export interface ReportPreview {
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