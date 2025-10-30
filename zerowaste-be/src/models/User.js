import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username harus diisi'],
    unique: true
  },
  email: {
    type: String,
    required: [true, 'Email harus diisi'],
    unique: true,
    lowercase: true
  },
  // Renamed to 'password' and ADDED select: false for security
  password: { 
    type: String,
    required: [true, 'Password harus diisi'],
    minlength: 8, 
    select: false 
  },
  number: {
    type: String,
    default: null
  },
  // Corrected ENUM to match the Class Diagram
  role: {
    type: String,
    enum: ['teacher', 'sppg_staff', 'admin'], 
    required: true
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

// CRITICAL HOOK: AUTOMATICALLY hash the password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  
  next();
});

const User = mongoose.model('User', userSchema);

export default User;