class InterfazRegistro {
    constructor() {
        this.gestor = new GestorUsuarios();
        this.formularioRegistro = document.querySelector('.formulario-login');
        this.campoNombre = document.getElementById('nombre');
        this.campoCorreo = document.getElementById('email');
        this.campoUsuario = document.getElementById('nuevo_usuario');
        this.campoContrasena = document.getElementById('nueva_contrasena');
        this.iconoOjo = document.querySelector('.icono-derecho');
        this.inicializar();
    }

    inicializar() {
        if (!this.formularioRegistro) return;

        this.configurarIconoOjo();
        this.configurarFormulario();
    }

    configurarIconoOjo() {
        if (!this.iconoOjo) return;

        this.iconoOjo.addEventListener('click', () => {
            const tipoActual = this.campoContrasena.getAttribute('type');
            if (tipoActual === 'password') {
                this.campoContrasena.setAttribute('type', 'text');
                this.iconoOjo.classList.remove('fa-eye');
                this.iconoOjo.classList.add('fa-eye-slash');
            } else {
                this.campoContrasena.setAttribute('type', 'password');
                this.iconoOjo.classList.remove('fa-eye-slash');
                this.iconoOjo.classList.add('fa-eye');
            }
        });
    }

    configurarFormulario() {
        this.formularioRegistro.addEventListener('submit', (evento) => {
            evento.preventDefault();
            this.registrarUsuario();
        });
    }

    registrarUsuario() {
        const nombre = this.campoNombre.value.trim();
        const correo = this.campoCorreo.value.trim();
        const usuario = this.campoUsuario.value.trim();
        const contrasena = this.campoContrasena.value.trim();

        if (!nombre || !correo || !usuario || !contrasena) {
            this.mostrarAlerta('Por favor, completa todos los campos.');
            return;
        }

        if (!this.validarCorreo(correo)) {
            this.mostrarAlerta('Por favor, ingresa un correo electrónico válido.');
            return;
        }

        if (contrasena.length < 6) {
            this.mostrarAlerta('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        const resultado = this.gestor.registrar({ nombre, correo, usuario, contrasena });

        if (resultado.exito) {
            this.mostrarAlerta(resultado.mensaje);
            // Correcta (está en Paginacion/registro.html, debe subir un nivel)
            window.location.href = '../index.html';
        } else {
            this.mostrarAlerta(resultado.mensaje);
        }
    }

    validarCorreo(correo) {
        const expresion = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return expresion.test(correo);
    }

    mostrarAlerta(mensaje) {
        alert(mensaje);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new InterfazRegistro();
});