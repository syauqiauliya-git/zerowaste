import express from 'express';
import schoolController from '../controllers/schoolController.js';

const router = express.Router();

// NOTE: These routes are currently PUBLIC/UNSECURED.
// Remember to apply JWT protection after your auth refactoring.

router.route('/')
  .post(schoolController.createSchool) // POST /api/v1/schools
  .get(schoolController.getAllSchools); // GET /api/v1/schools

router.route('/:id')
  .get(schoolController.getSchool) // GET /api/v1/schools/:id
  .put(schoolController.updateSchool) // PUT /api/v1/schools/:id
  .delete(schoolController.deleteSchool); // DELETE /api/v1/schools/:id

export default router;