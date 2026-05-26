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
        if (!regexNombre.test(nombre)) {
            return "Debe seguir la estructura: primer nombre, un espacio y el apellido";
        }
        const regexUcab = /^[a-zA-Z0-9._%+-]{3,35}@est\.ucab\.edu\.ve$/;
        if (!regexUcab.test(email)) {
            return "Debes usar un correo institucional valido (@est.ucab.edu.ve)";
        }
        const regexPassword = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[.\\-_/*+!?¿¡@#$%^&]).{6,}$/;
        if (!regexPassword.test(password)) {
            return "La contraseña debe tener entre [6-15] caracteres, contener al menos una letra, un número y un carácter especial";
        }
        return null; 
    }

    // EXTRAER: Hace una peticion HTTP para leer los usuarios reales del disco duro
    static async obtenerUsuarios() {
        try {
            const respuesta = await fetch('/api/leer/usuarios.json');
            return await respuesta.json();
        } catch (error) {
            console.error("Error obteniendo usuarios del disco físico:", error);
            return [];
        }
    }

    // GUARDAR: Agrega el usuario y envia la lista completa al servidor para que la guarde
    static async guardarUsuario(nombre, correo, password) {
        const usuarios = await Usuario.obtenerUsuarios();
        
        const existe = usuarios.some(u => u.email.toLowerCase() === correo.toLowerCase());
        if (existe) return false;

        const nuevoId = usuarios.length > 0 ? usuarios[usuarios.length - 1].id + 1 : 1;
        const nuevoUsuario = new Usuario(nuevoId, nombre.trim(), correo.trim().toLowerCase(), password, "estudiante");
        
        usuarios.push(nuevoUsuario);

        // envia el arreglo actualizado al endpoint de escritura de Node.js
        const respuesta = await fetch('/api/escribir/usuarios.json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuarios)
        });

        return respuesta.ok;
    }

    // VERIFICAR: Compara las credenciales con los datos reales extraidos del archivo fisico
    static async verificarCredenciales(email, password) {
        const usuarios = await Usuario.obtenerUsuarios();
        const usuarioEncontrado = usuarios.find(
            u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        return usuarioEncontrado || null;
    }
}