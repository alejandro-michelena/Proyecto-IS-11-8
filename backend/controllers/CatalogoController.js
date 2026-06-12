/*
  backend/controllers/CatalogoController.js

  Handlers HTTP para las rutas del catálogo público.
*/

import { CatalogoModel } from '../models/CatalogoModel.js';

const model = new CatalogoModel();

export const porCategoria = (req, res) => {
    res.json(model.porCategoria(req.query.categoria ?? null));
};

export const buscar = (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ ok: false, msg: 'Parámetro q requerido.' });
    res.json(model.buscar(q));
};

export const getFavoritos = (req, res) => {
    res.json(model.favoritos());
};

export const toggleFavorito = (req, res) => {
    res.json(model.toggleFavorito(req.params.id));
};
