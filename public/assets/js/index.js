document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("logout-btn").addEventListener("click", function() {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "/cerrar-sesion"; // Your logout endpoint

        // Append the form to the body and submit it
        document.body.appendChild(form);
        form.submit();
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const ids = ['fotoPerfil', 'logo', 'icono', 'imagen'];
    
    ids.forEach(id => {
        const fileInput = document.getElementById(id);
        const previewImage = document.getElementById('previewImage'); 
        
        if (fileInput && previewImage) {
            fileInput.addEventListener('change', function (event) {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        previewImage.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    });
});



function confirmDelete(event, button) {
    event.preventDefault();  // Prevent the form from submitting immediately
    
    // Logging to ensure the event is being triggered
    console.log("Delete event triggered");

    const form = button.closest("form");
    const card = button.closest(".card");

    // Check if the card exists and then query for .card-title
    const cardTitle = card ? card.querySelector(".card-title") : null;
    const entityName = cardTitle ? cardTitle.innerText : form.getAttribute("data-entity-name");
    const entityType = form.getAttribute("data-entity-type") || "Elemento";
    const confirmationMessage = `¿Estás seguro de que deseas borrar ${entityType}: "${entityName}"?`;

    console.log("Confirmation message: ", confirmationMessage); // Check message

    Swal.fire({
        title: 'Confirmación',
        text: confirmationMessage,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    }).then((result) => {
        console.log("SweetAlert result: ", result);  // Check result of Swal

        if (result.isConfirmed) {
            Swal.fire({
                title: '¡Eliminado!',
                text: `${entityType} "${entityName}" ha sido borrado exitosamente.`,
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                form.submit(); // Submit the form after the confirmation
            });
        } else {
            console.log("Deletion was cancelled.");
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        });
    });
});


document.getElementById('assignDeliveryBtn').addEventListener('click', async function() {
    const pedidoId = window.pedidoId; 

    try {
        const response = await fetch(`/comercio/pedidos/assign/${pedidoId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            // Delivery assigned successfully
            Swal.fire({
                icon: 'success',
                title: 'Delivery Asignado',
                text: data.message,
                confirmButtonText: 'Cerrar'
            });
        } else {
            // Show SweetAlert with error message
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.error,
                confirmButtonText: 'Cerrar'
            });
        }
    } catch (error) {
        // Show SweetAlert for network error
        Swal.fire({
            icon: 'error',
            title: 'No hay deliveries disponibles en este momento.',
            confirmButtonText: 'Cerrar'
        });
    }
});





  /*
  function confirmCreateOrEdit(button, event) {
    const form = button.closest("form");
  
    if (!validarCampos(form)) {
        event.preventDefault(); 
        return;  
    }
  
    event.preventDefault();
  
    let entityType = '';
    let actionUrl = form.action;
    
    if (actionUrl.includes("/libros/edit") || actionUrl.includes("/categorias/edit") || actionUrl.includes("/autores/edit") || actionUrl.includes("/editoriales/edit")) {
        entityType = actionUrl.includes("/libros") ? 'Libro' : actionUrl.includes("/categorias") ? 'Categoría' : actionUrl.includes("/autores") ? 'Autor' : 'Editorial';
    } else if (actionUrl.includes("/libros/create") || actionUrl.includes("/categorias/create") || actionUrl.includes("/autores/create") || actionUrl.includes("/editoriales/create")) {
        entityType = actionUrl.includes("/libros") ? 'Libro' : actionUrl.includes("/categorias") ? 'Categoría' : actionUrl.includes("/autores") ? 'Autor' : 'Editorial';
    }
  
    const isCreateAction = actionUrl.includes("/create");
  
    Swal.fire({
        title: isCreateAction ? '¿Confirmar creación de ' + entityType + '?' : '¿Confirmar actualización de ' + entityType + '?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: isCreateAction ? '¡Creación exitosa!' : '¡Actualización exitosa!',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                form.submit();  
            });
        }
    });
  }
  
  function validarCampos(form) {
    const inputs = form.querySelectorAll('input[required], select[required]');
    let esValido = true;

    for (const input of inputs) {
        if (input.id === 'correo') {
            // Validate the Gmail address
            const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
            if (!gmailPattern.test(input.value.trim())) {
                input.classList.add('input-error');
                input.classList.remove('input-success');
                esValido = false;
                Swal.fire({
                    title: 'Correo inválido',
                    text: 'Por favor, use una dirección de correo de Gmail.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                return false; 
            } else {
                input.classList.add('input-success');
                input.classList.remove('input-error');
            }
        } else {
            if (input.value.trim() === '') {
                input.classList.add('input-error');
                input.classList.remove('input-success');
                esValido = false;
            } else {
                input.classList.add('input-success');
                input.classList.remove('input-error');
            }
        }
    }

    if (!esValido) {
        Swal.fire({
            title: 'Campos incompletos',
            text: 'Por favor, complete todos los campos requeridos.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }

    return esValido;
}



  

  function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, ''); 
    if (value.length > 10) {
      value = value.substring(0, 10); 
    }
    if (value.length > 6) {
      value = value.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3'); 
    } else if (value.length > 3) {
      value = value.replace(/(\d{3})(\d{3})/, '$1-$2'); 
    }
    input.value = value; 
  }


function limitToFourDigits(inputId) {
    const inputElement = document.getElementById(inputId);
  
    inputElement.addEventListener('input', function (e) {
      const value = e.target.value;
      if (value.length > 4) {
        e.target.value = value.slice(0, 4);  
      }
    });
  }
  
  limitToFourDigits('fechaPublicacion');
  */

