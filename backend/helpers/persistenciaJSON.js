export class PersistenciaJSON {
    constructor() {
        this.inicializarAlmacenamiento();
    }

    inicializarAlmacenamiento() {
        const archivosJSON = [
            'productos.json',
            'usuarios.json',
            'carrito.json',
            'pedidos.json'
        ];

        archivosJSON.forEach(archivo => {
            const ruta = `data/${archivo}`;
            if (!localStorage.getItem(ruta)) {
                localStorage.setItem(ruta, JSON.stringify([]));
            }
        });
    }

    leerArchivo(nombreArchivo) {
        const ruta = `data/${nombreArchivo}`;
        const datos = localStorage.getItem(ruta);
        if (!datos) return null;
        return JSON.parse(datos);
    }

    escribirArchivo(nombreArchivo, datos) {
        const ruta = `data/${nombreArchivo}`;
        localStorage.setItem(ruta, JSON.stringify(datos, null, 2));
    }
}