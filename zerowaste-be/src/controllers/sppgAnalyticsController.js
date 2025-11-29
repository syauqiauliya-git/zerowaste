import DailyReport from '../models/DailyReport.js';
import School from '../models/School.js';
import Class from '../models/Class.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import mongoose from 'mongoose';

const calcAverageRating = (likes, dislikes) => {
  const total = likes + dislikes;
  return total === 0 ? 0 : (likes / total) * 5;
};

// GET /api/analytics/sppg/:sppgId
export const getSPPGAnalytics = catchAsync(async (req, res, next) => {
  const { sppgId } = req.params;

  const schools = await School.find({ sppg_id: sppgId }, '_id');

  if (!schools || schools.length === 0) {
    return next(new AppError('SPPG tidak memiliki sekolah terdaftar', 404));
  }

  const schoolIds = schools.map(s => s._id);

  const classes = await Class.find({ school_id: { $in: schoolIds } }, '_id');

  if (classes.length === 0) {
    return res.status(200).json({
      status: 'success',
      data: {
        totalReduction: 0,
        averageRating: 0,
        totalReports: 0,
        trend: []
      }
    });
  }

  const classIds = classes.map(c => c._id);

  const reports = await DailyReport.aggregate([
    { $match: { class: { $in: classIds } } },
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
        trend: []
      }
    });
  }

  const data = reports[0];
  const averageRating = calcAverageRating(data.totalLikes, data.totalDislikes);

  const trend = await DailyReport.aggregate([
    { $match: { class: { $in: classIds } } },
    {
      $group: {
        _id: '$report_date',
        totalWaste: { $sum: '$total_waste_kg' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      totalReduction: data.totalReduction,
      averageRating,
      totalReports: data.totalReports,
      trend
    }
  });
});

export default { getSPPGAnalytics };
