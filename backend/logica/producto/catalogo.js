/**
 * GestorCatalogo + InterfazCatalogo
 * ──────────────────────────────────
 * Depende de: PersistenciaCliente
 */

class GestorCatalogo {
    constructor() {
        this.persistencia       = new PersistenciaCliente();
        this.ARCHIVO_PRODUCTOS  = 'productos.json';
        this.ARCHIVO_CARRITO    = 'carrito.json';
        this.ARCHIVO_FAVORITOS  = 'favoritos.json';
        this.ARCHIVO_SESION     = 'sesion.json';
    }

    async verificarSesion() {
        const sesion = await this.persistencia.leerArchivo(this.ARCHIVO_SESION);
        if (!sesion) {
            window.location.href = 'index.html';
            return null;
        }
        return sesion;
    }

    async cargarProductos() {
        return await this.persistencia.leerArchivo(this.ARCHIVO_PRODUCTOS) || [];
    }

    async obtenerCarrito() {
        return await this.persistencia.leerArchivo(this.ARCHIVO_CARRITO) || [];
    }

    async guardarCarrito(carrito) {
        return await this.persistencia.escribirArchivo(this.ARCHIVO_CARRITO, carrito);
    }

    async añadirAlCarrito(idProducto) {
        const productos = await this.cargarProductos();
        const producto = productos.find(p => p.id === idProducto);

        if (!producto) return { exito: false, mensaje: 'Producto no encontrado.' };
        if (producto.stock <= 0) return { exito: false, mensaje: 'No hay stock disponible para este producto.' };

        const carrito = await this.obtenerCarrito();
        const itemExistente = carrito.find(item => item.id === idProducto);

        if (itemExistente) {
            if (itemExistente.cantidad >= producto.stock) {
                return { exito: false, mensaje: `No hay más unidades disponibles de ${producto.nombre}.` };
            }
            itemExistente.cantidad += 1;
        } else {
            carrito.push({
                id:       producto.id,
                nombre:   producto.nombre,
                precio:   producto.precio,
                cantidad: 1
            });
        }

        await this.guardarCarrito(carrito);
        return { exito: true, mensaje: `${producto.nombre} añadido al carrito.` };
    }

    async obtenerFavoritos() {
        return await this.persistencia.leerArchivo(this.ARCHIVO_FAVORITOS) || [];
    }

    async alternarFavorito(idProducto) {
        const favoritos = await this.obtenerFavoritos();
        const idx = favoritos.indexOf(idProducto);

        if (idx > -1) {
            favoritos.splice(idx, 1);
        } else {
            favoritos.push(idProducto);
        }

        await this.persistencia.escribirArchivo(this.ARCHIVO_FAVORITOS, favoritos);
        return { exito: true, esFavorito: idx === -1 };
    }

    async filtrarPorCategoria(categoria) {
        const productos = await this.cargarProductos();
        const publicados = productos.filter(p => p.estado === 'publicado');
        if (!categoria) return publicados;
        return publicados.filter(p => p.categoria === categoria);
    }

    async buscarProductos(termino) {
        const productos = await this.cargarProductos();
        const q = termino.toLowerCase();
        return productos.filter(p =>
            p.estado === 'publicado' &&
            (p.nombre.toLowerCase().includes(q) || (p.descripcion || '').toLowerCase().includes(q))
        );
    }

    // ── Carrito UI helpers ──────────────────────────────

    async calcularTotales() {
        const carrito = await this.obtenerCarrito();
        const subtotalNeto = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
        const iva   = Math.round(subtotalNeto * 0.16 * 100) / 100;
        const total = Math.round((subtotalNeto + iva) * 100) / 100;
        return { carrito, subtotalNeto, iva, total };
    }

    async cambiarCantidadItem(idProducto, delta) {
        const productos = await this.cargarProductos();
        const producto  = productos.find(p => p.id === idProducto);
        const carrito   = await this.obtenerCarrito();
        const item      = carrito.find(i => i.id === idProducto);

        if (!item) return { exito: false, mensaje: 'Item no encontrado en el carrito.' };

        const nuevaCantidad = item.cantidad + delta;

        if (nuevaCantidad <= 0) {
            const idx = carrito.indexOf(item);
            carrito.splice(idx, 1);
        } else {
            if (producto && nuevaCantidad > producto.stock) {
                return { exito: false, mensaje: 'No hay suficiente stock disponible.' };
            }
            item.cantidad = nuevaCantidad;
        }

        await this.guardarCarrito(carrito);
        return { exito: true };
    }

    async vaciarCarrito() {
        await this.guardarCarrito([]);
    }
}

// ══════════════════════════════════════════════════════════════════
//  INTERFAZ CATÁLOGO
// ══════════════════════════════════════════════════════════════════

class InterfazCatalogo {
    constructor() {
        this.gestor              = new GestorCatalogo();
        this.contenedor          = document.querySelector('.cuadricula-productos');
        this.campoBusqueda       = document.querySelector('.campo-busqueda');
        this.botonesFiltro       = document.querySelectorAll('.boton-filtro');
        this.modalCarrito        = document.getElementById('modal-carrito');
        this.botonVerCarrito     = document.getElementById('boton-carrito');
        this.botonCerrarCarrito  = document.getElementById('boton-cerrar-carrito');
        this.botonVaciar         = document.getElementById('boton-vaciar-carrito');
        this.categoriaActiva     = 'whey_protein';
    }

