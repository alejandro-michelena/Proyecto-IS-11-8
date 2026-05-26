import fs from 'fs';
import path from 'path';

export class PersistenciaJSON {
    constructor() {
        // apunta a la ruta absoluta de la carpeta backend/data
        this.directorioData = path.resolve('backend/data');
        this.inicializarAlmacenamiento();
    }

    inicializarAlmacenamiento() {
        if (!fs.existsSync(this.directorioData)) {
            fs.mkdirSync(this.directorioData, { recursive: true });
        }

        const archivosReales = [
            'productos.json',
            'usuarios.json',
            'carrito.json',
            'pedidos.json'
        ];

        archivosReales.forEach(archivo => {
            const rutaCompleta = path.join(this.directorioData, archivo);
            if (!fs.existsSync(rutaCompleta)) {
                fs.writeFileSync(rutaCompleta, JSON.stringify([], null, 2), 'utf-8');
            }
        });
    }

    leerArchivo(nombreArchivo) {
        try {
            const rutaCompleta = path.join(this.directorioData, nombreArchivo);
            if (!fs.existsSync(rutaCompleta)) return null;
            
            const contenidoTexto = fs.readFileSync(rutaCompleta, 'utf-8');
            return JSON.parse(contenidoTexto);
        } catch (error) {
            console.error(`Error al leer el archivo físico ${nombreArchivo}:`, error);
            return null;
        }
    }

    escribirArchivo(nombreArchivo, datos) {
        try {
            const rutaCompleta = path.join(this.directorioData, nombreArchivo);
            fs.writeFileSync(rutaCompleta, JSON.stringify(datos, null, 2), 'utf-8');
            return true;
        } catch (error) {
            console.error(`Error al escribir en el archivo físico ${nombreArchivo}:`, error);
            return false;
        }
    }
}