import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import AppError from '../utils/AppError.js';
import User from '../models/User.js'; 
import Teacher from '../models/Teacher.js';
import SPPGStaff from '../models/SPPGStaff.js'; // NEW IMPORT
import catchAsync from '../utils/catchAsync.js';
// NOTE: Assuming you have the TeacherClassAssignment model created for ZWB10
import TeacherClassAssignment from '../models/TeacherClassAssignment.js';


// HELPER: Retrieves current class ID logic (Simplified for middleware)
const getCurrentClassId = async (teacherId) => {
    // *** This logic needs to be implemented when ZWB10 is done. ***
    // We use the school_id as temporary context; replace with actual class ID logic later.
    // NOTE: This value must be replaced with a real ID to avoid BSON errors.
    const currentAssignment = { class_id: 'ASSIGNMENT_LOGIC_PENDING' }; 
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

  // 2. Check if user still exists (fetching the core User data)
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError('Token milik pengguna ini tidak lagi ada.', 401));
  }

  // --- CRITICAL: Attach Profile Context ---
  let teacherProfile = null;
  let sppgProfile = null;
  let classContextId = null;
  let schoolContextId = null;
  let sppgContextId = null;

  if (currentUser.role === 'teacher') {
    teacherProfile = await Teacher.findOne({ user_id: currentUser._id });
    if (teacherProfile) {
        // Fetch the active class ID (uses placeholder logic for now)
        classContextId = await getCurrentClassId(teacherProfile._id);
        schoolContextId = teacherProfile.school_id;
    }
  } else if (currentUser.role === 'sppg_staff') { // NEW LOGIC FOR SPPG STAFF
    sppgProfile = await SPPGStaff.findOne({ user_id: currentUser._id });
    if (sppgProfile) {
        sppgContextId = sppgProfile.sppg_id;
    }
  }

  // 3. Attach consolidated data directly to req.user
  req.user = {
      ...currentUser.toObject(), // Spread the User document properties
      teacher_id: teacherProfile ? teacherProfile._id : null,
      staff_id: sppgProfile ? sppgProfile._id : null, // NEW: Staff ID
      current_class_id: classContextId,
      school_id: schoolContextId, // NEW: School ID context
      sppg_id: sppgContextId, // NEW: SPPG ID context
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
