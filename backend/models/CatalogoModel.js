/*
  backend/models/CatalogoModel.js

  Lógica de consulta del catálogo público: filtrado, búsqueda y favoritos.
*/

import { ProductoRepository } from '../repositories/ProductoRepository.js';
import { UsuarioRepository }  from '../repositories/UsuarioRepository.js';

export class CatalogoModel {
    #prodRepo    = new ProductoRepository();
    #usuarioRepo = new UsuarioRepository();

    sesion()  { return this.#usuarioRepo.sesion(); }

    porCategoria(categoria) {
        const pub = this.#prodRepo.todos().filter(p => p.estado === 'publicado');
        return categoria ? pub.filter(p => p.categoria === categoria) : pub;
    }

    buscar(termino) {
        const q = termino.toLowerCase();
        return this.#prodRepo.todos().filter(p =>
            p.estado === 'publicado' &&
            (p.nombre.toLowerCase().includes(q) || (p.descripcion ?? '').toLowerCase().includes(q))
        );
    }

    favoritos()       { return this.#prodRepo.favoritos(); }

    toggleFavorito(id) {
        const lista = this.#prodRepo.favoritos();
        const idx   = lista.indexOf(id);
        idx > -1 ? lista.splice(idx, 1) : lista.push(id);
        this.#prodRepo.guardarFavoritos(lista);
        return { esFavorito: idx === -1 };
    }
}
