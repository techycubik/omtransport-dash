import { Router } from 'express';
import {
  getAllCrusherSites,
  getCrusherSiteById,
  createCrusherSite,
  updateCrusherSite,
  deleteCrusherSite
} from '../controllers/crusherSiteController';

const router = Router();

// Get all crusher sites
router.get('/', getAllCrusherSites);

// Get a single crusher site by ID
router.get('/:id', getCrusherSiteById);

// Create a new crusher site
router.post('/', createCrusherSite);

// Update a crusher site
router.put('/:id', updateCrusherSite);

// Delete a crusher site
router.delete('/:id', deleteCrusherSite);

export default router; 