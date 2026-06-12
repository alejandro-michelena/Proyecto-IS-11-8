/*
  backend/controllers/ProductoController.js

  Handlers HTTP para las rutas de gestión de productos (admin).
*/

import { ProductoModel } from '../models/ProductoModel.js';

const model = new ProductoModel();

export const publicar = (req, res) => {
    res.json(model.publicar(req.body));
};

export const guardarBorrador = (req, res) => {
    res.json(model.guardarBorrador(req.body));
};

export const eliminar = (req, res) => {
    res.json(model.eliminar(req.params.id));
};
