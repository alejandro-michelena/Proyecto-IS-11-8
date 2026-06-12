/*
  backend/repositories/PedidoRepository.js

  Único módulo autorizado a leer/escribir pedidos.json.
  Accede al disco directamente a través de db.js (sin salto HTTP).
*/

import { db } from '../config/db.js';

export class PedidoRepository {
    todos()        { return db.leer('pedidos.json') ?? []; }
    guardar(lista) { return db.escribir('pedidos.json', lista); }
    porId(id)      { return this.todos().find(p => p.id === id) ?? null; }
    porCliente(uid){ return this.todos().filter(p => p.clienteId === uid); }
    agregar(p)     { const lista = this.todos(); lista.push(p); return this.guardar(lista); }

    actualizarEstado(id, estado) {
        const lista  = this.todos();
        const pedido = lista.find(p => p.id === id);
        if (!pedido) return false;
        pedido.estado = estado;
        return this.guardar(lista);
    }
}
