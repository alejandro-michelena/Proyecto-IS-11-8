import { UsuarioModel } from "./UsuarioModel.js";

export class UsuarioController {
    constructor() {
        //referencias a los elementos html:
        //botones de Registrar Perfil
        this.inputNombre = document.getElementById("registro-nombre");
        this.inputEmail = document.getElementById("registro-email");
        this.inputPassword = document.getElementById("registro-password");
        this.btnRegistrar = document.getElementById("btn-registrar");

        //botones de Iniciar Sesion
        this.inputLoginEmail = document.getElementById("login-email");
        this.inputLoginPassword = document.getElementById("login-password");
        this.btnLogin = document.getElementById("btn-login");

        //textos donde se mostraran los datos al Consultar Perfil
        this.txtPerfilNombre = document.getElementById("perfil-nombre");
        this.txtPerfilEmail = document.getElementById("perfil-email");

        this.configurarEventos();
    }

    //esta funcion determina en cual de los html estamos cada vez que el html se recargue
    //ademas ella activa los botones relevantes
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

    manejarRegistro(e) {
        e.preventDefault(); //evita que se reinicie el html
        
        const nombre = this.inputNombre.value;
        const email = this.inputEmail.value;
        const password = this.inputPassword.value;

        const error = UsuarioModel.validarDatos(nombre, email, password); //funcion nativa del objeto Usuario (BOOL)
        if (error) {
            alert(error); /////
            return;
        }

        const exito = UsuarioModel.guardarUsuario(nombre, email, password);
        if (exito) {
            alert("Registro exitoso");
        } else {
            alert("El correo ya está registrado");
        }
    }

    manejarLogin(e) {
        e.preventDefault();

        const email = this.inputLoginEmail.value;
        const password = this.inputLoginPassword.value;

        const usuario = UsuarioModel.verificarCredenciales(email, password);
        if (usuario) {
            sessionStorage.setItem("usuarioActivo", JSON.stringify(usuario));
            window.location.href = "gestionProductos.html";
        } else {
            alert("Credenciales incorrectas");
        }
    }

    cargarPerfil() {
        const sesion = sessionStorage.getItem("usuarioActivo");
        if (!sesion) {
            window.location.href = "login.html";
            return;
        }

        const usuario = JSON.parse(sesion); //objeto plano de JS pero contiene todos los datos del usuario
        this.txtPerfilNombre.textContent = usuario.nombre;
        this.txtPerfilEmail.textContent = usuario.email;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new UsuarioController();
});