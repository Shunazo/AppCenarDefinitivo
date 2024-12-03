document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("logout-btn").addEventListener("click", function() {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "/cerrar-sesion"; 

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


function validarCampos(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required], input[type="file"][required]');
    let esValido = true;

    // Loop through each required input field
    for (const input of inputs) {
        // Clear any previous error or success styles
        input.classList.remove('input-error', 'input-success');

        // Validate specific types of fields
        if (input.type === 'email') {
            // Email validation
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
                return false;  // Stop the validation process
            } else {
                input.classList.add('input-success');
                input.classList.remove('input-error');
            }
        } else if (input.type === 'file') {
            // File validation
            if (input.files.length === 0) {
                // No file selected
                input.classList.add('input-error');
                input.classList.remove('input-success');
                esValido = false;
                Swal.fire({
                    title: 'Archivo requerido',
                    text: 'Por favor, seleccione un archivo.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                return false;  // Stop the validation process
            } else {
                // Optional: Validate file type and size
                const file = input.files[0];
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png']; // Only allow JPEG/JPG and PNG
                const maxSize = 5 * 1024 * 1024; // 5MB max size

                if (!validTypes.includes(file.type)) {
                    input.classList.add('input-error');
                    input.classList.remove('input-success');
                    esValido = false;
                    Swal.fire({
                        title: 'Tipo de archivo inválido',
                        text: 'Por favor, seleccione un archivo JPEG/JPG o PNG.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                    return false;  // Stop the validation process
                }

                if (file.size > maxSize) {
                    input.classList.add('input-error');
                    input.classList.remove('input-success');
                    esValido = false;
                    Swal.fire({
                        title: 'Tamaño de archivo demasiado grande',
                        text: 'El archivo debe ser de 5MB o menos.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                    return false;  // Stop the validation process
                }

                // If valid file
                input.classList.add('input-success');
                input.classList.remove('input-error');
            }
        } else if (input.value.trim() === '') {
            // Generic required field validation
            input.classList.add('input-error');
            input.classList.remove('input-success');
            esValido = false;
        } else {
            input.classList.add('input-success');
            input.classList.remove('input-error');
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


  function formatCedula(input) {
    // Remove all non-numeric characters
    let value = input.value.replace(/\D/g, '');

    // Limit the length to 11 characters (cédula max length)
    if (value.length > 11) {
        value = value.substring(0, 11);
    }

    // Apply formatting based on length
    if (value.length > 10) {
        value = value.replace(/(\d{3})(\d{7})(\d{1})/, '$1-$2-$3'); // Full cédula format
    } else if (value.length > 3) {
        value = value.replace(/(\d{3})(\d{7})?/, '$1-$2'); // Partial format
    }

    // Update the input field value
    input.value = value;
}


