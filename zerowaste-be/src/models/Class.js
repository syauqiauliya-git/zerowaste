import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  class_id: {
    type: Number,
    unique: true,
    required: true
  },
  school_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'School ID harus ada']
  },
  class_name: {
    type: String,
    required: [true, 'Nama harus ada']
  },
  grade_level: {
    type: String,
    required: [true, 'Tingkat kelas harus ada']
  }
}, { timestamps: true });

const Class = mongoose.model('Class', classSchema);

export default Class;