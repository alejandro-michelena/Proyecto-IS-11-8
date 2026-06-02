/*
  src/models/PedidoModel.js — Lógica de negocio de pedidos.
  Orquesta la transacción: valida stock, descuenta, crea el pedido y vacía el carrito.
  Depende de PedidoRepository, CarritoRepository, ProductoRepository, UsuarioRepository.
  Usado por PedidoController.
*/

class PedidoModel {
    #pedidoRepo  = new PedidoRepository();
    #carritoRepo = new CarritoRepository();
    #prodRepo    = new ProductoRepository();
    #usuarioRepo = new UsuarioRepository();

    async todos()          { return this.#pedidoRepo.todos(); }
    async porCliente(uid)  { return this.#pedidoRepo.porCliente(uid); }
    async porId(id)        { return this.#pedidoRepo.porId(id); }

    async crear(metodoPago, detallesEnvio) {
        const sesion = await this.#usuarioRepo.sesion();
        if (!sesion?.id) return { ok: false, msg: 'Sin sesión activa.' };

        const carrito   = await this.#carritoRepo.porUsuario(sesion.id);
        if (!carrito.length) return { ok: false, msg: 'El carrito está vacío.' };

        const productos = await this.#prodRepo.todos();

        for (const item of carrito) {
            const prod = productos.find(p => p.id === item.id);
            if (!prod)               return { ok: false, msg: `"${item.nombre}" ya no existe.` };
            if (prod.stock < item.cantidad) return { ok: false, msg: `Stock insuficiente para "${prod.nombre}".` };
        }

        let subtotalNeto = 0;
        const items = carrito.map(item => {
            const prod  = productos.find(p => p.id === item.id);
            prod.stock -= item.cantidad;
            const sub   = item.precio * item.cantidad;
            subtotalNeto += sub;
            return { idProducto: item.id, nombre: item.nombre, precioUnitario: item.precio, cantidad: item.cantidad, subtotal: sub };
        });

        await this.#prodRepo.actualizarLista(productos);

        const iva   = Math.round(subtotalNeto * 0.16 * 100) / 100;
        const total = Math.round((subtotalNeto + iva) * 100) / 100;

        await this.#pedidoRepo.agregar({
            id:            `PED-${Date.now()}`,
            clienteId:     sesion.id,
            clienteNombre: sesion.nombre,
            fecha:         new Date().toISOString(),
            items, subtotalNeto, iva, total,
            estado:        'pendiente',
            metodoPago,
            detallesEnvio: { direccion: detallesEnvio.direccion ?? '', telefono: detallesEnvio.telefono ?? '' },
        });

        await this.#carritoRepo.vaciarUsuario(sesion.id);
        return { ok: true, msg: '¡Pedido generado exitosamente!' };
    }

    async actualizarEstado(id, estado) {
        const validos = ['pendiente', 'completado', 'cancelado'];
        if (!validos.includes(estado)) return { ok: false, msg: 'Estado no válido.' };
        const ok = await this.#pedidoRepo.actualizarEstado(id, estado);
        return ok ? { ok: true, msg: `Pedido marcado como ${estado}.` } : { ok: false, msg: 'Pedido no encontrado.' };
    }
}
