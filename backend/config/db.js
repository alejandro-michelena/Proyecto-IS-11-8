/*
  backend/config/db.js — Único punto de acceso a disco.

  Toda lectura/escritura de archivos JSON pasa por aquí.
  Ningún otro módulo importa 'fs' directamente.
  Los repositorios importan este módulo y llaman a db.leer / db.escribir.
*/

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data');

const DEFAULTS = {
    'usuarios.json':           [],
    'productos.json':          [],
    'carrito.json':            {},
    'pedidos.json':            [],
    'sesion.json':             null,
    'borradores.json':         [],
    'favoritos.json':          [],
    'contador_productos.json': { contador: 0 },
};

if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
for (const [file, val] of Object.entries(DEFAULTS)) {
    const ruta = path.join(DIR, file);
    if (!fs.existsSync(ruta)) fs.writeFileSync(ruta, JSON.stringify(val, null, 2), 'utf-8');
}

export const db = {
    leer(archivo) {
        try {
            const raw = fs.readFileSync(path.join(DIR, archivo), 'utf-8').trim();
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    },
    escribir(archivo, datos) {
        try {
            fs.writeFileSync(path.join(DIR, archivo), JSON.stringify(datos, null, 2), 'utf-8');
            return true;
        } catch { return false; }
    },
};
