document.addEventListener('DOMContentLoaded', function() {
    var searchInput = document.getElementById('searchInput');

    searchInput.addEventListener('input', function() {
      var searchTerm = searchInput.value;

      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/search', true);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
          var response = xhr.responseText;
          //console.log(typeof(response))
            //console.log(response)
            var tratar = JSON.parse(response)
            console.log(tratar)
            var tbody = document.getElementById('miTablaBody');
            tbody.innerHTML = '';
            // console.log(tratar)
            window.elementos = tratar;

          document.querySelector('tbody').innerHTML = '';
            var contador = 1;

            tratar.forEach(function (producto){
                //console.log(producto.nombre)
                var fila = document.createElement('tr')

                var celdaNombre = document.createElement('td')
                var celdaNumero = document.createElement('td')
                var celdaCantidad = document.createElement('td')
                var celdaCategoria = document.createElement('td')
                var celdaCosto = document.createElement('td')
                var celdaPrecioVenta = document.createElement('td')
                var celdaGananciaNeta = document.createElement('td')
                var celdaPorcentajeGanancia = document.createElement('td')
                var celdaGananciaPotencial = document.createElement('td')
                var celdaEditar = document.createElement('td')
                var celdaAgregar = document.createElement("td")

                // Boton de editar producto
                var link = document.createElement('a')
                link.href=`/editar-producto/${producto.producto_id}`
                link.textContent = "Editar"
                var button = document.createElement("button")
                button.classList.add("btn", "btn-link")
                button.setAttribute("type", "button")


                //Boton para añadir al carrito
                var botonagregar = document.createElement("button")
                botonagregar.classList.add("btn", "btn-outline-success")
                botonagregar.setAttribute("type", "button")

                botonagregar.setAttribute("onclick", `agregarCarrito(${contador})`)
                botonagregar.textContent = "Agregar"







                celdaNombre.textContent = producto.nombre
                celdaNumero.textContent = contador
                celdaCategoria.textContent = producto.categoria
                celdaCosto.textContent = producto.costo
                celdaPrecioVenta.textContent = producto.precio_venta
                celdaCantidad.textContent = producto.cantidad
                celdaGananciaNeta.textContent = producto.ganancia_neta.toFixed(2)

                celdaPorcentajeGanancia.textContent = `${producto.porcentaje_ganancia.toFixed(2)}%`
                celdaGananciaPotencial.textContent = producto.ganancia_potencial.toFixed(2)

                button.appendChild(link)

                contador++;

                fila.appendChild(celdaNumero)
                fila.appendChild(celdaNombre)
                fila.appendChild(celdaCategoria)
                fila.appendChild(celdaCantidad)
                fila.appendChild(celdaCosto)
                fila.appendChild(celdaPrecioVenta)
                fila.appendChild(celdaGananciaNeta)
                fila.appendChild(celdaPorcentajeGanancia)
                fila.appendChild(celdaGananciaPotencial)

                celdaEditar.appendChild(button)
                fila.appendChild(celdaEditar)

                celdaAgregar.appendChild(botonagregar)
                fila.appendChild(celdaAgregar)



                tbody.appendChild(fila)

            })

        }
      };
      xhr.send('search_term=' + encodeURIComponent(searchTerm));

    });

  });