// src/routes/api.js

import express from 'express';
// Import feature-specific routers here as they are created
// import wasteRouter from './wasteRoutes.js';

const router = express.Router();

// 1. Feature Routers
// Example: router.use('/waste', wasteRouter);

// 2. Base API Info Route 
router.get('/', (req, res) => {
  res.json({
    name: 'ZeroWaste API',
    version: '1.0.0',
    description: 'Backend for MBG Food Waste Monitoring System',
    status: 'Active',
    endpoints: {
      health: '/api/v1/health', // Reflects the new mounted path
      base: '/api/v1'
    }
  });
});

// 3. Health Check Route 
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'ZeroWaste API Server is running 🚀',
    project: 'MBG Food Waste Monitoring System',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

export default router;