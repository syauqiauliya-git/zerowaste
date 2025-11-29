import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import AppError from '../utils/AppError.js';
import User from '../models/User.js'; 
import Teacher from '../models/Teacher.js';
import SPPGStaff from '../models/SPPGStaff.js';
import TeacherClassAssignment from '../models/TeacherClassAssignment.js'; // NEW IMPORT
import catchAsync from '../utils/catchAsync.js';

// HELPER: Retrieves current class ID by querying the real ZWB10 assignment table
const getCurrentClassId = async (teacherId) => {
    // DYNAMIC FETCH: Query the assignment table for the active class
    const currentAssignment = await TeacherClassAssignment.findOne({ 
        teacher_id: teacherId, 
        is_active: true 
    }).sort({ start_date: -1 }); // Get the most recent one

    if (!currentAssignment) {
        return null; 
    }
    return currentAssignment.class_id; 
};

// Middleware to check if a user is logged in (Authentication)
export const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Anda belum login. Silakan login untuk mendapatkan akses.', 401));
  }

  // 1. Verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); 

  // 2. Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError('Token milik pengguna ini tidak lagi ada.', 401));
  }

  // --- Attach Profile Context ---
  let teacherProfile = null;
  let sppgProfile = null;
  let classContextId = null;
  let schoolContextId = null;
  let sppgContextId = null;

  if (currentUser.role === 'teacher') {
    teacherProfile = await Teacher.findOne({ user_id: currentUser._id });
    if (teacherProfile) {
        // DYNAMIC FETCH: Now uses the helper to query the real DB
        classContextId = await getCurrentClassId(teacherProfile._id);
        schoolContextId = teacherProfile.school_id;
    }
  } else if (currentUser.role === 'sppg_staff') { 
    sppgProfile = await SPPGStaff.findOne({ user_id: currentUser._id });
    if (sppgProfile) {
        sppgContextId = sppgProfile.sppg_id;
    }
  }

  // 3. Attach consolidated data directly to req.user
  req.user = {
      ...currentUser.toObject(),
      teacher_id: teacherProfile ? teacherProfile._id : null,
      staff_id: sppgProfile ? sppgProfile._id : null,
      current_class_id: classContextId, // Will now be the valid ObjectId from DB
      school_id: schoolContextId,
      sppg_id: sppgContextId,
  };
  
  next();
});

// Middleware to restrict access based on user role
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Anda tidak memiliki izin untuk melakukan aksi ini (Akses Dibatasi).', 403));
    }
    next();
  };
};