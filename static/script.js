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
            //console.log(tratar)
            var tbody = document.getElementById('miTablaBody');
            // console.log(tratar)

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


                celdaNombre.textContent = producto.nombre
                celdaNumero.textContent = contador
                contador++;

                fila.appendChild(celdaNumero)
                fila.appendChild(celdaNombre)
                fila.appendChild(celdaCategoria)
                fila.appendChild(celdaCosto)
                fila.appendChild(celdaPrecioVenta)

                tbody.appendChild(fila)


            })

        }
      };
      xhr.send('search_term=' + encodeURIComponent(searchTerm));

    });

  });