const form = document.getElementById('form-alta-huesped');
const btnCancelar = document.getElementById('btn-cancelar');
const msgError = document.getElementById('mensaje-error');


const modalExito = document.getElementById('modal-exito');
const modalMensaje = document.getElementById('modal-mensaje');
const btnModalSi = document.getElementById('btn-modal-si');
const btnModalNo = document.getElementById('btn-modal-no');

const modalAdvertencia = document.getElementById('modal-advertencia');
const modalAdvertenciaMensaje = document.getElementById('modal-advertencia-mensaje');
const btnModalCorregir = document.getElementById('btn-modal-corregir');
const btnModalAceptar = document.getElementById('btn-modal-aceptar');


const API_URL = 'http://localhost:8080/api/huespedes';


let datosHuespedTemporal = null;

async function guardarHuesped(huespedData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(huespedData),
        });

        if (response.ok) {
            const nuevoHuesped = await response.json();
            mostrarModalExito(nuevoHuesped);
        } else if (response.status === 409) {
            //Flujo Alternativo 2.B
            const errorMsg = await response.text();
            datosHuespedTemporal = huespedData; 
            mostrarModalAdvertencia(errorMsg);
        } else {
            mostrarErrorGeneral('Ocurrió un error inesperado al guardar el huésped.');
        }

    } catch (error) {
        console.error('Error de conexión:', error);
        mostrarErrorGeneral('No se pudo conectar con el servidor. Revisa la consola.');
    }
}


async function forzarGuardadoHuesped(huespedData) {
    try {
        const response = await fetch(`${API_URL}?force=true`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(huespedData),
        });

        if (response.ok) {
            // Exito (Flujo Alternativo 2.B.2.1)
            const nuevoHuesped = await response.json();
            mostrarModalExito(nuevoHuesped);
        } else {
            mostrarErrorGeneral('Ocurrió un error inesperado al forzar el guardado.');
        }

    } catch (error) {
        console.error('Error de conexión:', error);
        mostrarErrorGeneral('No se pudo conectar con el servidor. Revisa la consola.');
    }
}

function mostrarModalExito(nuevoHuesped) {
    modalMensaje.textContent = `El huésped ${nuevoHuesped.nombres} ${nuevoHuesped.apellido} ha sido satisfactoriamente cargado al sistema.`;
    modalExito.style.display = 'flex';
}

function mostrarModalAdvertencia(mensaje) {
    modalAdvertenciaMensaje.textContent = mensaje;
    modalAdvertencia.style.display = 'flex';
}

function mostrarErrorGeneral(mensaje) {
    msgError.textContent = mensaje;
    msgError.style.display = 'block';
}

function ocultarPaneles() {
    msgError.style.display = 'none';
    modalExito.style.display = 'none';
    modalAdvertencia.style.display = 'none';
}


// Boton siguiente (cargar huesped)
form.addEventListener('submit', async (event) => {
    event.preventDefault(); 
    ocultarPaneles();

    const formData = new FormData(form);

    const huespedData = {
        nombres: formData.get('nombres'),
        apellido: formData.get('apellido'),
        tipoDocumento: formData.get('tipoDocumento'),
        numeroDocumento: formData.get('numeroDocumento'),
        cuit: formData.get('cuit') || null, 
        posicionIva: formData.get('posicionIva'),
        fechaNacimiento: formData.get('fechaNacimiento'),
        telefono: formData.get('telefono'),
        email: formData.get('email') || null, 
        ocupacion: formData.get('ocupacion'),
        nacionalidad: formData.get('nacionalidad'),
        
        // 2. Creamos el objeto anidado 'direccion'
        direccion: {
            pais: formData.get('pais'),
            provincia: formData.get('provincia'),
            localidad: formData.get('localidad'),
            direccionCalle: formData.get('direccionCalle'),
            codigoPostal: formData.get('codigoPostal'),
            direccionNumero: formData.get('direccionNumero'),
            direccionPiso: formData.get('direccionPiso') || null 
        }
    };

    guardarHuesped(huespedData);
});

// Boton cancelar
btnCancelar.addEventListener('click', () => {
    if (confirm('¿Desea cancelar el alta del huésped?')) {
        form.reset();
        ocultarPaneles();
    }
});

// Boton si cargar otro
btnModalSi.addEventListener('click', () => {
    modalExito.style.display = 'none';
    form.reset();
});

// Boton no cargar otro
btnModalNo.addEventListener('click', () => {
    modalExito.style.display = 'none';
});

// Boton corregir
btnModalCorregir.addEventListener('click', () => {
    modalAdvertencia.style.display = 'none';
    datosHuespedTemporal = null; 
});


btnModalAceptar.addEventListener('click', () => {
    modalAdvertencia.style.display = 'none';
    if (datosHuespedTemporal) {
        forzarGuardadoHuesped(datosHuespedTemporal); 
    }
    datosHuespedTemporal = null; 
});