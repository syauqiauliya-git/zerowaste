import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import AppError from '../utils/AppError.js';
// NOTE: You will need to query the TeacherClassAssignment model when ZWB10 is done.

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

// HELPER: Retrieves teacher-specific context (name, primary active class)
const getTeacherContext = async (userId) => {
    // 1. Find the specific Teacher profile data
    const teacherProfile = await Teacher.findOne({ user_id: userId });

    if (!teacherProfile) {
        return { teacher_id: null, name: null, current_class_id: null };
    }

    // 2. LOGIC FOR CURRENT CLASS (REQUIRED for QR workflow - ZWB02 AC)
    // *** Replace 'ASSIGNMENT_LOGIC_PENDING' with actual ZWB10 query when implemented. ***
    const currentAssignment = { class_id: 'ASSIGNMENT_LOGIC_PENDING' }; 

    return {
        teacher_id: teacherProfile._id,
        name: teacherProfile.name,
        current_class_id: currentAssignment.class_id,
        school_id: teacherProfile.school_id
    };
};


// REGISTER
export const register = async (req, res, next) => {
  try {
    const { name, email, password, number, school_id, role } = req.body;

    const validRoles = ['teacher', 'sppg_staff', 'admin'];
    if (!validRoles.includes(role)) {
      return next(new AppError('Role tidak valid. Gunakan teacher, sppg_staff, atau admin.', 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email sudah digunakan', 400));
    }
    
    // Hashing removed from here; model hooks handle it.
    const user = await User.create({
      username: email.split('@')[0],
      email,
      password, // Plain password sent, will be hashed in model
      number,
      role,
      is_active: true
    });

    let context = {};

    if (role === 'teacher') {
      if (!school_id) {
        return next(new AppError('school_id diperlukan untuk role teacher', 400));
      }

      const teacher = await Teacher.create({
        name,
        user_id: user._id,
        school_id
      });
      context = { teacher_id: teacher._id, name: teacher.name, school_id };
    }

    const token = signToken(user._id, role);

    res.status(201).json({
      message: 'Registrasi berhasil',
      user_id: user._id,
      role: user.role,
      email: user.email,
      ...context,
      token
    });
  } catch (err) {
    next(err);
  }
};

// LOGIN
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // CRITICAL: Must use .select('+password') to retrieve the hidden hash
    const user = await User.findOne({ email }).select('+password'); 
    
    if (!user) {
      return next(new AppError('Email atau password salah', 401));
    }

    // Compare plain text password with the hash retrieved from the database
    const valid = await bcrypt.compare(password, user.password); 
    if (!valid) {
      return next(new AppError('Email atau password salah', 401));
    }

    user.last_login = new Date();
    await user.save();

    let context = {};
    if (user.role === 'teacher') {
      // Fetch teacher-specific context (name, primary class ID, school ID)
      context = await getTeacherContext(user._id);
      
      if (!context.teacher_id) {
         return next(new AppError('Profil Guru tidak lengkap atau tidak ditemukan.', 404));
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