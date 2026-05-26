class PedidosModel {
    constructor() {
        this.persistencia = new PersistenciaJSON();
        this.ARCHIVO_PEDIDOS = 'pedidos.json';
        this.ARCHIVO_PRODUCTOS = 'productos.json';
        this.ARCHIVO_CARRITO = 'carrito.json';
        this.ARCHIVO_SESION = 'sesion.json';
    }

    obtenerTodos() {
        return this.persistencia.leerArchivo(this.ARCHIVO_PEDIDOS) || [];
    }

    obtenerPorCliente(clienteId) {
        const pedidos = this.obtenerTodos();
        return pedidos.filter(p => p.clienteId === clienteId);
    }

    obtenerPorId(pedidoId) {
        const pedidos = this.obtenerTodos();
        return pedidos.find(p => p.id === pedidoId);
    }

    guardarPedidos(pedidos) {
        this.persistencia.escribirArchivo(this.ARCHIVO_PEDIDOS, pedidos);
    }

    crearPedido(metodoPago = 'tarjeta', detallesEnvio = {}) {
        // 1. Obtener la sesión activa
        const sesion = this.persistencia.leerArchivo(this.ARCHIVO_SESION);
        if (!sesion) {
            return { exito: false, mensaje: 'No hay ninguna sesión activa. Debes iniciar sesión.' };
        }

        // 2. Obtener el carrito actual
        const carrito = this.persistencia.leerArchivo(this.ARCHIVO_CARRITO) || [];
        if (carrito.length === 0) {
            return { exito: false, mensaje: 'El carrito de compras está vacío.' };
        }

        // 3. Obtener los productos actuales para verificar stock y decrementar
        const productos = this.persistencia.leerArchivo(this.ARCHIVO_PRODUCTOS) || [];

        // 4. Validar stock de todos los artículos en el carrito antes de procesar
        for (const item of carrito) {
            const producto = productos.find(p => p.id === item.id);
            if (!producto) {
                return { exito: false, mensaje: `El producto con ID ${item.id} ya no existe en el catálogo.` };
            }
            if (producto.stock < item.cantidad) {
                return { exito: false, mensaje: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}, Solicitado: ${item.cantidad}` };
            }
        }

        // 5. Decrementar stock de los productos
        carrito.forEach(item => {
            const producto = productos.find(p => p.id === item.id);
            producto.stock -= item.cantidad;
        });

        // Guardar los productos con el nuevo stock
        this.persistencia.escribirArchivo(this.ARCHIVO_PRODUCTOS, productos);

        // 6. Calcular los totales del pedido
        let subtotalNeto = 0;
        const itemsPedido = carrito.map(item => {
            const subtotalItem = item.precio * item.cantidad;
            subtotalNeto += subtotalItem;
            return {
                idProducto: item.id,
                nombre: item.nombre,
                precioUnitario: item.precio,
                cantidad: item.cantidad,
                subtotal: subtotalItem
            };
        });

        const iva = Math.round((subtotalNeto * 0.16) * 100) / 100;
        const total = Math.round((subtotalNeto + iva) * 100) / 100;

        // 7. Generar el nuevo objeto de Pedido
        const timestamp = Date.now();
        const nuevoPedido = {
            id: `PED-${timestamp}`,
            clienteId: sesion.id,
            clienteNombre: sesion.nombre || sesion.usuario,
            fecha: new Date().toISOString(),
            items: itemsPedido,
            subtotalNeto: subtotalNeto,
            iva: iva,
            total: total,
            estado: 'pendiente', // Estados: 'pendiente', 'completado', 'cancelado'
            metodoPago: metodoPago,
            detallesEnvio: {
                direccion: detallesEnvio.direccion || 'No especificada',
                telefono: detallesEnvio.telefono || 'No especificado'
            }
        };

        // 8. Guardar el pedido en el historial de pedidos.json
        const pedidos = this.obtenerTodos();
        pedidos.push(nuevoPedido);
        this.guardarPedidos(pedidos);

        // 9. Limpiar el carrito de compras
        this.persistencia.escribirArchivo(this.ARCHIVO_CARRITO, []);

        return {
            exito: true,
            mensaje: 'Pedido generado exitosamente.',
            pedido: nuevoPedido
        };
    }

    actualizarEstado(pedidoId, nuevoEstado) {
        const pedidos = this.obtenerTodos();
        const pedido = pedidos.find(p => p.id === pedidoId);
        
        if (!pedido) {
            return { exito: false, mensaje: 'Pedido no encontrado.' };
        }

        const estadosValidos = ['pendiente', 'completado', 'cancelado'];
        if (!estadosValidos.includes(nuevoEstado)) {
            return { exito: false, mensaje: 'Estado de pedido no válido.' };
        }

        pedido.estado = nuevoEstado;
        this.guardarPedidos(pedidos);
        return { exito: true, mensaje: `Estado del pedido actualizado a ${nuevoEstado}.`, pedido };
    }
}
