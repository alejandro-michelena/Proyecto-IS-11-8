export class PersistenciaJSON {
    constructor() {
        this.rutaBase = 'data';
        this.inicializarAlmacenamiento();
    }

    inicializarAlmacenamiento() {
        const archivosReales = [
            'productos.json',
            'usuarios.json',
            'carrito.json',
            'pedidos.json'
        ];

        archivosReales.forEach(archivo => {
            const rutaCompleta = `${this.rutaBase}/${archivo}`;
            if (!localStorage.getItem(rutaCompleta)) {
                localStorage.setItem(rutaCompleta, JSON.stringify([])); 
            }
        });
    }

    leerArchivo(nombreArchivo) {
        const rutaCompleta = `${this.rutaBase}/${nombreArchivo}`;
        const datos = localStorage.getItem(rutaCompleta);
        if (!datos) return null;
        return JSON.parse(datos);
    }

    escribirArchivo(nombreArchivo, datos) {
        const rutaCompleta = `${this.rutaBase}/${nombreArchivo}`;
        localStorage.setItem(rutaCompleta, JSON.stringify(datos, null, 2));
    }

    exportarTodo() {
        const archivos = ['productos.json', 'usuarios.json', 'carrito.json', 'pedidos.json'];
        const datosCompletos = {};
        
        archivos.forEach(archivo => {
            datosCompletos[archivo] = this.leerArchivo(archivo);
        });
        return datosCompletos;
    }

    importarTodo(datosCompletos) {
        for (const [nombreArchivo, contenido] of Object.entries(datosCompletos)) {
            this.escribirArchivo(nombreArchivo, contenido);
        }
        return { exito: true, mensaje: 'Datos importados exitosamente.' };
    }

    descargarRespaldo() {
        const datos = this.exportarTodo();
        const archivoJSON = JSON.stringify(datos, null, 2);
        const blob = new Blob([archivoJSON], { type: 'application/json' });
        const enlace = document.createElement('a');
        enlace.href = URL.createObjectURL(blob);
        enlace.download = 'respaldo_sistema_' + new Date().toISOString().slice(0, 10) + '.json';
        enlace.click();
    }
}