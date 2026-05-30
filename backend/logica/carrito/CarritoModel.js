/**
 * CarritoModel
 * ────────────
 * Lógica de negocio del carrito de compras.
 * Depende de: PersistenciaCliente
 */
class CarritoModel {
    constructor() {
        this.persistencia      = new PersistenciaCliente();
        this.ARCHIVO_CARRITO   = 'carrito.json';
        this.ARCHIVO_PRODUCTOS = 'productos.json';
        this.ARCHIVO_SESION    = 'sesion.json'; 
    }

    // Método privado para obtener el ID del usuario actual
    async _obtenerIdUsuario() {
        const sesion = await this.persistencia.leerArchivo(this.ARCHIVO_SESION);
        return sesion ? sesion.id : null;
    }

    async obtenerCarrito() {
        const userId = await this._obtenerIdUsuario();
        const dataCompleta = await this.persistencia.leerArchivo(this.ARCHIVO_CARRITO) || {};
        return dataCompleta[userId] || []; 
        // Devuelve solo el carrito de este usuario
    }

    async guardarCarrito(carritoUsuario) {
        const userId = await this._obtenerIdUsuario();
        const dataCompleta = await this.persistencia.leerArchivo(this.ARCHIVO_CARRITO) || {};
        
        dataCompleta[userId] = carritoUsuario;
        
        return await this.persistencia.escribirArchivo(this.ARCHIVO_CARRITO, dataCompleta);
    }

    async agregarItem(idProducto) {
        const productos = await this.persistencia.leerArchivo(this.ARCHIVO_PRODUCTOS) || [];
        const producto  = productos.find(p => p.id === idProducto);

        if (!producto) return { exito: false, mensaje: 'Producto no encontrado en el catálogo.' };
        if (producto.stock <= 0) return { exito: false, mensaje: 'No hay más productos disponibles.' };

        const carrito = await this.obtenerCarrito();
        const item    = carrito.find(i => i.id === idProducto);

        if (item) {
            if (item.cantidad >= producto.stock) {
                return { exito: false, mensaje: `No hay más productos disponibles de ${producto.nombre}.` };
            }
            item.cantidad += 1;
        } else {
            carrito.push({
                id:       producto.id,
                nombre:   producto.nombre,
                precio:   producto.precio,
                cantidad: 1
            });
        }

        await this.guardarCarrito(carrito);
        return { exito: true, mensaje: `${producto.nombre} fue agregado exitosamente.` };
    }

    async eliminarItem(idProducto) {
        const carrito = await this.obtenerCarrito();
        const idx = carrito.findIndex(i => i.id === idProducto);
        if (idx === -1) return { exito: false, mensaje: 'Item no encontrado en el carrito.' };

        carrito.splice(idx, 1);
        await this.guardarCarrito(carrito);
        return { exito: true, mensaje: 'Producto eliminado del carrito.' };
    }

    async modificarCantidad(idProducto, nuevaCantidad) {
        if (nuevaCantidad <= 0) return this.eliminarItem(idProducto);

        const productos = await this.persistencia.leerArchivo(this.ARCHIVO_PRODUCTOS) || [];
        const producto  = productos.find(p => p.id === idProducto);
        const carrito   = await this.obtenerCarrito();
        const item      = carrito.find(i => i.id === idProducto);

        if (!item) return { exito: false, mensaje: 'Item no encontrado.' };
        if (producto && nuevaCantidad > producto.stock) {
            return { exito: false, mensaje: `Stock insuficiente. Disponible: ${producto.stock}.` };
        }

        item.cantidad = nuevaCantidad;
        await this.guardarCarrito(carrito);
        return { exito: true, mensaje: 'Cantidad actualizada.' };
    }

    async vaciar() {
        const userId = await this._obtenerIdUsuario();
        const dataCompleta = await this.persistencia.leerArchivo(this.ARCHIVO_CARRITO) || {};
        dataCompleta[userId] = [];
        return await this.persistencia.escribirArchivo(this.ARCHIVO_CARRITO, dataCompleta);
    }

    async calcularTotales() {
        const carrito = await this.obtenerCarrito();
        const subtotalNeto = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
        const iva   = Math.round(subtotalNeto * 0.16 * 100) / 100;
        const total = Math.round((subtotalNeto + iva) * 100) / 100;
        return { carrito, subtotalNeto, iva, total };
    }
}
