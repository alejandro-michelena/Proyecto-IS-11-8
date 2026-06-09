/*
  src/repositories/ProductoRepository.js — Acceso a productos.json, borradores.json,
  contador_productos.json y favoritos.json.
  Único módulo autorizado a leer/escribir esos archivos.
  Usado por ProductoModel y CatalogoModel.
*/

class ProductoRepository {
    async todos()                  { return await api.leer('productos.json') ?? []; }
    async guardar(lista)           { return api.escribir('productos.json', lista); }
    async porId(id)                { return (await this.todos()).find(p => p.id === id) ?? null; }
    async porNombre(nombre)        { return (await this.todos()).find(p => p.nombre.trim().toLowerCase() === nombre.trim().toLowerCase()) ?? null; }
    async agregar(p)               { const lista = await this.todos(); lista.push(p); return this.guardar(lista); }
    async actualizarLista(lista)   { return this.guardar(lista); }

    async borradores()             { return await api.leer('borradores.json') ?? []; }
    async guardarBorradores(lista) { return api.escribir('borradores.json', lista); }
    async agregarBorrador(b)       { const lista = await this.borradores(); lista.push(b); return this.guardarBorradores(lista); }

    async favoritos()              { return await api.leer('favoritos.json') ?? []; }
    async guardarFavoritos(lista)  { return api.escribir('favoritos.json', lista); }

    async generarId() {
        const c = (await api.leer('contador_productos.json')) ?? { contador: 0 };
        c.contador += 1;
        await api.escribir('contador_productos.json', c);
        return 'prod_' + String(c.contador).padStart(3, '0');
    }
}
