import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import Teacher from '../models/Teacher.js';
import SPPGStaff from '../models/SPPGStaff.js';

// Helper to determine the correct model and profile type
const getProfileModel = (profileType) => {
    if (profileType === 'teacher') return Teacher;
    if (profileType === 'sppgstaff') return SPPGStaff;
    throw new AppError('Tipe profil tidak valid.', 400);
};


// Handler to get all profiles pending approval
export const getPendingProfiles = catchAsync(async (req, res, next) => {
    const pendingTeachers = await Teacher.find({ status: 'PENDING' });
    const pendingStaff = await SPPGStaff.find({ status: 'PENDING' });

    res.status(200).json({
        status: 'success',
        results: pendingTeachers.length + pendingStaff.length,
        data: {
            teachers: pendingTeachers,
            sppgstaff: pendingStaff
        }
    });
});

export const getApprovedTeachers = catchAsync(async (req, res, next) => {
    const teachers = await Teacher.find({ status: 'APPROVED' })
        .populate('school_id', 'school_name')
        .populate('user_id', 'email')
        .select('name school_id user_id createdAt');

    res.status(200).json({
        status: 'success',
        results: teachers.length,
        data: {
            teachers
        }
    });
});

// Handler to approve a profile (PUT /api/admin/profiles/:id/approve)
export const approveProfile = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { profileType } = req.body; // e.g., 'teacher' or 'sppgstaff'

    const Model = getProfileModel(profileType);

    // 1. Update the profile status to APPROVED
    const profile = await Model.findByIdAndUpdate(id, { status: 'APPROVED' }, {
        new: true,
        runValidators: true
    });

    if (!profile) {
        return next(new AppError(`Profil ${profileType} dengan ID tersebut tidak ditemukan.`, 404));
    }

    // NOTE: The linked User's status remains 'is_active: true' from registration.
    // The profile status check in the login function is the final gate.

    res.status(200).json({
        status: 'success',
        message: `${profileType} berhasil disetujui.`,
        data: { profile }
    });
});

// Handler to reject a profile (PUT /api/admin/profiles/:id/reject)
export const rejectProfile = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { profileType } = req.body;

    const Model = getProfileModel(profileType);

    // 1. Update the profile status to REJECTED
    const profile = await Model.findByIdAndUpdate(id, { status: 'REJECTED' }, {
        new: true,
        runValidators: true
    });

    if (!profile) {
        return next(new AppError(`Profil ${profileType} dengan ID tersebut tidak ditemukan.`, 404));
    }

    res.status(200).json({
        status: 'success',
        message: `${profileType} berhasil ditolak.`,
        data: { profile }
    });
});


export default {
    getPendingProfiles,
    getApprovedTeachers,
    approveProfile,
    rejectProfile
};
