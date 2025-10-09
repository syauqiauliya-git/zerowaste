import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Nama harus diisi']
  },
  school_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School', 
    required: true
  }
}, { timestamps: true });

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;