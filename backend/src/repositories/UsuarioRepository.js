/*
  src/repositories/UsuarioRepository.js — Acceso a usuarios.json y sesion.json.
  Único módulo autorizado a leer/escribir esos dos archivos.
  Usado por UsuarioModel. Depende de api (public/js/api.js).
*/

class UsuarioRepository {
    async todos()               { return await api.leer('usuarios.json') ?? []; }
    async guardar(lista)        { return api.escribir('usuarios.json', lista); }
    async porEmail(email)       { return (await this.todos()).find(u => u.email === email.toLowerCase().trim()) ?? null; }
    async existeEmail(email)    { return !!(await this.porEmail(email)); }
    async agregar(u)            { const lista = await this.todos(); lista.push(u); return this.guardar(lista); }

    async sesion()              { return api.leer('sesion.json'); }
    async guardarSesion(s)      { return api.escribir('sesion.json', s); }
    async cerrarSesion()        { return api.escribir('sesion.json', null); }
}
