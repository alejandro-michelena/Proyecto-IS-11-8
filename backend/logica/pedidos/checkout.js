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

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const direccionInput = document.getElementById('vita-input-direccion').value;
        const telefonoInput = document.getElementById('vita-input-telefono').value;

        const btnPagar = form.querySelector('.vita-btn-pagar');
        btnPagar.disabled = true;
        btnPagar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';

        const ctrl = new PedidosController();
        const resultado = await ctrl.procesarCompra('tarjeta', {
            direccion: direccionInput.trim() || 'No especificada',
            telefono: telefonoInput.trim() || 'No especificado'
        });

        if (resultado.exito) {
            // Pasamos una función anidada que se ejecutará SOLO cuando el usuario presione el botón OK
            CheckoutView.mostrarExito(modal, 'Tu orden ha sido procesada con éxito.', () => {
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.remove();
                    window.location.href = 'catalogo.html';
                }, 300);
            });
        } else {
            alert('Error al realizar la compra: ' + resultado.mensaje);
            btnPagar.disabled = false;
            btnPagar.innerHTML = '<i class="fa-solid fa-credit-card"></i> Confirmar Procesamiento de Pedido';
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('boton-proceder-pago')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.ejecutarCheckout();
    });

    document.getElementById('btn-pagar-test')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.ejecutarCheckout();
    });
});