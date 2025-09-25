import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Basic Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'ZeroWaste API Server is running 🚀',
    project: 'MBG Food Waste Monitoring System',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Basic API info
app.get('/api', (req, res) => {
  res.json({
    name: 'ZeroWaste API',
    version: '1.0.0',
    description: 'Backend for MBG Food Waste Monitoring System',
    status: 'Active',
    endpoints: {
      health: '/api/health'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    message: `Route ${req.originalUrl} does not exist` 
  });
});

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