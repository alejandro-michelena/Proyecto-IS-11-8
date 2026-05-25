class GestorUsuarios {
    constructor() {
        this.persistencia = new PersistenciaJSON();
        this.ARCHIVO_CLIENTES = 'clientes.json';
        this.ARCHIVO_SESION = 'sesion.json';
    }

    cargarUsuarios() {
        return this.persistencia.leerArchivo(this.ARCHIVO_CLIENTES) || [];
    }

    guardarUsuarios(usuarios) {
        this.persistencia.escribirArchivo(this.ARCHIVO_CLIENTES, usuarios);
    }

    buscarPorUsuario(nombreUsuario) {
        const usuarios = this.cargarUsuarios();
        return usuarios.find(
            usuario => usuario.usuario.toLowerCase() === nombreUsuario.toLowerCase()
        );
    }

    buscarPorCorreo(correo) {
        const usuarios = this.cargarUsuarios();
        return usuarios.find(
            usuario => usuario.correo.toLowerCase() === correo.toLowerCase()
        );
    }

    registrar({ nombre, correo, usuario, contrasena }) {
        const usuarios = this.cargarUsuarios();

        if (this.buscarPorUsuario(usuario)) {
            return { exito: false, mensaje: 'El nombre de usuario ya está en uso.' };
        }

        if (this.buscarPorCorreo(correo)) {
            return { exito: false, mensaje: 'El correo electrónico ya está registrado.' };
        }

        const nuevoUsuario = {
            id: this.generarId(),
            nombre: nombre.trim(),
            correo: correo.trim().toLowerCase(),
            usuario: usuario.trim(),
            contrasena: contrasena,
            fechaRegistro: new Date().toISOString()
        };

        usuarios.push(nuevoUsuario);
        this.guardarUsuarios(usuarios);

        return { exito: true, mensaje: 'Usuario registrado exitosamente.' };
    }

    iniciarSesion(usuarioOcorreo, contrasena) {
        const usuarios = this.cargarUsuarios();
        const usuario = usuarios.find(
            u => (u.usuario.toLowerCase() === usuarioOcorreo.toLowerCase() || 
                  u.correo.toLowerCase() === usuarioOcorreo.toLowerCase()) &&
                 u.contrasena === contrasena
        );

        if (!usuario) {
            return { exito: false, mensaje: 'Usuario o contraseña incorrectos.' };
        }

        const sesion = {
            id: usuario.id,
            nombre: usuario.nombre,
            usuario: usuario.usuario,
            correo: usuario.correo,
            inicioSesion: new Date().toISOString()
        };

        this.persistencia.escribirArchivo(this.ARCHIVO_SESION, sesion);
        return { exito: true, mensaje: 'Inicio de sesión exitoso.', sesion };
    }

    cerrarSesion() {
        this.persistencia.escribirArchivo(this.ARCHIVO_SESION, null);
        return { exito: true, mensaje: 'Sesión cerrada exitosamente.' };
    }

    obtenerSesion() {
        return this.persistencia.leerArchivo(this.ARCHIVO_SESION);
    }

    generarId() {
        return 'cli_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    }
}