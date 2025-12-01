import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  getAllClasses,
  getClassById,
  getClassesBySchoolId,
  createClass,
  updateClass,
  deleteClass
} from '../controllers/classController.js';

const router = express.Router();

// --------------------------------------------------------------------------
// SECURITY: All Class routes require authentication.
// The controller logic (req.user.role) DEPENDS on 'protect' being executed first.
// --------------------------------------------------------------------------
router.use(protect);

// 1. READ Operations (Open to Admin, Teacher, SPPG Staff)
// Teachers need this to find their classes; SPPG Staff might need it for context.
router.get('/', restrictTo('admin', 'teacher', 'sppg_staff'), getAllClasses);
router.get('/:id', restrictTo('admin', 'teacher', 'sppg_staff'), getClassById);
router.get('/school/:schoolId', restrictTo('admin', 'teacher', 'sppg_staff'), getClassesBySchoolId);

// 2. WRITE Operations (Strictly Admin)
// Only Admins can manage the structural data of the school system.
router.use(restrictTo('admin'));

router.post('/', createClass);

router
  .route('/:id')
  .put(updateClass)
  .delete(deleteClass);

export default router;