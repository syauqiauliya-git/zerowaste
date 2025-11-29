import DailyReport from '../models/DailyReport.js';
import Class from '../models/Class.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import mongoose from 'mongoose';

const calcAverageRating = (likes, dislikes) => {
  const total = likes + dislikes;
  return total === 0 ? 0 : (likes / total) * 5;
};

// GET /api/analytics/class/:classId
export const getClassAnalytics = catchAsync(async (req, res, next) => {
  const { classId } = req.params;

  const kelas = await Class.findById(classId);
  if (!kelas) return next(new AppError('Kelas tidak ditemukan', 404));

  const reports = await DailyReport.aggregate([
    { $match: { class: new mongoose.Types.ObjectId(classId) } },
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
        class_name: kelas.class_name,
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
    { $match: { class: new mongoose.Types.ObjectId(classId) } },
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
      class_name: kelas.class_name,
      totalReduction: data.totalReduction,
      averageRating,
      totalReports: data.totalReports,
      trend
    }
  });
});

export default { getClassAnalytics };
