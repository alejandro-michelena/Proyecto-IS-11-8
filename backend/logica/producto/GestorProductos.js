/**
 * GestorProductos
 * ───────────────
 * Lógica de negocio para gestionar el catálogo de productos.
 * Todas las operaciones son async porque usan PersistenciaCliente (fetch).
 *
 * Depende de: PersistenciaCliente
 */
class GestorProductos {
    constructor() {
        this.persistencia        = new PersistenciaCliente();
        this.ARCHIVO_PRODUCTOS   = 'productos.json';
        this.ARCHIVO_BORRADORES  = 'borradores.json';
        this.ARCHIVO_CONTADOR    = 'contador_productos.json';
    }

    async cargarProductos() {
        return await this.persistencia.leerArchivo(this.ARCHIVO_PRODUCTOS) || [];
    }

    async guardarProductos(productos) {
        return await this.persistencia.escribirArchivo(this.ARCHIVO_PRODUCTOS, productos);
    }

    async cargarBorradores() {
        return await this.persistencia.leerArchivo(this.ARCHIVO_BORRADORES) || [];
    }

    async guardarBorradores(borradores) {
        return await this.persistencia.escribirArchivo(this.ARCHIVO_BORRADORES, borradores);
    }

    async generarId() {
        const contador = await this.persistencia.leerArchivo(this.ARCHIVO_CONTADOR)
                         || { contador: 0 };
        contador.contador += 1;
        await this.persistencia.escribirArchivo(this.ARCHIVO_CONTADOR, contador);
        return 'prod_' + contador.contador.toString().padStart(3, '0');
    }

    async publicarProducto(datosProducto) {
        if (!datosProducto.nombre || !datosProducto.categoria || !datosProducto.precio || datosProducto.stock === undefined) {
            return { exito: false, mensaje: 'Faltan campos obligatorios: nombre, categoría, precio y stock son requeridos.' };
        }
        if (datosProducto.precio <= 0) {
            return { exito: false, mensaje: 'El precio debe ser mayor a cero.' };
        }
        if (datosProducto.stock < 0) {
            return { exito: false, mensaje: 'El stock no puede ser negativo.' };
        }

        const productos = await this.cargarProductos();
        const nuevoProducto = {
            id: await this.generarId(),
            nombre:       datosProducto.nombre,
            categoria:    datosProducto.categoria,
            marca:        datosProducto.marca        || '',
            precio:       datosProducto.precio,
            stock:        datosProducto.stock,
            descripcion:  datosProducto.descripcion  || '',
            imagen:       datosProducto.imagen        || null,
            calificacion: 0,
            fechaCreacion: new Date().toISOString(),
            estado: 'publicado'
        };

        productos.push(nuevoProducto);
        await this.guardarProductos(productos);
        return { exito: true, mensaje: '¡Producto publicado exitosamente!', producto: nuevoProducto };
    }

    async guardarComoBorrador(datosProducto) {
        if (!datosProducto.nombre) {
            return { exito: false, mensaje: 'El nombre del producto es obligatorio incluso para borradores.' };
        }

        const borradores = await this.cargarBorradores();
        const borrador = {
            id: await this.generarId(),
            nombre:       datosProducto.nombre,
            categoria:    datosProducto.categoria    || '',
            marca:        datosProducto.marca        || '',
            precio:       datosProducto.precio       || 0,
            stock:        datosProducto.stock        || 0,
            descripcion:  datosProducto.descripcion  || '',
            imagen:       datosProducto.imagen        || null,
            calificacion: 0,
            fechaCreacion: new Date().toISOString(),
            estado: 'borrador'
        };

        borradores.push(borrador);
        await this.guardarBorradores(borradores);
        return { exito: true, mensaje: 'Producto guardado como borrador.', producto: borrador };
    }

    async obtenerProductosPublicados() {
        const productos = await this.cargarProductos();
        return productos.filter(p => p.estado === 'publicado');
    }

    async eliminarProducto(idProducto) {
        let productos = await this.cargarProductos();
        const idx = productos.findIndex(p => p.id === idProducto);
        if (idx > -1) {
            productos.splice(idx, 1);
            await this.guardarProductos(productos);
            return { exito: true, mensaje: 'Producto eliminado exitosamente.' };
        }

        let borradores = await this.cargarBorradores();
        const idxB = borradores.findIndex(b => b.id === idProducto);
        if (idxB > -1) {
            borradores.splice(idxB, 1);
            await this.guardarBorradores(borradores);
            return { exito: true, mensaje: 'Borrador eliminado exitosamente.' };
        }

        return { exito: false, mensaje: 'Producto no encontrado.' };
    }
}
