//
const tasa_cambio = 37
function saludar(){
    console.log("hola")
}


let fechaInicio = document.getElementById("fecha_inicio").value
let fechaFin = document.getElementById("fecha_fin").value

//console.log(fechaInicio)
//console.log(fechaFin)


function get_report(fechaIn, fechaFi)
{
    console.log(fechaIn, fechaFi)

    let url = "/generar_reportes"
    let fechas = {f1: fechaIn, f2: fechaFi}
    fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(fechas)
    })
        .then(response => response.json())
        .then(data => {
            console.log("enviado", data);

            console.log("here")
            let consulta = data["query_productos"]
            console.log(consulta)

            let tbody = document.getElementById("tabla_body")
            tbody.innerHTML = ''

            consulta.forEach(function (row){
                let fila = document.createElement('tr')
                var celdaFecha = document.createElement("td")
                var celdaTransaccion = document.createElement("td")
                var celdaCliente = document.createElement("td")
                var celdaFormapago = document.createElement("td")
                var celdaEntrega = document.createElement("td")
                var celdaProducto = document.createElement("td")
                var celdaCantidad = document.createElement("td")
                var celdaPrecioU = document.createElement("td")
                var celdaTotal =  document.createElement("td")
                var celdaCategoria = document.createElement("td")



                celdaFecha.textContent = row.fecha
                celdaTransaccion.textContent = row.pt_transaccion_id
                celdaCliente.textContent = row.cliente
                celdaFormapago.textContent = row.forma_pago
                celdaEntrega.textContent = row.entrega
                celdaProducto.textContent = row.nombre
                celdaCantidad.textContent = row.pt_cantidad
                celdaPrecioU.textContent = (row.pt_monto_producto / row.pt_cantidad).toLocaleString()

                let total = (row.pt_monto_producto).toFixed(2)
                celdaTotal.textContent = total

                celdaCategoria.textContent = row.categoria

                fila.appendChild(celdaTransaccion)
                fila.appendChild(celdaFecha)
                fila.appendChild(celdaCliente)
                fila.appendChild(celdaProducto)
                fila.appendChild(celdaCantidad)
                fila.appendChild(celdaPrecioU)
                fila.appendChild(celdaTotal)
                fila.appendChild(celdaFormapago)
                fila.appendChild(celdaEntrega)
                fila.appendChild(celdaCategoria)

                tbody.appendChild(fila)
            })

            let pvendidos = data["vendidos"]["vendidos"]
            let ventas = data["ventas"]["ventas"]
            let facturado = data["facturado"]
            console.log("vendidos: ", pvendidos)
            console.log(ventas)
            console.log(facturado)

            document.getElementById("productos_vendidos").textContent = String(pvendidos)
            let total_ventasE = document.querySelectorAll("#total_ventas")
            total_ventasE.forEach(function (elemento){
                elemento.textContent = String(ventas)
            })

            let total_facturadoE = document.querySelectorAll("#total_facturado")
            total_facturadoE.forEach(function (elemento){
                elemento.textContent = `$${facturado.toLocaleString()}`
            })

            let comprasEfectivo = data["compras_efectivo"]
            let comprasTransferencia = data["compras_transferencia"]
            let comprasTarjeta = data["compras_tarjeta"]

            document.getElementById("cantidad_ventas_efectivo").textContent = String(comprasEfectivo)
            document.getElementById("cantidad_ventas_transferencia").textContent = String(comprasTransferencia)
            document.getElementById("cantidad_ventas_tarjeta").textContent = String(comprasTarjeta)

            let entregasLocal = data["entregas_local"]
            let entregasDelivery = data["entregas_delivery"]

            document.getElementById("entregas_local").textContent = String(entregasLocal)
            document.getElementById("entregas_delivery").textContent = String(entregasDelivery)

            let montoEfectivo = data["monto_efectivo"]
            let montoTransferencia = data["monto_transferencia"]
            let montoTarjeta = data["monto_tarjeta"]

            document.getElementById("monto_efectivo").textContent = `$${montoEfectivo.toLocaleString()}`
            document.getElementById("monto_transferencia").textContent = `$${montoTransferencia.toLocaleString()}`
            document.getElementById("monto_tarjeta").textContent = String(`$${montoTarjeta}`)
            let montoDelivery = data["recaudado_delivery_cordobas"]
            document.getElementById("monto_delivery").textContent = `C$${montoDelivery.toLocaleString()}`
            document.getElementById("monto_cordobas").textContent = `$${(facturado * tasa_cambio).toLocaleString()}`

            document.getElementById("monto_ventas").textContent = `$${data["monto_ventas"].toLocaleString()}`


        })
        .catch(error => {
            console.log("Error en la solicitud", error)
        })

}

let  inputInicio = document.getElementById("fecha_inicio")
let  inputFin = document.getElementById("fecha_fin")

inputInicio.addEventListener("change", function (){
    get_report(inputInicio.value, inputFin.value)
})

inputFin.addEventListener("change", function (){
    get_report(inputInicio.value, inputFin.value)
})

get_report(fechaInicio, fechaFin)