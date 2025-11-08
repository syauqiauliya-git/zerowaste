import DailyReport from '../models/DailyReport.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import mongoose from 'mongoose';

// menghitung rata-rata rating
const calcAverageRating = (likes, dislikes) => {
  const total = likes + dislikes;
  return total === 0 ? 0 : (likes / total) * 5; // Skala 0–5
};

// GET /api/analytics/school
// Akses: teacher, admin
export const getSchoolAnalytics = catchAsync(async (req, res, next) => {
  const { school_id: userSchoolId, role } = req.user;
  
  // For admins, allow query parameter; for teachers, use user's school_id
  const school_id = role === 'admin' && req.query.school_id 
    ? req.query.school_id 
    : userSchoolId;

  if (!school_id) return next(new AppError('School ID tidak ditemukan di user context', 400));

  const reports = await DailyReport.aggregate([
    {
      $lookup: {
        from: 'classes',
        localField: 'class',
        foreignField: '_id',
        as: 'class_data'
      }
    },
    { $unwind: '$class_data' },
    { $match: { 'class_data.school': new mongoose.Types.ObjectId(school_id) } },
    {
      $group: {
        _id: null,
        totalReduction: { $sum: '$total_waste_kg' },
        totalLikes: { $sum: '$total_likes' },
        totalDislikes: { $sum: '$total_dislikes' },
        totalReports: { $sum: 1 }
      }
    }
  ]);

  if (reports.length === 0) {
    return res.status(200).json({
      status: 'success',
      data: {
        totalReduction: 0,
        averageRating: 0,
        totalReports: 0,
        trend: [],
      }
    });
  }

  const data = reports[0];

  const trend = await DailyReport.aggregate([
    {
      $lookup: {
        from: 'classes',
        localField: 'class',
        foreignField: '_id',
        as: 'class_data'
      }
    },
    { $unwind: '$class_data' },
    { $match: { 'class_data.school': new mongoose.Types.ObjectId(school_id) } },
    {
      $group: {
        _id: '$report_date',
        totalWaste: { $sum: '$total_waste_kg' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const averageRating = calcAverageRating(data.totalLikes, data.totalDislikes);

  res.status(200).json({
    status: 'success',
    data: {
      totalReduction: data.totalReduction,
      averageRating,
      totalReports: data.totalReports,
      trend,
    }
  });
});

// GET /api/analytics/global
// Akses: admin
export const getGlobalAnalytics = catchAsync(async (req, res, next) => {
  const reports = await DailyReport.aggregate([
    {
      $group: {
        _id: null,
        totalReduction: { $sum: '$total_waste_kg' },
        totalLikes: { $sum: '$total_likes' },
        totalDislikes: { $sum: '$total_dislikes' },
        totalReports: { $sum: 1 },
      }
    }
  ]);

  const data = reports[0] || {
    totalReduction: 0,
    totalLikes: 0,
    totalDislikes: 0,
    totalReports: 0,
  };

  const averageRating = calcAverageRating(data.totalLikes, data.totalDislikes);

  res.status(200).json({
    status: 'success',
    data: {
      totalReduction: data.totalReduction,
      averageRating,
      totalReports: data.totalReports,
    }
  });
});

// GET /api/leaderboard?period=month|week|all
// Akses: teacher, admin
export const getLeaderboard = catchAsync(async (req, res, next) => {
  const period = req.query.period || 'all';
  let matchStage = {};

  // Filter berdasarkan periode
  const now = new Date();
  if (period === 'month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    matchStage.report_date = { $gte: firstDay };
  } else if (period === 'week') {
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    matchStage.report_date = { $gte: startOfWeek };
  }

  // Ranking per kelas
  const leaderboard = await DailyReport.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$class',
        totalWaste: { $sum: '$total_waste_kg' },
        totalLikes: { $sum: '$total_likes' },
        totalDislikes: { $sum: '$total_dislikes' },
        totalReports: { $sum: 1 },
      }
    },
    {
      $lookup: {
        from: 'classes',
        localField: '_id',
        foreignField: '_id',
        as: 'class_data',
      }
    },
    { $unwind: '$class_data' },
    {
      $project: {
        class_id: '$_id',
        class_name: '$class_data.class_name',
        totalWaste: 1,
        totalReports: 1,
        averageRating: {
          $cond: [
            { $eq: [{ $add: ['$totalLikes', '$totalDislikes'] }, 0] },
            0,
            {
              $multiply: [
                { $divide: ['$totalLikes', { $add: ['$totalLikes', '$totalDislikes'] }] },
                5,
              ],
            },
          ],
        },
      }
    },
    { $sort: { totalWaste: 1 } }
  ]);

  res.status(200).json({
    status: 'success',
    period,
    results: leaderboard.length,
    data: leaderboard,
  });
});

export default {
    getSchoolAnalytics,
    getGlobalAnalytics,
    getLeaderboard,
};