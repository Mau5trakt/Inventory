// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')
  let carrito = JSON.parse(localStorage.getItem('Carrito'))
    let contador = 0;
  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
        if (!form.checkValidity())
        {
            event.preventDefault()
            event.stopPropagation()
        }
        else if (carrito.length === 0)
        {
            Swal.fire({
                icon: "error",
                title: "Carrito Invalido",
                text: "Introduzca productos para facturar"
            });
        }

        else if (contador > 0)
        {
            Swal.fire({
                icon: "warning",
                title: "Orden duplicada",
                text: "Esta intentando introducir una orden que ya fue facturada",
                footer: '<a href="/">Inicio</a>'
            });
            event.preventDefault()
            event.stopPropagation()

        }


        else {
            //here i can send the values to the backend
            //need a transaction object
            let nombre = document.getElementById("firstName").value;
            let apellido = document.getElementById("lastName").value;
            let email = document.getElementById("email").value;
            let direccion = document.getElementById("address").value;

            let radios_pago = document.querySelectorAll('input[name="pago"]');
            let forma_pago
            radios_pago.forEach(function (radio) {
                if (radio.checked) {
                    forma_pago = radio.id;
                }
            })

            let radios_entrega = document.querySelectorAll('input[name="entrega"]');
            let forma_entrega
            radios_entrega.forEach(function (radio) {
                if (radio.checked) {
                    forma_entrega = radio.id;
                }
            })
            console.log(forma_pago)
            console.log(forma_entrega)
            let delivery_value
            if (forma_entrega === "delivery") {
                let delivery_input = document.getElementById("inputDelivery");
                delivery_value = parseFloat(delivery_input.value)
            } else {
                delivery_value = 0.00
            }

            let transaccion = {
                cliente: `${nombre} ${apellido}`,
                correo: email,
                direccion: direccion,
                forma_pago: forma_pago,
                entrega: forma_entrega,
                delivery: delivery_value
            }
            //productos = []
            let products_list = [];
            //producto = {}
            //gotta create a new product then push into products

            let productos = document.querySelectorAll("#product")
            productos.forEach(function (producto) {
                let nombre = producto.querySelector("h6").textContent
                let qty = producto.querySelector("input").value
                let price = producto.querySelector("#priceItem").textContent
                //below this insert the discount ammount
                let producto_insert = {nombre: nombre, cantidad: Number(qty), total: Number(price.replace("$", "")).toFixed(2)}
                products_list.push(producto_insert)
            });
            console.log(transaccion)
            console.log(products_list)
            let data = {transaccion: transaccion, products_list: products_list};
            let url = "/procesar_orden";
            if(document.getElementById("invalid-qty") || document.getElementById("error-alert")){
                Swal.fire({
        icon: "error",
        title: "Inputs Invalidos",
        text: "Revise los valores introducidos "
            });
                event.preventDefault()
            event.stopPropagation()
            }
    else{
            fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)  // Convertir el objeto a cadena JSON
            })
                .then(response => response.json())
                .then(data => {
                    console.log("js sent", data);

                })
                .catch(error => {
                    console.log("Error en la solicitud", error);
                    console.log(data);
                    console.log(JSON.stringify(data));
                });
            event.preventDefault()
            event.stopPropagation()
                localStorage.clear()
                Swal.fire({
                            icon: "success",
                            title: "Compra hecha con exito",
                            footer: '<a href="/">Inicio</a>'
});
            contador += 1;
        }
    }

      form.classList.add('was-validated')
    }, false)
  })
})()

const conversion = 37;

