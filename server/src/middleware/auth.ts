import { Request, Response, NextFunction } from 'express';
import { Admin } from '../models/Admin.model';
import { jwtUtils } from '../models/Admin.model';

export interface AuthRequest extends Request {
  user?: any;
  token?: string;
}

// Authentication Middleware
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authentication token provided' 
      });
    }

    const decoded = jwtUtils.verifyAccessToken(token);
    const admin = await Admin.findById(decoded.userId).select('-password');

    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated' 
      });
    }

    req.user = admin;
    req.token = token;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token has expired' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    console.error('Authentication error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Please authenticate' 
    });
  }
};

// Authorization Middleware
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden: Insufficient permissions' 
      });
    }

    next();
  };
};