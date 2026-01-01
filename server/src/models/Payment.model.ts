import mongoose, { Schema, Document } from 'mongoose';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  EXPIRED = 'expired',
  COMPLETED = 'completed'
}

export enum ReportType {
  BASIC = 'basic',
  SILVER = 'silver',
  GOLD = 'gold'
}

export interface IPayment extends Document {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  vin: string;
  reportType: ReportType;
  amount: number;
  currency: string;
  transactionId: string;
  status: PaymentStatus;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  stripeUrl?: string;
  reportUrl?: string;
  reportGeneratedAt?: Date;
  reportAccessExpiresAt?: Date;
  paidAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  customerPhone: {
    type: String,
    trim: true
  },
  vin: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    minlength: 17,
    maxlength: 17
  },
  reportType: {
    type: String,
    enum: Object.values(ReportType),
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING
  },
  stripeSessionId: {
    type: String,
    sparse: true
  },
  stripePaymentIntentId: {
    type: String,
    sparse: true
  },
  stripeUrl: {
    type: String
  },
  reportUrl: {
    type: String
  },
  reportGeneratedAt: {
    type: Date
  },
  reportAccessExpiresAt: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setDate(date.getDate() + 30); // 30 days from creation
      return date;
    }
  },
  paidAt: {
    type: Date
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Indexes
PaymentSchema.index({ transactionId: 1 });
PaymentSchema.index({ customerEmail: 1 });
PaymentSchema.index({ vin: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ stripeSessionId: 1 }, { sparse: true });
PaymentSchema.index({ reportType: 1 });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);