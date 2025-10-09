import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import AppError from '../utils/AppError.js';

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

// REGISTER
export const register = async (req, res, next) => {
  try {
    const { name, email, password, number, school_id, role } = req.body;

    const validRoles = ['teacher', 'student', 'admin'];
    if (!validRoles.includes(role)) {
      return next(new AppError('Role tidak valid. Gunakan teacher, student, atau admin.', 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email sudah digunakan', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      username: email.split('@')[0],
      email,
      password_hash: hashedPassword,
      number,
      role,
      is_active: true
    });

    let teacher = null;

    if (role === 'teacher') {
      if (!school_id) {
        return next(new AppError('school_id diperlukan untuk role teacher', 400));
      }

      teacher = await Teacher.create({
        name,
        user_id: user._id,
        school_id
      });
    }

    const token = signToken(user._id, role);

    res.status(201).json({
      message: 'Registrasi berhasil',
      user_id: user._id,
      role: user.role,
      email: user.email,
      ...(teacher && { teacher_id: teacher._id, name: teacher.name, school_id }),
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

    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('Email atau password salah', 401));
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return next(new AppError('Email atau password salah', 401));
    }

    user.last_login = new Date();
    await user.save();

    let teacher = null;
    if (user.role === 'teacher') {
      teacher = await Teacher.findOne({ user_id: user._id });
    }

    const token = signToken(user._id, user.role);

    res.status(200).json({
      message: 'Login berhasil',
      token,
      user_id: user._id,
      role: user.role,
      ...(teacher && { teacher_id: teacher._id, name: teacher.name })
    });
  } catch (err) {
    next(err);
  }
};