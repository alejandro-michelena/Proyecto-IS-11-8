/*
  src/controllers/ProductoController.js — Maneja la vista agregar-producto.html.
  Gestiona subida de imagen, publicación y guardado como borrador.
  Instancia ProductoModel. Cargado solo en agregar-producto.html.
*/

class ProductoController {
    #model           = new ProductoModel();
    #imagenBase64    = null;

    constructor() {
        this.#verificarSesion();
        this.#initUpload();
        document.querySelector('.product-form')?.addEventListener('submit', e => { e.preventDefault(); this.#publicar(); });
        document.querySelectorAll('.btn-secondary').forEach(btn => {
            if (btn.textContent.trim() === 'Cancelar')               btn.addEventListener('click', () => location.href = 'catalogo.html');
            if (btn.textContent.trim() === 'Guardar como Borrador')  btn.addEventListener('click', () => this.#borrador());
        });
    }

    async #verificarSesion() {
        const s = await api.leer('sesion.json');
        if (!s?.id) location.href = 'index.html';
    }

    #initUpload() {
        const area   = document.querySelector('.upload-area');
        if (!area) return;
        const input  = document.createElement('input');
        input.type   = 'file'; input.accept = 'image/*'; input.style.display = 'none';
        area.appendChild(input);

        area.addEventListener('click',    e => { if (e.target.tagName !== 'IMG') input.click(); });
        area.addEventListener('dragover', e => { e.preventDefault(); area.style.borderColor = '#3b82f6'; });
        area.addEventListener('dragleave',  () => area.style.borderColor = '');
        area.addEventListener('drop',     e => { e.preventDefault(); area.style.borderColor = ''; this.#leerImagen(e.dataTransfer.files[0]); });
        input.addEventListener('change',  e => this.#leerImagen(e.target.files[0]));
    }

    #leerImagen(archivo) {
        if (!archivo?.type.startsWith('image/')) return;
        const r = new FileReader();
        r.onload = e => {
            this.#imagenBase64 = e.target.result;
            const area = document.querySelector('.upload-area');
            area.innerHTML = `<img src="${this.#imagenBase64}" style="max-height:150px;border-radius:10px;">`;
            this.#initUpload();
        };
        r.readAsDataURL(archivo);
    }

    #datos() {
        return {
            nombre:      document.getElementById('product-name')?.value.trim()     ?? '',
            categoria:   document.getElementById('product-category')?.value        ?? '',
            marca:       document.getElementById('product-brand')?.value           ?? '',
            precio:      parseFloat(document.getElementById('list-price')?.value)  || 0,
            stock:       parseInt(document.getElementById('current-stock')?.value) || 0,
            descripcion: document.getElementById('full-description')?.value.trim() ?? '',
            imagen:      this.#imagenBase64,
        };
    }

    async #publicar() {
        const r = await this.#model.publicar(this.#datos());
        this.#toast(r.msg, r.ok ? 'exito' : 'error');
        if (r.ok) setTimeout(() => location.href = 'catalogo.html', 1500);
    }

    async #borrador() {
        const r = await this.#model.guardarBorrador(this.#datos());
        this.#toast(r.msg, r.ok ? 'exito' : 'error');
        if (r.ok) { document.querySelector('.product-form').reset(); this.#imagenBase64 = null; }
    }

    #toast(msg, tipo) {
        document.querySelector('.toast-prod')?.remove();
        const d = document.createElement('div');
        d.className = 'toast-prod'; d.textContent = msg;
        Object.assign(d.style, { position:'fixed', bottom:'30px', right:'30px', padding:'14px 22px',
            borderRadius:'12px', fontWeight:'600', color:'#fff', zIndex:'9999',
            background: tipo === 'exito' ? '#10b981' : '#ef4444' });
        document.body.appendChild(d);
        setTimeout(() => d.remove(), 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => new ProductoController());
