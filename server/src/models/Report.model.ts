import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  paymentId: mongoose.Types.ObjectId;
  vin: string;
  reportType: string;
  vehicle: any;
  safety?: any;
  market?: any;
  recalls?: any[];
  verdict?: {
    score: number;
    recommendation: 'BUY' | 'AVOID' | 'CAUTION';
    reasons: string[];
  };
  reportUrl: string;
  cloudStorage?: {
    provider: 'cloudinary';
    publicId: string;
    url: string;
    secureUrl: string;
  };
  downloadCount: number;
  lastAccessed?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema({
  paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
  vin: { type: String, required: true },
  reportType: { type: String, required: true },
  vehicle: { type: Schema.Types.Mixed, required: true },
  safety: { type: Schema.Types.Mixed },
  market: { type: Schema.Types.Mixed },
  recalls: { type: [Schema.Types.Mixed] },
  verdict: {
    score: Number,
    recommendation: { type: String, enum: ['BUY', 'AVOID', 'CAUTION'] },
    reasons: [String],
  },
  reportUrl: { type: String, required: true },
  cloudStorage: {
    provider: { type: String, default: 'cloudinary' },
    publicId: String,
    url: String,
    secureUrl: String,
  },
  downloadCount: { type: Number, default: 0 },
  lastAccessed: { type: Date },
  expiresAt: { type: Date, required: true },
}, {
  timestamps: true,
});

export const Report = mongoose.model<IReport>('Report', ReportSchema);