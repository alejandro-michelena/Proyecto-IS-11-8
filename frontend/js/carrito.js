/*
  frontend/js/carrito.js

  Maneja el modal del carrito y el flujo de checkout.
  Se carga en catalogo.html y gestionPerfil.html.
*/

const modal = () => document.getElementById('modal-carrito');
const tbody = () => document.getElementById('contenedor-items-carrito');

// ── Render ────────────────────────────────────────────────────────────────────
async function renderCarrito() {
    const { carrito, subtotalNeto, iva, total } = await fetch('/api/carrito').then(r => r.json());
    const tb = tbody();
    if (!tb) return;

    tb.innerHTML = carrito.length === 0
        ? `<tr><td colspan="5" style="text-align:center;padding:20px;color:#94a3b8;">El carrito está vacío.</td></tr>`
        : carrito.map(item => `
            <tr>
                <td>${item.nombre}</td>
                <td>$${item.precio.toFixed(2)}</td>
                <td>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <button class="btn-cant" data-id="${item.id}" data-cant="${item.cantidad - 1}"
                            style="border:none;background:#f1f5f9;border-radius:6px;width:26px;height:26px;cursor:pointer;">−</button>
                        <span>${item.cantidad}</span>
                        <button class="btn-cant" data-id="${item.id}" data-cant="${item.cantidad + 1}"
                            style="border:none;background:#f1f5f9;border-radius:6px;width:26px;height:26px;cursor:pointer;">+</button>
                    </div>
                </td>
                <td>$${(item.precio * item.cantidad).toFixed(2)}</td>
                <td><button class="btn-del" data-id="${item.id}"
                    style="border:none;background:#fee2e2;color:#ef4444;border-radius:8px;padding:5px 10px;cursor:pointer;">
                    <i class="fa-solid fa-trash"></i></button></td>
            </tr>`).join('');

    document.getElementById('total-neto').textContent = `$${subtotalNeto.toFixed(2)}`;
    document.getElementById('total-iva').textContent  = `$${iva.toFixed(2)}`;
    document.getElementById('gran-total').textContent = `$${total.toFixed(2)}`;

    tb.querySelectorAll('.btn-cant').forEach(btn =>
        btn.addEventListener('click', async () => {
            await fetch(`/api/carrito/${btn.dataset.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cantidad: parseInt(btn.dataset.cant) }),
            });
            await renderCarrito();
        }));
    tb.querySelectorAll('.btn-del').forEach(btn =>
        btn.addEventListener('click', async () => {
            await fetch(`/api/carrito/${btn.dataset.id}`, { method: 'DELETE' });
            await renderCarrito();
        }));
}

// ── Modal ─────────────────────────────────────────────────────────────────────
async function abrirCarrito() { await renderCarrito(); modal()?.classList.add('modal-carrito-activo'); }
function cerrarCarrito()      { modal()?.classList.remove('modal-carrito-activo'); }

// ── Checkout ──────────────────────────────────────────────────────────────────
function abrirCheckout() {
    const html = `
        <div id="modal-checkout" style="position:fixed;inset:0;background:rgba(15,23,42,.6);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:99999;">
            <div style="background:#fff;padding:35px 30px;border-radius:16px;width:90%;max-width:440px;font-family:'Roboto',sans-serif;">
                <div style="text-align:center;margin-bottom:25px;">
                    <div style="color:#2e7d32;font-weight:700;font-size:1.3rem;margin-bottom:12px;"><i class="fa-solid fa-leaf"></i> VITA-SUPPS</div>
                    <h2 style="font-size:1.5rem;color:#1f2937;margin-bottom:6px;">Finalizar Compra</h2>
                    <p style="font-size:.9rem;color:#6b7280;">Ingresa los datos de entrega.</p>
                </div>
                <div style="margin-bottom:20px;"><label style="font-size:.85rem;font-weight:700;color:#4b5563;">Dirección</label>
                    <input id="co-dir" type="text" placeholder="Av. Las Palmas 456, Caracas"
                        style="width:100%;padding:12px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:.95rem;margin-top:8px;box-sizing:border-box;"></div>
                <div style="margin-bottom:20px;"><label style="font-size:.85rem;font-weight:700;color:#4b5563;">Teléfono</label>
                    <input id="co-tel" type="text" placeholder="0412-0000000"
                        style="width:100%;padding:12px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:.95rem;margin-top:8px;box-sizing:border-box;"></div>
                <div style="display:flex;gap:12px;margin-top:25px;">
                    <button id="co-cancel" style="flex:1;padding:13px;background:#f3f4f6;color:#4b5563;border:none;border-radius:8px;cursor:pointer;font-weight:700;">Cancelar</button>
                    <button id="co-confirm" style="flex:1;padding:13px;background:#2e7d32;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:700;"><i class="fa-solid fa-lock"></i> Confirmar</button>
                </div>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', html);

    document.getElementById('co-cancel').addEventListener('click', () => document.getElementById('modal-checkout').remove());
    document.getElementById('co-confirm').addEventListener('click', async () => {
        const direccion = document.getElementById('co-dir').value;
        const telefono  = document.getElementById('co-tel').value;
        if (!direccion.trim()) return alert('La dirección es obligatoria.');
        if (!/^[0-9\-]+$/.test(telefono)) return alert('El teléfono debe contener solo números.');

        const r = await fetch('/api/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ metodoPago: 'tarjeta', detallesEnvio: { direccion, telefono } }),
        }).then(res => res.json());

        document.getElementById('modal-checkout').remove();
        if (r.ok) {
            toastCarrito('¡Pedido exitoso!', 'exito');
            cerrarCarrito();
            setTimeout(() => location.reload(), 2000);
        } else {
            toastCarrito(r.msg, 'error');
        }
    });
}

function toastCarrito(msg, tipo) {
    document.querySelector('.toast-carrito')?.remove();
    const d = document.createElement('div');
    d.className = 'toast-carrito'; d.textContent = msg;
    Object.assign(d.style, { position:'fixed', bottom:'30px', right:'30px', padding:'14px 22px',
        borderRadius:'12px', fontWeight:'600', color:'#fff', zIndex:'9999',
        background: tipo === 'exito' ? '#10b981' : '#ef4444' });
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 3000);
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('menu-carrito')?.addEventListener('click', e => { e.preventDefault(); abrirCarrito(); });
    document.getElementById('boton-cerrar-carrito')?.addEventListener('click', cerrarCarrito);
    document.getElementById('boton-vaciar-carrito')?.addEventListener('click', async () => {
        if (confirm('¿Vaciar el carrito?')) {
            await fetch('/api/carrito', { method: 'DELETE' });
            await renderCarrito();
        }
    });
    document.getElementById('boton-proceder-pago')?.addEventListener('click', abrirCheckout);
    window.addEventListener('click', e => { if (e.target === modal()) cerrarCarrito(); });
});
