import mongoose from 'mongoose';

const sppgSchoolAssignmentSchema = new mongoose.Schema({
    sppg_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SPPG',
        required: true
    },
    school_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    start_date: {
        type: Date,
        default: Date.now
    },
    end_date: Date,
    is_active: {
        type: Boolean,
        default: true
    }
}, { timestamps: { createdAt: 'created_at' } });

// Ensures an SPPG can only have one active assignment per school at a time
sppgSchoolAssignmentSchema.index({ sppg_id: 1, school_id: 1, is_active: 1 }, { unique: true });

const SPPGSchoolAssignment = mongoose.model('SPPGSchoolAssignment', sppgSchoolAssignmentSchema);
export default SPPGSchoolAssignment;
