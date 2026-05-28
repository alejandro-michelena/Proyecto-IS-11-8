export class Producto {
    constructor(nombre, marca, precio, stock, categoria) {
        this.id = Date.now(); //este metodo genera un id irrepetible (el tiempo Unix)
        this.nombre = nombre;
        this.marca = marca; //para filtros
        this.precio = precio;
        this.stock = stock;
        this.categoria = categoria; //proteina, creatina, salud, pre-entreno, aminoacidos
        this.fechaAgregado = new Date().toISOString();
    }

    //(verificacion y ejecutacion de compra (si hay suficiente lo descuenta, si no no, y devuelve booleano))
    descontarStock(cantidad) {
        if (this.stock >= cantidad) {
            this.stock -= cantidad;
            return true;
        }
        return false;
    }
}