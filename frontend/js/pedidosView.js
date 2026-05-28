/**
 * InterfazPedidos
 * ───────────────
 * Vista de gestión de pedidos para el admin.
 * Depende de: PersistenciaCliente, PedidosModel, PedidosController
 */
class InterfazPedidos {
    constructor() {
        this.pedidosCtrl = new PedidosController();

        this.statTotal      = document.getElementById('stat-total-pedidos');
        this.statPendientes = document.getElementById('stat-pendientes');
        this.statCompletados = document.getElementById('stat-completados');
        this.statIngresos   = document.getElementById('stat-ingresos');

        this.tablaBody      = document.getElementById('lista-pedidos-body');
        this.sinPedidosDiv  = document.getElementById('sin-pedidos');

        this.campoBusqueda  = document.getElementById('buscar-pedido');
        this.botonesFiltro  = document.querySelectorAll('.boton-filtro-ped');

        this.modalDetalle        = document.getElementById('modal-detalle-pedido');
        this.modalDetalleCuerpo  = document.getElementById('modal-detalle-cuerpo');
        this.btnCerrarModal      = document.getElementById('cerrar-modal-detalle');

        this.filtroActivo   = 'todos';
        this.busquedaActiva = '';
    }

    async inicializar() {
        await this.renderizarVista();
        this.configurarBusqueda();
        this.configurarFiltros();
        this.configurarCierreModal();
    }

    async renderizarVista() {
        const pedidos = await this.pedidosCtrl.obtenerTodosLosPedidos();
        this.actualizarEstadisticas(pedidos);
        this.renderizarTabla(pedidos);
    }

    actualizarEstadisticas(pedidos) {
        const total      = pedidos.length;
        const pendientes = pedidos.filter(p => p.estado === 'pendiente').length;
        const completados = pedidos.filter(p => p.estado === 'completado').length;
        const ingresos   = pedidos
            .filter(p => p.estado === 'completado')
            .reduce((acc, p) => acc + p.total, 0);

        if (this.statTotal)       this.statTotal.textContent      = total;
        if (this.statPendientes)  this.statPendientes.textContent  = pendientes;
        if (this.statCompletados) this.statCompletados.textContent = completados;
        if (this.statIngresos)    this.statIngresos.textContent    = `$${ingresos.toFixed(2)}`;
    }

