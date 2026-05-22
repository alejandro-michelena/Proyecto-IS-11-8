export class Usuario {
    constructor(id, nombre, email, password, rol) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.password = password;
        this.rol = rol;
        this.fechaRegistro = new Date().toISOString();
    }

    static validarDatos(nombre, email, password) {
        if (!nombre || !email || !password) {
            return "Todos los campos son obligatorios";
        }
        const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]{3,15} [a-zA-ZáéíóúÁÉÍÓÚñÑ]{3,15}$/;
        if(!regexNombre.test(nombre)) {
            return "Debe seguir la estructura: primer nombre, un espacio y el apellido"
        }
        const regexUcab = /^[a-zA-Z0-9._%+-]{3,35}@est\.ucab\.edu\.ve$/;
        if (!regexUcab.test(email)) {
            return "Debes usar un correo institucional valido (@est.ucab.edu.ve)";
        }
        const regexPassword = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[.\\-_/*+!?¿¡@#$%^&]).{6,}$/;
        if (!regexPassword.test(password)) {
            return "La contraseña debe tener entre [6-15] caracteres, contener al menos una letra, un número y un carácter especial";
        }
        return null; // null == todo bien
    }

    //implementar mas tarde ************* (de la mano con el JSON)
    static guardarUsuario(nombre, correo, password) {
        //RECORDAR QUE DEVUELVE UN BOOLEAN DE CONFIRMACION
    }

    static verificarCredenciales(email, password) {
        //RECORDAR QUE DEVUELVE AL USUARIO (O NULL EN CASO DE NO EXISTIR)
    }
}