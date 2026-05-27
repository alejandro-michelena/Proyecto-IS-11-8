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
    }

    async obtenerCarrito() {
        return await this.persistencia.leerArchivo(this.ARCHIVO_CARRITO) || [];
    }

    async guardarCarrito(carrito) {
        return await this.persistencia.escribirArchivo(this.ARCHIVO_CARRITO, carrito);
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
        await this.guardarCarrito([]);
        return { exito: true, mensaje: 'Carrito vaciado.' };
    }

    async calcularTotales() {
        const carrito = await this.obtenerCarrito();
        const subtotalNeto = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
        const iva   = Math.round(subtotalNeto * 0.16 * 100) / 100;
        const total = Math.round((subtotalNeto + iva) * 100) / 100;
        return { carrito, subtotalNeto, iva, total };
    }
}
