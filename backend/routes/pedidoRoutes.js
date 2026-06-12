import { Router } from 'express';
import * as c from '../controllers/PedidoController.js';

const router = Router();

router.get('/',              c.listar);
router.post('/',             c.crear);
router.get('/:id',           c.porId);
router.put('/:id/estado',    c.actualizarEstado);

export default router;
