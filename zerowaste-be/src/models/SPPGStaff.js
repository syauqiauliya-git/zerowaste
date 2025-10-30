import mongoose from 'mongoose';

const sppgStaffSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  sppg_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SPPG',
    required: [true, 'SPPG ID harus diisi untuk staff supplier']
  },
  name: {
    type: String,
    required: [true, 'Nama staff harus diisi']
  },
  is_active: {
    type: Boolean,
    default: true
  },
  // CRITICAL ADDITION: Status for the Claim-and-Approve model
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  }
}, { timestamps: true });

// Optional: Automatically populate the linked User's email when querying
sppgStaffSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user_id',
        select: 'email role -_id'
    });
    next();
});

const SPPGStaff = mongoose.model('SPPGStaff', sppgStaffSchema);
export default SPPGStaff;