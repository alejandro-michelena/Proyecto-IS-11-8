document.addEventListener('DOMContentLoaded', () => {
    const botonProcederPago = document.getElementById('boton-proceder-pago');

    const btnPagarTest = document.getElementById('btn-pagar-test');

    const ejecutarCompra = (e) => {
        e.preventDefault();

        const persistencia = new PersistenciaJSON();
        const carrito = persistencia.leerArchivo('carrito.json') || [];

        if (carrito.length === 0) {
            alert('Tu carrito está vacío. Agrega productos desde el catálogo antes de comprar.');
            return;
        }

        // Confirmación rápida de compra
        const confirmar = confirm('¿Deseas confirmar tu compra y generar el pedido de inmediato?');
        if (!confirmar) return;

        // Solicitar dirección y teléfono de forma interactiva pero rápida
        const direccion = prompt('Por favor, ingresa tu dirección de envío:', 'Av. Las Palmas 456');
        if (direccion === null) return; // Cancelado por el usuario

        const telefono = prompt('Por favor, ingresa tu número de teléfono:', '0412-1234567');
        if (telefono === null) return; // Cancelado por el usuario

        // Instanciar controlador de pedidos (backend simulado)
        const pedidosCtrl = new PedidosController();
        const resultado = pedidosCtrl.procesarCompra('tarjeta', {
            direccion: direccion || 'Dirección no especificada',
            telefono: telefono || 'Teléfono no especificado'
        });

        if (resultado.exito) {
            alert('¡Compra exitosa! ' + resultado.mensaje);
            // Redireccionar al módulo de gestión de pedidos
            window.location.href = 'gestionPedidos.html';
        } else {
            alert('Error al realizar la compra: ' + resultado.mensaje);
        }
    };

    if (botonProcederPago) {
        botonProcederPago.addEventListener('click', ejecutarCompra);
    }
    if (btnPagarTest) {
        btnPagarTest.addEventListener('click', ejecutarCompra);
        // Efecto hover simple para el botón de prueba
        btnPagarTest.addEventListener('mouseover', () => {
            btnPagarTest.style.background = '#d97706';
            btnPagarTest.style.boxShadow = '0 6px 16px rgba(217, 119, 6, 0.3)';
        });
        btnPagarTest.addEventListener('mouseout', () => {
            btnPagarTest.style.background = '#eab308';
            btnPagarTest.style.boxShadow = '0 4px 12px rgba(234, 179, 8, 0.2)';
        });
    }
});
