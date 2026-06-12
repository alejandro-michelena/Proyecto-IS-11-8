/*
  backend/models/UsuarioModel.js

  Lógica de negocio de usuarios y sesión.
  Valida datos, orquesta registro/login y gestiona la sesión activa.
*/

import { UsuarioRepository } from '../repositories/UsuarioRepository.js';

export class UsuarioModel {
    #repo = new UsuarioRepository();

    validar(nombre, email, password) {
        if (!nombre || !email || !password) return 'Todos los campos son obligatorios.';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,20}( [a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,20})+$/.test(nombre.trim()))
            return 'Debe ingresar nombre y apellido, solo letras.';
        if (!/^[a-zA-Z0-9._%+-]{3,35}@(est\.)?ucab\.edu\.ve$/.test(email.trim()))
            return 'Debes usar un correo institucional válido (@est.ucab.edu.ve).';
        if (!/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[.\-_/*+!?¿¡@#$%^&]).{6,}$/.test(password))
            return 'Contraseña: mínimo 6 caracteres, una letra, un número y un carácter especial.';
        return null;
    }

    registrar(nombre, email, password) {
        if (this.#repo.existeEmail(email)) return { ok: false, msg: 'El correo ya está registrado.' };
        const lista = this.#repo.todos();
        this.#repo.agregar({
            id:            (lista.length ? Math.max(...lista.map(u => u.id)) : 0) + 1,
            nombre:        nombre.trim(),
            email:         email.trim().toLowerCase(),
            password,
            rol:           'cliente',
            fechaRegistro: new Date().toISOString(),
        });
        return { ok: true };
    }

    login(email, password) {
        const u = this.#repo.porEmail(email);
        if (!u || u.password !== password) return { ok: false, msg: 'Correo o contraseña incorrectos.' };
        this.#repo.guardarSesion({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol });
        return { ok: true };
    }

    sesion()       { return this.#repo.sesion(); }
    cerrarSesion() { return this.#repo.cerrarSesion(); }
}
