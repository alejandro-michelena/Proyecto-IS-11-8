import { Router } from 'express';
import * as c from '../controllers/ProductoController.js';

const router = Router();

router.post('/',           c.publicar);
router.post('/borrador',   c.guardarBorrador);
router.delete('/:id',      c.eliminar);

export default router;
