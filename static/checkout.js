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


window.onload = deliverySwitch()