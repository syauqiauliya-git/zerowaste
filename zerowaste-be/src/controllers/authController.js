import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Teacher from '../models/Teacher.js';
import AppError from '../utils/AppError.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

// REGISTER
export const register = async (req, res, next) => {
  try {
    const { nama, email, password, school_id } = req.body;

    // Cek email unik
    const existing = await Teacher.findOne({ email });
    if (existing) {
      return next(new AppError('Email sudah digunakan', 400));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const teacher = await Teacher.create({
      nama,
      email,
      password_hash: hashedPassword,
      school_id
    });

    const token = signToken(teacher._id);

    res.status(201).json({
      teacher_id: teacher._id,
      nama: teacher.nama,
      email: teacher.email,
      school_id: teacher.school_id,
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

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return next(new AppError('Email atau password salah', 401));
    }

    const valid = await bcrypt.compare(password, teacher.password_hash);
    if (!valid) {
      return next(new AppError('Email atau password salah', 401));
    }

    const token = signToken(teacher._id);

    res.status(200).json({
      token,
      teacher_id: teacher._id,
      nama: teacher.nama
    });
  } catch (err) {
    next(err);
  }
};