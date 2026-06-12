/*
  backend/models/CarritoModel.js

  Lógica de negocio del carrito de compras.
*/

import { CarritoRepository }  from '../repositories/CarritoRepository.js';
import { ProductoRepository } from '../repositories/ProductoRepository.js';
import { UsuarioRepository }  from '../repositories/UsuarioRepository.js';

export class CarritoModel {
    #carritoRepo = new CarritoRepository();
    #prodRepo    = new ProductoRepository();
    #usuarioRepo = new UsuarioRepository();

    #uid() {
        return this.#usuarioRepo.sesion()?.id ?? null;
    }

    obtener()  { return this.#carritoRepo.porUsuario(this.#uid()); }

    totales() {
        const carrito      = this.obtener();
        const subtotalNeto = carrito.reduce((a, i) => a + i.precio * i.cantidad, 0);
        const iva          = Math.round(subtotalNeto * 0.16 * 100) / 100;
        return { carrito, subtotalNeto, iva, total: Math.round((subtotalNeto + iva) * 100) / 100 };
    }

    agregar(idProducto) {
        const prod = this.#prodRepo.porId(idProducto);
        if (!prod)           return { ok: false, msg: 'Producto no encontrado.' };
        if (prod.stock <= 0) return { ok: false, msg: 'Sin stock disponible.' };

        const uid     = this.#uid();
        const carrito = this.#carritoRepo.porUsuario(uid);
        const item    = carrito.find(i => i.id === idProducto);

        if (item) {
            if (item.cantidad >= prod.stock) return { ok: false, msg: `Sin más unidades de ${prod.nombre}.` };
            item.cantidad++;
        } else {
            carrito.push({ id: prod.id, nombre: prod.nombre, precio: prod.precio, cantidad: 1 });
        }
        this.#carritoRepo.guardarUsuario(uid, carrito);
        return { ok: true, msg: `${prod.nombre} agregado.` };
    }

    eliminar(idProducto) {
        const uid     = this.#uid();
        const carrito = this.#carritoRepo.porUsuario(uid);
        const idx     = carrito.findIndex(i => i.id === idProducto);
        if (idx === -1) return { ok: false, msg: 'Ítem no encontrado.' };
        carrito.splice(idx, 1);
        this.#carritoRepo.guardarUsuario(uid, carrito);
        return { ok: true };
    }

    modificarCantidad(idProducto, nuevaCantidad) {
        if (nuevaCantidad <= 0) return this.eliminar(idProducto);
        const prod    = this.#prodRepo.porId(idProducto);
        const uid     = this.#uid();
        const carrito = this.#carritoRepo.porUsuario(uid);
        const item    = carrito.find(i => i.id === idProducto);
        if (!item) return { ok: false, msg: 'Ítem no encontrado.' };
        if (prod && nuevaCantidad > prod.stock) return { ok: false, msg: `Stock insuficiente. Disponible: ${prod.stock}.` };
        item.cantidad = nuevaCantidad;
        this.#carritoRepo.guardarUsuario(uid, carrito);
        return { ok: true };
    }

    vaciar() {
        return this.#carritoRepo.vaciarUsuario(this.#uid());
    }
}
