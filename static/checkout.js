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
    li.id = "product"
    nombre.classList.add("my-0")
    nombre.textContent = articulo.elemento
    small.classList.add("text-body-secondary")
    eliminar.href = "#"
    eliminar.textContent = "Eliminar"
    eliminar.addEventListener("click", function () {
      deleteItem(this)
    })
    price.classList.add("text-body-secondary")
    price.textContent = `$${(articulo.pventa * articulo.cantidad).toFixed(2)}`

    cuenta += articulo.pventa * articulo.cantidad

    price.id = "priceItem"
    input.type ="text"
    input.value = articulo.cantidad
    input.addEventListener("input", function () {
      changeQty(this)
    })
    input.id = "inputQty"

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


total.textContent = `$ ${cuenta.toFixed(2).toString()}`
}

function changeQty(element) {
    let alertInvalid = document.createElement("div");
    alertInvalid.classList.add("alert", "alert-danger");
    alertInvalid.role = "alert";
    alertInvalid.textContent = "Cantidad invalida";
    alertInvalid.id = "error-alert";

    let alertQty = document.createElement("div")
    alertQty.classList.add("alert", "alert-warning")
    alertQty.role = "alert"
    alertQty.textContent = "Cantidad no disponible"
    alertQty.id = "invalid-qty";

    let divItem = element.parentNode;
    let cantidad = element.value;

    // Use a regular expression to check if the entire input is numeric or check if the qty is 0
    if (!/^\d+$/.test(cantidad) || cantidad === "0") {
        element.classList.add("invalid-input");

        // Check if there is an error div, if not, insert it
        if (!divItem.querySelector("#error-alert")) {
            divItem.insertAdjacentElement("afterbegin", alertInvalid);
        }
    } else {
        element.classList.remove("invalid-input");

        // Remove the error div if it exists
        let errorAlert = divItem.querySelector("#error-alert");
        if (errorAlert) {
            divItem.removeChild(errorAlert);
        }

        let product = element.parentNode.parentNode
        let name = product.querySelector("h6").textContent
        let qty = element.value;
        let carrito = JSON.parse(localStorage.getItem('Carrito')) || [];

        let elementIndex = carrito.findIndex(p => p.elemento === name)
        if (elementIndex !== -1)
        {

            if (qty > carrito[elementIndex].disponibles)
            {
                    element.classList.add("invalid-qty");

                    // Check if there is an invalid-qty div, if not, insert it
                    if (!divItem.querySelector("#invalid-qty"))
                    {
                        divItem.insertAdjacentElement("afterbegin", alertQty);
                    }
            }
            else
            {
                // Remove the invalid-qty class and div if it exists
                element.classList.remove("invalid-qty");
                let invalidQtyAlert = product.querySelector("#invalid-qty");
                if (invalidQtyAlert) {
                    divItem.removeChild(invalidQtyAlert);
                }

                let totalArt = (qty * carrito[elementIndex].pventa).toFixed(2)
                let producto = element.parentNode.parentNode
                let priceHtml = producto.querySelector("span")
                priceHtml.textContent = `$${totalArt.toString()}`

                let products = document.querySelectorAll("#product")

                let cuenta = 0;
                //For here i gotta modify to add the delivery field and add it to the count
                // Also I've to convert the delivery value
                // AND CONVERT EVERYTHING TO CORDOBAS
                // AND SHOW EVERY SINGLE ITEM ALSO IN CORDOBAS
                for (let p of products)
                {
                    let priceRow = p.querySelector("span")
                    //cuenta += priceRow.textContent
                    console.log(priceRow.textContent)
                    let priceConverted = parseFloat(priceRow.textContent.replace("$", ""))

                    cuenta += priceConverted


                }
                console.log(cuenta)
                document.querySelector("#total").textContent = cuenta.toFixed(2)


            }

        }
    }
}



function deleteItem(element){
  let div = (element.parentNode.parentNode)

  let nombre = div.querySelector("h6").textContent

  //
  let carrito = JSON.parse(localStorage.getItem('Carrito')) || [];


  //console.log(parentNode)
  console.log(carrito)

  let indexProduct = carrito.findIndex(product => product.elemento === nombre)
  if (indexProduct !== -1)
  {
    carrito.splice(indexProduct, 1)
    localStorage.setItem('Carrito', JSON.stringify(carrito))
    let products = document.querySelectorAll("#product")

    for (let product of products)
    {
      product.remove()

    }

    cartRenderize()

  }


}

//Just call the function lmao
cartRenderize()
deliverySwitch()