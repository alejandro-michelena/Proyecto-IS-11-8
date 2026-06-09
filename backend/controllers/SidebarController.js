/*
  src/controllers/SidebarController.js — Inicializa el sidebar en todas las vistas internas.
  Lee la sesión activa, muestra el nombre del usuario y filtra las opciones del menú según el rol.
  Cargado en todas las vistas que tienen sidebar (catalogo, agregar-producto, gestionPedidos, gestionPerfil).
*/

class SidebarController {
    #usuarioRepo = new UsuarioRepository();
    
    async init() {
        const sesion = await this.#usuarioRepo.sesion();
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
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.sidebar')) new SidebarController().init();
});
