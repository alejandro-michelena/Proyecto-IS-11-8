/*
  src/controllers/UsuarioController.js — Maneja los eventos de login, registro y perfil.
  Instancia UsuarioModel y responde a interacciones del DOM.
  Cargado en index.html, registro.html y gestionPerfil.html.
*/

class UsuarioController {
    #model = new UsuarioModel();

    constructor() {
        document.getElementById('btn-registrar')?.addEventListener('click', e => this.#registrar(e));
        document.getElementById('btn-login')?.addEventListener('click', e => this.#login(e));
        if (document.getElementById('perfil-nombre')) this.#cargarPerfil();
        document.getElementById('btn-cerrar-sesion')?.addEventListener('click', e => this.#cerrarSesion(e));
    }

    async #registrar(e) {
        e.preventDefault();
        const nombre   = document.getElementById('registro-nombre')?.value ?? '';
        const email    = document.getElementById('registro-email')?.value  ?? '';
        const password = document.getElementById('registro-password')?.value ?? '';
        const err = this.#model.validar(nombre, email, password);
        if (err) return this.#toast(err, 'error');
        const r = await this.#model.registrar(nombre, email, password);
        r.ok ? (this.#toast('¡Registro exitoso! Redirigiendo...', 'exito'), setTimeout(() => location.href = 'index.html', 1800))
             : this.#toast(r.msg, 'error');
    }

    async #login(e) {
        e.preventDefault();
        const email    = document.getElementById('login-email')?.value    ?? '';
        const password = document.getElementById('login-password')?.value ?? '';
        if (!email || !password) return this.#toast('Completa todos los campos.', 'error');
        const r = await this.#model.login(email, password);
        r.ok ? location.href = 'catalogo.html' : this.#toast(r.msg, 'error');
    }

    async #cargarPerfil() {
        const sesion = await this.#model.sesion();
        if (!sesion?.id) return location.href = 'index.html';
        document.getElementById('perfil-nombre').textContent = sesion.nombre;
        document.getElementById('perfil-email').textContent  = sesion.email;
    }

    async #cerrarSesion(e) {
        e.preventDefault();
        await this.#model.cerrarSesion();
        location.href = 'index.html';
    }

    #toast(msg, tipo) {
        document.querySelector('.toast-auth')?.remove();
        const d = document.createElement('div');
        d.className   = 'toast-auth';
        d.textContent = msg;
        Object.assign(d.style, {
            position: 'fixed', bottom: '30px', right: '30px', padding: '14px 22px',
            borderRadius: '12px', fontWeight: '600', color: '#fff', zIndex: '9999',
            background: tipo === 'exito' ? '#10b981' : '#ef4444',
        });
        document.body.appendChild(d);
        setTimeout(() => d.remove(), 4000);
    }
}

document.addEventListener('DOMContentLoaded', () => new UsuarioController());
