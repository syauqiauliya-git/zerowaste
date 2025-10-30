import Class from '../models/Class.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

// Handler for POST /api/v1/classes
export const createClass = catchAsync(async (req, res, next) => {
  // NOTE: school_id validation (existence check) should be added later, but basic FK is handled by Mongoose
  const newClass = await Class.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      class: newClass,
    },
  });
});

// Handler for GET /api/v1/classes
export const getAllClasses = catchAsync(async (req, res, next) => {
  const classes = await Class.find().populate('school_id', 'school_name address');

  res.status(200).json({
    status: 'success',
    results: classes.length,
    data: {
      classes,
    },
  });
});

// Handler for GET /api/v1/classes/:id
export const getClass = catchAsync(async (req, res, next) => {
  const singleClass = await Class.findById(req.params.id).populate('school_id', 'school_name address');

  if (!singleClass) {
    return next(new AppError('Kelas tidak ditemukan', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      class: singleClass,
    },
  });
});

// Handler for PUT /api/v1/classes/:id
export const updateClass = catchAsync(async (req, res, next) => {
  const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedClass) {
    return next(new AppError('Kelas tidak ditemukan', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      class: updatedClass,
    },
  });
});

// Handler for DELETE /api/v1/classes/:id
export const deleteClass = catchAsync(async (req, res, next) => {
  const classToDelete = await Class.findByIdAndDelete(req.params.id);

  if (!classToDelete) {
    return next(new AppError('Kelas tidak ditemukan', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null, 
  });
});

export default {
    createClass,
    getAllClasses,
    getClass,
    updateClass,
    deleteClass,
};
