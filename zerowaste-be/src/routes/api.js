import express from 'express';
import authRouter from './authRoutes.js';
import schoolRouter from './schoolRoutes.js';
import menuRouter from './menuRoutes.js';
import reportRouter from './reportRoutes.js';
import analyticsRouter from './analyticsRoutes.js';
import sppgRouter from './sppgRoutes.js';
import sppgStaffRouter from './sppgStaffRoutes.js';
import assignmentRouter from './assignmentRoutes.js';
import adminRouter from './adminRoutes.js'; 
import classRouter from './classRoutes.js';
import userRouter from './userRoutes.js'; 

const router = express.Router();

// 1. Feature Routers
router.use('/auth', authRouter);
router.use('/schools', schoolRouter); 
router.use('/menus', menuRouter); 
router.use('/reports', reportRouter);
router.use('/analytics', analyticsRouter);
router.use('/sppg', sppgRouter);
router.use('/sppg-staff', sppgStaffRouter);
router.use('/assignments', assignmentRouter);
router.use('/admin', adminRouter); 
router.use('/classes', classRouter);
router.use('/users', userRouter);

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
      analytics: '/api/v1/analytics',
      sppg: '/api/v1/sppg',
      'sppg-staff': '/api/v1/sppg-staff', 
      assignments: '/api/v1/assignments',
      admin: '/api/v1/admin', 
      classes: '/api/v1/classes',
      users: '/api/v1/users',
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