/**
 * UsuarioController
 * ─────────────────
 * Maneja registro, login y carga de perfil.
 * Guarda la sesión activa en sesion.json (en disco) para que
 * los demás módulos (pedidos, carrito) puedan leerla uniformemente.
 *
 * Depende de: PersistenciaCliente, UsuarioModel
 */
class UsuarioController {
    constructor() {
        // Registro
        this.inputNombre   = document.getElementById('registro-nombre');
        this.inputEmail    = document.getElementById('registro-email');
        this.inputPassword = document.getElementById('registro-password');
        this.btnRegistrar  = document.getElementById('btn-registrar');

        // Login
        this.inputLoginEmail    = document.getElementById('login-email');
        this.inputLoginPassword = document.getElementById('login-password');
        this.btnLogin           = document.getElementById('btn-login');

        // Perfil
        this.txtPerfilNombre = document.getElementById('perfil-nombre');
        this.txtPerfilEmail  = document.getElementById('perfil-email');

        this.configurarEventos();
    }

    configurarEventos() {
        if (this.btnRegistrar) {
            this.btnRegistrar.addEventListener('click', (e) => this.manejarRegistro(e));
        }
        if (this.btnLogin) {
            this.btnLogin.addEventListener('click', (e) => this.manejarLogin(e));
        }
        if (this.txtPerfilNombre) {
            this.cargarPerfil();
        }
    }

    async manejarRegistro(e) {
        e.preventDefault();

        const nombre   = this.inputNombre?.value   || '';
        const email    = this.inputEmail?.value    || '';
        const password = this.inputPassword?.value || '';

        const error = UsuarioModel.validarDatos(nombre, email, password);
        if (error) {
            this.mostrarError(error);
            return;
        }

        const exito = await UsuarioModel.guardarUsuario(nombre, email, password);
        if (exito) {
            this.mostrarExito('¡Registro exitoso! Redirigiendo al inicio de sesión...');
            setTimeout(() => { window.location.href = 'index.html'; }, 1800);
        } else {
            this.mostrarError('El correo ya está registrado. Intenta con otro.');
        }
    }

    async manejarLogin(e) {
        e.preventDefault();

        const email    = this.inputLoginEmail?.value    || '';
        const password = this.inputLoginPassword?.value || '';

        if (!email || !password) {
            this.mostrarError('Por favor completa todos los campos.');
            return;
        }

        const usuario = await UsuarioModel.verificarCredenciales(email, password);

        if (usuario) {
            // Guardar sesión en disco para que todos los módulos la lean igual
            const persistencia = new PersistenciaCliente();
            await persistencia.escribirArchivo('sesion.json', {
                id:     usuario.id,
                nombre: usuario.nombre,
                email:  usuario.email,
                rol:    usuario.rol
            });

            window.location.href = 'catalogo.html';
        } else {
            this.mostrarError('Correo o contraseña incorrectos.');
        }
    }

    async cargarPerfil() {
        const persistencia = new PersistenciaCliente();
        const sesion = await persistencia.leerArchivo('sesion.json');

        if (!sesion) {
            window.location.href = 'index.html';
            return;
        }

        if (this.txtPerfilNombre) this.txtPerfilNombre.textContent = sesion.nombre;
        if (this.txtPerfilEmail)  this.txtPerfilEmail.textContent  = sesion.email;
    }

    // ── Helpers de UI ──────────────────────────────────
    mostrarError(mensaje) {
        this.quitarMensajeAnterior();
        const div = document.createElement('div');
        div.className = 'mensaje-form error-form';
        div.textContent = mensaje;
        document.querySelector('.tarjeta-login')?.appendChild(div);
        setTimeout(() => div.remove(), 4000);
    }

    mostrarExito(mensaje) {
        this.quitarMensajeAnterior();
        const div = document.createElement('div');
        div.className = 'mensaje-form exito-form';
        div.textContent = mensaje;
        document.querySelector('.tarjeta-login')?.appendChild(div);
    }

    quitarMensajeAnterior() {
        document.querySelector('.mensaje-form')?.remove();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new UsuarioController();
});