    async inicializar() {
        await this.gestor.verificarSesion();
        await this.renderizarProductos();
        this.configurarFiltros();
        this.configurarBusqueda();
        this.configurarCarritoModal();
        this.configurarBotonPagar();
    }

    generarEstrellas(cal = 0) {
        return Array.from({ length: Math.min(5, Math.max(0, cal)) })
                    .map(() => '<i class="fa-solid fa-star"></i>').join('');
    }

    async renderizarProductos() {
        if (!this.contenedor) return;
        this.contenedor.innerHTML = '<p style="padding:20px;color:#6b7280;">Cargando productos...</p>';

        const productos = await this.gestor.filtrarPorCategoria(this.categoriaActiva);
        const favoritos = await this.gestor.obtenerFavoritos();
        this.contenedor.innerHTML = '';

        if (productos.length === 0) {
            this.contenedor.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:40px;color:#6b7280;">
                    <i class="fa-solid fa-box-open" style="font-size:48px;display:block;margin-bottom:15px;"></i>
                    <p>No hay productos publicados en esta categoría.</p>
                </div>`;
            return;
        }

        productos.forEach(producto => {
            const esFav = favoritos.includes(producto.id);
            const tarjeta = document.createElement('article');
            tarjeta.className = 'tarjeta-producto';

            const imgHTML = producto.imagen
                ? `<img src="${producto.imagen}" alt="${producto.nombre}" style="width:90px;height:110px;object-fit:cover;border-radius:10px;">`
                : `<div class="imagen-simulada">Pote</div>`;

            tarjeta.innerHTML = `
                <button class="boton-favorito" data-id="${producto.id}" style="${esFav ? 'color:#ef4444;' : ''}">
                    <i class="${esFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                </button>
                <div class="contenedor-imagen-producto">${imgHTML}</div>
                <h3 class="nombre-producto">${producto.nombre}</h3>
                <p class="descripcion-producto">${producto.descripcion || ''}</p>
                <div class="calificacion-estrellas">${this.generarEstrellas(producto.calificacion)}</div>
                <p class="precio-producto">$${producto.precio}</p>
                <p style="font-size:12px;color:#94a3b8;margin-bottom:8px;">Stock: ${producto.stock}</p>
                <button class="boton-anadir" data-id="${producto.id}">Añadir al Carrito</button>
            `;
            this.contenedor.appendChild(tarjeta);
        });

        this.configurarBotonesFavorito();
        this.configurarBotonesAnadir();
    }

    configurarBotonesFavorito() {
        document.querySelectorAll('.boton-favorito').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const res = await this.gestor.alternarFavorito(id);
                const icono = btn.querySelector('i');
                if (res.esFavorito) {
                    icono.className = 'fa-solid fa-heart';
                    btn.style.color = '#ef4444';
                } else {
                    icono.className = 'fa-regular fa-heart';
                    btn.style.color = '';
                }
            });
        });
    }

    configurarBotonesAnadir() {
        document.querySelectorAll('.boton-anadir').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id  = btn.getAttribute('data-id');
                const res = await this.gestor.añadirAlCarrito(id);
                this.mostrarToast(res.mensaje, res.exito ? 'exito' : 'error');
            });
        });
    }

    configurarFiltros() {
        const mapa = {
            'Whey Protein': 'whey_protein',
            'Pre-workout':  'pre_workout',
            'Creatine':     'creatine'
        };
        this.botonesFiltro.forEach(btn => {
            btn.addEventListener('click', async () => {
                this.botonesFiltro.forEach(b => b.classList.remove('activo'));
                btn.classList.add('activo');
                this.categoriaActiva = mapa[btn.textContent.trim()];
                await this.renderizarProductos();
            });
        });
    }

    configurarBusqueda() {
        this.campoBusqueda?.addEventListener('input', async () => {
            const t = this.campoBusqueda.value.trim();
            const productos = t
                ? await this.gestor.buscarProductos(t)
                : await this.gestor.filtrarPorCategoria(this.categoriaActiva);
            const favoritos = await this.gestor.obtenerFavoritos();
            this.contenedor.innerHTML = '';
            // Reutilizamos el mismo render pasando los productos ya filtrados
            this._renderLista(productos, favoritos);
        });
    }

    _renderLista(productos, favoritos) {
        if (productos.length === 0) {
            this.contenedor.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:40px;color:#6b7280;">
                    <p>No se encontraron productos.</p>
                </div>`;
            return;
        }
        productos.forEach(producto => {
            const esFav = favoritos.includes(producto.id);
            const tarjeta = document.createElement('article');
            tarjeta.className = 'tarjeta-producto';
            const imgHTML = producto.imagen
                ? `<img src="${producto.imagen}" alt="${producto.nombre}" style="width:90px;height:110px;object-fit:cover;border-radius:10px;">`
                : `<div class="imagen-simulada">Pote</div>`;
            tarjeta.innerHTML = `
                <button class="boton-favorito" data-id="${producto.id}" style="${esFav ? 'color:#ef4444;' : ''}">
                    <i class="${esFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                </button>
                <div class="contenedor-imagen-producto">${imgHTML}</div>
                <h3 class="nombre-producto">${producto.nombre}</h3>
                <p class="descripcion-producto">${producto.descripcion || ''}</p>
                <div class="calificacion-estrellas">${this.generarEstrellas(producto.calificacion)}</div>
                <p class="precio-producto">$${producto.precio}</p>
                <p style="font-size:12px;color:#94a3b8;margin-bottom:8px;">Stock: ${producto.stock}</p>
                <button class="boton-anadir" data-id="${producto.id}">Añadir al Carrito</button>
            `;
            this.contenedor.appendChild(tarjeta);
        });
        this.configurarBotonesFavorito();
        this.configurarBotonesAnadir();
    }

