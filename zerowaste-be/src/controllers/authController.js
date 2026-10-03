import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import SPPGStaff from '../models/SPPGStaff.js';
import TeacherClassAssignment from '../models/TeacherClassAssignment.js'; // Import ZWB10 Model
import AppError from '../utils/AppError.js';
import { createNotification } from './notificationController.js';

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

// HELPER: Retrieves teacher-specific context
const getTeacherContext = async (userId) => {
    const teacherProfile = await Teacher.findOne({ user_id: userId });
    if (!teacherProfile) return { teacher_id: null, name: null, current_class_id: null, school_id: null };

    // ZWB10 INTEGRATION: Query the assignment table for the active class
    // This replaces the placeholder logic with real database lookups
    const currentAssignment = await TeacherClassAssignment.findOne({
        teacher_id: teacherProfile._id,
        is_active: true
    }).sort({ start_date: -1 }); // Get the most recent active assignment

    return {
        teacher_id: teacherProfile._id,
        name: teacherProfile.name,
        // Return the found class ID or null if no assignment exists
        current_class_id: currentAssignment ? currentAssignment.class_id : null,
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
  let user = null;
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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email sudah digunakan', 400));
    }

    // 2. CREATE CORE USER
    user = await User.create({
      username: email.split('@')[0],
      email,
      password,
      number,
      role,
      is_active: true
    });

    let context = {};

    // 3. CREATE PROFILE (Transaction Wrapper)
    try {
        if (role === 'teacher') {
            // Status defaults to PENDING via model default
            const teacher = await Teacher.create({ name, user_id: user._id, school_id });
            context = { teacher_id: teacher._id, name: teacher.name, school_id };

        } else if (role === 'sppg_staff') {
             // Status defaults to PENDING via model default
            const staff = await SPPGStaff.create({ name, user_id: user._id, sppg_id });
            context = { staff_id: staff._id, name: staff.name, sppg_id };
        }
    } catch (profileError) {
        // ROLLBACK: Delete the user if profile creation fails
        await User.findByIdAndDelete(user._id);
        return next(new AppError('Registrasi gagal. ID afiliasi tidak valid atau terjadi kesalahan database.', 400));
    }

    // 4. NOTIFY ALL ADMINS about new registration pending approval
    if (role === 'teacher' || role === 'sppg_staff') {
      try {
        const admins = await User.find({ role: 'admin', is_active: true }).select('_id');
        const roleName = role === 'teacher' ? 'Guru' : 'Staff SPPG';

        for (const admin of admins) {
          await createNotification({
            user_id: admin._id,
            title: 'Pendaftaran Baru Menunggu Persetujuan',
            body: `Ada pendaftaran baru dari ${name} sebagai ${roleName} yang menunggu persetujuan Anda`,
            type: 'info',
            related_data: {
              user_id: user._id,
              email: user.email,
              role: role,
              name: name
            }
          });
        }
      } catch (notifError) {
        console.error('Failed to create admin notifications:', notifError.message);
      }
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
    // Catch-all cleanup for other errors (excluding unique email error which is handled above)
    if (user && err.code !== 11000) {
        await User.findByIdAndDelete(user._id);
    }
    next(err);
  }
};

// LOGIN
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
    let profileStatus = 'APPROVED'; // Admin/default users are implicitly approved

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

    // SECURITY GATE: Check Status
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
