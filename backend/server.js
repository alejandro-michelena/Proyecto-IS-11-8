/*
  backend/server.js — Punto de entrada del servidor.

  Configura Express, sirve los archivos estáticos del frontend
  y registra las rutas del API REST.

  
  **************
  Flujo:
    Html(invoca js) → js(configura eventos de btn, que hacen>) → HTTP /api/* → server(atrapa y va a ) → Routes(llama) → Controllers → Models → Repositories → db.js → disco

    
CORRER: npm run dev 
*/

import express from 'express';
import path    from 'path';
import { fileURLToPath } from 'url';

import usuarioRoutes  from './routes/usuarioRoutes.js';
import catalogoRoutes from './routes/catalogoRoutes.js';
import carritoRoutes  from './routes/carritoRoutes.js';
import pedidoRoutes   from './routes/pedidoRoutes.js';
import productoRoutes from './routes/productoRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ── Archivos estáticos del frontend ──────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend/views')));
app.use('/styles', express.static(path.join(__dirname, '../frontend/styles')));
app.use('/js',     express.static(path.join(__dirname, '../frontend/js')));

// ── Rutas API REST ────────────────────────────────────────────────────────────
app.use('/api/usuarios',  usuarioRoutes);
app.use('/api/catalogo',  catalogoRoutes);
app.use('/api/carrito',   carritoRoutes);
app.use('/api/pedidos',   pedidoRoutes);
app.use('/api/productos', productoRoutes);

app.listen(PORT, () => console.log(`\n🚀  http://localhost:${PORT}\n`));
