import express from 'express';
import menuController from '../controllers/menuController.js';
// IMPORTING THE NOW-AVAILABLE MIDDLEWARE
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🚨 APPLY SECURITY: All menu CRUD operations are restricted to authenticated SPPG Staff
router.use(protect, restrictTo('sppg_staff')); 

router.route('/')
  .post(menuController.createMenu) 
  .get(menuController.getAllMenus); 

router.route('/:id')
  .get(menuController.getMenu) 
  .put(menuController.updateMenu) 
  .delete(menuController.deleteMenu); 

export default router;