    renderizarTabla(pedidos) {
        if (!this.tablaBody) return;
        this.tablaBody.innerHTML = '';

        let filtrados = [...pedidos];

        if (this.filtroActivo !== 'todos') {
            filtrados = filtrados.filter(p => p.estado === this.filtroActivo);
        }
        if (this.busquedaActiva !== '') {
            const q = this.busquedaActiva.toLowerCase();
            filtrados = filtrados.filter(p =>
                p.id.toLowerCase().includes(q) ||
                (p.clienteNombre || '').toLowerCase().includes(q)
            );
        }

        if (filtrados.length === 0) {
            this.sinPedidosDiv.className = 'sin-datos-activo';
            return;
        }
        this.sinPedidosDiv.className = 'sin-datos-oculto';

        filtrados.forEach(pedido => {
            const fila = document.createElement('tr');
            const cantidadItems = pedido.items.reduce((acc, i) => acc + i.cantidad, 0);
            const fecha = new Date(pedido.fecha).toLocaleDateString('es-ES', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            let accionesHTML = `
                <button class="btn-accion-ped ver" data-id="${pedido.id}">
                    <i class="fa-solid fa-eye"></i> Detalle
                </button>
            `;
            if (pedido.estado === 'pendiente') {
                accionesHTML += `
                    <button class="btn-accion-ped completar" data-id="${pedido.id}">
                        <i class="fa-solid fa-check"></i> Completar
                    </button>
                    <button class="btn-accion-ped cancelar" data-id="${pedido.id}">
                        <i class="fa-solid fa-ban"></i> Cancelar
                    </button>
                `;
            }

            const iconoEstado = pedido.estado === 'completado'
                ? 'fa-circle-check' : pedido.estado === 'cancelado'
                ? 'fa-circle-xmark' : 'fa-spinner';

            fila.innerHTML = `
                <td style="font-weight:700;color:#1e293b;">${pedido.id}</td>
                <td>${fecha}</td>
                <td>${pedido.clienteNombre}</td>
                <td>${pedido.items.length} prod. (${cantidadItems} uds)</td>
                <td style="font-weight:700;">$${pedido.total.toFixed(2)}</td>
                <td><i class="fa-solid fa-credit-card" style="margin-right:5px;color:#64748b;"></i>${pedido.metodoPago}</td>
                <td>
                    <span class="badge-estado ${pedido.estado}">
                        <i class="fa-solid ${iconoEstado}"></i> ${pedido.estado}
                    </span>
                </td>
                <td>
                    <div class="botones-acciones-celda">${accionesHTML}</div>
                </td>
            `;
            this.tablaBody.appendChild(fila);
        });

        this.configurarBotonesAcciones();
    }

    configurarBusqueda() {
        this.campoBusqueda?.addEventListener('input', async () => {
            this.busquedaActiva = this.campoBusqueda.value.trim();
            await this.renderizarVista();
        });
    }

    configurarFiltros() {
        this.botonesFiltro.forEach(btn => {
            btn.addEventListener('click', async () => {
                this.botonesFiltro.forEach(b => b.classList.remove('activo'));
                btn.classList.add('activo');
                this.filtroActivo = btn.getAttribute('data-filtro');
                await this.renderizarVista();
            });
        });
    }

    configurarBotonesAcciones() {
        document.querySelectorAll('.btn-accion-ped.ver').forEach(btn => {
            btn.addEventListener('click', async () => {
                await this.abrirModalDetalle(btn.getAttribute('data-id'));
            });
        });

        document.querySelectorAll('.btn-accion-ped.completar').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                if (confirm(`¿Marcar el pedido ${id} como COMPLETADO?`)) {
                    const res = await this.pedidosCtrl.cambiarEstadoPedido(id, 'completado');
                    alert(res.mensaje);
                    await this.renderizarVista();
                }
            });
        });

        document.querySelectorAll('.btn-accion-ped.cancelar').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                if (confirm(`¿CANCELAR el pedido ${id}? Esta acción es irreversible.`)) {
                    const res = await this.pedidosCtrl.cambiarEstadoPedido(id, 'cancelado');
                    alert(res.mensaje);
                    await this.renderizarVista();
                }
            });
        });
    }

    async abrirModalDetalle(pedidoId) {
        const pedido = await this.pedidosCtrl.model.obtenerPorId(pedidoId);
        if (!pedido) {
            alert('No se pudo encontrar el pedido.');
            return;
        }

        const fecha = new Date(pedido.fecha).toLocaleString('es-ES');
        const filas = pedido.items.map(item => `
            <tr>
                <td>${item.nombre}</td>
                <td>$${item.precioUnitario.toFixed(2)}</td>
                <td>${item.cantidad}</td>
                <td style="font-weight:600;">$${item.subtotal.toFixed(2)}</td>
            </tr>
        `).join('');

        this.modalDetalleCuerpo.innerHTML = `
            <div class="bloque-info-detalle">
                <div class="grupo-info">
                    <span class="titulo">ID Pedido</span>
                    <span class="valor" style="font-weight:700;color:#2b5074;">${pedido.id}</span>
                </div>
                <div class="grupo-info">
                    <span class="titulo">Fecha</span>
                    <span class="valor">${fecha}</span>
                </div>
                <div class="grupo-info">
                    <span class="titulo">Cliente</span>
                    <span class="valor">${pedido.clienteNombre} (ID: ${pedido.clienteId})</span>
                </div>
                <div class="grupo-info">
                    <span class="titulo">Método de Pago</span>
                    <span class="valor" style="text-transform:uppercase;">${pedido.metodoPago}</span>
                </div>
                <div class="grupo-info" style="grid-column:1/-1;">
                    <span class="titulo">Dirección de Envío</span>
                    <span class="valor">${pedido.detallesEnvio?.direccion || 'No especificada'}</span>
                </div>
                <div class="grupo-info">
                    <span class="titulo">Teléfono</span>
                    <span class="valor">${pedido.detallesEnvio?.telefono || 'No especificado'}</span>
                </div>
                <div class="grupo-info">
                    <span class="titulo">Estado</span>
                    <span class="valor"><span class="badge-estado ${pedido.estado}">${pedido.estado}</span></span>
                </div>
            </div>

            <h3 style="margin-top:25px;margin-bottom:10px;color:#1e293b;font-size:15px;font-weight:700;">
                <i class="fa-solid fa-boxes-stacked"></i> Artículos Comprados
            </h3>

            <table class="detalle-productos-tabla">
                <thead>
                    <tr>
                        <th>Producto</th><th>Precio Unit.</th><th>Cantidad</th><th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>${filas}</tbody>
            </table>

            <div class="totales-detalle-pedido">
                <div class="linea-total"><span>Subtotal Neto:</span><span>$${pedido.subtotalNeto.toFixed(2)}</span></div>
                <div class="linea-total"><span>IVA (16%):</span><span>$${pedido.iva.toFixed(2)}</span></div>
                <div class="linea-total principal"><span>Total Pagado:</span><span>$${pedido.total.toFixed(2)}</span></div>
            </div>
        `;

        this.modalDetalle.classList.add('modal-detalle-activo');
    }

    configurarCierreModal() {
        this.btnCerrarModal?.addEventListener('click', () => {
            this.modalDetalle.classList.remove('modal-detalle-activo');
        });
        window.addEventListener('click', (e) => {
            if (e.target === this.modalDetalle) {
                this.modalDetalle.classList.remove('modal-detalle-activo');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const interfaz = new InterfazPedidos();
    await interfaz.inicializar();
});
