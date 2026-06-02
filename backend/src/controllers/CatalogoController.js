/*
  src/controllers/CatalogoController.js — Renderiza el catálogo de productos,
  gestiona filtros, búsqueda, favoritos y el botón "Añadir al carrito".
  Instancia CatalogoModel y CarritoModel. Cargado en catalogo.html.
*/

class CatalogoController {
    #model         = new CatalogoModel();
    #carritoModel  = new CarritoModel();
    #contenedor    = document.querySelector('.cuadricula-productos');
    #campoBusqueda = document.querySelector('.campo-busqueda');
    #botonesFiltro = document.querySelectorAll('.boton-filtro');
    #categoria     = 'whey_protein';
    #sesion        = null;

    async init() {
        this.#sesion = await this.#model.sesion();
        if (!this.#sesion?.id) return location.href = 'index.html';
        await this.#render();
        this.#initFiltros();
        this.#initBusqueda();
    }

    async #render(productos = null) {
        if (!this.#contenedor) return;
        this.#contenedor.innerHTML = '<p style="padding:20px;color:#6b7280;">Cargando...</p>';
        const lista     = productos ?? await this.#model.porCategoria(this.#categoria);
        const favoritos = await this.#model.favoritos();
        this.#contenedor.innerHTML = '';

        if (!lista.length) {
            this.#contenedor.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:#6b7280;">
                <i class="fa-solid fa-box-open" style="font-size:48px;display:block;margin-bottom:15px;"></i>
                <p>No hay productos en esta categoría.</p></div>`;
            return;
        }

        lista.forEach(p => {
            const esFav   = favoritos.includes(p.id);
            const tarjeta = document.createElement('article');
            tarjeta.className = 'tarjeta-producto';
            const img = p.imagen
                ? `<img src="${p.imagen}" alt="${p.nombre}" style="width:90px;height:110px;object-fit:cover;border-radius:10px;">`
                : `<div class="imagen-simulada">Pote</div>`;
            const estrellas = Array.from({ length: Math.min(5, p.calificacion ?? 0) }, () => '<i class="fa-solid fa-star"></i>').join('');
            const btnCarrito = this.#sesion.rol !== 'admin'
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
            this.#contenedor.appendChild(tarjeta);
        });

        this.#bindFavoritos();
        this.#bindCarrito();
    }

    #bindFavoritos() {
        document.querySelectorAll('.boton-favorito').forEach(btn => {
            btn.addEventListener('click', async () => {
                const r    = await this.#model.toggleFavorito(btn.getAttribute('data-id'));
                const i    = btn.querySelector('i');
                i.className      = r.esFavorito ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
                btn.style.color  = r.esFavorito ? '#ef4444' : '';
            });
        });
    }

    #bindCarrito() {
        document.querySelectorAll('.boton-anadir').forEach(btn => {
            btn.addEventListener('click', async () => {
                const r = await this.#carritoModel.agregar(btn.getAttribute('data-id'));
                this.#toast(r.msg, r.ok ? 'exito' : 'error');
            });
        });
    }

    #initFiltros() {
        const mapa = { 'Whey Protein': 'whey_protein', 'Pre-workout': 'pre_workout', 'Creatine': 'creatine' };
        this.#botonesFiltro.forEach(btn => {
            btn.addEventListener('click', async () => {
                this.#botonesFiltro.forEach(b => b.classList.remove('activo'));
                btn.classList.add('activo');
                this.#categoria = mapa[btn.textContent.trim()];
                await this.#render();
            });
        });
    }

    #initBusqueda() {
        this.#campoBusqueda?.addEventListener('input', async () => {
            const t = this.#campoBusqueda.value.trim();
            const lista = t ? await this.#model.buscar(t) : await this.#model.porCategoria(this.#categoria);
            await this.#render(lista);
        });
    }

    #toast(msg, tipo) {
        document.querySelector('.toast-cat')?.remove();
        const d = document.createElement('div');
        d.className = 'toast-cat'; d.textContent = msg;
        Object.assign(d.style, { position:'fixed', bottom:'30px', right:'30px', padding:'14px 22px',
            borderRadius:'12px', fontWeight:'600', color:'#fff', zIndex:'9999',
            background: tipo === 'exito' ? '#10b981' : '#ef4444' });
        document.body.appendChild(d);
        setTimeout(() => d.remove(), 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => new CatalogoController().init());
