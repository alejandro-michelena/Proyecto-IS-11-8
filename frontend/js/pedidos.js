/*
  frontend/js/pedidos.js

  Renderiza la vista de gestión de pedidos.
  Muestra estadísticas, tabla y modal de detalle.
  Se carga en gestionPedidos.html.
*/

let filtro   = 'todos';
let busqueda = '';

// ── Fetch ─────────────────────────────────────────────────────────────────────
async function fetchPedidos()  { return fetch('/api/pedidos').then(r => r.json()); }
async function fetchDetalle(id){ return fetch(`/api/pedidos/${id}`).then(r => r.json()); }

// ── Estadísticas ──────────────────────────────────────────────────────────────
function actualizarStats(pedidos) {
    const completados = pedidos.filter(p => p.estado === 'completado');
    document.getElementById('stat-total-pedidos').textContent = pedidos.length;
    document.getElementById('stat-pendientes').textContent    = pedidos.filter(p => p.estado === 'pendiente').length;
    document.getElementById('stat-completados').textContent   = completados.length;
    document.getElementById('stat-ingresos').textContent      = `$${completados.reduce((a, p) => a + p.total, 0).toFixed(2)}`;
}

// ── Tabla ─────────────────────────────────────────────────────────────────────
function renderTabla(pedidos) {
    const body = document.getElementById('lista-pedidos-body');
    if (!body) return;

    let lista = [...pedidos];
    if (filtro !== 'todos') lista = lista.filter(p => p.estado === filtro);
    if (busqueda) {
        const q = busqueda.toLowerCase();
        lista = lista.filter(p => p.id.toLowerCase().includes(q) || (p.clienteNombre ?? '').toLowerCase().includes(q));
    }

    document.getElementById('sin-pedidos').className = lista.length ? 'sin-datos-oculto' : 'sin-datos-activo';

    body.innerHTML = lista.map(p => {
        const fecha   = new Date(p.fecha).toLocaleDateString('es-ES', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
        const icono   = p.estado === 'completado' ? 'fa-circle-check' : p.estado === 'cancelado' ? 'fa-circle-xmark' : 'fa-spinner';
        const acciones = `<button class="btn-accion-ped ver" data-id="${p.id}"><i class="fa-solid fa-eye"></i> Detalle</button>`
            + (p.estado === 'pendiente' ? `<button class="btn-accion-ped completar" data-id="${p.id}"><i class="fa-solid fa-check"></i> Completar</button>` : '');
        return `<tr>
            <td style="font-weight:700;">${p.id}</td><td>${fecha}</td><td>${p.clienteNombre}</td>
            <td>${p.items.length} prod. (${p.items.reduce((a, i) => a + i.cantidad, 0)} uds)</td>
            <td style="font-weight:700;">$${p.total.toFixed(2)}</td>
            <td><i class="fa-solid fa-credit-card" style="margin-right:5px;color:#64748b;"></i>${p.metodoPago}</td>
            <td><span class="badge-estado ${p.estado}"><i class="fa-solid ${icono}"></i> ${p.estado}</span></td>
            <td><div class="botones-acciones-celda">${acciones}</div></td></tr>`;
    }).join('');

    bindAcciones();
}

function bindAcciones() {
    document.querySelectorAll('.btn-accion-ped.ver').forEach(btn =>
        btn.addEventListener('click', () => abrirDetalle(btn.dataset.id)));
    document.querySelectorAll('.btn-accion-ped.completar').forEach(btn =>
        btn.addEventListener('click', async () => {
            if (!confirm(`¿Marcar ${btn.dataset.id} como COMPLETADO?`)) return;
            const r = await fetch(`/api/pedidos/${btn.dataset.id}/estado`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: 'completado' }),
            }).then(res => res.json());
            alert(r.msg);
            renderVista();
        }));
}

// ── Detalle ───────────────────────────────────────────────────────────────────
async function abrirDetalle(id) {
    const p = await fetchDetalle(id);
    if (!p?.id) return alert('No se encontró el pedido.');
    const cuerpo = document.getElementById('modal-detalle-cuerpo');
    cuerpo.innerHTML = `
        <div class="bloque-info-detalle">
            <div class="grupo-info"><span class="titulo">ID</span><span class="valor" style="font-weight:700;">${p.id}</span></div>
            <div class="grupo-info"><span class="titulo">Fecha</span><span class="valor">${new Date(p.fecha).toLocaleString('es-ES')}</span></div>
            <div class="grupo-info"><span class="titulo">Cliente</span><span class="valor">${p.clienteNombre}</span></div>
            <div class="grupo-info"><span class="titulo">Método de Pago</span><span class="valor">${p.metodoPago}</span></div>
            <div class="grupo-info" style="grid-column:1/-1;"><span class="titulo">Dirección</span><span class="valor">${p.detallesEnvio?.direccion ?? ''}</span></div>
            <div class="grupo-info"><span class="titulo">Teléfono</span><span class="valor">${p.detallesEnvio?.telefono ?? ''}</span></div>
            <div class="grupo-info"><span class="titulo">Estado</span><span class="valor"><span class="badge-estado ${p.estado}">${p.estado}</span></span></div>
        </div>
        <h3 style="margin-top:25px;margin-bottom:10px;font-size:15px;font-weight:700;"><i class="fa-solid fa-boxes-stacked"></i> Artículos</h3>
        <table class="detalle-productos-tabla"><thead><tr><th>Producto</th><th>Precio Unit.</th><th>Cantidad</th><th>Subtotal</th></tr></thead>
        <tbody>${p.items.map(i => `<tr><td>${i.nombre}</td><td>$${i.precioUnitario.toFixed(2)}</td><td>${i.cantidad}</td><td>$${i.subtotal.toFixed(2)}</td></tr>`).join('')}</tbody></table>
        <div class="totales-detalle-pedido">
            <div class="linea-total"><span>Subtotal:</span><span>$${p.subtotalNeto.toFixed(2)}</span></div>
            <div class="linea-total"><span>IVA (16%):</span><span>$${p.iva.toFixed(2)}</span></div>
            <div class="linea-total principal"><span>Total:</span><span>$${p.total.toFixed(2)}</span></div>
        </div>`;
    document.getElementById('modal-detalle-pedido')?.classList.add('modal-detalle-activo');
}

// ── Vista completa ────────────────────────────────────────────────────────────
async function renderVista() {
    const pedidos = await fetchPedidos();
    actualizarStats(pedidos);
    renderTabla(pedidos);
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    const sesion = await fetch('/api/usuarios/sesion').then(r => r.json());
    if (!sesion?.id) return location.href = 'index.html';

    await renderVista();

    document.getElementById('buscar-pedido')?.addEventListener('input', async e => {
        busqueda = e.target.value.trim();
        await renderVista();
    });

    document.querySelectorAll('.boton-filtro-ped').forEach(btn =>
        btn.addEventListener('click', async () => {
            document.querySelectorAll('.boton-filtro-ped').forEach(b => b.classList.remove('activo'));
            btn.classList.add('activo');
            filtro = btn.dataset.filtro;
            await renderVista();
        }));

    document.getElementById('cerrar-modal-detalle')?.addEventListener('click', () =>
        document.getElementById('modal-detalle-pedido')?.classList.remove('modal-detalle-activo'));
});
