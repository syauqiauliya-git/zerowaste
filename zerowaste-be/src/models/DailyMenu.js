import mongoose from 'mongoose';

const dailyMenuSchema = new mongoose.Schema({
  // --- Relational Fields (FKs) ---
  sppg: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SPPG',
    required: [true, 'Menu harus terkait dengan SPPG (Supplier)'],
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'Menu harus ditujukan untuk sebuah Sekolah'],
  },
  created_by: { // The User (SPPG Staff) who uploaded the menu
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Menu harus dibuat oleh seorang pengguna'],
  },

  // --- Data Fields ---
  menu_date: {
    type: Date,
    default: Date.now,
  },
  nama_menu: {
    type: String,
    required: [true, 'Menu harus memiliki nama'],
  },
  deskripsi: String,
  
  // --- Nutritional/Rating Fields ---
  rating: { type: Number, min: 0, max: 5, default: 0 },
  harga: { type: Number, min: 0, default: 0 },
  protein: { type: Number, min: 0, default: 0 },
  lemak: { type: Number, min: 0, default: 0 },
  karbohidrat: { type: Number, min: 0, default: 0 },

  is_active: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true }); // Accepts Acceptance Criteria: created_at & updated_at otomatis terisi.

const DailyMenu = mongoose.model('DailyMenu', dailyMenuSchema);
export default DailyMenu;