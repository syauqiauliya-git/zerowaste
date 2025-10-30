import mongoose from 'mongoose';

const sppgSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nama SPPG harus diisi'],
    unique: true,
  },
  address: String,
  number: String,
  is_active: {
    type: Boolean,
    default: true,
  },
}, { timestamps: { createdAt: 'created_at' } });

const SPPG = mongoose.model('SPPG', sppgSchema);
export default SPPG;