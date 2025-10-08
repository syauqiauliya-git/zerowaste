import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema({
  school_name: {
    type: String,
    required: [true, 'Nama sekolah harus diisi'],
    unique: true,
  },
  address: String, // Alamat
  jml_murid: { // Jumlah Murid
    type: Number,
    min: 0,
    default: 0,
  },
  jml_kelas: { // Jumlah Kelas
    type: Number,
    min: 0,
    default: 0,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
}, { timestamps: { createdAt: 'created_at' } });

const School = mongoose.model('School', schoolSchema);
export default School;