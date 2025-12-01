import DailyReport from '../models/DailyReport.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import mongoose from 'mongoose';
import DailyMenu from '../models/DailyMenu.js'; 
import Class from '../models/Class.js'; // NEW IMPORT for validation

// --- HELPER: NEW QR String Parsing (Offline Contract) ---
const parseQrPayload = (rawString) => {
  const parts = rawString.split('|'); 

  if (parts.length < 4) {
    throw new AppError('Format data QR tidak lengkap (Harus 4 bagian).', 400);
  }

  const [wasteKg, likes, dislikes, reasonsString] = parts;

  const total_waste_kg = parseFloat(wasteKg);
  const total_likes = parseInt(likes, 10);
  const total_dislikes = parseInt(dislikes, 10);

  const reason_breakdown_json = reasonsString.split(',').reduce((acc, code) => {
    if (code) acc[code] = (acc[code] || 0) + 1;
    return acc;
  }, {});
  
  const reasonCodeCount = Object.values(reason_breakdown_json).reduce((sum, count) => sum + count, 0);
  const totalInteractions = total_likes + total_dislikes + reasonCodeCount;

  if (isNaN(total_waste_kg) || total_waste_kg < 0) {
    throw new AppError('Data berat limbah tidak valid.', 400);
  }

  return {
    total_waste_kg,
    total_likes,
    total_dislikes,
    reason_breakdown_json,
    total_interactions: totalInteractions, 
  };
};

// --- CORE HANDLER: POST /api/v1/reports ---

export const createReport = catchAsync(async (req, res, next) => {
  // 1. CONTEXT: Get Teacher and School from Session
  // We no longer need current_class_id from the session
  const { teacher_id, school_id } = req.user; 

  if (!teacher_id || !school_id) {
    return next(new AppError('Konteks Guru/Sekolah tidak ditemukan. Silakan login ulang.', 400));
  }

  // 2. DATA SOURCE: REQ BODY (Manual Inputs)
  // Expecting 'class_id' from the frontend dropdown
  const { qr_payload_string, verbal_feedback, scan_timestamp, class_id } = req.body;

  if (!qr_payload_string || !class_id) {
    return next(new AppError('Payload QR code dan Pilihan Kelas wajib disertakan.', 400));
  }

  // 3. SECURITY: Cross-Reference Validation
  // Ensure the selected class actually belongs to the Teacher's school
  const selectedClass = await Class.findOne({ _id: class_id, school_id: school_id });
  if (!selectedClass) {
      return next(new AppError('Kelas tidak valid atau tidak terdaftar di sekolah Anda.', 403));
  }
  
  // 4. PARSE: Extract waste data 
  const qrData = parseQrPayload(qr_payload_string);

  // 5. LOGIC: Find the Menu ID based on DATE and SCHOOL
  const eventDate = scan_timestamp ? new Date(scan_timestamp) : new Date();
  const startOfDay = new Date(eventDate); startOfDay.setHours(0,0,0,0);
  const endOfDay = new Date(eventDate); endOfDay.setHours(23,59,59,999);

  const matchedMenu = await DailyMenu.findOne({
      school: school_id,
      menu_date: {
          $gte: startOfDay,
          $lte: endOfDay
      }
  });

  if (!matchedMenu) {
      return next(new AppError(`Tidak ada Menu yang ditemukan untuk sekolah Anda pada tanggal ${startOfDay.toLocaleDateString()}.`, 404));
  }

  // 6. SAVE: Merge everything
  const finalReportData = {
    ...qrData, 
    menu: matchedMenu._id, 
    report_date: matchedMenu.menu_date,
    teacher: teacher_id, 
    class: class_id, // Uses the verified manual input
    verbal_feedback: verbal_feedback || 'Tidak ada feedback verbal.',
  };
  
  const newReport = await DailyReport.create(finalReportData);

  res.status(201).json({
    status: 'success',
    message: 'Laporan berhasil disimpan.',
    data: {
      report: newReport,
      detected_menu: matchedMenu.nama_menu
    },
  });
});

// --- CORE HANDLER: GET /api/v1/reports ---
export const getAllReports = catchAsync(async (req, res, next) => {
  const filters = {};
  if (req.query.class_id) filters.class = req.query.class_id;
  if (req.query.menu_id) filters.menu = req.query.menu_id;

  const reports = await DailyReport.find(filters)
    .populate('teacher', 'name')
    .populate('class', 'class_name')
    .populate('menu', 'nama_menu');

  res.status(200).json({
    status: 'success',
    results: reports.length,
    data: { reports },
  });
});

export default { createReport, getAllReports };