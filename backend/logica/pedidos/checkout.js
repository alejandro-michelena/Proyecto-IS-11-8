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
    const sesion = await persistencia.leerArchivo('sesion.json');
    
    // 1. Leer el carrito como objeto y extraer solo el del usuario actual
    const dataCompleta = await persistencia.leerArchivo('carrito.json') || {};
    const carrito = dataCompleta[sesion.id] || [];

    if (carrito.length === 0) {
        alert('Tu carrito está vacío. Agrega productos antes de comprar.');
        return;
    }

    // 2. Inyectar el modal de pago
    CheckoutView.inyectarModal();

    const modal = document.getElementById('vita-modal-checkout');
    const form = document.getElementById('vita-form-checkout');
    const btnCancelar = document.getElementById('vita-btn-cancelar');

    // Animación de apertura
    setTimeout(() => modal.classList.add('active'), 10);

    btnCancelar.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    });

    // 3. Lógica de envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const direccion = document.getElementById('vita-input-direccion').value;
        const telefono = document.getElementById('vita-input-telefono').value;

        const pedidosCtrl = new PedidosController();
        const resultado = await pedidosCtrl.procesarCompra('tarjeta', { direccion, telefono });

        if (resultado.exito) {
            CheckoutView.mostrarNotificacion('¡Pedido exitoso!');
            modal.remove();
            setTimeout(() => window.location.reload(), 2000);
        } else {
            console.log("Resultado del error:", resultado); // 
            CheckoutView.mostrarError(resultado.mensaje);
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const btnPagar = document.getElementById('boton-proceder-pago');
    if (btnPagar) {
        btnPagar.addEventListener('click', () => window.ejecutarCheckout());
    }
});