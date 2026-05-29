/**
 * checkout.js
 * ───────────
 * Lógica de la pantalla de pago.
 * Depende de: PersistenciaCliente, PedidosModel, PedidosController
 *
 * Expone window.ejecutarCheckout() para que catalogo.js pueda llamarla.
 */

window.ejecutarCheckout = async function () {
    const persistencia = new PersistenciaCliente();
    const carrito = await persistencia.leerArchivo('carrito.json') || [];

    if (carrito.length === 0) {
        alert('Tu carrito está vacío. Agrega productos antes de comprar.');
        return;
    }

    const confirmar = confirm('¿Deseas confirmar tu compra y generar el pedido?');
    if (!confirmar) return;

    const direccion = prompt('Ingresa tu dirección de envío:', 'Av. Las Palmas 456, Caracas');
    if (direccion === null) return;

    const telefono = prompt('Ingresa tu número de teléfono:', '0412-0000000');
    if (telefono === null) return;

    const ctrl = new PedidosController();
    const resultado = await ctrl.procesarCompra('tarjeta', {
        direccion: direccion.trim() || 'No especificada',
        telefono:  telefono.trim()  || 'No especificado'
    });

    if (resultado.exito) {
        alert('¡Compra exitosa! ' + resultado.mensaje);
        // window.location.href = 'gestionPedidos.html'; // Redirección desactivada por requerimiento
        window.location.reload(); // Recargar la página actual para limpiar el carrito visualmente
    } else {
        alert('Error al realizar la compra: ' + resultado.mensaje);
    }
};

// Compatibilidad: si el botón está en catalogo.html fuera del módulo de catálogo
document.addEventListener('DOMContentLoaded', () => {
    const btnPagar     = document.getElementById('boton-proceder-pago');

    btnPagar?.addEventListener('click', (e) => {
        e.preventDefault();
        window.ejecutarCheckout();
    });
});
