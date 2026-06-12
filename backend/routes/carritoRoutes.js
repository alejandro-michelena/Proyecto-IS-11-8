import { Router } from 'express';
import * as c from '../controllers/CarritoController.js';

const router = Router();

router.get('/',                    c.getTotales);
router.post('/:idProducto',        c.agregar);
router.delete('/',                 c.vaciar);
router.delete('/:idProducto',      c.eliminar);
router.put('/:idProducto',         c.modificarCantidad);

export default router;
