class SidebarController {
    constructor() {
        this.inicializarSidebar();
    }

    async inicializarSidebar() {
        const persistencia = new PersistenciaCliente();
        const sesion = await persistencia.leerArchivo('sesion.json');

        // si no hay sesion, nadie debería ver pantallas internas
        if (!sesion || !sesion.id) {
            window.location.href = 'index.html';
            return;
        }

        // 2. Modificar el nombre del perfil en el sidebar
        const adminNameLabel = document.querySelector('.admin-name');
        if (adminNameLabel) {
            adminNameLabel.textContent = sesion.nombre;
        }

        // 3. Aplicar el filtrado estricto por Roles **
        this.filtrarOpcionesMenu(sesion.rol);
    }

    filtrarOpcionesMenu(rol) {
        const itemAgregar = document.getElementById('menu-agregar');
        const itemPedidos = document.getElementById('menu-pedidos');
        const itemPerfil  = document.getElementById('menu-perfil');
        const itemCarrito = document.getElementById('menu-carrito');
        const botonPagarTest = document.getElementById('btn-pagar-test');

        if (rol === 'admin') {
            // Ocultar las funciones de cliente
            if (itemCarrito) itemCarrito.style.display = 'none';
            if (itemPerfil)  itemPerfil.style.display = 'none';
            if (botonPagarTest) botonPagarTest.style.display = 'none';
        } 
        else if (rol === 'cliente') {
            // Ocultar las funciones de admin
            if (itemAgregar) itemAgregar.style.display = 'none';
            if (itemPedidos) itemPedidos.style.display = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.sidebar')) {
        new SidebarController();
    }
});