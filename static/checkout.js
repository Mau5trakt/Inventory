// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

function deliverySwitch(){

  const radioLocal = document.getElementById('local')
  const radioDelivery = document.getElementById('delivery')
  const inputDelivery = document.getElementById('inputDelivery')

  inputDelivery.value = 0;

  radioLocal.addEventListener('change', function () {
    if (radioLocal.checked) {

      inputDelivery.disabled = true;
      inputDelivery.value = 0;
    }
  });

  radioDelivery.addEventListener('change', function (){
    if (radioDelivery.checked){
      inputDelivery.disabled = false;
    }
  });

}



function cartRenderize(){
  let carrito = JSON.parse(localStorage.getItem('Carrito')) || [];
  let spanqty = document.getElementById("cartqty")
  spanqty.textContent = carrito.length.toString()

  let cuenta = 0
  let total = document.getElementById("total")
  let ul = document.getElementById("begin") // where the li gonna be inserte

  for (let articulo of carrito){

    let li = document.createElement("li");
    let div =  document.createElement("div");
    let nombre = document.createElement("h6")
    let input = document.createElement("input")
    let small = document.createElement("small")
    let eliminar = document.createElement("a")
    let price = document.createElement("span")

    //attributes
    li.classList.add("list-group-item", "d-flex", "justify-content-between", "lh-sm")
    nombre.classList.add("my-0")
    nombre.textContent = articulo.elemento
    small.classList.add("text-body-secondary")
    eliminar.href = "#"
    eliminar.textContent = "Eliminar"
    price.classList.add("text-body-secondary")
    price.textContent = `$${(articulo.pventa * articulo.cantidad).toFixed(2)}`

    cuenta += articulo.pventa

    price.id = "priceItem"
    input.type ="text"
    input.value = articulo.cantidad
    input.addEventListener("input", changeqty)

    //making the element
    small.insertAdjacentElement("beforeend", eliminar)
    //div
    // h6
    // input
    // small > a
    div.insertAdjacentElement("beforeend", nombre)
    div.insertAdjacentElement("beforeend", input)
    div.insertAdjacentElement("beforeend", small)


    //Elements of the ul
    //insert the div into the li

    li.insertAdjacentElement("beforeend", div)
    li.insertAdjacentElement("beforeend", price)
    // li
    // div //Div created last
    // span

    ul.insertAdjacentElement("afterbegin", li)

  }


total.textContent = `$ ${cuenta.toString()}`
}



//Just call the function lmao
cartRenderize()
deliverySwitch()