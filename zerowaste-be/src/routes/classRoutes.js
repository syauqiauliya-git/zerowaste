import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass
} from '../controllers/classController.js';

const router = express.Router();

// Admin saja
router.use(protect);
router.use(restrictTo('admin'));

router
  .route('/')
  .get(getAllClasses)
  .post(createClass);

router
  .route('/:id')
  .get(getClassById)
  .put(updateClass)
  .delete(deleteClass);

export default router;