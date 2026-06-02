/*
  server.js — Punto de entrada del servidor.

  Configura Express, sirve los archivos estáticos del frontend y expone
  la API REST de persistencia (/api/leer/:archivo, /api/escribir/:archivo).

  Es el único proceso Node que corre; db.js es el único módulo que toca disco ********.

Flujo:
  Controller → Model → Repository → api.js → /api → server.js → db.js → disco
*/

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './src/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static(path.join(__dirname, '../frontend/views')));
app.use('/styles', express.static(path.join(__dirname, '../frontend/styles')));
app.use('/js',     express.static(path.join(__dirname, '../frontend/js')));
app.use('/src',    express.static(path.join(__dirname, './src')));

app.use('/models',    express.static(path.join(__dirname, '../frontend/models')));
app.use('/repositories',    express.static(path.join(__dirname, '../frontend/repositories')));
app.use('/controllers',    express.static(path.join(__dirname, '../frontend/controllers')));

app.get('/api/leer/:archivo', (req, res) => {
    const datos = db.leer(req.params.archivo);
    res.json(datos ?? []);
});

app.post('/api/escribir/:archivo', (req, res) => {
    const ok = db.escribir(req.params.archivo, req.body);
    ok ? res.json({ ok: true }) : res.status(500).json({ ok: false });
});

app.listen(PORT, () => console.log(`\n🚀  http://localhost:${PORT}\n`));
