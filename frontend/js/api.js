/*
  public/js/api.js — Cliente HTTP único del frontend.
  Reemplaza persistenciaCliente.js. Todo acceso a datos desde el browser
  pasa por api.leer / api.escribir. Cargado como primer <script> en cada vista.
  Se comunica con /api/leer y /api/escribir del servidor.
*/

const api = {
    async leer(archivo) {
        try {
            const r = await fetch(`/api/leer/${archivo}`);
            return r.ok ? r.json() : null;
        } catch { return null; }
    },
    async escribir(archivo, datos) {
        try {
            const r = await fetch(`/api/escribir/${archivo}`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(datos),
            });
            return r.ok;
        } catch { return false; }
    },
};
