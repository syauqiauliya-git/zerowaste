import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Guru from '../models/Guru.js';
import AppError from '../utils/AppError.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

// REGISTER
export const register = async (req, res, next) => {
  try {
    const { nama, email, password, sekolah_id } = req.body;

    // Cek email unik
    const existing = await Guru.findOne({ email });
    if (existing) {
      return next(new AppError('Email sudah digunakan', 400));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const guru = await Guru.create({
      nama,
      email,
      password_hash: hashedPassword,
      sekolah_id
    });

    const token = signToken(guru._id);

    res.status(201).json({
      guru_id: guru._id,
      nama: guru.nama,
      email: guru.email,
      sekolah_id: guru.sekolah_id,
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

    const guru = await Guru.findOne({ email });
    if (!guru) {
      return next(new AppError('Email atau password salah', 401));
    }

    const valid = await bcrypt.compare(password, guru.password_hash);
    if (!valid) {
      return next(new AppError('Email atau password salah', 401));
    }

    const token = signToken(guru._id);

    res.status(200).json({
      token,
      guru_id: guru._id,
      nama: guru.nama
    });
  } catch (err) {
    next(err);
  }
};