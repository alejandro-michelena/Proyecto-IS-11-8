/*
  backend/controllers/PedidoController.js

  Handlers HTTP para las rutas de pedidos.
*/

import { PedidoModel } from '../models/PedidoModel.js';
import { UsuarioRepository } from '../repositories/UsuarioRepository.js';

const model        = new PedidoModel();
const usuarioRepo  = new UsuarioRepository();

export const listar = (req, res) => {
    const sesion = usuarioRepo.sesion();
    if (!sesion?.id) return res.status(401).json({ ok: false, msg: 'No autenticado.' });
    const lista = sesion.rol === 'admin'
        ? model.todos()
        : model.porCliente(sesion.id);
    res.json(lista);
};

export const porId = (req, res) => {
    const pedido = model.porId(req.params.id);
    pedido ? res.json(pedido) : res.status(404).json({ ok: false, msg: 'Pedido no encontrado.' });
};

export const crear = (req, res) => {
    const { metodoPago, detallesEnvio } = req.body;
    if (!metodoPago || !detallesEnvio) return res.status(400).json({ ok: false, msg: 'Datos incompletos.' });
    res.json(model.crear(metodoPago, detallesEnvio));
};

export const actualizarEstado = (req, res) => {
    res.json(model.actualizarEstado(req.params.id, req.body.estado));
};
