import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PersistenciaJSON {
    constructor() {
        // Siempre apunta a backend/data/ sin importar desde dónde se llame
        this.directorioData = path.join(__dirname, '../data');
        this.inicializarAlmacenamiento();
    }

    inicializarAlmacenamiento() {
        if (!fs.existsSync(this.directorioData)) {
            fs.mkdirSync(this.directorioData, { recursive: true });
        }

        const archivosIniciales = {
            'productos.json':          [],
            'usuarios.json':           [],
            'carrito.json':            [],
            'pedidos.json':            [],
            'sesion.json':             null,
            'favoritos.json':          [],
            'borradores.json':         [],
            'contador_productos.json': { contador: 0 }
        };

        Object.entries(archivosIniciales).forEach(([archivo, valorDefecto]) => {
            const rutaCompleta = path.join(this.directorioData, archivo);
            if (!fs.existsSync(rutaCompleta)) {
                fs.writeFileSync(
                    rutaCompleta,
                    JSON.stringify(valorDefecto, null, 2),
                    'utf-8'
                );
            }
        });
    }

    leerArchivo(nombreArchivo) {
        try {
            const rutaCompleta = path.join(this.directorioData, nombreArchivo);
            if (!fs.existsSync(rutaCompleta)) return null;
            const contenido = fs.readFileSync(rutaCompleta, 'utf-8').trim();
            if (!contenido) return null;
            return JSON.parse(contenido);
        } catch (error) {
            console.error(`Error al leer ${nombreArchivo}:`, error.message);
            return null;
        }
    }

    escribirArchivo(nombreArchivo, datos) {
        try {
            const rutaCompleta = path.join(this.directorioData, nombreArchivo);
            fs.writeFileSync(rutaCompleta, JSON.stringify(datos, null, 2), 'utf-8');
            return true;
        } catch (error) {
            console.error(`Error al escribir ${nombreArchivo}:`, error.message);
            return false;
        }
    }
}
