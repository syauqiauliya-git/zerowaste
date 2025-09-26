// src/server.js (TEMPORARY VERSION for Step 1/2 verification)

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Imports for Structure and Error Handling
import apiRouter from './routes/api.js';
import connectDB from './db/connect.js';
import AppError from './utils/AppError.js';
import globalErrorHandler from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();

// Basic Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ----------------------------------------------------
// 1. ROUTE HANDLERS
// Use the centralized API router under '/api/v1'
app.use('/api/v1', apiRouter);

// ----------------------------------------------------
// 2. UNHANDLED ROUTE (404) CATCH-ALL
app.all('*', (req, res, next) => {
  // Pass the error to the global error handler middleware
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// ----------------------------------------------------
// 3. GLOBAL ERROR HANDLER
// This must be the last middleware in the chain
app.use(globalErrorHandler);

// ----------------------------------------------------
// 4. SERVER STARTUP LOGIC (Final Version)
const PORT = process.env.PORT || 5000;

// Connect to DB, then start the Express server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`
  🚀 ZeroWaste Backend Server Started!
  📍 Port: ${PORT}
  🌱 Environment: ${process.env.NODE_ENV}
  📊 Project: MBG Food Waste Monitoring
  🗓️ Started: ${new Date().toLocaleString()}
  `);
  });
}).catch(err => {
  console.error('Initial setup failed: Could not connect to DB or start server.', err);
  process.exit(1); // Exit with failure code
});

export default app;