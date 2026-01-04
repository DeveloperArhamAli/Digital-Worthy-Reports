import express from 'express';
import {
  login,
  refreshToken,
  logout,
  getProfile,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  toggleAdminStatus,
  changePassword,
  getPayments
} from '../controllers/adminAuthController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.post('/auth/login', login);
router.post('/auth/refresh-token', refreshToken);
router.post('/auth/logout', logout);

router.get('/auth/profile', authenticate, getProfile);
router.post('/auth/change-password', authenticate, changePassword);

router.get('/admins', authenticate, authorize('super_admin'), getAllAdmins);
router.post('/admins', authenticate, authorize('super_admin'), createAdmin);
router.put('/admins/:id', authenticate, authorize('super_admin'), updateAdmin);
router.delete('/admins/:id', authenticate, authorize('super_admin'), deleteAdmin);
router.patch('/admins/:id/toggle-status', authenticate, authorize('super_admin'), toggleAdminStatus);
router.post('/payments', authenticate, authorize('admin', 'super_admin'), getPayments);

export default router;