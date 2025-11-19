import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import SPPGStaff from '../models/SPPGStaff.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

// Helper to retrieve the specific profile (Teacher or SPPGStaff) based on role
const getProfile = async (user) => {
    let profile = null;
    if (user.role === 'teacher') {
        profile = await Teacher.findOne({ user_id: user._id }).populate('school_id', 'school_name');
    } else if (user.role === 'sppg_staff') {
        profile = await SPPGStaff.findOne({ user_id: user._id }).populate('sppg_id', 'name');
    }
    return profile;
};

// GET /api/v1/users/me - Get the current authenticated user's profile
export const getMe = catchAsync(async (req, res, next) => {
    // req.user is guaranteed to be present and authenticated by the 'protect' middleware
    const user = req.user; 
    
    // Fetch the linked profile data (Teacher or SPPGStaff)
    const profile = await getProfile(user);

    if (!profile) {
        return next(new AppError('Profil pengguna tidak ditemukan.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user_info: user, // Core User data (email, role)
            profile_info: profile // Linked Teacher/Staff data (name, school/sppg context)
        }
    });
});

// PUT /api/v1/users/update-me - Update the current authenticated user's personal data
export const updateMe = catchAsync(async (req, res, next) => {
    // Prevent sensitive updates through this general endpoint
    if (req.body.password || req.body.role) {
        return next(new AppError('Endpoint ini hanya untuk update data non-sensitif (username, number).', 400));
    }

    // Filter fields to allow only username and number update on the User document
    const filteredBody = {};
    if (req.body.username) filteredBody.username = req.body.username;
    if (req.body.number) filteredBody.number = req.body.number;

    if (Object.keys(filteredBody).length === 0) {
        return next(new AppError('Tidak ada data yang valid untuk diperbarui.', 400));
    }

    // 1. Update the core User document
    const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
        new: true,
        runValidators: true
    });
    
    // 2. Update the linked profile (e.g., Teacher name) if provided
    let profile = await getProfile(updatedUser);
    
    if (req.body.name && profile) {
         // Assuming the name field is common to Teacher/SPPGStaff and can be updated
         profile = await profile.constructor.findByIdAndUpdate(profile._id, { name: req.body.name }, { new: true });
    }

    res.status(200).json({
        status: 'success',
        message: 'Profil berhasil diperbarui.',
        data: {
            user_info: updatedUser,
            profile_info: profile
        }
    });
});

export default { getMe, updateMe };