import DailyReport from '../models/DailyReport.js';
import SPPGSchoolAssignment from '../models/SPPGSchoolAssignment.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import mongoose from 'mongoose';

const calcAverageRating = (likes, dislikes) => {
  const total = likes + dislikes;
  return total === 0 ? 0 : (likes / total) * 5;
};

export const getSchoolAnalytics = catchAsync(async (req, res, next) => {
  const { school_id: userSchoolId, role } = req.user;

  const school_id =
    role === 'admin' && req.query.school_id
      ? req.query.school_id
      : userSchoolId;

  if (!school_id) return next(new AppError('School ID tidak ditemukan', 400));
  if (!mongoose.Types.ObjectId.isValid(school_id))
    return next(new AppError('School ID tidak valid', 400));

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
    {
      $match: { 'class_data.school': new mongoose.Types.ObjectId(school_id) }
    },
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
      data: { totalReduction: 0, averageRating: 0, totalReports: 0, trend: [] }
    });
  }

  const data = reports[0];
  const averageRating = calcAverageRating(data.totalLikes, data.totalDislikes);

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
    {
      $match: { 'class_data.school': new mongoose.Types.ObjectId(school_id) }
    },
    {
      $group: { _id: '$report_date', totalWaste: { $sum: '$total_waste_kg' } }
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

export const getSchoolAnalyticsById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new AppError('School ID tidak valid', 400));

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
    {
      $match: { 'class_data.school': new mongoose.Types.ObjectId(id) }
    },
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

  const data =
    reports[0] ||
    { totalReduction: 0, totalLikes: 0, totalDislikes: 0, totalReports: 0 };

  res.status(200).json({ status: 'success', data });
});

export const getGlobalAnalytics = catchAsync(async (req, res, next) => {
  const reports = await DailyReport.aggregate([
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

  const data =
    reports[0] ||
    { totalReduction: 0, totalLikes: 0, totalDislikes: 0, totalReports: 0 };

  const averageRating = calcAverageRating(data.totalLikes, data.totalDislikes);

  res.status(200).json({
    status: 'success',
    data: {
      totalReduction: data.totalReduction,
      averageRating,
      totalReports: data.totalReports
    }
  });
});

export const getLeaderboard = catchAsync(async (req, res) => {
  const period = req.query.period || 'all';
  let matchStage = {};

  const now = new Date();
  if (period === 'month') {
    matchStage.report_date = {
      $gte: new Date(now.getFullYear(), now.getMonth(), 1)
    };
  } else if (period === 'week') {
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    matchStage.report_date = { $gte: startOfWeek };
  }

  const leaderboard = await DailyReport.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$class',
        totalWaste: { $sum: '$total_waste_kg' },
        totalLikes: { $sum: '$total_likes' },
        totalDislikes: { $sum: '$total_dislikes' },
        totalReports: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'classes',
        localField: '_id',
        foreignField: '_id',
        as: 'class_data'
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
                {
                  $divide: ['$totalLikes', { $add: ['$totalLikes', '$totalDislikes'] }]
                },
                5
              ]
            }
          ]
        }
      }
    },
    { $sort: { totalWaste: 1 } }
  ]);

  res.status(200).json({
    status: 'success',
    period,
    results: leaderboard.length,
    data: leaderboard
  });
});

export const getClassAnalytics = catchAsync(async (req, res, next) => {
  const { role, school_id } = req.user;

  if (role !== 'teacher')
    return next(new AppError('Hanya teacher yang dapat mengakses /class', 403));

  const classes = await DailyReport.aggregate([
    {
      $lookup: {
        from: 'classes',
        localField: 'class',
        foreignField: '_id',
        as: 'class_data'
      }
    },
    { $unwind: '$class_data' },
    {
      $match: { 'class_data.school': new mongoose.Types.ObjectId(school_id) }
    },
    {
      $group: {
        _id: '$class',
        className: { $first: '$class_data.class_name' },
        totalWaste: { $sum: '$total_waste_kg' }
      }
    }
  ]);

  res.status(200).json({ status: 'success', results: classes.length, data: classes });
});

export const getClassAnalyticsById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new AppError('Class ID tidak valid', 400));

  const reports = await DailyReport.aggregate([
    { $match: { class: new mongoose.Types.ObjectId(id) } },
    {
      $group: {
        _id: null,
        totalWaste: { $sum: '$total_waste_kg' },
        totalLikes: { $sum: '$total_likes' },
        totalDislikes: { $sum: '$total_dislikes' },
        totalReports: { $sum: 1 }
      }
    }
  ]);

  const data =
    reports[0] ||
    { totalWaste: 0, totalLikes: 0, totalDislikes: 0, totalReports: 0 };

  const averageRating = calcAverageRating(data.totalLikes, data.totalDislikes);

  res.status(200).json({
    status: 'success',
    data: { ...data, averageRating }
  });
});

export const getSppgAnalytics = catchAsync(async (req, res, next) => {
  const { role, sppg_id } = req.user;

  if (role !== 'sppg_staff')
    return next(new AppError('Hanya SPPG Staff yang dapat mengakses /sppg', 403));

  const assignments = await SPPGSchoolAssignment.aggregate([
    {
      $match: {
        sppg_id: new mongoose.Types.ObjectId(sppg_id),
        is_active: true
      }
    },
    {
      $lookup: {
        from: 'schools',
        localField: 'school_id',
        foreignField: '_id',
        as: 'school_data'
      }
    },
    { $unwind: '$school_data' },
    {
      $project: {
        school_id: 1,
        school_name: '$school_data.school_name',
        start_date: 1,
        end_date: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    totalActiveSchools: assignments.length,
    data: assignments
  });
});

export const getSppgAnalyticsById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new AppError('SPPG ID tidak valid', 400));

  const schools = await SPPGSchoolAssignment.aggregate([
    {
      $match: {
        sppg_id: new mongoose.Types.ObjectId(id),
        is_active: true
      }
    },
    {
      $lookup: {
        from: 'schools',
        localField: 'school_id',
        foreignField: '_id',
        as: 'school_data'
      }
    },
    { $unwind: '$school_data' },
    { $project: { school_id: 1, school_name: '$school_data.school_name' } }
  ]);

  res.status(200).json({
    status: 'success',
    data: { totalActiveSchools: schools.length, schools }
  });
});

export default {
  getSchoolAnalytics,
  getSchoolAnalyticsById,
  getGlobalAnalytics,
  getLeaderboard,
  getClassAnalytics,
  getClassAnalyticsById,
  getSppgAnalytics,
  getSppgAnalyticsById
};
