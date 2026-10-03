import express from 'express';
import assignmentController from '../controllers/assignmentController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Teacher-specific endpoint (accessible by teachers)
router.get('/my-assignments', protect, restrictTo('teacher'), assignmentController.getMyTeacherAssignments);

// Apply security middleware to admin routes: Must be authenticated AND an Admin
router.use(protect, restrictTo('admin'));

// --- Teacher-Class Assignment Endpoints ---

// GET /api/v1/assignments/teacher-class (Read All)
// POST /api/v1/assignments/teacher-class (Create New)
router.route('/teacher-class')
  .post(assignmentController.createAssignment)
  .get(assignmentController.getAllAssignments);

// GET /api/v1/assignments/teacher-class/:id (Read Detail)
// PUT /api/v1/assignments/teacher-class/:id (Update)
// DELETE /api/v1/assignments/teacher-class/:id (Delete)
router.route('/teacher-class/:id')
  .get(assignmentController.getAssignment)
  .put(assignmentController.updateAssignment)
  .delete(assignmentController.deleteAssignment);

// --- SPPG-School Assignment Endpoints ---

// GET /api/v1/assignments/sppg-school (Read All)
// POST /api/v1/assignments/sppg-school (Create New)
router.route('/sppg-school')
  .post(assignmentController.createAssignment)
  .get(assignmentController.getAllAssignments);

// GET /api/v1/assignments/sppg-school/:id (Read Detail)
// PUT /api/v1/assignments/sppg-school/:id (Update)
// DELETE /api/v1/assignments/sppg-school/:id (Delete)
router.route('/sppg-school/:id')
  .get(assignmentController.getAssignment)
  .put(assignmentController.updateAssignment)
  .delete(assignmentController.deleteAssignment);

export default router;
