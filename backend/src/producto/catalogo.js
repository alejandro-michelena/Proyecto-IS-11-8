class GestorCatalogo {
    constructor() {
        this.persistencia = new PersistenciaJSON();
        this.ARCHIVO_PRODUCTOS = 'productos.json';
        this.ARCHIVO_CARRITO = 'carrito.json';
        this.ARCHIVO_FAVORITOS = 'favoritos.json';
        this.ARCHIVO_SESION = 'sesion.json';
    
        this.productos = this.cargarProductos();
        this.verificarSesion();
    }

    verificarSesion() {
    const sesion = this.persistencia.leerArchivo('sesion.json');
        if (!sesion) {
            window.location.href = '../index.html';
            return false;
        }
        return true;
    }

    cargarProductos() {
        return this.persistencia.leerArchivo(this.ARCHIVO_PRODUCTOS) || [];
    }

    guardarProductos(productos) {
        this.persistencia.escribirArchivo(this.ARCHIVO_PRODUCTOS, productos);
    }

    recargarProductos() {
        this.productos = this.cargarProductos();
    }

    obtenerCarrito() {
        return this.persistencia.leerArchivo(this.ARCHIVO_CARRITO) || [];
    }

    guardarCarrito(carrito) {
        this.persistencia.escribirArchivo(this.ARCHIVO_CARRITO, carrito);
    }

    añadirAlCarrito(idProducto) {
        const carrito = this.obtenerCarrito();
        const producto = this.productos.find(p => p.id === idProducto);
        
        if (!producto) return { exito: false, mensaje: 'Producto no encontrado.' };

        const itemExistente = carrito.find(item => item.id === idProducto);
        
        if (itemExistente) {
            if (itemExistente.cantidad >= producto.stock) {
                return { exito: false, mensaje: 'No hay suficiente stock disponible.' };
            }
            itemExistente.cantidad += 1;
        } else {
            carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: 1
            });
        }

        this.guardarCarrito(carrito);
        return { exito: true, mensaje: `${producto.nombre} añadido al carrito.` };
    }

    obtenerFavoritos() {
        return this.persistencia.leerArchivo(this.ARCHIVO_FAVORITOS) || [];
    }

    guardarFavoritos(favoritos) {
        this.persistencia.escribirArchivo(this.ARCHIVO_FAVORITOS, favoritos);
    }

    alternarFavorito(idProducto) {
        const favoritos = this.obtenerFavoritos();
        const indice = favoritos.indexOf(idProducto);
        
        if (indice > -1) {
            favoritos.splice(indice, 1);
        } else {
            favoritos.push(idProducto);
        }
        
        this.guardarFavoritos(favoritos);
        return { 
            exito: true, 
            esFavorito: indice === -1,
            mensaje: indice === -1 ? 'Añadido a favoritos.' : 'Eliminado de favoritos.'
        };
    }

    filtrarPorCategoria(categoria) {
        if (!categoria) return this.productos.filter(p => p.estado === 'publicado');
        return this.productos.filter(p => p.categoria === categoria && p.estado === 'publicado');
    }

    buscarProductos(termino) {
        const busqueda = termino.toLowerCase();
        return this.productos.filter(
            p => p.estado === 'publicado' && 
                 (p.nombre.toLowerCase().includes(busqueda) || 
                  p.descripcion.toLowerCase().includes(busqueda))
        );
    }
}

class InterfazCatalogo {
    constructor() {
        this.gestorCatalogo = new GestorCatalogo();
        this.contenedorProductos = document.querySelector('.cuadricula-productos');
        this.campoBusqueda = document.querySelector('.campo-busqueda');
        this.botonesFiltro = document.querySelectorAll('.boton-filtro');
        this.categoriaActiva = 'whey_protein';
        this.productosMostrados = [];
        this.inicializar();
    }

    inicializar() {
        this.productosMostrados = this.gestorCatalogo.filtrarPorCategoria(this.categoriaActiva);
        this.renderizarProductos(this.productosMostrados);
        this.configurarFiltros();
        this.configurarBusqueda();
    }

    generarEstrellas(calificacion) {
        let htmlEstrellas = '';
        for (let i = 0; i < calificacion; i++) {
            htmlEstrellas += '<i class="fa-solid fa-star"></i>';
        }
        return htmlEstrellas;
    }

