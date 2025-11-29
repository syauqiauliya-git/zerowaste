export const getSchoolAnalytics = catchAsync(async (req, res, next) => {
  const { school_id: userSchoolId, role } = req.user;

  let matchStage = {};

  if (role === 'teacher') {
    if (!userSchoolId) {
      return next(new AppError('School ID tidak ditemukan di user context', 400));
    }
    matchStage = { 'class_data.school': new mongoose.Types.ObjectId(userSchoolId) };
  }

  if (role === 'admin') {
    if (req.query.school_id) {
      matchStage = { 'class_data.school': new mongoose.Types.ObjectId(req.query.school_id) };
    }
  }

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
    { $match: matchStage },
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

  const data = reports[0] || {
    totalReduction: 0,
    totalLikes: 0,
    totalDislikes: 0,
    totalReports: 0,
  };

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
    { $match: matchStage },
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
