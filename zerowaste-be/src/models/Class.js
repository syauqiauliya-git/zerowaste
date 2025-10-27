import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  // school_id reference (FK)
  school_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'Kelas harus terkait dengan Sekolah'],
  },
  class_name: {
    type: String,
    required: [true, 'Nama kelas harus diisi'],
    trim: true,
  },
  grade_level: String, // e.g., '5', '6', '7'
  is_active: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

const Class = mongoose.model('Class', classSchema);
export default Class;
