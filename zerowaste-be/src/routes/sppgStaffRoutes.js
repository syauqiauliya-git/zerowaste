import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import SPPGStaff from '../models/SPPGStaff.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

const router = express.Router();

// All SPPG Staff management is restricted to Admin
router.use(protect, restrictTo('admin'));

// GET /api/v1/sppg-staff/ (List all staff)
router.get('/', catchAsync(async (req, res, next) => {
    // Populate the user_id to get email and role context, and sppg_id for vendor name
    const staffList = await SPPGStaff.find()
        .populate('sppg_id', 'name') 
        .populate('user_id', 'email role'); 

    res.status(200).json({
        status: 'success',
        results: staffList.length,
        data: { staff: staffList }
    });
}));

// GET /api/v1/sppg-staff/:id (Get staff detail)
router.get('/:id', catchAsync(async (req, res, next) => {
    const staff = await SPPGStaff.findById(req.params.id)
        .populate('sppg_id', 'name')
        .populate('user_id', 'email role');

    if (!staff) {
        return next(new AppError('Profil staff SPPG tidak ditemukan', 404));
    }
    
    res.status(200).json({
        status: 'success',
        data: { staff }
    });
}));

export default router;