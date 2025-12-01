import Class from '../models/Class.js';
import School from '../models/School.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

// GET All Classes (Context Aware)
// Used for the Frontend Dropdown
export const getAllClasses = catchAsync(async (req, res, next) => {
  const filter = {};

  // If the requester is a Teacher, force the query to their specific school
  if (req.user.role === 'teacher') {
      if (!req.user.school_id) {
          return next(new AppError('Data sekolah guru tidak ditemukan.', 403));
      }
      filter.school_id = req.user.school_id;
  }

  // Execute query with the dynamic filter
  const classes = await Class.find(filter).populate('school_id', 'school_name address');

  res.status(200).json({
    status: 'success',
    results: classes.length,
    data: {
      classes,
    },
  });
});

// GET Classes by School ID (Admin/Staff Utility)
export const getClassesBySchoolId = catchAsync(async (req, res, next) => {
    const { schoolId } = req.params;
    
    const school = await School.findById(schoolId);
    if (!school) {
      return next(new AppError('Sekolah tidak ditemukan', 404));
    }

    const classes = await Class.find({ school_id: schoolId }).populate('school_id', 'school_name');
    
    res.status(200).json({
      status: 'success',
      results: classes.length,
      data: classes
    });
});

// GET Detail Class
export const getClassById = catchAsync(async (req, res, next) => {
    const singleClass = await Class.findById(req.params.id).populate('school_id', 'school_name');
    
    if (!singleClass) {
        return next(new AppError('Kelas tidak ditemukan', 404));
    }

    // SECURITY: Ensure teacher can only view class from their own school
    // This prevents a teacher from guessing an ID to view another school's class
    if (req.user.role === 'teacher') {
        const teacherSchoolId = req.user.school_id.toString();
        const classSchoolId = singleClass.school_id._id.toString();
        
        if (teacherSchoolId !== classSchoolId) {
            return next(new AppError('Anda tidak memiliki akses ke kelas ini.', 403));
        }
    }

    res.status(200).json({ 
        status: 'success', 
        data: singleClass 
    });
});

// POST Create Class (Admin Only)
export const createClass = catchAsync(async (req, res, next) => {
    // Mongoose schema handles the 'required' checks automatically
    const newClass = await Class.create(req.body);
    res.status(201).json({ status: 'success', data: newClass });
});

// PUT Update Class (Admin Only)
export const updateClass = catchAsync(async (req, res, next) => {
    const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!updatedClass) return next(new AppError('Kelas tidak ditemukan', 404));
    
    res.status(200).json({ status: 'success', data: updatedClass });
});

// DELETE Class (Admin Only)
export const deleteClass = catchAsync(async (req, res, next) => {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    
    if (!deletedClass) return next(new AppError('Kelas tidak ditemukan', 404));
    
    res.status(204).json({ status: 'success', data: null });
});

export default {
    createClass,
    getAllClasses,
    getClassesBySchoolId,
    getClassById,
    updateClass,
    deleteClass,
};