    renderizarProductos(productos) {
        this.contenedorProductos.innerHTML = '';
        
        if (productos.length === 0) {
            this.contenedorProductos.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6b7280;">
                    <i class="fa-solid fa-box-open" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                    <p>No se encontraron productos en esta categoría.</p>
                </div>
            `;
            return;
        }
        
        productos.forEach(producto => {
            const favoritos = this.gestorCatalogo.obtenerFavoritos();
            const esFavorito = favoritos.includes(producto.id);
            const claseCorazon = esFavorito ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
            const estiloCorazon = esFavorito ? 'color: #ef4444;' : '';
            
            const tarjeta = document.createElement('article');
            tarjeta.className = 'tarjeta-producto';
            
            let contenidoImagen = '';
            if (producto.imagen) {
                contenidoImagen = `<img src="${producto.imagen}" alt="${producto.nombre}" style="width: 90px; height: 110px; object-fit: cover; border-radius: 10px;">`;
            } else {
                contenidoImagen = `<div class="imagen-simulada">Pote</div>`;
            }
            
            tarjeta.innerHTML = `
                <button class="boton-favorito" data-id="${producto.id}" style="${estiloCorazon}">
                    <i class="${claseCorazon}"></i>
                </button>
                <div class="contenedor-imagen-producto">
                    ${contenidoImagen}
                </div>
                <h3 class="nombre-producto">${producto.nombre}</h3>
                <p class="descripcion-producto">${producto.descripcion}</p>
                <div class="calificacion-estrellas">
                    ${this.generarEstrellas(producto.calificacion)}
                </div>
                <p class="precio-producto">$${producto.precio}</p>
                <button class="boton-anadir" data-id="${producto.id}">Añadir al Carrito</button>
            `;
            
            this.contenedorProductos.appendChild(tarjeta);
        });

        this.configurarBotonesFavorito();
        this.configurarBotonesAnadir();
    }

    configurarBotonesFavorito() {
        const botonesFavorito = document.querySelectorAll('.boton-favorito');
        botonesFavorito.forEach(boton => {
            boton.addEventListener('click', (evento) => {
                const idProducto = evento.currentTarget.getAttribute('data-id');
                const resultado = this.gestorCatalogo.alternarFavorito(idProducto);
                
                const icono = evento.currentTarget.querySelector('i');
                if (resultado.esFavorito) {
                    icono.classList.remove('fa-regular');
                    icono.classList.add('fa-solid');
                    evento.currentTarget.style.color = '#ef4444';
                } else {
                    icono.classList.remove('fa-solid');
                    icono.classList.add('fa-regular');
                    evento.currentTarget.style.color = '';
                }
                
                this.mostrarAlerta(resultado.mensaje);
            });
        });
    }

    configurarBotonesAnadir() {
        const botonesAnadir = document.querySelectorAll('.boton-anadir');
        botonesAnadir.forEach(boton => {
            boton.addEventListener('click', (evento) => {
                const idProducto = evento.currentTarget.getAttribute('data-id');
                const resultado = this.gestorCatalogo.añadirAlCarrito(idProducto);
                this.mostrarAlerta(resultado.mensaje);
            });
        });
    }

    configurarFiltros() {
        const mapaCategorias = {
            'Whey Protein': 'whey_protein',
            'Pre-workout': 'pre_workout',
            'Creatine': 'creatine'
        };

        this.botonesFiltro.forEach(boton => {
            boton.addEventListener('click', () => {
                this.botonesFiltro.forEach(b => b.classList.remove('activo'));
                boton.classList.add('activo');
                
                const textoCategoria = boton.textContent.trim();
                this.categoriaActiva = mapaCategorias[textoCategoria];
                this.gestorCatalogo.recargarProductos();
                this.productosMostrados = this.gestorCatalogo.filtrarPorCategoria(this.categoriaActiva);
                this.renderizarProductos(this.productosMostrados);
            });
        });
    }

    configurarBusqueda() {
        this.campoBusqueda.addEventListener('input', () => {
            const termino = this.campoBusqueda.value.trim();
            this.gestorCatalogo.recargarProductos();
            
            if (termino === '') {
                this.productosMostrados = this.gestorCatalogo.filtrarPorCategoria(this.categoriaActiva);
            } else {
                this.productosMostrados = this.gestorCatalogo.buscarProductos(termino);
            }
            
            this.renderizarProductos(this.productosMostrados);
        });
    }

    mostrarAlerta(mensaje) {
        alert(mensaje);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new InterfazCatalogo();
});