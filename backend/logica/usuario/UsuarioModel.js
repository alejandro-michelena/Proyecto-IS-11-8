/**
 * UsuarioModel
 * ────────────
 * Lógica de negocio del usuario.
 * Depende de PersistenciaCliente (cargado antes en el HTML).
 */
class UsuarioModel {

    static validarDatos(nombre, email, password) {
        if (!nombre || !email || !password) {
            return 'Todos los campos son obligatorios.';
        }
        const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,20}( [a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,20})+$/;
        if (!regexNombre.test(nombre.trim())) {
            return 'Debe ingresar nombre y apellido, comenzando con mayúscula y solo letras.';
        }
        const regexUcab = /^[a-zA-Z0-9._%+-]{3,35}@(est\.)?ucab\.edu\.ve$/;
        if (!regexUcab.test(email.trim())) {
            return 'Debes usar un correo institucional válido (@est.ucab.edu.ve).';
        }
        const regexPassword = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[.\-_/*+!?¿¡@#$%^&]).{6,}$/;
        if (!regexPassword.test(password)) {
            return 'La contraseña debe tener al menos 6 caracteres, una letra, un número y un carácter especial.';
        }
        return null;
    }

    static async obtenerUsuarios() {
        const persistencia = new PersistenciaCliente();
        return await persistencia.leerArchivo('usuarios.json') || [];
    }

    static async guardarUsuario(nombre, email, password) {
        const persistencia = new PersistenciaCliente();
        const usuarios = await UsuarioModel.obtenerUsuarios();

        const existe = usuarios.some(u => u.email.toLowerCase() === email.toLowerCase().trim());
        if (existe) return false;

        const nuevoId = usuarios.length > 0
            ? usuarios[usuarios.length - 1].id + 1
            : 1;

        const nuevoUsuario = {
            id: nuevoId,
            nombre: nombre.trim(),
            email: email.trim().toLowerCase(),
            password: password,
            rol: 'cliente',
            fechaRegistro: new Date().toISOString()
        };

        usuarios.push(nuevoUsuario);
        await persistencia.escribirArchivo('usuarios.json', usuarios);
        return true;
    }

    static async verificarCredenciales(email, password) {
        const usuarios = await UsuarioModel.obtenerUsuarios();
        return usuarios.find(
            u => u.email.toLowerCase() === email.toLowerCase().trim()
              && u.password === password
        ) || null;
    }
}
