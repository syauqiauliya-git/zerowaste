// src/server.js (TEMPORARY VERSION for Step 1/2 verification)

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Imports for Structure and Error Handling
import apiRouter from './routes/api.js';
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
// 4. SERVER STARTUP LOGIC (TEMPORARY - NO DB CONNECTION)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  🚀 ZeroWaste Backend Server Started!
  📍 Port: ${PORT}
  🌱 Environment: ${process.env.NODE_ENV}
  📊 Project: MBG Food Waste Monitoring
  🗓️ Started: ${new Date().toLocaleString()}
  `);
});

export default app;