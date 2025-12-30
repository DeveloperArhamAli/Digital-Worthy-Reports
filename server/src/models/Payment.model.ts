import mongoose, { Schema, Document } from 'mongoose';

export enum ReportType {
  Basic = 'Basic',
  SILVER = 'silver',
  GOLD = 'gold'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  STRIPE = 'stripe',
  PAYPAL = 'paypal'
}

export interface IPayment extends Document {
  customerId: mongoose.Types.ObjectId;
  transactionId: string;
  amount: number;
  currency: string;
  reportType: ReportType;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  
  stripePaymentIntentId?: string;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  vin: string;
  
  reportUrl?: string;
  reportGeneratedAt?: Date;
  reportAccessExpiresAt?: Date;
  
  metadata: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true, // Field-level index
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true, // Field-level index
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
  },
  reportType: {
    type: String,
    enum: Object.values(ReportType),
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
    index: true, // Field-level index
  },
  
  stripePaymentIntentId: {
    type: String,
    index: true, // Field-level index
  },
  paypalOrderId: {
    type: String,
    index: true, // Field-level index
  },
  paypalCaptureId: String,
  
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true, // Field-level index
  },
  customerPhone: String,
  vin: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    index: true, // Field-level index
  },
  
  reportUrl: String,
  reportGeneratedAt: Date,
  reportAccessExpiresAt: Date,
  
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Additional indexes (not defined at field level)
PaymentSchema.index({ createdAt: -1 });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);