    const costoInput = document.getElementById('costo');
    const precioVentaInput = document.getElementById('precio-venta');
    const gananciaNetaInput = document.getElementById('ganancia-neta');
    const porcentajeInput = document.getElementById('porcentaje');


    function calcularGananciaNeta() {
        const costo = parseFloat(costoInput.value) || 0;
        const precioVenta = parseFloat(precioVentaInput.value) || 0;

        const gananciaNeta = precioVenta - costo;
        gananciaNetaInput.value = gananciaNeta.toFixed(2);

        // Llamar a la función para calcular el porcentaje de ganancia
        calcularPorcentajeGanancia();
    }


    function calcularPorcentajeGanancia() {
        const costo = parseFloat(costoInput.value) || 0;
        const precioVenta = parseFloat(precioVentaInput.value) || 0;

        const gananciaNeta = precioVenta - costo;
        const porcentajeGanancia = (gananciaNeta / costo) * 100;
        porcentajeInput.value = porcentajeGanancia.toFixed(2) + '%';
    }


    costoInput.addEventListener('input', calcularGananciaNeta);
    precioVentaInput.addEventListener('input', calcularGananciaNeta);