class InterfazAgregarProducto {
    constructor() {
        this.gestorProductos = new GestorProductos();
        this.formulario = document.querySelector('.product-form');
        this.imagenSeleccionada = null;
        this.inicializar();
    }

    inicializar() {
        this.verificarSesion();
        this.configurarAreaSubidaImagen();
        this.configurarEventosFormulario();
    }

    verificarSesion() {
        const persistencia = new PersistenciaJSON();
        const sesion = persistencia.leerArchivo('sesion.json');
        if (!sesion) {
            window.location.href = '../index.html';
        }
    }

    configurarAreaSubidaImagen() {
        const areaSubida = document.querySelector('.upload-area');
        if (!areaSubida) return;

        const entradaArchivo = document.createElement('input');
        entradaArchivo.type = 'file';
        entradaArchivo.accept = 'image/*';
        entradaArchivo.className = 'upload-input-oculto';
        entradaArchivo.id = 'entrada-imagen';
        areaSubida.appendChild(entradaArchivo);

        areaSubida.addEventListener('click', (evento) => {
            if (evento.target.closest('.preview-imagen')) return;
            entradaArchivo.click();
        });

        areaSubida.addEventListener('dragover', (evento) => {
            evento.preventDefault();
            areaSubida.style.borderColor = 'var(--color-primario)';
            areaSubida.style.backgroundColor = '#f8fafc';
        });

        areaSubida.addEventListener('dragleave', () => {
            areaSubida.style.borderColor = 'var(--color-borde)';
            areaSubida.style.backgroundColor = 'transparent';
        });

        areaSubida.addEventListener('drop', (evento) => {
            evento.preventDefault();
            areaSubida.style.borderColor = 'var(--color-borde)';
            areaSubida.style.backgroundColor = 'transparent';
            
            const archivo = evento.dataTransfer.files[0];
            if (archivo && archivo.type.startsWith('image/')) {
                this.procesarImagen(archivo);
            }
        });

        entradaArchivo.addEventListener('change', (evento) => {
            const archivo = evento.target.files[0];
            if (archivo) {
                this.procesarImagen(archivo);
            }
        });
    }

    procesarImagen(archivo) {
        const lector = new FileReader();
        lector.onload = (evento) => {
            this.imagenSeleccionada = evento.target.result;
            this.mostrarPreviewImagen(this.imagenSeleccionada);
        };
        lector.readAsDataURL(archivo);
    }

    mostrarPreviewImagen(imagenBase64) {
        const areaSubida = document.querySelector('.upload-area');
        areaSubida.classList.add('tiene-imagen');
        areaSubida.innerHTML = `
            <img src="${imagenBase64}" alt="Vista previa del producto" class="preview-imagen">
            <input type="file" accept="image/*" class="upload-input-oculto" id="entrada-imagen">
        `;
        this.configurarAreaSubidaImagen();
    }

    configurarEventosFormulario() {
        if (!this.formulario) return;

        this.formulario.addEventListener('submit', (evento) => {
            evento.preventDefault();
            this.publicarProducto();
        });

        const botonesSecundarios = document.querySelectorAll('.btn-secondary');
        botonesSecundarios.forEach(boton => {
            if (boton.textContent.trim() === 'Cancelar') {
                boton.addEventListener('click', () => {
                    window.location.href = 'catalogo.html';
                });
            }
            if (boton.textContent.trim() === 'Guardar como Borrador') {
                boton.addEventListener('click', () => {
                    this.guardarComoBorrador();
                });
            }
        });
    }

    obtenerDatosFormulario() {
        const nombre = document.getElementById('product-name')?.value.trim() || '';
        const categoria = document.getElementById('product-category')?.value || '';
        const marca = document.getElementById('product-brand')?.value || '';
        const precio = parseFloat(document.getElementById('list-price')?.value) || 0;
        const stock = parseInt(document.getElementById('current-stock')?.value) || 0;
        const descripcion = document.getElementById('full-description')?.value.trim() || '';

        return {
            nombre,
            categoria,
            marca,
            precio,
            stock,
            descripcion,
            imagen: this.imagenSeleccionada
        };
    }

    validarFormulario(datos) {
        if (!datos.nombre) {
            this.mostrarNotificacion('El nombre del producto es obligatorio.', 'error');
            return false;
        }
        if (!datos.categoria) {
            this.mostrarNotificacion('Selecciona una categoría.', 'error');
            return false;
        }
        if (!datos.marca) {
            this.mostrarNotificacion('Selecciona una marca.', 'error');
            return false;
        }
        if (isNaN(datos.precio) || datos.precio <= 0) {
            this.mostrarNotificacion('Ingresa un precio válido mayor a cero.', 'error');
            return false;
        }
        if (isNaN(datos.stock) || datos.stock < 0) {
            this.mostrarNotificacion('Ingresa un stock válido.', 'error');
            return false;
        }
        return true;
    }

    publicarProducto() {
        const datos = this.obtenerDatosFormulario();
        
        if (!this.validarFormulario(datos)) return;

        const resultado = this.gestorProductos.publicarProducto(datos);
        
        if (resultado.exito) {
            this.mostrarNotificacion(resultado.mensaje, 'exito');
            setTimeout(() => {
                window.location.href = 'catalogo.html';
            }, 1500);
        } else {
            this.mostrarNotificacion(resultado.mensaje, 'error');
        }
    }

    guardarComoBorrador() {
        const datos = this.obtenerDatosFormulario();
        
        if (!datos.nombre) {
            this.mostrarNotificacion('El nombre del producto es obligatorio incluso para borradores.', 'error');
            return;
        }

        const resultado = this.gestorProductos.guardarComoBorrador(datos);
        
        if (resultado.exito) {
            this.mostrarNotificacion(resultado.mensaje, 'exito');
            this.limpiarFormulario();
        } else {
            this.mostrarNotificacion(resultado.mensaje, 'error');
        }
    }

    limpiarFormulario() {
        this.formulario.reset();
        this.imagenSeleccionada = null;
        
        const areaSubida = document.querySelector('.upload-area');
        if (areaSubida) {
            areaSubida.classList.remove('tiene-imagen');
            areaSubida.innerHTML = `
                <i class="fa-solid fa-image upload-icon"></i>
                <p class="upload-text">Subir Imagen</p>
                <input type="file" accept="image/*" class="upload-input-oculto" id="entrada-imagen">
            `;
            this.configurarAreaSubidaImagen();
        }
    }

    mostrarNotificacion(mensaje, tipo) {
        const notificacionExistente = document.querySelector('.notificacion');
        if (notificacionExistente) {
            notificacionExistente.remove();
        }

        const notificacion = document.createElement('div');
        notificacion.className = `notificacion ${tipo}`;
        notificacion.textContent = mensaje;
        document.body.appendChild(notificacion);

        setTimeout(() => {
            notificacion.remove();
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new InterfazAgregarProducto();
});