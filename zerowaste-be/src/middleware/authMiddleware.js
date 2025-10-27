import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import AppError from '../utils/AppError.js';
import User from '../models/User.js'; 
import Teacher from '../models/Teacher.js'; // Need to import this model
import catchAsync from '../utils/catchAsync.js';
// NOTE: Assuming you have the TeacherClassAssignment model created for ZWB10
// import TeacherClassAssignment from '../models/TeacherClassAssignment.js';

// HELPER: Retrieves current class ID logic (Simplified for middleware)
const getCurrentClassId = async (teacherId) => {
  // *** CRITICAL: REPLACE 'ASSIGNMENT_LOGIC_PENDING' with the actual Class ID ***
  const realClassId = "68fb3e28a6a61fba689ab22c"; // Example: '68fb3a0c78772755327e30d7'

  const currentAssignment = { class_id: realClassId };
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

  // --- CRITICAL FIX: Attach Profile Context ---
  let teacherProfile = null;
  let classContextId = null;

  if (currentUser.role === 'teacher') {
    // Fetch the linked Teacher profile
    teacherProfile = await Teacher.findOne({ user_id: currentUser._id });
    
    if (teacherProfile) {
        // Fetch the active class ID (uses placeholder logic for now)
        classContextId = await getCurrentClassId(teacherProfile._id);
    }
  }

  // 3. Attach consolidated data directly to req.user
  req.user = {
      ...currentUser.toObject(), // Spread the User document properties
      teacher_id: teacherProfile ? teacherProfile._id : null,
      current_class_id: classContextId,
      school_id: teacherProfile ? teacherProfile.school_id : null,
  };
  
  next();
});

// Middleware to restrict access based on user role (Authorization)
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Anda tidak memiliki izin untuk melakukan aksi ini (Akses Dibatasi).', 403));
    }
    next();
  };
};