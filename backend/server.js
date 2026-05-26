import express from 'express';
import path from 'path';
import { PersistenciaJSON } from './helpers/persistenciaJSON.js';

const app = express();
const PORT = 3000;
const persistencia = new PersistenciaJSON();

// permite al servidor entender datos en JSON
app.use(express.json());

// servir los archivos del proyecto (HTML, CSS, JS del cliente)
app.use(express.static(path.resolve()));

// ruta para LEER un archivo JSON
app.get('/api/leer/:archivo', (req, res) => {
    const datos = persistencia.leerArchivo(req.params.archivo);
    res.json(datos || []); //devuelve el archivo o una lista vacia
});

// ruta para ESCRIBIR en un archivo JSON
app.post('/api/escribir/:archivo', (req, res) => {
    const exito = persistencia.escribirArchivo(req.params.archivo, req.body);
    if (exito) {
        res.json({ mensaje: "Guardado con éxito" });
    } else {
        res.status(500).json({ error: "Error al escribir en el disco" });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    console.log(`📂 Conectado a la carpeta física backend/data/\n`);
});