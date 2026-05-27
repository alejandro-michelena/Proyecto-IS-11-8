document.addEventListener('DOMContentLoaded', () => {
    const botonVerCarrito = document.getElementById('boton-carrito');
    const modalCarrito = document.getElementById('modal-carrito');
    const botonCerrarCarrito = document.getElementById('boton-cerrar-carrito');

    // Función para abrir el carrito
    botonVerCarrito.addEventListener('click', (e) => {
        e.preventDefault(); // Evita que la página salte
        modalCarrito.classList.add('modal-carrito-activo');
    });

    // Función para cerrar el carrito
    botonCerrarCarrito.addEventListener('click', () => {
        modalCarrito.classList.remove('modal-carrito-activo');
    });

    // Cerrar si hacen clic fuera de la ventana blanca
    window.addEventListener('click', (e) => {
        if (e.target === modalCarrito) {
            modalCarrito.classList.remove('modal-carrito-activo');
        }
    });
});