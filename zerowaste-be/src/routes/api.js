import express from 'express';
import authRouter from './authRoutes.js';
import schoolRouter from './schoolRoutes.js';
import menuRouter from './menuRoutes.js';
import reportRouter from './reportRoutes.js';
import classRouter from './classRoutes.js'; // <-- NEW IMPORT

const router = express.Router();

// 1. Feature Routers
router.use('/auth', authRouter);
router.use('/schools', schoolRouter); 
router.use('/menus', menuRouter); 
router.use('/reports', reportRouter);
router.use('/classes', classRouter); // <-- NEW ROUTE MAPPING

// 2. Base API Info Route 
router.get('/', (req, res) => {
  res.json({
    name: 'ZeroWaste API',
    version: '1.0.0',
    description: 'Backend for MBG Food Waste Monitoring System',
    status: 'Active',
    endpoints: {
      health: '/api/v1/health', 
      auth: '/api/v1/auth',
      schools: '/api/v1/schools', 
      menus: '/api/v1/menus',
      reports: '/api/v1/reports',
      classes: '/api/v1/classes', // <-- NEW ENDPOINT INFO
      base: '/api/v1'
    }
  });
});

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
