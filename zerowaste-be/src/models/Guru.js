import mongoose from 'mongoose';

const guruSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: [true, 'Nama harus diisi']
  },
  email: {
    type: String,
    required: [true, 'Email harus diisi'],
    unique: true,
    lowercase: true
  },
  password_hash: {
    type: String,
    required: [true, 'Password harus diisi']
  },
  sekolah_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sekolah',
    required: true
  }
}, { timestamps: true });

const Guru = mongoose.model('Guru', guruSchema);

export default Guru;