import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import Teacher from '../models/Teacher.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Anda belum login. Token tidak ditemukan', 401));
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Cari user di DB
    const currentTeacher = await Teacher.findById(decoded.id);
    if (!currentTeacher) {
      return next(new AppError('Guru tidak ditemukan', 401));
    }

    // simpan ke request untuk digunakan di controller lain
    req.teacher = currentTeacher;
    next();
  } catch (err) {
    next(new AppError('Token tidak valid atau kadaluarsa', 401));
  }
};