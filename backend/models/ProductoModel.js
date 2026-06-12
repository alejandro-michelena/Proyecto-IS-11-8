/*
  backend/models/ProductoModel.js

  Lógica de negocio de productos (publicar, borrador, eliminar).
*/

import { ProductoRepository } from '../repositories/ProductoRepository.js';

export class ProductoModel {
    #repo = new ProductoRepository();

    publicar(datos) {
        if (!datos.nombre || !datos.categoria || !datos.precio || datos.stock == null)
            return { ok: false, msg: 'Faltan campos: nombre, categoría, precio y stock.' };
        if (datos.precio <= 0)  return { ok: false, msg: 'El precio debe ser mayor a cero.' };
        if (datos.stock  <  0)  return { ok: false, msg: 'El stock no puede ser negativo.' };
        if (this.#repo.porNombre(datos.nombre)) return { ok: false, msg: 'Ya existe un producto con ese nombre.' };

        const producto = {
            id:            this.#repo.generarId(),
            nombre:        datos.nombre,
            categoria:     datos.categoria,
            marca:         datos.marca        ?? '',
            precio:        datos.precio,
            stock:         datos.stock,
            descripcion:   datos.descripcion  ?? '',
            imagen:        datos.imagen       ?? null,
            calificacion:  0,
            fechaCreacion: new Date().toISOString(),
            estado:        'publicado',
        };
        this.#repo.agregar(producto);
        return { ok: true, msg: 'Producto publicado.', producto };
    }

    guardarBorrador(datos) {
        if (!datos.nombre) return { ok: false, msg: 'El nombre es obligatorio.' };
        const borrador = {
            id:            this.#repo.generarId(),
            nombre:        datos.nombre,
            categoria:     datos.categoria   ?? '',
            marca:         datos.marca       ?? '',
            precio:        datos.precio      ?? 0,
            stock:         datos.stock       ?? 0,
            descripcion:   datos.descripcion ?? '',
            imagen:        datos.imagen      ?? null,
            calificacion:  0,
            fechaCreacion: new Date().toISOString(),
            estado:        'borrador',
        };
        this.#repo.agregarBorrador(borrador);
        return { ok: true, msg: 'Guardado como borrador.', producto: borrador };
    }

    eliminar(id) {
        const lista = this.#repo.todos();
        const idx   = lista.findIndex(p => p.id === id);
        if (idx > -1) { lista.splice(idx, 1); this.#repo.guardar(lista); return { ok: true }; }
        const borra = this.#repo.borradores();
        const idxB  = borra.findIndex(b => b.id === id);
        if (idxB > -1) { borra.splice(idxB, 1); this.#repo.guardarBorradores(borra); return { ok: true }; }
        return { ok: false, msg: 'Producto no encontrado.' };
    }
}
