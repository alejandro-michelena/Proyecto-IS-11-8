import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { PersistenciaJSON } from './helpers/persistenciaJSON.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const persistencia = new PersistenciaJSON();

app.use(express.json());

// ── Archivos estáticos ─────────────────────────────────────────
// HTML
app.use(express.static(path.join(__dirname, '../frontend/html')));
// CSS
app.use('/styles', express.static(path.join(__dirname, '../frontend/styles')));
// JS del cliente (checkout.js, pedidosView.js, persistenciaCliente.js)
app.use('/js', express.static(path.join(__dirname, '../frontend/js')));
// Lógica del backend expuesta al browser (logica con "a")
app.use('/logica', express.static(path.join(__dirname, 'logica')));
// ElementosJS
app.use('/elementosJS', express.static(path.join(__dirname, 'elementosJS')));

// ── API de Persistencia ────────────────────────────────────────
app.get('/api/leer/:archivo', (req, res) => {
    const datos = persistencia.leerArchivo(req.params.archivo);
    res.json(datos ?? []);
});

app.post('/api/escribir/:archivo', (req, res) => {
    const exito = persistencia.escribirArchivo(req.params.archivo, req.body);
    if (exito) {
        res.json({ mensaje: 'Guardado con éxito' });
    } else {
        res.status(500).json({ error: 'Error al escribir en el disco' });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📂 Datos en: backend/data/\n`);
});
