class CarritoController {
    
    constructor() {
        this.inicializarEventos();
    }
    
    //captura las acciones de los botones de añadir
    inicializarEventos() {
        const botonesAnadir = document.querySelectorAll('.boton-anadir');

        botonesAnadir.forEach(boton => {
            boton.addEventListener('click', (evento) => {
                evento.preventDefault();
                
                //buscamos el id
                const idProductoUnix = evento.target.getAttribute('data-id');
                
                //empieza el flujo principal
                this.agregarAlCarritoFlujo(idProductoUnix);
            });
        });
    }

    //busca cantidad y valida stock 
    agregarAlCarritoFlujo(idProducto) {
        // 1.- se trae la lista del inventario
        const inventario = JSON.parse(localStorage.getItem('productosInventario')) || [];
        
        // se busca el producto que haga match con el id
        const productoEncontrado = inventario.find(p => p.id === idProducto);

        // si el id no esta en el inventario
        if (!productoEncontrado) {
            alert("Error: El producto seleccionado no existe en el inventario maestro.");
            return;
        }

        // 2.- ventana emergente de ingreso de cantidad
        const cantidadIngresada = prompt(`¿Cuántas unidades de ${productoEncontrado.nombre} desea agregar al carrito?`, "1");

        // si presiona cancelar frena la ejecucion
        if (cantidadIngresada === null) return; 

        const cantidad = parseInt(cantidadIngresada);

        // valida el formato
        if (isNaN(cantidad) || cantidad <= 0) {
            alert("Por favor, ingresa una cantidad válida mayor a cero.");
            return;
        }

        // 3.- valida si no hay del mismo producto en el carrito
        const carritoActual = JSON.parse(localStorage.getItem('carrito')) || [];
        const productoEnCarrito = carritoActual.find(item => item.id === idProducto);
        const cantidadPrevia = productoEnCarrito ? productoEnCarrito.cantidad : 0;

        // suma la cantidad nueva con la previa
        const cantidadTotalSolicitada = cantidadPrevia + cantidad;

        if (cantidadTotalSolicitada > productoEncontrado.stock) {
            // mensaje de error si no hay esa cantidad de items en el stock
            alert(`Error: La cantidad ingresada de ${productoEncontrado.nombre} no se encuentra disponible. Stock disponible: ${productoEncontrado.stock - cantidadPrevia}`);
            return;
        }

        // 4.- guardado
        this.guardarEnLocalStorage(productoEncontrado, cantidad);
        alert(`¡Éxito! El item ha sido añadido con éxito al carrito.`);
    }

    //escribe en carrito.json
    guardarEnLocalStorage(producto, cantidad) {
        // invoca lo que hay en el carrito
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

        //verifica si ya existe item adentro
        const indiceExistente = carrito.findIndex(item => item.id === producto.id);

        if (indiceExistente >= 0) {
            // si existe, suma nueva cantidad
            carrito[indiceExistente].cantidad += cantidad;
        } else {
            //si es nuevo empuja nuevos datos
            carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: cantidad
            });
        }

        // guarda el arreglo
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }
}

//inicia el controler
const miCarrito = new CarritoController();