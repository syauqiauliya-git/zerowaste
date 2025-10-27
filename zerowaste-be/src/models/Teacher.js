import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Nama harus diisi']
  },
  school_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School', 
    required: true
  },
  // CRITICAL ADDITION: Status for the Claim-and-Approve model
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  }
}, { timestamps: true });

// Ensures that the User's email and role are populated upon query
teacherSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user_id',
        select: 'email role -_id'
    });
    next();
});

const Teacher = mongoose.model('Teacher', teacherSchema);
export default Teacher;