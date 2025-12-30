import mongoose, { Schema, Document } from 'mongoose';
import { ReportType } from './Payment.model';

export interface IReport extends Document {
  paymentId: mongoose.Types.ObjectId;
  vin: string;
  reportType: ReportType;
  
  vehicle: {
    year: number;
    make: string;
    model: string;
    trim?: string;
    bodyStyle?: string;
    engine?: string;
    transmission?: string;
    drivetrain?: string;
    fuelType?: string;
  };
  
  title: {
    status: string;
    issueDate?: Date;
    brand?: string;
    state: string;
  };
  
  odometer: {
    lastReading: number;
    unit: string;
    readings: Array<{
      date: Date;
      reading: number;
      unit: string;
    }>;
  };
  
  accidents: Array<{
    date: Date;
    severity: string;
    description: string;
    reportedBy: string;
  }>;
  
  service: {
    records: Array<{
      date: Date;
      type: string;
      location: string;
      details: string;
    }>;
    lastService?: Date;
    nextService?: Date;
  };
  
  recalls: Array<{
    id: string;
    date: Date;
    description: string;
    status: string;
  }>;
  
  theft: {
    isStolen: boolean;
    reportedDate?: Date;
    recoveredDate?: Date;
  };
  
  market?: {
    value: number;
    range: {
      low: number;
      high: number;
    };
    comparison: Array<{
      vin: string;
      price: number;
      location: string;
    }>;
  };
  
  verdict?: {
    score: number;
    recommendation: 'BUY' | 'AVOID' | 'CAUTION';
    reasons: string[];
  };
  
  reportUrl: string;
  downloadCount: number;
  lastAccessed?: Date;
  expiresAt: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema({
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment',
    required: true,
    unique: true,
    // Remove index: true if you have schema.index below
  },
  vin: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    // Remove index: true if you have schema.index below
  },
  reportType: {
    type: String,
    enum: ['Basic', 'silver', 'gold'],
    required: true,
  },
  
  // Report data fields...
  
  reportUrl: {
    type: String,
    required: true,
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
  lastAccessed: Date,
  expiresAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

// Remove duplicate indexes
// ReportSchema.index({ paymentId: 1 }); // DUPLICATE - remove if field has unique: true
// ReportSchema.index({ vin: 1 });      // DUPLICATE - remove if field has index: true

// Keep these
ReportSchema.index({ expiresAt: 1 });
ReportSchema.index({ createdAt: -1 });

export const Report = mongoose.model<IReport>('Report', ReportSchema);