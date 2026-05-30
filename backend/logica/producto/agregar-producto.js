/**
 * InterfazAgregarProducto
 * ───────────────────────
 * Controlador de la vista agregar-producto.html.
 * Depende de: PersistenciaCliente, GestorProductos
 */
class InterfazAgregarProducto {
    constructor() {
        this.gestorProductos   = new GestorProductos();
        this.formulario        = document.querySelector('.product-form');
        this.imagenSeleccionada = null;
        this.inicializar();
    }

    async inicializar() {
        await this.verificarSesion();
        this.configurarAreaSubidaImagen();
        this.configurarEventosFormulario();
    }

    async verificarSesion() {
        const persistencia = new PersistenciaCliente();
        const sesion = await persistencia.leerArchivo('sesion.json');
        if (!sesion || !sesion.id) {
            window.location.href = 'index.html';
        }
    }

    configurarAreaSubidaImagen() {
        const areaSubida = document.querySelector('.upload-area');
        if (!areaSubida) return;

        // Limpia listeners previos reemplazando el nodo
        const nueva = areaSubida.cloneNode(true);
        areaSubida.parentNode.replaceChild(nueva, areaSubida);
        const area = document.querySelector('.upload-area');

        const entradaArchivo = document.createElement('input');
        entradaArchivo.type = 'file';
        entradaArchivo.accept = 'image/*';
        entradaArchivo.style.display = 'none';
        area.appendChild(entradaArchivo);

        area.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') return;
            entradaArchivo.click();
        });

        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.style.borderColor = 'var(--color-primario)';
        });

        area.addEventListener('dragleave', () => {
            area.style.borderColor = 'var(--color-borde)';
        });

        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.style.borderColor = 'var(--color-borde)';
            const archivo = e.dataTransfer.files[0];
            if (archivo?.type.startsWith('image/')) this.procesarImagen(archivo);
        });

        entradaArchivo.addEventListener('change', (e) => {
            const archivo = e.target.files[0];
            if (archivo) this.procesarImagen(archivo);
        });
    }

    procesarImagen(archivo) {
        const lector = new FileReader();
        lector.onload = (e) => {
            this.imagenSeleccionada = e.target.result;
            this.mostrarPreviewImagen(this.imagenSeleccionada);
        };
        lector.readAsDataURL(archivo);
    }

    mostrarPreviewImagen(imagenBase64) {
        const area = document.querySelector('.upload-area');
        if (!area) return;
        area.innerHTML = `<img src="${imagenBase64}" alt="Vista previa" style="max-height:150px; border-radius:10px;">`;
        area.style.padding = '10px';
        this.configurarAreaSubidaImagen();
    }

    configurarEventosFormulario() {
        if (!this.formulario) return;

        this.formulario.addEventListener('submit', (e) => {
            e.preventDefault();
            this.publicarProducto();
        });

        document.querySelectorAll('.btn-secondary').forEach(boton => {
            if (boton.textContent.trim() === 'Cancelar') {
                boton.addEventListener('click', () => { window.location.href = 'catalogo.html'; });
            }
            if (boton.textContent.trim() === 'Guardar como Borrador') {
                boton.addEventListener('click', () => this.guardarComoBorrador());
            }
        });
    }

    obtenerDatosFormulario() {
        return {
            nombre:      document.getElementById('product-name')?.value.trim()    || '',
            categoria:   document.getElementById('product-category')?.value       || '',
            marca:       document.getElementById('product-brand')?.value          || '',
            precio:      parseFloat(document.getElementById('list-price')?.value) || 0,
            stock:       parseInt(document.getElementById('current-stock')?.value) || 0,
            descripcion: document.getElementById('full-description')?.value.trim() || '',
            imagen:      this.imagenSeleccionada
        };
    }

    async publicarProducto() {
        const datos = this.obtenerDatosFormulario();
        const resultado = await this.gestorProductos.publicarProducto(datos);

        if (resultado.exito) {
            this.mostrarNotificacion(resultado.mensaje, 'exito');
            setTimeout(() => { window.location.href = 'catalogo.html'; }, 1500);
        } else {
            this.mostrarNotificacion(resultado.mensaje, 'error');
        }
    }

    async guardarComoBorrador() {
        const datos = this.obtenerDatosFormulario();
        const resultado = await this.gestorProductos.guardarComoBorrador(datos);

        if (resultado.exito) {
            this.mostrarNotificacion(resultado.mensaje, 'exito');
            this.formulario.reset();
            this.imagenSeleccionada = null;
        } else {
            this.mostrarNotificacion(resultado.mensaje, 'error');
        }
    }

    mostrarNotificacion(mensaje, tipo) {
        document.querySelector('.notificacion')?.remove();
        const n = document.createElement('div');
        n.className = `notificacion ${tipo}`;
        n.textContent = mensaje;
        Object.assign(n.style, {
            position: 'fixed', bottom: '30px', right: '30px',
            padding: '14px 22px', borderRadius: '12px', fontWeight: '600',
            background: tipo === 'exito' ? '#10b981' : '#ef4444',
            color: '#fff', zIndex: '9999', boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
        });
        document.body.appendChild(n);
        setTimeout(() => n.remove(), 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new InterfazAgregarProducto();
});
