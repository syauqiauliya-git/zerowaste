import mongoose from 'mongoose';

const teacherClassAssignmentSchema = new mongoose.Schema({
    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    class_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
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

// Ensures a teacher can only have one active assignment per class at a time
teacherClassAssignmentSchema.index({ teacher_id: 1, class_id: 1, is_active: 1 }, { unique: true });

const TeacherClassAssignment = mongoose.model('TeacherClassAssignment', teacherClassAssignmentSchema);
export default TeacherClassAssignment;
