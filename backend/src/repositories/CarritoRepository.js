/*
  src/repositories/CarritoRepository.js — Acceso a carrito.json.
  El carrito se almacena como { [userId]: [items] }.
  Único módulo autorizado a leer/escribir carrito.json.
  Usado por CarritoModel.
*/

class CarritoRepository {
    async _todo()                       { return await api.leer('carrito.json') ?? {}; }
    async porUsuario(uid)               { return (await this._todo())[uid] ?? []; }
    async guardarUsuario(uid, carrito)  { const d = await this._todo(); d[uid] = carrito; return api.escribir('carrito.json', d); }
    async vaciarUsuario(uid)            { return this.guardarUsuario(uid, []); }
}
