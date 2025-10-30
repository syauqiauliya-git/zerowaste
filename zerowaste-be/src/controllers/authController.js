import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import SPPGStaff from '../models/SPPGStaff.js';
import AppError from '../utils/AppError.js';

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

// HELPER: Retrieves teacher-specific context (simplified helper functions remain outside the main file block for brevity)
const getTeacherContext = async (userId) => {
    const teacherProfile = await Teacher.findOne({ user_id: userId });
    if (!teacherProfile) return { teacher_id: null, name: null, current_class_id: null, school_id: null };
    
    // NOTE: Using school_id as temporary class context
    const currentAssignment = { class_id: teacherProfile.school_id }; 
    
    return {
        teacher_id: teacherProfile._id,
        name: teacherProfile.name,
        current_class_id: currentAssignment.class_id,
        school_id: teacherProfile.school_id
    };
};

// HELPER: Retrieves sppg staff context
const getSPPGStaffContext = async (userId) => {
    const staffProfile = await SPPGStaff.findOne({ user_id: userId });
    if (!staffProfile) return { staff_id: null, name: null, sppg_id: null };
    
    return {
        staff_id: staffProfile._id,
        name: staffProfile.name,
        sppg_id: staffProfile.sppg_id
    };
};


// REGISTER
export const register = async (req, res, next) => {
  let user = null; // Declare outside try block for cleanup access
  try {
    const { name, email, password, number, school_id, sppg_id, role } = req.body;

    const validRoles = ['teacher', 'sppg_staff', 'admin'];
    if (!validRoles.includes(role)) {
      return next(new AppError('Role tidak valid. Gunakan teacher, sppg_staff, atau admin.', 400));
    }

    // 1. VALIDATION CHECK BEFORE USER CREATION
    if (role === 'teacher' && !school_id) {
        return next(new AppError('school_id diperlukan untuk role teacher', 400));
    }
    if (role === 'sppg_staff' && !sppg_id) {
        return next(new AppError('sppg_id diperlukan untuk role sppg_staff', 400));
    }
    
    // Check if email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email sudah digunakan', 400));
    }
    
    // 2. CREATE CORE USER (Success required before proceeding)
    user = await User.create({
      username: email.split('@')[0],
      email,
      password, // Model hook handles hashing
      number,
      role,
      is_active: true
    });

    let context = {};

    // 3. CREATE PROFILE (Wrap in internal try-catch for rollback)
    try {
        if (role === 'teacher') {
            const teacher = await Teacher.create({ name, user_id: user._id, school_id });
            context = { teacher_id: teacher._id, name: teacher.name, school_id };

        } else if (role === 'sppg_staff') {
            const staff = await SPPGStaff.create({ name, user_id: user._id, sppg_id });
            context = { staff_id: staff._id, name: staff.name, sppg_id };
        }
    } catch (profileError) {
        // If profile creation fails (e.g., invalid FK), delete the core User account (Rollback)
        await User.findByIdAndDelete(user._id);
        // Throw a generic error to the global handler
        return next(new AppError('Registrasi gagal. ID afiliasi (Sekolah/SPPG) tidak valid atau hilang.', 400));
    }

    const token = signToken(user._id, role);

    res.status(201).json({
      message: 'Registrasi berhasil. Akun Anda menunggu persetujuan Admin.',
      user_id: user._id,
      role: user.role,
      email: user.email,
      ...context,
      token
    });
  } catch (err) {
    // Catch-all for unique key violations (like existing email) or other general errors
    if (user && err.code !== 11000) { // If user was created but error wasn't unique key violation, clean up
        await User.findByIdAndDelete(user._id);
    }
    next(err);
  }
};

// LOGIN (remains the same)
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password'); 
    
    if (!user) return next(new AppError('Email atau password salah', 401));

    const valid = await bcrypt.compare(password, user.password); 
    if (!valid) return next(new AppError('Email atau password salah', 401));

    user.last_login = new Date();
    await user.save();

    let context = {};
    let profileStatus = 'APPROVED'; 

    if (user.role === 'teacher') {
      context = await getTeacherContext(user._id);
      if (!context.teacher_id) return next(new AppError('Profil Guru tidak lengkap atau tidak ditemukan.', 404));
      
      const teacherProfile = await Teacher.findById(context.teacher_id);
      profileStatus = teacherProfile ? teacherProfile.status : 'REJECTED'; 
    
    } else if (user.role === 'sppg_staff') {
      context = await getSPPGStaffContext(user._id);
      if (!context.staff_id) return next(new AppError('Profil Staff SPPG tidak lengkap atau tidak ditemukan.', 404));
      
      const staffProfile = await SPPGStaff.findById(context.staff_id);
      profileStatus = staffProfile ? staffProfile.status : 'REJECTED'; 
    }

    if (profileStatus !== 'APPROVED') {
        if (profileStatus === 'PENDING') {
            return next(new AppError('Akun Anda menunggu persetujuan dari Administrator.', 403));
        } else if (profileStatus === 'REJECTED') {
            return next(new AppError('Akses ditolak. Profil Anda telah ditolak oleh Admin.', 403));
        }
    }

    const token = signToken(user._id, user.role);

    res.status(200).json({
      message: 'Login berhasil',
      token,
      user_id: user._id,
      role: user.role,
      ...context
    });
  } catch (err) {
    next(err);
  }
};