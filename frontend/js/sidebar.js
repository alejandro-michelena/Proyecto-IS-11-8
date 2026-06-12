/*
  frontend/js/sidebar.js

  Inicializa el sidebar en todas las vistas internas.
  Lee la sesión activa desde el API, muestra el nombre del usuario
  y filtra las opciones del menú según el rol.
  Maneja el botón de Cerrar Sesión.
*/

document.addEventListener('DOMContentLoaded', async () => {
    const res    = await fetch('/api/usuarios/sesion');
    const sesion = await res.json();

    if (!sesion?.id) return location.href = 'index.html';

    const nameLabel = document.querySelector('.admin-name');
    if (nameLabel) nameLabel.textContent = sesion.nombre;

    const itemAgregar = document.getElementById('menu-agregar');
    const itemPedidos = document.getElementById('menu-pedidos');
    const itemPerfil  = document.getElementById('menu-perfil');
    const itemCarrito = document.getElementById('menu-carrito');

    if (sesion.rol === 'admin') {
        itemCarrito?.style.setProperty('display', 'none');
        itemPerfil?.style.setProperty('display', 'none');
    } else {
        itemAgregar?.style.setProperty('display', 'none');
        itemPedidos?.style.setProperty('display', 'none');
    }

    document.getElementById('btn-cerrar-sesion')?.addEventListener('click', async e => {
        e.preventDefault();
        await fetch('/api/usuarios/sesion', { method: 'DELETE' });
        location.href = 'index.html';
    });
});
