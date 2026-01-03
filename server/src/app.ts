import 'module-alias/register';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { connectDB } from './config/database';
import paymentRoutes from './routes/payment.routes';
import configRoutes from './routes/config.routes';
import adminRoutes from './routes/admin.routes';
import { logger } from './utils/logger';
import { NODE_ENV, PORT, FRONTEND_URL, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS } from '@utils/readDockerSecret';

const app = express();

connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: parseInt(RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/reports', express.static(path.join(__dirname, '../public/reports')));

app.use('/api', paymentRoutes);
app.use('/api/config', configRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${NODE_ENV}`);
  logger.info(`Frontend URL: ${FRONTEND_URL}`);
});

const gracefulShutdown = async () => {
  logger.info('Shutting down gracefully...');
  server.close(async () => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;