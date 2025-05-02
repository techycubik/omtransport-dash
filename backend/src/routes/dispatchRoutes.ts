import { Router } from 'express';
import { list, create, update } from '../controllers/dispatchController';

const router = Router();

router.get('/', list);
router.post('/', create);
router.patch('/:id', update);

export default router; 