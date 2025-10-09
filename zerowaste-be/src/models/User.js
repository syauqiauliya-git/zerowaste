import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username harus diisi'],
    unique: true
  },
  password_hash: {
    type: String,
    required: [true, 'Password harus diisi']
  },
  email: {
    type: String,
    required: [true, 'Email harus diisi'],
    unique: true,
    lowercase: true
  },
  number: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['teacher', 'student', 'admin'],
    default: 'teacher'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  last_login: {
    type: Date,
    default: null
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;