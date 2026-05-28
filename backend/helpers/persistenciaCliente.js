/**
 * PersistenciaCliente
 * ──────────────────
 * Reemplaza al PersistenciaJSON de Node en el browser.
 * Todas las operaciones son async y hablan con /api/leer y /api/escribir.
 *
 * USO:
 *   const persistencia = new PersistenciaCliente();
 *   const usuarios = await persistencia.leerArchivo('usuarios.json');
 *   await persistencia.escribirArchivo('usuarios.json', usuarios);
 */
class PersistenciaCliente {
    async leerArchivo(nombreArchivo) {
        try {
            const respuesta = await fetch(`/api/leer/${nombreArchivo}`);
            if (!respuesta.ok) return null;
            const datos = await respuesta.json();
            return datos;
        } catch (error) {
            console.error(`PersistenciaCliente: error al leer ${nombreArchivo}:`, error);
            return null;
        }
    }

    async escribirArchivo(nombreArchivo, datos) {
        try {
            const respuesta = await fetch(`/api/escribir/${nombreArchivo}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            return respuesta.ok;
        } catch (error) {
            console.error(`PersistenciaCliente: error al escribir ${nombreArchivo}:`, error);
            return false;
        }
    }
}
