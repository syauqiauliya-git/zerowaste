import School from '../models/School.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

// Handler for POST /api/v1/schools
export const createSchool = catchAsync(async (req, res, next) => {
  const { school_name, jml_murid, jml_kelas, address } = req.body;

  const newSchool = await School.create({ 
    school_name, 
    jml_murid, 
    jml_kelas, 
    address 
  });

  res.status(201).json({
    status: 'success',
    data: {
      school: newSchool,
    },
  });
});

// Handler for GET /api/v1/schools
export const getAllSchools = catchAsync(async (req, res, next) => {
  const schools = await School.find();

  res.status(200).json({
    status: 'success',
    results: schools.length,
    data: {
      schools,
    },
  });
});

// Handler for GET /api/v1/schools/:id
export const getSchool = catchAsync(async (req, res, next) => {
  const school = await School.findById(req.params.id);

  if (!school) {
    return next(new AppError('Sekolah dengan ID tersebut tidak ditemukan', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      school,
    },
  });
});

// Handler for PUT /api/v1/schools/:id
export const updateSchool = catchAsync(async (req, res, next) => {
  // Use findByIdAndUpdate for efficient, quick updates
  const updatedSchool = await School.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Returns the updated document
    runValidators: true, // Run model validation rules on update fields
  });

  if (!updatedSchool) {
    return next(new AppError('Sekolah dengan ID tersebut tidak ditemukan', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      school: updatedSchool,
    },
  });
});

// Handler for DELETE /api/v1/schools/:id
export const deleteSchool = catchAsync(async (req, res, next) => {
  const school = await School.findByIdAndDelete(req.params.id);

  if (!school) {
    return next(new AppError('Sekolah dengan ID tersebut tidak ditemukan', 404));
  }

  // 204 No Content is the standard HTTP response for a successful deletion
  res.status(204).json({
    status: 'success',
    data: null, 
  });
});

export default {
    createSchool,
    getAllSchools,
    getSchool,
    updateSchool,
    deleteSchool,
};