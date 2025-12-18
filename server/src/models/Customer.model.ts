import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  email: string;
  name: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true, // Field-level index
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// No schema.index calls - using field-level indexes only
CustomerSchema.index({ createdAt: -1 }); // Additional index

export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);