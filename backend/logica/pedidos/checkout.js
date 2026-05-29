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

    CheckoutView.inyectarModal();

    const modal = document.getElementById('vita-modal-checkout');
    const form = document.getElementById('vita-form-checkout');
    const btnCancelar = document.getElementById('vita-btn-cancelar');

    setTimeout(() => modal.classList.add('active'), 10);

    btnCancelar.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    });

    if (resultado.exito) {
        alert('¡Compra exitosa! ' + resultado.mensaje);
        // window.location.href = 'gestionPedidos.html'; // Redirección desactivada por requerimiento
        window.location.reload(); // Recargar la página actual para limpiar el carrito visualmente
    } else {
        alert('Error al realizar la compra: ' + resultado.mensaje);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const btnPagar     = document.getElementById('boton-proceder-pago');

    btnPagar?.addEventListener('click', (e) => {
        e.preventDefault();
        window.ejecutarCheckout();
    });
});
