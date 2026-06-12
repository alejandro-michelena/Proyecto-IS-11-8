/*
  frontend/js/catalogo.js

  Renderiza el catálogo de productos, gestiona filtros, búsqueda,
  favoritos y el botón "Añadir al carrito".
  Se carga en catalogo.html.
*/

const MAPA_CATEGORIA = {
    'Whey Protein': 'whey_protein',
    'Pre-workout':  'pre_workout',
    'Creatine':     'creatine',
};

let categoriaActual = 'whey_protein';
let sesion          = null;

// ── Fetch helpers ─────────────────────────────────────────────────────────────
async function fetchProductos(categoria) {
    return fetch(`/api/catalogo?categoria=${categoria}`).then(r => r.json());
}
async function fetchBuscar(q) {
    return fetch(`/api/catalogo/buscar?q=${encodeURIComponent(q)}`).then(r => r.json());
}
async function fetchFavoritos() {
    return fetch('/api/catalogo/favoritos').then(r => r.json());
}

// ── Render ────────────────────────────────────────────────────────────────────
async function render(lista = null) {
    const contenedor = document.querySelector('.cuadricula-productos');
    if (!contenedor) return;

    contenedor.innerHTML = '<p style="padding:20px;color:#6b7280;">Cargando...</p>';
    const productos  = lista ?? await fetchProductos(categoriaActual);
    const favoritos  = await fetchFavoritos();
    contenedor.innerHTML = '';

    if (!productos.length) {
        contenedor.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:#6b7280;">
            <i class="fa-solid fa-box-open" style="font-size:48px;display:block;margin-bottom:15px;"></i>
            <p>No hay productos en esta categoría.</p></div>`;
        return;
    }

    productos.forEach(p => {
        const esFav   = favoritos.includes(p.id);
        const tarjeta = document.createElement('article');
        tarjeta.className = 'tarjeta-producto';
        const img = p.imagen
            ? `<img src="${p.imagen}" alt="${p.nombre}" style="width:90px;height:110px;object-fit:cover;border-radius:10px;">`
            : `<div class="imagen-simulada">Pote</div>`;
        const estrellas = Array.from({ length: Math.min(5, p.calificacion ?? 0) }, () => '<i class="fa-solid fa-star"></i>').join('');
        const btnCarrito = sesion?.rol !== 'admin'
            ? `<button class="boton-anadir" data-id="${p.id}">Añadir al Carrito</button>` : '';

        tarjeta.innerHTML = `
            <button class="boton-favorito" data-id="${p.id}" style="${esFav ? 'color:#ef4444;' : ''}">
                <i class="${esFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            </button>
            <div class="contenedor-imagen-producto">${img}</div>
            <h3 class="nombre-producto">${p.nombre}</h3>
            <p class="descripcion-producto">${p.descripcion ?? ''}</p>
            <div class="calificacion-estrellas">${estrellas}</div>
            <p class="precio-producto">$${p.precio}</p>
            <p style="font-size:12px;color:#94a3b8;margin-bottom:8px;">Stock: ${p.stock}</p>
            ${btnCarrito}`;
        contenedor.appendChild(tarjeta);
    });

    bindFavoritos();
    bindCarrito();
}

function bindFavoritos() {
    document.querySelectorAll('.boton-favorito').forEach(btn => {
        btn.addEventListener('click', async () => {
            const r = await fetch(`/api/catalogo/favoritos/${btn.dataset.id}`, { method: 'POST' }).then(res => res.json());
            const i = btn.querySelector('i');
            i.className     = r.esFavorito ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
            btn.style.color = r.esFavorito ? '#ef4444' : '';
        });
    });
}

function bindCarrito() {
    document.querySelectorAll('.boton-anadir').forEach(btn => {
        btn.addEventListener('click', async () => {
            const r = await fetch(`/api/carrito/${btn.dataset.id}`, { method: 'POST' }).then(res => res.json());
            toast(r.msg, r.ok ? 'exito' : 'error');
        });
    });
}

// ── Filtros ───────────────────────────────────────────────────────────────────
function initFiltros() {
    document.querySelectorAll('.boton-filtro').forEach(btn => {
        btn.addEventListener('click', async () => {
            document.querySelectorAll('.boton-filtro').forEach(b => b.classList.remove('activo'));
            btn.classList.add('activo');
            categoriaActual = MAPA_CATEGORIA[btn.textContent.trim()] ?? 'whey_protein';
            await render();
        });
    });
}

function initBusqueda() {
    document.querySelector('.campo-busqueda')?.addEventListener('input', async e => {
        const t = e.target.value.trim();
        const lista = t ? await fetchBuscar(t) : await fetchProductos(categoriaActual);
        await render(lista);
    });
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function toast(msg, tipo) {
    document.querySelector('.toast-cat')?.remove();
    const d = document.createElement('div');
    d.className = 'toast-cat'; d.textContent = msg;
    Object.assign(d.style, { position:'fixed', bottom:'30px', right:'30px', padding:'14px 22px',
        borderRadius:'12px', fontWeight:'600', color:'#fff', zIndex:'9999',
        background: tipo === 'exito' ? '#10b981' : '#ef4444' });
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 3000);
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    const res = await fetch('/api/usuarios/sesion');
    sesion    = await res.json();
    if (!sesion?.id) return location.href = 'index.html';
    await render();
    initFiltros();
    initBusqueda();
});
