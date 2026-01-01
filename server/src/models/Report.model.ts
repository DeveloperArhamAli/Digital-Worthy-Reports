import mongoose, { Schema, Document } from 'mongoose';
import { IPayment } from './Payment.model';

export interface IOdometerReading {
  date: Date;
  reading: number;
  unit: string;
}

export interface IAccident {
  date: Date;
  severity: string;
  description: string;
  reportedBy: string;
}

export interface IServiceRecord {
  date: Date;
  type: string;
  location: string;
  details: string;
}

export interface IRecall {
  id: string;
  date: Date;
  description: string;
  status: string;
}

export interface IMarketComparison {
  vin: string;
  price: number;
  location: string;
}

export interface IVerdict {
  score: number;
  recommendation: 'BUY' | 'AVOID' | 'CAUTION';
  reasons: string[];
}

export interface IReport extends Document {
  paymentId: mongoose.Types.ObjectId | IPayment;
  vin: string;
  reportType: string;
  vehicle: {
    year?: number;
    make?: string;
    model?: string;
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
    state?: string;
  };
  odometer: {
    lastReading: number;
    unit: string;
    readings: IOdometerReading[];
  };
  accidents: IAccident[];
  service: {
    records: IServiceRecord[];
    lastService?: Date;
    nextService?: Date;
  };
  recalls: IRecall[];
  theft: {
    isStolen: boolean;
    reportedDate?: Date;
  };
  market?: {
    value: number;
    range: {
      low: number;
      high: number;
    };
    comparison: IMarketComparison[];
  };
  verdict?: IVerdict;
  reportUrl: string;
  downloadCount: number;
  expiresAt: Date;
  lastAccessed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema({
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment',
    required: true,
    index: true
  },
  vin: {
    type: String,
    required: true,
    uppercase: true,
    index: true
  },
  reportType: {
    type: String,
    required: true,
    enum: ['basic', 'silver', 'gold']
  },
  vehicle: {
    year: Number,
    make: String,
    model: String,
    trim: String,
    bodyStyle: String,
    engine: String,
    transmission: String,
    drivetrain: String,
    fuelType: String
  },
  title: {
    status: {
      type: String,
      required: true
    },
    issueDate: Date,
    state: String
  },
  odometer: {
    lastReading: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      default: 'miles'
    },
    readings: [{
      date: Date,
      reading: Number,
      unit: String
    }]
  },
  accidents: [{
    date: Date,
    severity: String,
    description: String,
    reportedBy: String
  }],
  service: {
    records: [{
      date: Date,
      type: String,
      location: String,
      details: String
    }],
    lastService: Date,
    nextService: Date
  },
  recalls: [{
    id: String,
    date: Date,
    description: String,
    status: String
  }],
  theft: {
    isStolen: {
      type: Boolean,
      default: false
    },
    reportedDate: Date
  },
  market: {
    value: Number,
    range: {
      low: Number,
      high: Number
    },
    comparison: [{
      vin: String,
      price: Number,
      location: String
    }]
  },
  verdict: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    recommendation: {
      type: String,
      enum: ['BUY', 'AVOID', 'CAUTION']
    },
    reasons: [String]
  },
  reportUrl: {
    type: String,
    required: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
    default: () => {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date;
    }
  },
  lastAccessed: {
    type: Date
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
ReportSchema.index({ vin: 1, createdAt: -1 });
ReportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
ReportSchema.index({ downloadCount: -1 });
ReportSchema.index({ 'verdict.score': -1 });

export const Report = mongoose.model<IReport>('Report', ReportSchema);