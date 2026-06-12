/*
  backend/controllers/CarritoController.js

  Handlers HTTP para las rutas del carrito.
*/

import { CarritoModel } from '../models/CarritoModel.js';

const model = new CarritoModel();

export const getTotales = (req, res) => {
    res.json(model.totales());
};

export const agregar = (req, res) => {
    res.json(model.agregar(req.params.idProducto));
};

export const eliminar = (req, res) => {
    res.json(model.eliminar(req.params.idProducto));
};

export const modificarCantidad = (req, res) => {
    const cantidad = parseInt(req.body.cantidad);
    if (isNaN(cantidad)) return res.status(400).json({ ok: false, msg: 'Cantidad inválida.' });
    res.json(model.modificarCantidad(req.params.idProducto, cantidad));
};

export const vaciar = (req, res) => {
    model.vaciar();
    res.json({ ok: true });
};
