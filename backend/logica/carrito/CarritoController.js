/**
 * CarritoController.js
 * Centraliza la UI, eventos y comunicación con el modelo del carrito.
 */
class CarritoController {
    constructor() {
        this.modelo = new CarritoModel(); // Asumimos que CarritoModel está cargado globalmente
        this.modal = document.getElementById('modal-carrito');
        this.tbody = document.getElementById('contenedor-items-carrito');
        
        // Elementos de UI
        this.botonVer = document.getElementById('menu-carrito'); //este es el boton del carrito en la barra lateral izquierda (lo renombre para cohesividad)
        this.botonCerrar = document.getElementById('boton-cerrar-carrito');
        this.botonVaciar = document.getElementById('boton-vaciar-carrito');
        this.botonPagar = document.getElementById('boton-proceder-pago');
        
        this.init();
    }

    init() {
        // Eventos de apertura/cierre
        this.botonVer?.addEventListener('click', (e) => { e.preventDefault(); this.abrir(); });
        this.botonCerrar?.addEventListener('click', () => this.cerrar());
        window.addEventListener('click', (e) => { if (e.target === this.modal) this.cerrar(); });

        // Evento vaciar
        this.botonVaciar?.addEventListener('click', async () => {
            if (confirm('¿Vaciar el carrito?')) {
                await this.modelo.vaciar();
                await this.renderizar();
            }
        });
    }

    async abrir() {
        await this.renderizar();
        this.modal?.classList.add('modal-carrito-activo');
    }

    cerrar() {
        this.modal?.classList.remove('modal-carrito-activo');
    }

    async renderizar() {
        const { carrito, subtotalNeto, iva, total } = await this.modelo.calcularTotales();
        this.tbody.innerHTML = '';

        if (carrito.length === 0) {
            this.tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:#94a3b8;">El carrito está vacío.</td></tr>`;
        } else {
            carrito.forEach(item => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${item.nombre}</td>
                    <td>$${item.precio.toFixed(2)}</td>
                    <td>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <button class="btn-cantidad" data-id="${item.id}" data-delta="-1" style="border:none;background:#f1f5f9;border-radius:6px;width:26px;height:26px;cursor:pointer;">−</button>
                            <span>${item.cantidad}</span>
                            <button class="btn-cantidad" data-id="${item.id}" data-delta="1" style="border:none;background:#f1f5f9;border-radius:6px;width:26px;height:26px;cursor:pointer;">+</button>
                        </div>
                    </td>
                    <td>$${(item.precio * item.cantidad).toFixed(2)}</td>
                    <td>
                        <button class="btn-eliminar-item" data-id="${item.id}" style="border:none;background:#fee2e2;color:#ef4444;border-radius:8px;padding:5px 10px;cursor:pointer;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                `;
                this.tbody.appendChild(fila);
            });
        }

        // Actualizar totales en la vista
        document.getElementById('total-neto').textContent  = `$${subtotalNeto.toFixed(2)}`;
        document.getElementById('total-iva').textContent   = `$${iva.toFixed(2)}`;
        document.getElementById('gran-total').textContent  = `$${total.toFixed(2)}`;

        this.configurarListenersAcciones();
    }

    configurarListenersAcciones() {
        // Botones de cantidad (+/-)
        this.tbody.querySelectorAll('.btn-cantidad').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const delta = parseInt(btn.getAttribute('data-delta'));
                const { carrito } = await this.modelo.calcularTotales();
                const item = carrito.find(i => i.id === id);
                
                if (item) {
                    await this.modelo.modificarCantidad(id, item.cantidad + delta);
                    await this.renderizar();
                }
            });
        });

        // Botones de eliminar
        this.tbody.querySelectorAll('.btn-eliminar-item').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                await this.modelo.eliminarItem(id);
                await this.renderizar();
            });
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => new CarritoController());
