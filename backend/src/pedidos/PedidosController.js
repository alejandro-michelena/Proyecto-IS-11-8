class PedidosController {
    constructor() {
        this.model = new PedidosModel();
    }

    /**
     * Procesa la compra a partir del carrito actual.
     * @param {string} metodoPago - 'tarjeta', 'transferencia', 'efectivo'
     * @param {object} detallesEnvio - { direccion, telefono }
     * @returns {object} { exito: boolean, mensaje: string, pedido?: object }
     */
    procesarCompra(metodoPago = 'tarjeta', detallesEnvio = {}) {
        try {
            // Validaciones básicas de negocio
            if (detallesEnvio.direccion && detallesEnvio.direccion.trim() === '') {
                return { exito: false, mensaje: 'La dirección de envío es obligatoria.' };
            }
            if (detallesEnvio.telefono && detallesEnvio.telefono.trim() === '') {
                return { exito: false, mensaje: 'El teléfono de contacto es obligatorio.' };
            }

            // Delegar en el servicio/modelo de pedidos
            const resultado = this.model.crearPedido(metodoPago, detallesEnvio);
            return resultado;
        } catch (error) {
            console.error('Error al procesar la compra en el controlador:', error);
            return { exito: false, mensaje: 'Ocurrió un error inesperado al procesar tu compra.' };
        }
    }

    /**
     * Obtiene todos los pedidos registrados en el sistema.
     * @returns {Array} Listado de todos los pedidos.
     */
    obtenerTodosLosPedidos() {
        try {
            return this.model.obtenerTodos();
        } catch (error) {
            console.error('Error al obtener todos los pedidos en el controlador:', error);
            return [];
        }
    }

    /**
     * Obtiene los pedidos asociados a un cliente específico.
     * @param {string} clienteId 
     * @returns {Array} Listado de pedidos filtrados por cliente.
     */
    obtenerPedidosDeCliente(clienteId) {
        try {
            if (!clienteId) return [];
            return this.model.obtenerPorCliente(clienteId);
        } catch (error) {
            console.error('Error al obtener pedidos del cliente:', error);
            return [];
        }
    }

    /**
     * Actualiza el estado de un pedido específico.
     * @param {string} pedidoId 
     * @param {string} nuevoEstado - 'pendiente', 'completado', 'cancelado'
     * @returns {object} { exito: boolean, mensaje: string }
     */
    cambiarEstadoPedido(pedidoId, nuevoEstado) {
        try {
            if (!pedidoId || !nuevoEstado) {
                return { exito: false, mensaje: 'El ID de pedido y el nuevo estado son obligatorios.' };
            }
            return this.model.actualizarEstado(pedidoId, nuevoEstado);
        } catch (error) {
            console.error('Error al actualizar el estado del pedido:', error);
            return { exito: false, mensaje: 'Error interno al cambiar el estado del pedido.' };
        }
    }
}
