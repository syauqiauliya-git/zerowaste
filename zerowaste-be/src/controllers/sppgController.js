import SPPG from '../models/SPPG.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const getAllSPPG = async (req, res, next) => {
  try {
    const sppgList = await SPPG.find();
    res.status(200).json({
      status: 'success',
      results: sppgList.length,
      data: sppgList,
    });
  } catch (err) {
    next(err);
  }
};

export const getSPPGById = async (req, res, next) => {
  try {
    const sppg = await SPPG.findById(req.params.id);
    if (!sppg) return next(new AppError('SPPG tidak ditemukan', 404));

    res.status(200).json({
      status: 'success',
      data: sppg,
    });
  } catch (err) {
    next(err);
  }
};

export const createSPPG = async (req, res, next) => {
  try {
    const sppg = await SPPG.create(req.body);
    res.status(201).json({
      status: 'success',
      message: 'SPPG berhasil ditambahkan',
      data: sppg,
    });
  } catch (err) {
    next(err);
  }
};

export const updateSPPG = async (req, res, next) => {
  try {
    const sppg = await SPPG.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!sppg) return next(new AppError('SPPG tidak ditemukan', 404));

    res.status(200).json({
      status: 'success',
      message: 'SPPG berhasil diperbarui',
      data: sppg,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteSPPG = async (req, res, next) => {
  try {
    const sppg = await SPPG.findByIdAndDelete(req.params.id);
    if (!sppg) return next(new AppError('SPPG tidak ditemukan', 404));

    res.status(204).json({
      status: 'success',
      message: 'SPPG berhasil dihapus',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

export default {
    createSPPG,
    getAllSPPG,
    getSPPGById,
    updateSPPG,
    deleteSPPG,
};
