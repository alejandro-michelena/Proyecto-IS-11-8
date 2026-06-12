/*
  frontend/js/producto.js

  Maneja el formulario de agregar producto (publicar y guardar borrador).
  Se carga en agregar-producto.html.
*/

let imagenBase64 = null;

// ── Upload de imagen ──────────────────────────────────────────────────────────
function initUpload() {
    const area = document.querySelector('.upload-area');
    if (!area) return;

    const input = document.createElement('input');
    input.type   = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    area.appendChild(input);

    area.addEventListener('click', () => input.click());
    area.addEventListener('dragover', e => { e.preventDefault(); area.style.borderColor = '#2e7d32'; });
    area.addEventListener('dragleave', () => { area.style.borderColor = ''; });
    area.addEventListener('drop', e => { e.preventDefault(); area.style.borderColor = ''; if (e.dataTransfer.files[0]) procesarImagen(e.dataTransfer.files[0]); });
    input.addEventListener('change', () => { if (input.files[0]) procesarImagen(input.files[0]); });
}

function procesarImagen(file) {
    const reader = new FileReader();
    reader.onload = e => {
        imagenBase64 = e.target.result;
        const area = document.querySelector('.upload-area');
        area.innerHTML = `<img src="${imagenBase64}" alt="Preview" style="max-width:100%;max-height:200px;border-radius:8px;">`;
    };
    reader.readAsDataURL(file);
}

// ── Recoger datos del formulario ──────────────────────────────────────────────
function getDatos() {
    return {
        nombre:      document.getElementById('product-name')?.value      ?? '',
        categoria:   document.getElementById('product-category')?.value  ?? '',
        marca:       document.getElementById('product-brand')?.value     ?? '',
        precio:      parseFloat(document.getElementById('list-price')?.value) || 0,
        stock:       parseInt(document.getElementById('current-stock')?.value)  ?? 0,
        descripcion: document.getElementById('full-description')?.value   ?? '',
        imagen:      imagenBase64,
    };
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function toast(msg, tipo) {
    document.querySelector('.toast-prod')?.remove();
    const d = document.createElement('div');
    d.className = 'toast-prod'; d.textContent = msg;
    Object.assign(d.style, { position:'fixed', bottom:'30px', right:'30px', padding:'14px 22px',
        borderRadius:'12px', fontWeight:'600', color:'#fff', zIndex:'9999',
        background: tipo === 'exito' ? '#10b981' : '#ef4444' });
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 3500);
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    const sesion = await fetch('/api/usuarios/sesion').then(r => r.json());
    if (!sesion?.id) return location.href = 'index.html';

    initUpload();

    document.querySelector('.product-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const r = await fetch('/api/productos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(getDatos()),
        }).then(res => res.json());
        if (r.ok) {
            toast(r.msg, 'exito');
            setTimeout(() => location.href = 'catalogo.html', 1800);
        } else {
            toast(r.msg, 'error');
        }
    });

    document.querySelectorAll('.btn-secondary, .action-buttons-row button').forEach(btn => {
        if (btn.textContent.trim() === 'Cancelar')
            btn.addEventListener('click', () => location.href = 'catalogo.html');
        if (btn.textContent.trim() === 'Guardar como Borrador')
            btn.addEventListener('click', async () => {
                const r = await fetch('/api/productos/borrador', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(getDatos()),
                }).then(res => res.json());
                toast(r.msg, r.ok ? 'exito' : 'error');
            });
    });
});
