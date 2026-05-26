class InterfazPedidos {
    constructor() {
        this.pedidosCtrl = new PedidosController();
        
        // Elementos DOM de estadísticas
        this.statTotal = document.getElementById('stat-total-pedidos');
        this.statPendientes = document.getElementById('stat-pendientes');
        this.statCompletados = document.getElementById('stat-completados');
        this.statIngresos = document.getElementById('stat-ingresos');

        // Elementos DOM de tabla y listado
        this.tablaBody = document.getElementById('lista-pedidos-body');
        this.sinPedidosDiv = document.getElementById('sin-pedidos');
        
        // Elementos DOM de búsqueda y filtros
        this.campoBusqueda = document.getElementById('buscar-pedido');
        this.botonesFiltro = document.querySelectorAll('.boton-filtro-ped');
        
        // Elementos DOM del modal de detalle
        this.modalDetalle = document.getElementById('modal-detalle-pedido');
        this.modalDetalleCuerpo = document.getElementById('modal-detalle-cuerpo');
        this.btnCerrarModal = document.getElementById('cerrar-modal-detalle');

        this.filtroActivo = 'todos';
        this.busquedaActiva = '';

        this.inicializar();
    }

    inicializar() {
        this.renderizarVista();
        this.configurarBusqueda();
        this.configurarFiltros();
        this.configurarCierreModal();
    }

    renderizarVista() {
        const todosLosPedidos = this.pedidosCtrl.obtenerTodosLosPedidos();
        
        this.actualizarEstadisticas(todosLosPedidos);
        this.renderizarTabla(todosLosPedidos);
    }

    actualizarEstadisticas(pedidos) {
        const total = pedidos.length;
        const pendientes = pedidos.filter(p => p.estado === 'pendiente').length;
        const completados = pedidos.filter(p => p.estado === 'completado').length;
        
        // Sumar ingresos solo de pedidos completados
        const ingresos = pedidos
            .filter(p => p.estado === 'completado')
            .reduce((acc, p) => acc + p.total, 0);

        if (this.statTotal) this.statTotal.textContent = total;
        if (this.statPendientes) this.statPendientes.textContent = pendientes;
        if (this.statCompletados) this.statCompletados.textContent = completados;
        if (this.statIngresos) this.statIngresos.textContent = `$${ingresos.toFixed(2)}`;
    }

    renderizarTabla(pedidos) {
        if (!this.tablaBody) return;
        this.tablaBody.innerHTML = '';

        // Filtrar pedidos según el estado y búsqueda activos
        let pedidosFiltrados = pedidos;

        if (this.filtroActivo !== 'todos') {
            pedidosFiltrados = pedidosFiltrados.filter(p => p.estado === this.filtroActivo);
        }

        if (this.busquedaActiva !== '') {
            const query = this.busquedaActiva.toLowerCase();
            pedidosFiltrados = pedidosFiltrados.filter(p => 
                p.id.toLowerCase().includes(query) || 
                p.clienteNombre.toLowerCase().includes(query)
            );
        }

        // Mostrar / Ocultar indicador de tabla vacía
        if (pedidosFiltrados.length === 0) {
            this.sinPedidosDiv.className = 'sin-datos-activo';
            return;
        } else {
            this.sinPedidosDiv.className = 'sin-datos-oculto';
        }

        // Dibujar las filas de la tabla
        pedidosFiltrados.forEach(pedido => {
            const fila = document.createElement('tr');

            // Calcular cantidad total de productos
            const cantidadItems = pedido.items.reduce((acc, item) => acc + item.cantidad, 0);
            
            // Formatear la fecha
            const fechaFormateada = new Date(pedido.fecha).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Botones de acción según el estado
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

            fila.innerHTML = `
                <td style="font-weight: 700; color: #1e293b;">${pedido.id}</td>
                <td>${fechaFormateada}</td>
                <td>${pedido.clienteNombre}</td>
                <td>${pedido.items.length} prod. (${cantidadItems} uds)</td>
                <td style="font-weight: 700;">$${pedido.total.toFixed(2)}</td>
                <td><i class="fa-solid fa-credit-card" style="margin-right: 5px; color: #64748b;"></i> ${pedido.metodoPago}</td>
                <td>
                    <span class="badge-estado ${pedido.estado}">
                        <i class="fa-solid ${pedido.estado === 'completado' ? 'fa-circle-check' : pedido.estado === 'cancelado' ? 'fa-circle-xmark' : 'fa-spinner'}"></i>
                        ${pedido.estado}
                    </span>
                </td>
                <td>
                    <div class="botones-acciones-celda">
                        ${accionesHTML}
                    </div>
                </td>
            `;

            this.tablaBody.appendChild(fila);
        });

        this.configurarBotonesAcciones();
    }

    configurarBusqueda() {
        if (!this.campoBusqueda) return;
        this.campoBusqueda.addEventListener('input', () => {
            this.busquedaActiva = this.campoBusqueda.value.trim();
            this.renderizarVista();
        });
    }

    configurarFiltros() {
        this.botonesFiltro.forEach(boton => {
            boton.addEventListener('click', () => {
                this.botonesFiltro.forEach(b => b.classList.remove('activo'));
                boton.classList.add('activo');
                
                this.filtroActivo = boton.getAttribute('data-filtro');
                this.renderizarVista();
            });
        });
    }

    configurarBotonesAcciones() {
        // Detalle
        const botonesVer = document.querySelectorAll('.btn-accion-ped.ver');
        botonesVer.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                this.abrirModalDetalle(id);
            });
        });

        // Completar
        const botonesCompletar = document.querySelectorAll('.btn-accion-ped.completar');
        botonesCompletar.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (confirm(`¿Estás seguro de marcar el pedido ${id} como COMPLETADO y ENTREGADO?`)) {
                    const res = this.pedidosCtrl.cambiarEstadoPedido(id, 'completado');
                    alert(res.mensaje);
                    this.renderizarVista();
                }
            });
        });

        // Cancelar
        const botonesCancelar = document.querySelectorAll('.btn-accion-ped.cancelar');
        botonesCancelar.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (confirm(`¿Estás seguro de CANCELAR el pedido ${id}? Esta acción es irreversible.`)) {
                    const res = this.pedidosCtrl.cambiarEstadoPedido(id, 'cancelado');
                    alert(res.mensaje);
                    this.renderizarVista();
                }
            });
        });
    }

    abrirModalDetalle(pedidoId) {
        const pedido = this.pedidosCtrl.model.obtenerPorId(pedidoId);
        if (!pedido) {
            alert('No se pudo encontrar la información detallada del pedido.');
            return;
        }

        const fechaFormateada = new Date(pedido.fecha).toLocaleString('es-ES');

        let productosFilas = '';
        pedido.items.forEach(item => {
            productosFilas += `
                <tr>
                    <td>${item.nombre}</td>
                    <td>$${item.precioUnitario.toFixed(2)}</td>
                    <td>${item.cantidad}</td>
                    <td style="font-weight: 600;">$${item.subtotal.toFixed(2)}</td>
                </tr>
            `;
        });

        this.modalDetalleCuerpo.innerHTML = `
            <div class="bloque-info-detalle">
                <div class="grupo-info">
                    <span class="titulo">ID Pedido</span>
                    <span class="valor" style="font-weight: 700; color: #2b5074;">${pedido.id}</span>
                </div>
                <div class="grupo-info">
                    <span class="titulo">Fecha de Creación</span>
                    <span class="valor">${fechaFormateada}</span>
                </div>
                <div class="grupo-info">
                    <span class="titulo">Cliente</span>
                    <span class="valor">${pedido.clienteNombre} (ID: ${pedido.clienteId})</span>
                </div>
                <div class="grupo-info">
                    <span class="titulo">Método de Pago</span>
                    <span class="valor" style="text-transform: uppercase;">${pedido.metodoPago}</span>
                </div>
                <div class="grupo-info" style="grid-column: 1 / -1;">
                    <span class="titulo">Dirección de Envío</span>
                    <span class="valor">${pedido.detallesEnvio?.direccion || 'No especificada'}</span>
                </div>
                <div class="grupo-info">
                    <span class="titulo">Teléfono de Contacto</span>
                    <span class="valor">${pedido.detallesEnvio?.telefono || 'No especificado'}</span>
                </div>
                <div class="grupo-info">
                    <span class="titulo">Estado Actual</span>
                    <span class="valor">
                        <span class="badge-estado ${pedido.estado}">
                            ${pedido.estado}
                        </span>
                    </span>
                </div>
            </div>

            <h3 style="margin-top: 25px; margin-bottom: 10px; color: #1e293b; font-size: 15px; font-weight: 700;">
                <i class="fa-solid fa-boxes-stacked"></i> Artículos Comprados
            </h3>
            
            <table class="detalle-productos-tabla">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Precio Unitario</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${productosFilas}
                </tbody>
            </table>

            <div class="totales-detalle-pedido">
                <div class="linea-total">
                    <span>Subtotal Neto:</span>
                    <span>$${pedido.subtotalNeto.toFixed(2)}</span>
                </div>
                <div class="linea-total">
                    <span>IVA (16%):</span>
                    <span>$${pedido.iva.toFixed(2)}</span>
                </div>
                <div class="linea-total principal">
                    <span>Total Pagado:</span>
                    <span>$${pedido.total.toFixed(2)}</span>
                </div>
            </div>
        `;

        this.modalDetalle.classList.add('modal-detalle-activo');
    }

    configurarCierreModal() {
        if (!this.btnCerrarModal) return;

        this.btnCerrarModal.addEventListener('click', () => {
            this.modalDetalle.classList.remove('modal-detalle-activo');
        });

        window.addEventListener('click', (e) => {
            if (e.target === this.modalDetalle) {
                this.modalDetalle.classList.remove('modal-detalle-activo');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new InterfazPedidos();
});
