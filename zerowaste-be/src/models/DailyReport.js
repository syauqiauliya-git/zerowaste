import mongoose from 'mongoose';

const dailyReportSchema = new mongoose.Schema({
  // --- Relational Fields (FKs) ---
  teacher: { // The submitter
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'Report harus terkait dengan Guru'],
  },
  class: { // The class being reported on
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Report harus terkait dengan Kelas'],
  },
  menu: { // The menu being evaluated (from QR code data)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DailyMenu',
    required: [true, 'Report harus terkait dengan Menu'],
  },

  // --- Data from QR Payload (Limbah/Waste) ---
  report_date: {
    type: Date,
    required: [true, 'Report harus memiliki tanggal'],
  },
  total_waste_kg: { // From QR Payload
    type: Number,
    min: 0,
    required: [true, 'Berat limbah harus diisi'],
  },

  // --- Data from Survey/Feedback ---
  total_likes: { type: Number, default: 0 },
  total_dislikes: { type: Number, default: 0 },
  reason_breakdown_json: { // JSON field for detailed survey reasons
    type: Object,
    default: {},
  },
  verbal_feedback: String, // Manual input from Teacher

  // --- Status and Utility ---
  status: {
    type: String,
    enum: ['draft', 'submitted', 'validated'],
    default: 'submitted',
  },
  submitted_at: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: false }); // Note: We use submitted_at instead of Mongoose's default timestamps

const DailyReport = mongoose.model('DailyReport', dailyReportSchema);
export default DailyReport;