    // ── Modal Carrito ────────────────────────────────────

    configurarCarritoModal() {
        // Al hacer clic en el botón de ver carrito (<li> o enlace interno)
        this.botonVerCarrito?.addEventListener('click', async (e) => {
            e.preventDefault();
            await this.abrirCarrito();
        });

        this.botonCerrarCarrito?.addEventListener('click', () => this.cerrarCarrito());

        window.addEventListener('click', (e) => {
            if (e.target === this.modalCarrito) this.cerrarCarrito();
        });

        this.botonVaciar?.addEventListener('click', async () => {
            if (confirm('¿Vaciar el carrito?')) {
                await this.gestor.vaciarCarrito();
                await this.renderizarTablaCarrito();
            }
        });
    }

    async abrirCarrito() {
        await this.renderizarTablaCarrito();
        this.modalCarrito?.classList.add('modal-carrito-activo');
    }

    cerrarCarrito() {
        this.modalCarrito?.classList.remove('modal-carrito-activo');
    }

    async renderizarTablaCarrito() {
        const tbody = document.getElementById('contenedor-items-carrito');
        if (!tbody) return;

        const { carrito, subtotalNeto, iva, total } = await this.gestor.calcularTotales();
        tbody.innerHTML = '';

        if (carrito.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:#94a3b8;">El carrito está vacío.</td></tr>`;
        } else {
            carrito.forEach(item => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${item.nombre}</td>
                    <td>$${item.precio.toFixed(2)}</td>
                    <td>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <button class="btn-cantidad" data-id="${item.id}" data-delta="-1" style="border:none;background:#f1f5f9;border-radius:6px;width:26px;height:26px;cursor:pointer;font-size:16px;">−</button>
                            <span>${item.cantidad}</span>
                            <button class="btn-cantidad" data-id="${item.id}" data-delta="1" style="border:none;background:#f1f5f9;border-radius:6px;width:26px;height:26px;cursor:pointer;font-size:16px;">+</button>
                        </div>
                    </td>
                    <td>$${(item.precio * item.cantidad).toFixed(2)}</td>
                    <td>
                        <button class="btn-eliminar-item" data-id="${item.id}" style="border:none;background:#fee2e2;color:#ef4444;border-radius:8px;padding:5px 10px;cursor:pointer;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(fila);
            });
        }

        document.getElementById('total-neto').textContent  = `$${subtotalNeto.toFixed(2)}`;
        document.getElementById('total-iva').textContent   = `$${iva.toFixed(2)}`;
        document.getElementById('gran-total').textContent  = `$${total.toFixed(2)}`;

        // Botones +/−
        document.querySelectorAll('.btn-cantidad').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id    = btn.getAttribute('data-id');
                const delta = parseInt(btn.getAttribute('data-delta'));
                const res   = await this.gestor.cambiarCantidadItem(id, delta);
                if (!res.exito) this.mostrarToast(res.mensaje, 'error');
                await this.renderizarTablaCarrito();
            });
        });

        // Botones eliminar
        document.querySelectorAll('.btn-eliminar-item').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                await this.gestor.cambiarCantidadItem(id, -9999);
                await this.renderizarTablaCarrito();
            });
        });
    }

    configurarBotonPagar() {
        const btnPagar     = document.getElementById('boton-proceder-pago');
        const btnPagarTest = document.getElementById('btn-pagar-test');

        const ejecutar = (e) => {
            e.preventDefault();
            window.ejecutarCheckout?.();
        };

        btnPagar?.addEventListener('click', ejecutar);
        btnPagarTest?.addEventListener('click', ejecutar);
    }

    mostrarToast(mensaje, tipo = 'exito') {
        document.querySelector('.toast-notif')?.remove();
        const t = document.createElement('div');
        t.className = 'toast-notif';
        t.textContent = mensaje;
        Object.assign(t.style, {
            position: 'fixed', bottom: '30px', right: '30px',
            padding: '14px 22px', borderRadius: '12px', fontWeight: '600',
            background: tipo === 'exito' ? '#10b981' : '#ef4444',
            color: '#fff', zIndex: '9999', boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
        });
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const ui = new InterfazCatalogo();
    await ui.inicializar();
});
