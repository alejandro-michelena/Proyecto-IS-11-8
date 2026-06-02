/*
  src/models/CarritoModel.js — Lógica de negocio del carrito de compras.
  Lee la sesión activa vía UsuarioRepository para identificar al usuario.
  Lee stock vía ProductoRepository. Persiste vía CarritoRepository.
  Usado por CarritoController.
*/

class CarritoModel {
    #carritoRepo = new CarritoRepository();
    #prodRepo    = new ProductoRepository();
    #usuarioRepo = new UsuarioRepository();

    async #uid() {
        const s = await this.#usuarioRepo.sesion();
        return s?.id ?? null;
    }

    async obtener()  { return this.#carritoRepo.porUsuario(await this.#uid()); }

    async totales() {
        const carrito      = await this.obtener();
        const subtotalNeto = carrito.reduce((a, i) => a + i.precio * i.cantidad, 0);
        const iva          = Math.round(subtotalNeto * 0.16 * 100) / 100;
        return { carrito, subtotalNeto, iva, total: Math.round((subtotalNeto + iva) * 100) / 100 };
    }

    async agregar(idProducto) {
        const prod = await this.#prodRepo.porId(idProducto);
        if (!prod)           return { ok: false, msg: 'Producto no encontrado.' };
        if (prod.stock <= 0) return { ok: false, msg: 'Sin stock disponible.' };

        const uid     = await this.#uid();
        const carrito = await this.#carritoRepo.porUsuario(uid);
        const item    = carrito.find(i => i.id === idProducto);

        if (item) {
            if (item.cantidad >= prod.stock) return { ok: false, msg: `Sin más unidades de ${prod.nombre}.` };
            item.cantidad++;
        } else {
            carrito.push({ id: prod.id, nombre: prod.nombre, precio: prod.precio, cantidad: 1 });
        }
        await this.#carritoRepo.guardarUsuario(uid, carrito);
        return { ok: true, msg: `${prod.nombre} agregado.` };
    }

    async eliminar(idProducto) {
        const uid     = await this.#uid();
        const carrito = await this.#carritoRepo.porUsuario(uid);
        const idx     = carrito.findIndex(i => i.id === idProducto);
        if (idx === -1) return { ok: false, msg: 'Ítem no encontrado.' };
        carrito.splice(idx, 1);
        await this.#carritoRepo.guardarUsuario(uid, carrito);
        return { ok: true };
    }

    async modificarCantidad(idProducto, nuevaCantidad) {
        if (nuevaCantidad <= 0) return this.eliminar(idProducto);
        const prod    = await this.#prodRepo.porId(idProducto);
        const uid     = await this.#uid();
        const carrito = await this.#carritoRepo.porUsuario(uid);
        const item    = carrito.find(i => i.id === idProducto);
        if (!item) return { ok: false, msg: 'Ítem no encontrado.' };
        if (prod && nuevaCantidad > prod.stock) return { ok: false, msg: `Stock insuficiente. Disponible: ${prod.stock}.` };
        item.cantidad = nuevaCantidad;
        await this.#carritoRepo.guardarUsuario(uid, carrito);
        return { ok: true };
    }

    async vaciar() {
        return this.#carritoRepo.vaciarUsuario(await this.#uid());
    }
}
