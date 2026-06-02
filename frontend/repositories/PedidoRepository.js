/*
  src/repositories/PedidoRepository.js — Acceso a pedidos.json.
  Único módulo autorizado a leer/escribir pedidos.json.
  Usado por PedidoModel.
*/

class PedidoRepository {
    async todos()               { return await api.leer('pedidos.json') ?? []; }
    async guardar(lista)        { return api.escribir('pedidos.json', lista); }
    async porId(id)             { return (await this.todos()).find(p => p.id === id) ?? null; }
    async porCliente(uid)       { return (await this.todos()).filter(p => p.clienteId === uid); }
    async agregar(p)            { const lista = await this.todos(); lista.push(p); return this.guardar(lista); }
    async actualizarEstado(id, estado) {
        const lista  = await this.todos();
        const pedido = lista.find(p => p.id === id);
        if (!pedido) return false;
        pedido.estado = estado;
        return this.guardar(lista);
    }
}
