class PersistenciaJSON {
    constructor() {
        this.rutaBase = 'data';
        this.inicializarAlmacenamiento();
    }

    inicializarAlmacenamiento() {
        if (!localStorage.getItem('data/productos.json')) {
            const productosIniciales = this.obtenerProductosIniciales();
            this.escribirArchivo('productos.json', productosIniciales);
        }

        if (!localStorage.getItem('data/clientes.json')) {
            const clientesIniciales = this.obtenerClientesIniciales();
            this.escribirArchivo('clientes.json', clientesIniciales);
        }

        if (!localStorage.getItem('data/borradores.json')) {
            this.escribirArchivo('borradores.json', []);
        }

        if (!localStorage.getItem('../data/carrito.json')) {
            this.escribirArchivo('carrito.json', []);
        }

        if (!localStorage.getItem('data/favoritos.json')) {
            this.escribirArchivo('favoritos.json', []);
        }

        if (!localStorage.getItem('data/sesion.json')) {
            this.escribirArchivo('sesion.json', null);
        }

        if (!localStorage.getItem('data/contador_productos.json')) {
            this.escribirArchivo('contador_productos.json', { contador: 0 });
        }
    }

    leerArchivo(nombreArchivo) {
        const ruta = `data/${nombreArchivo}`;
        const datos = localStorage.getItem(ruta);
        if (!datos) return null;
        return JSON.parse(datos);
    }

    escribirArchivo(nombreArchivo, datos) {
        const ruta = `data/${nombreArchivo}`;
        localStorage.setItem(ruta, JSON.stringify(datos, null, 2));
    }

    obtenerProductosIniciales() {
        return [
            {
                id: 'prod_001',
                nombre: 'Whey Protein',
                categoria: 'whey_protein',
                marca: 'brand1',
                precio: 750,
                stock: 50,
                descripcion: 'Proteína de suero de leche de alta calidad para recuperación muscular.',
                calificacion: 5,
                imagen: null,
                fechaCreacion: '2025-01-15T10:30:00.000Z',
                estado: 'publicado'
            },
            {
                id: 'prod_002',
                nombre: 'Whey Protein Isolate',
                categoria: 'whey_protein',
                marca: 'brand1',
                precio: 950,
                stock: 35,
                descripcion: 'Aislado de proteína con 90% de pureza y rápida absorción.',
                calificacion: 4,
                imagen: null,
                fechaCreacion: '2025-01-15T10:30:00.000Z',
                estado: 'publicado'
            },
            {
                id: 'prod_003',
                nombre: 'Pre-Workout Explosivo',
                categoria: 'pre_workout',
                marca: 'brand2',
                precio: 580,
                stock: 40,
                descripcion: 'Fórmula avanzada para máxima energía y concentración durante el entrenamiento.',
                calificacion: 5,
                imagen: null,
                fechaCreacion: '2025-01-15T10:30:00.000Z',
                estado: 'publicado'
            },
            {
                id: 'prod_004',
                nombre: 'Pre-Workout Sin Cafeína',
                categoria: 'pre_workout',
                marca: 'brand2',
                precio: 520,
                stock: 25,
                descripcion: 'Energía limpia sin estimulantes para entrenar a cualquier hora.',
                calificacion: 4,
                imagen: null,
                fechaCreacion: '2025-01-15T10:30:00.000Z',
                estado: 'publicado'
            },
            {
                id: 'prod_005',
                nombre: 'Creatina Monohidratada',
                categoria: 'creatine',
                marca: 'brand1',
                precio: 450,
                stock: 60,
                descripcion: 'Creatina pura para aumentar fuerza y resistencia muscular.',
                calificacion: 5,
                imagen: null,
                fechaCreacion: '2025-01-15T10:30:00.000Z',
                estado: 'publicado'
            },
            {
                id: 'prod_006',
                nombre: 'Creatina Micronizada',
                categoria: 'creatine',
                marca: 'brand2',
                precio: 620,
                stock: 30,
                descripcion: 'Creatina de fácil disolución con máxima absorción celular.',
                calificacion: 4,
                imagen: null,
                fechaCreacion: '2025-01-15T10:30:00.000Z',
                estado: 'publicado'
            }
        ];
    }

    obtenerClientesIniciales() {
        return [];
    }

    exportarTodo() {
        const archivos = [
            'productos.json',
            'clientes.json',
            'borradores.json',
            'carrito.json',
            'favoritos.json',
            'sesion.json',
            'contador_productos.json'
        ];

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
        enlace.download = 'respaldo_vitassups_' + new Date().toISOString().slice(0, 10) + '.json';
        enlace.click();
    }
}