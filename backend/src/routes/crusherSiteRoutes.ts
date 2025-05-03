import { Router } from 'express';
import {
  getCrusherSites,
  getCrusherSiteById,
  createCrusherSite,
  updateCrusherSite,
  deleteCrusherSite
} from '../controllers/crusherSiteController';

const router = Router();

// Crusher Sites routes
router.get('/', getCrusherSites);
router.get('/:id', getCrusherSiteById);
router.post('/', createCrusherSite);
router.put('/:id', updateCrusherSite);
router.delete('/:id', deleteCrusherSite);

export default router; 