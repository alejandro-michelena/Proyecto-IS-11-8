/**
 * PedidosModel
 * ────────────
 * Lógica de negocio de pedidos.
 * Depende de: PersistenciaCliente
 */
class PedidosModel {
    constructor() {
        this.persistencia      = new PersistenciaCliente();
        this.ARCHIVO_PEDIDOS   = 'pedidos.json';
        this.ARCHIVO_PRODUCTOS = 'productos.json';
        this.ARCHIVO_CARRITO   = 'carrito.json';
        this.ARCHIVO_SESION    = 'sesion.json';
    }

    async obtenerTodos() {
        return await this.persistencia.leerArchivo(this.ARCHIVO_PEDIDOS) || [];
    }

    async obtenerPorCliente(clienteId) {
        const pedidos = await this.obtenerTodos();
        return pedidos.filter(p => p.clienteId === clienteId);
    }

    async obtenerPorId(pedidoId) {
        const pedidos = await this.obtenerTodos();
        return pedidos.find(p => p.id === pedidoId) || null;
    }

    async guardarPedidos(pedidos) {
        return await this.persistencia.escribirArchivo(this.ARCHIVO_PEDIDOS, pedidos);
    }

    async crearPedido(metodoPago = 'tarjeta', detallesEnvio = {}) {
        // 1. Sesión activa
        const sesion = await this.persistencia.leerArchivo(this.ARCHIVO_SESION);
        if (!sesion || !sesion.id) {
            return { exito: false, mensaje: 'No hay sesión activa. Por favor inicia sesión.' };
        }

        // 2. Carrito
        const carrito = await this.persistencia.leerArchivo(this.ARCHIVO_CARRITO) || [];
        if (carrito.length === 0) {
            return { exito: false, mensaje: 'El carrito de compras está vacío.' };
        }

        // 3. Productos para verificar stock
        const productos = await this.persistencia.leerArchivo(this.ARCHIVO_PRODUCTOS) || [];

        // 4. Validar stock de todos los items antes de procesar
        for (const item of carrito) {
            const prod = productos.find(p => p.id === item.id);
            if (!prod) {
                return { exito: false, mensaje: `El producto "${item.nombre}" ya no existe en el catálogo.` };
            }
            if (prod.stock < item.cantidad) {
                return { exito: false, mensaje: `Stock insuficiente para "${prod.nombre}". Disponible: ${prod.stock}, Solicitado: ${item.cantidad}.` };
            }
        }

        // 5. Descontar stock
        carrito.forEach(item => {
            const prod = productos.find(p => p.id === item.id);
            if (prod) prod.stock -= item.cantidad;
        });
        await this.persistencia.escribirArchivo(this.ARCHIVO_PRODUCTOS, productos);

        // 6. Calcular totales
        let subtotalNeto = 0;
        const itemsPedido = carrito.map(item => {
            const sub = item.precio * item.cantidad;
            subtotalNeto += sub;
            return {
                idProducto:    item.id,
                nombre:        item.nombre,
                precioUnitario: item.precio,
                cantidad:      item.cantidad,
                subtotal:      sub
            };
        });

        const iva   = Math.round(subtotalNeto * 0.16 * 100) / 100;
        const total = Math.round((subtotalNeto + iva) * 100) / 100;

        // 7. Crear objeto pedido
        const nuevoPedido = {
            id:           `PED-${Date.now()}`,
            clienteId:    sesion.id,
            clienteNombre: sesion.nombre,
            fecha:        new Date().toISOString(),
            items:        itemsPedido,
            subtotalNeto,
            iva,
            total,
            estado:       'pendiente',
            metodoPago,
            detallesEnvio: {
                direccion: detallesEnvio.direccion || 'No especificada',
                telefono:  detallesEnvio.telefono  || 'No especificado'
            }
        };

        // 8. Guardar pedido
        const pedidos = await this.obtenerTodos();
        pedidos.push(nuevoPedido);
        await this.guardarPedidos(pedidos);

        // 9. Limpiar carrito
        await this.persistencia.escribirArchivo(this.ARCHIVO_CARRITO, []);

        return { exito: true, mensaje: '¡Pedido generado exitosamente!', pedido: nuevoPedido };
    }

    async actualizarEstado(pedidoId, nuevoEstado) {
        const estadosValidos = ['pendiente', 'completado', 'cancelado'];
        if (!estadosValidos.includes(nuevoEstado)) {
            return { exito: false, mensaje: 'Estado no válido.' };
        }

        const pedidos = await this.obtenerTodos();
        const pedido  = pedidos.find(p => p.id === pedidoId);

        if (!pedido) return { exito: false, mensaje: 'Pedido no encontrado.' };

        pedido.estado = nuevoEstado;
        await this.guardarPedidos(pedidos);

        const mensajes = {
            completado: 'Confirmado Exitosamente.',
            cancelado:  'Cancelado Exitosamente.',
            pendiente:  'Estado actualizado a pendiente.'
        };
        return { exito: true, mensaje: mensajes[nuevoEstado], pedido };
    }
}
