/**
 * PedidosController
 * ─────────────────
 * Depende de: PedidosModel
 */
class PedidosController {
    constructor() {
        this.model = new PedidosModel();
    }

    async procesarCompra(metodoPago = 'tarjeta', detallesEnvio = {}) {
        try {
            if (detallesEnvio.direccion?.trim() === '') {
                return { exito: false, mensaje: 'La dirección de envío es obligatoria.' };
            }
            if (detallesEnvio.telefono?.trim() === '') {
                return { exito: false, mensaje: 'El teléfono de contacto es obligatorio.' };
            }
            return await this.model.crearPedido(metodoPago, detallesEnvio);
        } catch (error) {
            console.error('PedidosController.procesarCompra:', error);
            return { exito: false, mensaje: 'Error inesperado al procesar la compra.' };
        }
    }

    async obtenerTodosLosPedidos() {
        try {
            return await this.model.obtenerTodos();
        } catch (error) {
            console.error('PedidosController.obtenerTodosLosPedidos:', error);
            return [];
        }
    }

    async obtenerPedidosDeCliente(clienteId) {
        try {
            if (!clienteId) return [];
            return await this.model.obtenerPorCliente(clienteId);
        } catch (error) {
            console.error('PedidosController.obtenerPedidosDeCliente:', error);
            return [];
        }
    }

    async cambiarEstadoPedido(pedidoId, nuevoEstado) {
        try {
            if (!pedidoId || !nuevoEstado) {
                return { exito: false, mensaje: 'ID de pedido y nuevo estado son obligatorios.' };
            }
            return await this.model.actualizarEstado(pedidoId, nuevoEstado);
        } catch (error) {
            console.error('PedidosController.cambiarEstadoPedido:', error);
            return { exito: false, mensaje: 'Error interno al cambiar el estado del pedido.' };
        }
    }
}
