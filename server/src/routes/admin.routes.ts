import express, { Request, Response } from 'express';
import { Payment } from '../models/Payment.model';

const router = express.Router();

router.get('/payments', async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = 'all',
      reportType = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate,
      endDate,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = {};

    if (status !== 'all') {
      filter.status = status;
    }

    if (reportType !== 'all') {
      filter.reportType = reportType;
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    // Search in multiple fields
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { vin: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Fetch payments
    const payments = await Payment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count
    const total = await Payment.countDocuments(filter);

    res.json({
      payments,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

export default router;