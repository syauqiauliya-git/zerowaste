import express from 'express';
import schoolController from '../controllers/schoolController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. ENDPOINTS FOR OPERATIONAL READ ACCESS (GET)

// GET All Schools: Accessible to Admin and SPPG Staff (needs global list visibility)
router.route('/')
  .get(schoolController.getAllSchools); 

// GET Detail School: Accessible to Admin, and Teachers for contextual access.
// Teachers require special logic (getSchoolWithContext) to ensure they only see their own school.
router.route('/:id')
  .get(protect, schoolController.getSchoolWithContext); 

// 2. ENDPOINTS FOR ADMIN MANAGEMENT (POST, PUT, DELETE)
// These are destructive and strictly limited to the 'admin' role.
router.use(protect, restrictTo('admin'));

router.route('/')
.post(schoolController.createSchool); // POST: Restricted to ADMIN

router.route('/:id')
  .put(schoolController.updateSchool) // PUT: Restricted to ADMIN
  .delete(schoolController.deleteSchool); // DELETE: Restricted to ADMIN

export default router;