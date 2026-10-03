import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import TeacherClassAssignment from '../models/TeacherClassAssignment.js';
import SPPGSchoolAssignment from '../models/SPPGSchoolAssignment.js';
import mongoose from 'mongoose';

// Helper function to dynamically select the model based on the URL path
const getAssignmentModel = (req) => {
    if (req.originalUrl.includes('teacher-class')) {
        return TeacherClassAssignment;
    } else if (req.originalUrl.includes('sppg-school')) {
        return SPPGSchoolAssignment;
    }
    // This should not happen if routes are defined correctly
    throw new AppError('Assignment type not recognized.', 400);
};

// Helper function to define the correct fields for population
const getPopulateFields = (Model) => {
    // Check constructor name to determine which fields exist on the model
    if (Model.modelName === 'TeacherClassAssignment') {
        return [
            'teacher_id',
            { path: 'class_id', populate: { path: 'school_id' } }
        ];
    } else if (Model.modelName === 'SPPGSchoolAssignment') {
        return ['sppg_id', 'school_id'];
    }
    return [];
};


/**
 * Generic handler for creating a new assignment record.
 */
export const createAssignment = catchAsync(async (req, res, next) => {
    const Model = getAssignmentModel(req);

    // NOTE: Foreign key validation is handled by Mongoose if IDs are invalid.
    const newAssignment = await Model.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            assignment: newAssignment,
        },
    });
});

/**
 * Generic handler for reading all assignment records of a specific type.
 */
export const getAllAssignments = catchAsync(async (req, res, next) => {
    const Model = getAssignmentModel(req);
    const populateFields = getPopulateFields(Model); // CRITICAL FIX: Get only valid fields

    let query = Model.find().limit(50); // Limit response size for efficiency

    // Apply populate for each field
    for (const field of populateFields) {
        query = query.populate(field);
    }

    const assignments = await query;

    res.status(200).json({
        status: 'success',
        results: assignments.length,
        data: {
            assignments,
        },
    });
});

/**
 * Generic handler for reading a single assignment record by ID.
 */
export const getAssignment = catchAsync(async (req, res, next) => {
    const Model = getAssignmentModel(req);
    const populateFields = getPopulateFields(Model); // CRITICAL FIX

    let query = Model.findById(req.params.id);

    // Apply populate for each field
    for (const field of populateFields) {
        query = query.populate(field);
    }

    const assignment = await query;

    if (!assignment) {
        return next(new AppError('Assignment record not found.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            assignment,
        },
    });
});

/**
 * Generic handler for updating an assignment record by ID.
 */
export const updateAssignment = catchAsync(async (req, res, next) => {
    const Model = getAssignmentModel(req);

    const updatedAssignment = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!updatedAssignment) {
        return next(new AppError('Assignment record not found for update.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            assignment: updatedAssignment,
        },
    });
});

/**
 * Generic handler for deleting an assignment record by ID.
 */
export const deleteAssignment = catchAsync(async (req, res, next) => {
    const Model = getAssignmentModel(req);

    const assignment = await Model.findByIdAndDelete(req.params.id);

    if (!assignment) {
        return next(new AppError('Assignment record not found for deletion.', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

/**
 * Get teacher's own class assignments (for logged-in teacher)
 */
export const getMyTeacherAssignments = catchAsync(async (req, res, next) => {
    if (!req.user || !req.user.teacher_id) {
        return next(new AppError('Teacher profile not found.', 404));
    }

    const populateFields = [
        'teacher_id',
        { path: 'class_id', populate: { path: 'school_id' } }
    ];

    const assignments = await TeacherClassAssignment.find({
        teacher_id: req.user.teacher_id,
        is_active: true
    }).populate(populateFields);

    res.status(200).json({
        status: 'success',
        results: assignments.length,
        data: {
            assignments,
        },
    });
});

export default {
    createAssignment,
    getAllAssignments,
    getAssignment,
    updateAssignment,
    deleteAssignment,
    getMyTeacherAssignments,
};
