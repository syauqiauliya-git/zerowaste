import express from 'express';
import classController from '../controllers/classController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply security and role restriction for all class CRUD operations
router.use(protect, restrictTo('admin'));

router.route('/')
  .post(classController.createClass)
  .get(classController.getAllClasses);

router.route('/:id')
  .get(classController.getClass)
  .put(classController.updateClass)
  .delete(classController.deleteClass);

export default router;
