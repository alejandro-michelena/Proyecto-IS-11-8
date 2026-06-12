/*
  backend/repositories/ProductoRepository.js

  Único módulo autorizado a leer/escribir productos.json, borradores.json,
  contador_productos.json y favoritos.json.
  Accede al disco directamente a través de db.js (sin salto HTTP).
*/

import { db } from '../config/db.js';

export class ProductoRepository {
    todos()                  { return db.leer('productos.json') ?? []; }
    guardar(lista)           { return db.escribir('productos.json', lista); }
    porId(id)                { return this.todos().find(p => p.id === id) ?? null; }
    porNombre(nombre)        { return this.todos().find(p => p.nombre.trim().toLowerCase() === nombre.trim().toLowerCase()) ?? null; }
    agregar(p)               { const lista = this.todos(); lista.push(p); return this.guardar(lista); }
    actualizarLista(lista)   { return this.guardar(lista); }

    borradores()             { return db.leer('borradores.json') ?? []; }
    guardarBorradores(lista) { return db.escribir('borradores.json', lista); }
    agregarBorrador(b)       { const lista = this.borradores(); lista.push(b); return this.guardarBorradores(lista); }

    favoritos()              { return db.leer('favoritos.json') ?? []; }
    guardarFavoritos(lista)  { return db.escribir('favoritos.json', lista); }

    generarId() {
        const c = db.leer('contador_productos.json') ?? { contador: 0 };
        c.contador += 1;
        db.escribir('contador_productos.json', c);
        return 'prod_' + String(c.contador).padStart(3, '0');
    }
}
