/*
  backend/repositories/UsuarioRepository.js

  Único módulo autorizado a leer/escribir usuarios.json y sesion.json.
  Accede al disco directamente a través de db.js (sin salto HTTP).
*/

import { db } from '../config/db.js';

export class UsuarioRepository {
    todos()            { return db.leer('usuarios.json') ?? []; }
    guardar(lista)     { return db.escribir('usuarios.json', lista); }
    porEmail(email)    { return this.todos().find(u => u.email === email.toLowerCase().trim()) ?? null; }
    existeEmail(email) { return !!this.porEmail(email); }
    agregar(u)         { const lista = this.todos(); lista.push(u); return this.guardar(lista); }

    sesion()           { return db.leer('sesion.json'); }
    guardarSesion(s)   { return db.escribir('sesion.json', s); }
    cerrarSesion()     { return db.escribir('sesion.json', null); }
}
