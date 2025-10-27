import School from '../models/School.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

// --- HANDLERS FOR ADMIN CRUD (No change to core logic) ---

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

// Handler for GET /api/v1/schools (Unrestricted Read for Admin/Staff)
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

// Handler for PUT /api/v1/schools/:id
export const updateSchool = catchAsync(async (req, res, next) => {
  const updatedSchool = await School.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
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

  res.status(204).json({
    status: 'success',
    data: null, 
  });
});


// --- NEW HANDLER: CONTEXTUAL READ (Record-Level Security) ---

/**
 * Handles GET /api/v1/schools/:id with record-level security applied to the Teacher role.
 * Teachers can only view the school associated with their user profile (req.user.school_id).
 */
export const getSchoolWithContext = catchAsync(async (req, res, next) => {
  const requestedSchoolId = req.params.id;
  const userRole = req.user.role;

  // 1. SECURITY CHECK: If the user is a Teacher, enforce the contextual restriction
  if (userRole === 'teacher') {
    const userSchoolId = req.user.school_id.toString(); // Get the ID from the authenticated user's context

    // Compare the requested ID with the user's assigned school ID
    if (requestedSchoolId !== userSchoolId) {
      return next(
        new AppError('Akses Ditolak. Guru hanya dapat melihat detail sekolah tempat mereka bertugas.', 403)
      );
    }
  }

  // 2. DATA RETRIEVAL: If security check passes (or user is Admin/Staff), fetch the data
  const school = await School.findById(requestedSchoolId);

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


export default {
    createSchool,
    getAllSchools,
    getSchoolWithContext, // Exporting the new handler
    updateSchool,
    deleteSchool,
};