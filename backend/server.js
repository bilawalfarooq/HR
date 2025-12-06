import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import configurations
import logger from './src/utils/logger.js';
import { errorHandler, notFound } from './src/middleware/errorHandler.js';

// Create Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev')); // HTTP request logger
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.get(`${process.env.API_PREFIX}/${process.env.API_VERSION}`, (req, res) => {
  res.json({
    success: true,
    message: 'HR Management System API',
    version: process.env.API_VERSION,
    documentation: `${process.env.APP_URL}/api-docs`
  });
});

// Import routes
import authRoutes from './src/routes/authRoutes.js';
import employeeRoutes from './src/routes/employeeRoutes.js';
import { multiTenant } from './src/middleware/multiTenant.js';

// Apply multi-tenant middleware to all API routes
app.use(`${process.env.API_PREFIX}/${process.env.API_VERSION}`, multiTenant);

// Use routes
const apiBase = `${process.env.API_PREFIX}/${process.env.API_VERSION}`;
app.use(`${apiBase}/auth`, authRoutes);
app.use(`${apiBase}/employees`, employeeRoutes);

// 404 handler - must be after all routes
app.use(notFound);

// Error handling middleware - must be last
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://${HOST}:${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 API Base: ${process.env.APP_URL}${process.env.API_PREFIX}/${process.env.API_VERSION}`);
});

export default app;
