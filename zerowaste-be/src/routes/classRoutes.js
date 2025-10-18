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

// Public routes (no authentication needed)
router.get('/', getAllClasses);
router.get('/school/:schoolId', getClassesBySchoolId);
router.get('/:id', getClassById);

// Protected routes (need authentication and admin role)
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', createClass);

router
  .route('/:id')
  .put(updateClass)
  .delete(deleteClass);

export default router;