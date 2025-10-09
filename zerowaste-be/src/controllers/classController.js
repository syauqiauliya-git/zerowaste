import Class from '../models/Class.js';
import AppError from '../utils/AppError.js';

// GET semua kelas
export const getAllClasses = async (req, res, next) => {
  try {
    const classes = await Class.find().populate('school_id', 'school_name');
    res.status(200).json({ status: 'success', data: classes });
  } catch (err) {
    next(err);
  }
};

// GET detail kelas
export const getClassById = async (req, res, next) => {
  try {
    const kelas = await Class.findById(req.params.id).populate('school_id', 'school_name');
    if (!kelas) return next(new AppError('Kelas tidak ditemukan', 404));
    res.status(200).json({ status: 'success', data: kelas });
  } catch (err) {
    next(err);
  }
};

// POST tambah kelas
export const createClass = async (req, res, next) => {
  try {
    const { class_id, school_id, class_name, grade_level } = req.body;

    if (!class_id || !school_id || !class_name || !grade_level) {
      return next(new AppError('Semua field harus diisi', 400));
    }

    const kelas = await Class.create({
      class_id,
      school_id,
      class_name,
      grade_level
    });

    res.status(201).json({ status: 'success', data: kelas });
  } catch (err) {
    next(err);
  }
};

// PUT update kelas
export const updateClass = async (req, res, next) => {
  try {
    const kelas = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!kelas) return next(new AppError('Kelas tidak ditemukan', 404));
    res.status(200).json({ status: 'success', data: kelas });
  } catch (err) {
    next(err);
  }
};

// DELETE kelas
export const deleteClass = async (req, res, next) => {
  try {
    const kelas = await Class.findByIdAndDelete(req.params.id);
    if (!kelas) return next(new AppError('Kelas tidak ditemukan', 404));
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};