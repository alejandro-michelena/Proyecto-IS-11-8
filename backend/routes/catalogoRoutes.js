import { Router } from 'express';
import * as c from '../controllers/CatalogoController.js';

const router = Router();

router.get('/',               c.porCategoria);
router.get('/buscar',         c.buscar);
router.get('/favoritos',      c.getFavoritos);
router.post('/favoritos/:id', c.toggleFavorito);

export default router;
