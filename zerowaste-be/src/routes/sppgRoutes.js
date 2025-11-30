import express from 'express';
import sppgController from '../controllers/sppgController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(sppgController.getAllSPPG)

// Semua route dilindungi JWT dan role admin
router.use(protect, restrictTo('admin'));

router.route('/')
  .post(sppgController.createSPPG);

router.route('/:id')
  .get(sppgController.getSPPGById)
  .put(sppgController.updateSPPG)
  .delete(sppgController.deleteSPPG);

export default router;
