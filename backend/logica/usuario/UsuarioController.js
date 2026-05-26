import { Usuario } from "./UsuarioModel.js";

export class UsuarioController {
    constructor() {
        this.inputNombre = document.getElementById("registro-nombre");
        this.inputEmail = document.getElementById("registro-email");
        this.inputPassword = document.getElementById("registro-password");
        this.btnRegistrar = document.getElementById("btn-registrar");

        this.inputLoginEmail = document.getElementById("login-email");
        this.inputLoginPassword = document.getElementById("login-password");
        this.btnLogin = document.getElementById("btn-login");

        this.txtPerfilNombre = document.getElementById("perfil-nombre");
        this.txtPerfilEmail = document.getElementById("perfil-email");

        this.configurarEventos();
    }

    configurarEventos() {
        if (this.btnRegistrar) {
            this.btnRegistrar.addEventListener("click", (e) => this.manejarRegistro(e));
        }
        if (this.btnLogin) {
            this.btnLogin.addEventListener("click", (e) => this.manejarLogin(e));
        }
        if (this.txtPerfilNombre) {
            this.cargarPerfil();
        }
    }

    // puse 'async' aqui
    async manejarRegistro(e) {
        e.preventDefault(); 
        
        const nombre = this.inputNombre.value;
        const email = this.inputEmail.value;
        const password = this.inputPassword.value;

        const error = Usuario.validarDatos(nombre, email, password); 
        if (error) {
            alert(error); 
            return;
        }

        const exito = await Usuario.guardarUsuario(nombre, email, password);
        if (exito) {
            alert("Registro exitoso");
            // limpia el formulario
            this.inputNombre.value = "";
            this.inputEmail.value = "";
            this.inputPassword.value = "";
        } else {
            alert("El correo ya está registrado");
        }
    }

    async manejarLogin(e) {
        e.preventDefault();

        const email = this.inputLoginEmail.value;
        const password = this.inputLoginPassword.value;

        const usuario = await Usuario.verificarCredenciales(email, password);
        if (usuario) {
            sessionStorage.setItem("usuarioActivo", JSON.stringify(usuario));
            window.location.href = "../../frontend/html/catalogo.html"; // asegura que la ruta relativa calce con tu app
        } else {
            alert("Credenciales incorrectas");
        }
    }

    cargarPerfil() {
        const sesion = sessionStorage.getItem("usuarioActivo");
        if (!sesion) {
            window.location.href = "../../frontend/html/index.html";
            return;
        }

        const usuario = JSON.parse(sesion); 
        this.txtPerfilNombre.textContent = usuario.nombre;
        this.txtPerfilEmail.textContent = usuario.email;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new UsuarioController();
});