function toggleCarrito() {

  mostarCarrito();
  var carritoDiv = document.getElementById("carritoDiv");

  // Verifica si el div está visible o no
  if (carritoDiv.style.display === "none" || carritoDiv.style.display === "") {
    // Si está oculto, lo muestra
    carritoDiv.style.display = "block";
  } else {
    // Si está visible, lo oculta
    carritoDiv.style.display = "none";
  }
}

function agregarCarrito(id) {
  var elemento = window.elementos[id - 1]["nombre"];

  let carrito = JSON.parse(localStorage.getItem('Carrito')) || [];

  const elementoExistente = carrito.find(item => item.elemento === elemento);

  if (elementoExistente) {
    // Si ya existe, actualizar la cantidad

    elementoExistente.cantidad += 1;
  } else {
    // Si no existe, agregar un nuevo objeto al carrito
    cantidad = 1;
    carrito.push({ elemento, cantidad });
  }

  localStorage.setItem("Carrito", JSON.stringify(carrito));

  // Llamar a la función para renderizar el carrito
  valorCarrito();
  renderizarCarrito();
}

function mostarCarrito() {
  // Llamar a la función para renderizar el carrito
  renderizarCarrito();
}

document.addEventListener('DOMContentLoaded', function () {
  // Llamar a la función para renderizar el carrito al cargar la página
  renderizarCarrito();
  valorCarrito();
  valorCarrito();

});

// Función para renderizar el carrito en la tabla
function renderizarCarrito() {
  let carrito = JSON.parse(localStorage.getItem('Carrito')) || [];
  const tabla = document.getElementById('carritoTable').getElementsByTagName('tbody')[0];

  // Limpiar contenido existente en la tabla
  tabla.innerHTML = '';

  // Iterar sobre los elementos del carrito y agregar filas a la tabla
  carrito.forEach(item => {
    const fila = tabla.insertRow();
    const celdaElemento = fila.insertCell(0);
    const celdaCantidad = fila.insertCell(1);
    const celdaEliminar = fila.insertCell(2);

    var eliminarButton = document.createElement("button");
    eliminarButton.classList.add("btn", "btn-info");
    eliminarButton.setAttribute("type", "button");
    eliminarButton.setAttribute("onclick", "eliminarElemento(this)");
    eliminarButton.textContent = "Eliminar";


    celdaElemento.textContent = item.elemento;
    celdaCantidad.textContent = item.cantidad;
    celdaEliminar.appendChild(eliminarButton);
  });
}

function eliminarCarrito(){
  localStorage.clear()
  renderizarCarrito()
  valorCarrito();

}

function eliminarElemento(boton){

  const tablaCarrito = document.getElementById("carritoTable")
  var fila = boton.parentNode.parentNode;
  var nombreElemento = fila.cells[0].textContent


  let carrito = JSON.parse(localStorage.getItem('Carrito')) || [];
  const indiceProducto = carrito.findIndex(item => item.elemento === nombreElemento);


  if (indiceProducto !== -1) {
    // Eliminar el producto del carrito
    carrito.splice(indiceProducto, 1);

    // Actualizar el carrito en localStorage
    localStorage.setItem('Carrito', JSON.stringify(carrito));
    renderizarCarrito();
    valorCarrito()
  }
  else
  {
    console.log("Objeto no encotrado en el carrito")
  }





}

function valorCarrito() {
    let carrito = JSON.parse(localStorage.getItem('Carrito')) || [];
    console.log(carrito.length);

    // Obtén el elemento <a> existente si ya fue creado
    let aCarrito = document.getElementById("textoCarrito");

    // Si el elemento <a> ya existe, actualiza solo el texto sin afectar el <i>
    if (aCarrito) {
        // Obtén el elemento <i> dentro de <a>
        let iCarrito = aCarrito.querySelector("i");

        // Actualiza solo el texto
        aCarrito.textContent = ` Carrito (${carrito.length})`;

        // Vuelve a agregar el <i> como hijo de <a>
        aCarrito.prepend(iCarrito);
    } else {
        // Si el elemento <a> no existe, créalo y añádelo al <div>
        let iCarrito = document.createElement("i");
        iCarrito.classList.add("fa-solid", "fa-cart-shopping");

        aCarrito = document.createElement("a");
        aCarrito.classList.add("nav-link");
        aCarrito.setAttribute("href", "#");
        aCarrito.setAttribute("onclick", "toggleCarrito()");
        aCarrito.setAttribute("id", "textoCarrito");
        aCarrito.textContent = " Carrito ";  // Espacio antes de "Carrito"
        aCarrito.appendChild(iCarrito);

        let dCarrito = document.getElementById("carritoContainer");
        dCarrito.appendChild(aCarrito);
    }

    // Agregar el resto del contenido al div si es necesario
    // Ejemplo: dCarrito.appendChild(otroElemento);
}

