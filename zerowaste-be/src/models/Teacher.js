import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
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
  school_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  }
}, { timestamps: true });

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;