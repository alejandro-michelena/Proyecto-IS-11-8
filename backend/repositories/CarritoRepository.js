/*
  backend/repositories/CarritoRepository.js

  Único módulo autorizado a leer/escribir carrito.json.
  El carrito se almacena como { [userId]: [items] }.
  Accede al disco directamente a través de db.js (sin salto HTTP).
*/

import { db } from '../config/db.js';

export class CarritoRepository {
    _todo()                      { return db.leer('carrito.json') ?? {}; }
    porUsuario(uid)              { return this._todo()[uid] ?? []; }
    guardarUsuario(uid, carrito) { const d = this._todo(); d[uid] = carrito; return db.escribir('carrito.json', d); }
    vaciarUsuario(uid)           { return this.guardarUsuario(uid, []); }
}
