import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN!;

// JWT Types
export interface JwtPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
}

export const jwtUtils = {
  generateTokens: (payload: JwtPayload) => {
    const accessToken = jwt.sign(
      payload, 
      "fklsdajfowencfsdjalfjweou203u04jfa", 
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      payload, 
      "jfwj23084rjdlsajlaJDLSKAJ@#$@#AFJAF", 
      { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
  },

  verifyAccessToken: (token: string): JwtPayload => {
    const verifyOptions: VerifyOptions = {
      algorithms: ['HS256']
    };

    try {
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET as string, 
        verifyOptions
      );
      return decoded as JwtPayload;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  },

  verifyRefreshToken: (token: string): JwtPayload => {
    const verifyOptions: VerifyOptions = {
      algorithms: ['HS256']
    };

    try {
      const decoded = jwt.verify(
        token, 
        process.env.REFRESH_TOKEN_SECRET as string, 
        verifyOptions
      );
      return decoded as JwtPayload;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
};

// Admin Interface
export interface IAdmin extends Document {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
  lastLogin?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Admin Schema
const AdminSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
AdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
AdminSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
AdminSchema.set('toJSON', {
  transform: function(doc, ret: any) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

export const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);