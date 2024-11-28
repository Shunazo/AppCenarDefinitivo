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
    const fileInput = document.getElementById('fotoPerfil');
    const previewImage = document.getElementById('previewImage');

    if (fileInput && previewImage) {
        fileInput.addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    // Update the src of the image preview
                    previewImage.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
});


/*function confirmDelete(button) {
    const form = button.closest("form");
  
    const cardTitle = button.closest(".card").querySelector(".card-title");
    const entityName = cardTitle ? cardTitle.innerText : "";
  
    let entityType = '';
    if (button.closest(".libros")) {
        entityType = 'Libro';
    } else if (button.closest(".categorias")) {
        entityType = 'Categoría';
    } else if (button.closest(".autores")) {
        entityType = 'Autor';
    } else if (button.closest(".editoriales")) {
        entityType = 'Editorial';
    }
  
    const confirmationMessage = `¿Estás seguro de que deseas borrar ${entityType}: "${entityName}"?`;
  
    Swal.fire({
        title: 'Confirmación',
        text: confirmationMessage,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: '¡Eliminado!',
                text: `${entityType} "${entityName}" ha sido borrado exitosamente.`,
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                form.submit(); 
            });
        }
    });
  }
  
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

