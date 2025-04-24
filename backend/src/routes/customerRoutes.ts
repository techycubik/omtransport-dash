import { Router } from 'express';
import { list, create, update } from '../controllers/customerController';

const router = Router();

router.get('/', list);
router.post('/', create);
router.put('/:id', update);

export default router; 