function deliverySwitch(){

  const radioLocal = document.getElementById('local')
  const radioDelivery = document.getElementById('delivery')
  const inputDelivery = document.getElementById('inputDelivery')

  inputDelivery.value = 100;

  radioLocal.addEventListener('change', function () {
    if (radioLocal.checked) {
      document.getElementById("address").removeAttribute("required")
      inputDelivery.disabled = true;
      //Delete the delivery span also
      inputDelivery.value = 0;

      //Eliminate the delivery value and re-do the account
        //More easy, just set the delivery price as 0

        document.getElementById("deliveryPrice").textContent = `$0.00`
        let deliveryValue = 0
        //document.getElementById("")

        totalUpdate()


    }
  });

  radioDelivery.addEventListener('change', function (){
    if (radioDelivery.checked){

      inputDelivery.disabled = false;
      document.getElementById("address").setAttribute("required", "")

        //Set a default in the price to make more easy
        //have to modify the value in the Delivery span


        let pconvertido = (inputDelivery.value / conversion).toFixed(2)
        console.log(pconvertido, "pconvertido")

        document.getElementById("deliveryPrice").textContent = `$${Number(pconvertido).toLocaleString()}`


        let products = document.querySelectorAll("#product")
        //Refactor this, eventually...
        let cuenta = 0;
        for (let p of products)
                {
                    let priceRow = p.querySelector("span")
                    //cuenta += priceRow.textContent
                    console.log(priceRow.textContent)
                    let priceConverted = parseFloat(priceRow.textContent.replace("$", ""))

                    cuenta += priceConverted


                }

        cuenta += parseFloat(pconvertido)
        document.querySelector("#total").textContent = cuenta.toFixed(2)

      inputDelivery.addEventListener("input", () => {

           if (!/^\d+$/.test(inputDelivery.value))
        {
            //Later...
            Swal.fire({
                        icon: "error",
                        title: "Cantidad Invalida",
                        text: "Introduzca una cantidad numérica"
            });
        }
           else{

               let valor = inputDelivery.value
               let formatedValue = (valor/conversion).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})

               document.getElementById("deliveryPrice").textContent = `$${formatedValue}`

               let subtotalElement = document.getElementById("subtotalPrice")

               let subtotalPrice = parseFloat(subtotalElement.textContent.replace("$", ""))

               let total = (valor / conversion) + subtotalPrice

               let totalFormated = total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})

               console.log(`total ${totalFormated}`)

               //Modificar el total
               document.getElementById("total").textContent = `$${Number(totalFormated)}`


           }

        console.log(inputDelivery.value)

      })

    }
  });

}



function cartRenderize(){
  let carrito = JSON.parse(localStorage.getItem('Carrito')) || [];
  let spanqty = document.getElementById("cartqty")
  spanqty.textContent = carrito.length.toString()

  let cuenta = 0
  let subtotal = document.getElementById("subtotalPrice")
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


    subtotal.textContent = `$${cuenta.toFixed(2).toString()}`
    totalUpdate()
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
                //document.querySelector("#total").textContent = cuenta.toFixed(2)
                document.getElementById("subtotalPrice").textContent = `$${cuenta.toFixed(2)}`
                totalUpdate()


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

function totalUpdate(){
    let subtotalElement = document.getElementById("subtotalPrice").textContent
    let subtotalConverted = parseFloat(subtotalElement.replace("$", ""))

    let deliveryElement = document.getElementById("deliveryPrice").textContent
    let deliveryConverted = parseFloat(deliveryElement.replace("$", ""))

    let totalValue = (subtotalConverted + deliveryConverted).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
    document.getElementById("total").textContent = `$${totalValue}`

}

document.getElementById("liTotal").addEventListener("mouseenter", function (){
    setTimeout(function (){
        let dolares = document.getElementById("total").textContent
        let dolaresConverted = parseFloat(dolares.replace("$", ""))

        let li = document.createElement("li")
        let span = document.createElement("span")
        let strong = document.createElement("strong")

        li.classList.add("list-group-item", "d-flex", "justify-content-between")
        li.id = "liCordobas"

        span.textContent = "Total Cordobas"
        strong.id= "tcordobas"
        strong.textContent = `C$${(conversion * dolaresConverted).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`

        let ul = document.getElementById("begin")
        ul.appendChild(li)
        li.appendChild(span)
        li.appendChild(strong)
    }, 1000)

})
document.getElementById("liTotal").addEventListener("mouseleave", function (){
    setTimeout(function (){
        let li = document.getElementById("liCordobas")
        let ul = document.getElementById("begin")
        ul.removeChild(li)
    }, 500)
})

//Just call the function lmao
cartRenderize()
deliverySwitch()