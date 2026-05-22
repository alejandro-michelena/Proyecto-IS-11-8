class InterfazLogin {
    constructor() {
        this.gestor = new GestorUsuarios();
        this.formularioLogin = document.querySelector('.formulario-login');
        this.campoUsuario = document.getElementById('usuario');
        this.campoContrasena = document.getElementById('contrasena');
        this.iconoOjo = document.querySelector('.icono-derecho');
        this.botonIniciar = document.querySelector('.boton-iniciar');
        this.inicializar();
    }

    inicializar() {
        this.configurarIconoOjo();
        this.configurarBotonIniciar();
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

    configurarBotonIniciar() {
        this.botonIniciar.addEventListener('click', (evento) => {
            evento.preventDefault();
            this.iniciarSesion();
        });
    }

    iniciarSesion() {
        const usuarioOcorreo = this.campoUsuario.value.trim();
        const contrasena = this.campoContrasena.value.trim();

        if (!usuarioOcorreo || !contrasena) {
            this.mostrarAlerta('Por favor, completa todos los campos.');
            return;
        }

        const resultado = this.gestor.iniciarSesion(usuarioOcorreo, contrasena);

        if (resultado.exito) {
            // Correcta (index.html está en raíz, debe bajar a Paginacion/)
            window.location.href = 'Paginacion/catalogo.html';
        } else {
            this.mostrarAlerta(resultado.mensaje);
        }
    }

    mostrarAlerta(mensaje) {
        alert(mensaje);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new InterfazLogin();
});