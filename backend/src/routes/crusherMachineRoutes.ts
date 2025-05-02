import { Router } from 'express';
import {
  getAllCrusherMachines,
  getCrusherMachineById,
  createCrusherMachine,
  updateCrusherMachine,
  deleteCrusherMachine
} from '../controllers/crusherMachineController';

const router = Router();

// Get all crusher machines
router.get('/', getAllCrusherMachines);

// Get a single crusher machine by ID
router.get('/:id', getCrusherMachineById);

// Create a new crusher machine
router.post('/', createCrusherMachine);

// Update a crusher machine
router.put('/:id', updateCrusherMachine);

// Delete a crusher machine
router.delete('/:id', deleteCrusherMachine);

export default router; 