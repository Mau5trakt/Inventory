function toggleCarrito() {
  console.log("Abrir Carrito")
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

function agregarCarrito(id){

  if (!localStorage.getItem('carrito')) {
    localStorage.setItem('carrito', JSON.stringify([]));
  }

  var carrito = JSON.parse(localStorage.getItem("carrito"));

  //carrito.push(window.elementos[(id - 1)])

  var encontrado = false
  for (var i = 0; i <localStorage.getItem("carrito").length; i++)
  {
    if (localStorage.getItem("carrito")[i]["nombre"] == window.elementos[id - 1 ]["nombre"]){
      console.log("Si esta")
    }
  }

  carrito.push({"Elemento": `${window.elementos[id - 1]["nombre"]}`, "Cantidad": 1})

  localStorage.setItem("carrito", JSON.stringify(carrito))
  console.log(localStorage.getItem("carrito"))
  var e = carrito.JSON.parse()
  console.log(e, "@@@")

  //var fila = document.querySelector(`#tabla tbody tr:nth-child(${id})`)




}

