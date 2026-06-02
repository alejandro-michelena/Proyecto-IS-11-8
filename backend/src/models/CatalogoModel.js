/*
  src/models/CatalogoModel.js — Lógica de consulta del catálogo público: filtrado,
  búsqueda y favoritos. Depende de ProductoRepository y UsuarioRepository
  (solo para leer sesión). Usado por CatalogoController.
*/

class CatalogoModel {
    #prodRepo    = new ProductoRepository();
    #usuarioRepo = new UsuarioRepository();

    async sesion()  { return this.#usuarioRepo.sesion(); }

    async porCategoria(categoria) {
        const todos = await this.#prodRepo.todos();
        const pub   = todos.filter(p => p.estado === 'publicado');
        return categoria ? pub.filter(p => p.categoria === categoria) : pub;
    }

    async buscar(termino) {
        const q    = termino.toLowerCase();
        const todos = await this.#prodRepo.todos();
        return todos.filter(p =>
            p.estado === 'publicado' &&
            (p.nombre.toLowerCase().includes(q) || (p.descripcion ?? '').toLowerCase().includes(q))
        );
    }

    async favoritos()          { return this.#prodRepo.favoritos(); }

    async toggleFavorito(id) {
        const lista = await this.#prodRepo.favoritos();
        const idx   = lista.indexOf(id);
        idx > -1 ? lista.splice(idx, 1) : lista.push(id);
        await this.#prodRepo.guardarFavoritos(lista);
        return { esFavorito: idx === -1 };
    }
}
