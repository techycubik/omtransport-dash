import { Router } from 'express';
import { list, create, update, destroy } from '../controllers/purchaseOrderController';

const router = Router();

router.get('/', list);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', destroy);

export default router; 