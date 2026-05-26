class GestorProductos {
    constructor() {
        this.persistencia = new PersistenciaJSON();
        this.ARCHIVO_PRODUCTOS = 'productos.json';
        this.ARCHIVO_BORRADORES = 'borradores.json';
        this.ARCHIVO_CONTADOR = 'contador_productos.json';
    }

    cargarProductos() {
        return this.persistencia.leerArchivo(this.ARCHIVO_PRODUCTOS) || [];
    }

    guardarProductos(productos) {
        this.persistencia.escribirArchivo(this.ARCHIVO_PRODUCTOS, productos);
    }

    cargarBorradores() {
        return this.persistencia.leerArchivo(this.ARCHIVO_BORRADORES) || [];
    }

    guardarBorradores(borradores) {
        this.persistencia.escribirArchivo(this.ARCHIVO_BORRADORES, borradores);
    }

    generarId() {
        const contador = this.persistencia.leerArchivo(this.ARCHIVO_CONTADOR) || { contador: 0 };
        contador.contador += 1;
        this.persistencia.escribirArchivo(this.ARCHIVO_CONTADOR, contador);
        return 'prod_' + contador.contador.toString().padStart(3, '0');
    }

    guardarComoBorrador(datosProducto) {
        const borradores = this.cargarBorradores();
        const borrador = {
            id: this.generarId(),
            ...datosProducto,
            calificacion: 0,
            imagen: datosProducto.imagen || null,
            fechaCreacion: new Date().toISOString(),
            estado: 'borrador'
        };

        borradores.push(borrador);
        this.guardarBorradores(borradores);
        return { exito: true, mensaje: 'Producto guardado como borrador exitosamente.', producto: borrador };
    }

    publicarProducto(datosProducto) {
        if (!datosProducto.nombre || !datosProducto.categoria || !datosProducto.precio || !datosProducto.stock) {
            return { exito: false, mensaje: 'Faltan campos obligatorios: nombre, categoría, precio y stock son requeridos.' };
        }

        if (datosProducto.precio <= 0) {
            return { exito: false, mensaje: 'El precio debe ser mayor a cero.' };
        }

        if (datosProducto.stock < 0) {
            return { exito: false, mensaje: 'El stock no puede ser negativo.' };
        }

        const productos = this.cargarProductos();
        const nuevoProducto = {
            id: this.generarId(),
            ...datosProducto,
            calificacion: 0,
            imagen: datosProducto.imagen || null,
            fechaCreacion: new Date().toISOString(),
            estado: 'publicado'
        };

        productos.push(nuevoProducto);
        this.guardarProductos(productos);
        return { exito: true, mensaje: 'Producto publicado exitosamente.', producto: nuevoProducto };
    }

    obtenerProductosPublicados() {
        const productos = this.cargarProductos();
        return productos.filter(p => p.estado === 'publicado');
    }

    obtenerTodosLosProductos() {
        const productos = this.cargarProductos();
        const borradores = this.cargarBorradores();
        return [...productos, ...borradores.filter(b => b.estado === 'borrador')];
    }

    eliminarProducto(idProducto) {
        let productos = this.cargarProductos();
        const indiceProducto = productos.findIndex(p => p.id === idProducto);
        if (indiceProducto > -1) {
            productos.splice(indiceProducto, 1);
            this.guardarProductos(productos);
            return { exito: true, mensaje: 'Producto eliminado exitosamente.' };
        }

        let borradores = this.cargarBorradores();
        const indiceBorrador = borradores.findIndex(b => b.id === idProducto);
        if (indiceBorrador > -1) {
            borradores.splice(indiceBorrador, 1);
            this.guardarBorradores(borradores);
            return { exito: true, mensaje: 'Borrador eliminado exitosamente.' };
        }

        return { exito: false, mensaje: 'Producto no encontrado.' };
    }
}