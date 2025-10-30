import DailyReport from '../models/DailyReport.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import mongoose from 'mongoose';
import DailyMenu from '../models/DailyMenu.js'; // <-- Added to fetch menu_date

// --- HELPER FUNCTION: QR String Parsing (CRITICAL) ---

/**
 * Parses the raw QR string into structured data fields.
 * Assumes a pipe-delimited format: menu_id|total_waste_kg|total_likes|total_dislikes|reason_breakdown_codes
 * * Code List (ZWH Contract):
 * A: Porsi Terlalu Besar (Portion Size)
 * B: Rasa Tidak Enak (Taste/Flavor)
 * C: Suhu Makanan (Temperature)
 * D: Tekstur/Keras (Texture)
 * E: Waktu Terlalu Singkat (Time Constraint)
 * * @param {string} rawString - The raw string from the scanned QR code.
 * @returns {object} - Object containing parsed menu and waste data.
 */
const parseQrPayload = (rawString) => {
  // CRITICAL CHANGE: Expecting 5 parts (Timestamp removed)
  const parts = rawString.split('|'); 

  if (parts.length < 5) {
    throw new AppError('Format data QR tidak lengkap (Harus ada 5 bagian). Harap pindai ulang kode.', 400);
  }

  // NOTE: Order is now: menu_id|total_waste_kg|total_likes|total_dislikes|reason_breakdown_codes
  const [menuId, wasteKg, likes, dislikes, reasonsString] = parts;

  // Simple conversion for numbers
  const total_waste_kg = parseFloat(wasteKg);
  const total_likes = parseInt(likes, 10);
  const total_dislikes = parseInt(dislikes, 10);

  // Handle reason breakdown codes
  const reason_breakdown_json = reasonsString.split(',').reduce((acc, code) => {
    // Only count codes if they are not empty (to handle trailing commas)
    if (code) {
      acc[code] = (acc[code] || 0) + 1;
    }
    return acc;
  }, {});
  
  // Calculate total interactions from its constituent parts
  const reasonCodeCount = Object.values(reason_breakdown_json).reduce((sum, count) => sum + count, 0);
  const totalInteractions = total_likes + total_dislikes + reasonCodeCount;

  // Validation check after parsing
  if (isNaN(total_waste_kg) || total_waste_kg < 0 || !mongoose.Types.ObjectId.isValid(menuId)) {
    throw new AppError('Data QR tidak valid atau rusak.', 400);
  }

  return {
    menu: menuId,
    total_waste_kg,
    total_likes,
    total_dislikes,
    reason_breakdown_json,
    total_interactions: totalInteractions, 
  };
};

// --- CORE HANDLER: POST /api/v1/reports ---

export const createReport = catchAsync(async (req, res, next) => {
  // 1. DATA SOURCE: SESSION/JWT (Contextual IDs)
  const { teacher_id, current_class_id } = req.user; 

  if (!current_class_id || !teacher_id) {
    return next(new AppError('Konteks Guru (Kelas/ID) tidak ditemukan. Coba login ulang.', 400));
  }

  // 2. DATA SOURCE: QR PAYLOAD
  // NOTE: Multer attaches files to req.file, but we are skipping file handling for now.
  const { qr_payload_string, verbal_feedback } = req.body; 

  if (!qr_payload_string) {
    return next(new AppError('Payload QR code mentah wajib disertakan.', 400));
  }
  
  // Parse and validate data from the QR string.
  const qrData = parseQrPayload(qr_payload_string);

  // 3. CRITICAL: Fetch the menu date to set the report date
  // This ensures the report date is consistent with the planned menu date.
  const menuDocument = await DailyMenu.findById(qrData.menu).select('menu_date');

  if (!menuDocument) {
      return next(new AppError('Menu ID dari QR code tidak ditemukan di database.', 404));
  }

  // 4. MERGE AND ASSEMBLE FINAL DOCUMENT
  const finalReportData = {
    ...qrData, 
    
    // CRITICAL FIX: Use the Menu's scheduled date as the report date
    report_date: menuDocument.menu_date, 
    
    teacher: teacher_id, 
    class: current_class_id, 
    verbal_feedback: verbal_feedback || 'Tidak ada feedback verbal.',
  };
  
  const newReport = await DailyReport.create(finalReportData);

  res.status(201).json({
    status: 'success',
    message: 'Laporan harian berhasil disimpan dan digabungkan.',
    data: {
      report: newReport,
    },
  });
});

// --- CORE HANDLER: GET /api/v1/reports ---

export const getAllReports = catchAsync(async (req, res, next) => {
  // Filters are applied to the query object
  const filters = {};
  if (req.query.class_id) filters.class = req.query.class_id;
  if (req.query.menu_id) filters.menu = req.query.menu_id;

  // Enforce Teacher Scope (Teachers only see reports for their own assigned schools/classes)
  if (req.user.role === 'teacher') {
      // Future filter logic can be added here: filters.school = req.user.school_id;
  }

  const reports = await DailyReport.find(filters)
    .populate('teacher', 'name')
    .populate('class', 'class_name')
    .populate('menu', 'nama_menu');

  res.status(200).json({
    status: 'success',
    results: reports.length,
    data: {
      reports,
    },
  });
});

export default { createReport, getAllReports };
