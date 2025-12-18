import mongoose, { Schema, Document } from 'mongoose';
import { PaymentStatus } from './Payment.model';

export interface ITransactionLog extends Document {
  transactionId: string;
  paymentId: mongoose.Types.ObjectId;
  status: PaymentStatus;
  action: string;
  data: Record<string, any>;
  errorMessage?: string;
  createdAt: Date;
}

const TransactionLogSchema: Schema = new Schema({
  transactionId: {
    type: String,
    required: true,
    // Remove index: true here if you have schema.index below
  },
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment',
    required: true,
    // Remove index: true here if you have schema.index below
  },
  status: {
    type: String,
    enum: Object.values(PaymentStatus),
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  data: {
    type: Schema.Types.Mixed,
    default: {},
  },
  errorMessage: String,
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// Remove duplicate indexes
// TransactionLogSchema.index({ transactionId: 1 }); // DUPLICATE - remove if field has index: true
// TransactionLogSchema.index({ paymentId: 1 });    // DUPLICATE - remove if field has index: true

// Keep this if not duplicate
TransactionLogSchema.index({ createdAt: -1 });

export const TransactionLog = mongoose.model<ITransactionLog>('TransactionLog', TransactionLogSchema);