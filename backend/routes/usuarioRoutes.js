import { Router } from 'express';
import * as c from '../controllers/UsuarioController.js';

const router = Router();

router.post('/registrar',    c.registrar);
router.post('/login',        c.login);
router.get('/sesion',        c.getSesion);
router.delete('/sesion',     c.cerrarSesion);

export default router;
