/*
  backend/controllers/UsuarioController.js

  Handlers HTTP para las rutas de usuario y sesión.
  Recibe req/res de Express, delega lógica al UsuarioModel.
*/

import { UsuarioModel } from '../models/UsuarioModel.js';

const model = new UsuarioModel();

export const registrar = (req, res) => {
    const { nombre, email, password } = req.body;
    const err = model.validar(nombre, email, password);
    if (err) return res.status(400).json({ ok: false, msg: err });
    res.json(model.registrar(nombre, email, password));
};

export const login = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ ok: false, msg: 'Completa todos los campos.' });
    res.json(model.login(email, password));
};

export const getSesion = (req, res) => {
    res.json(model.sesion() ?? null);
};

export const cerrarSesion = (req, res) => {
    model.cerrarSesion();
    res.json({ ok: true });
};
