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

const reglaSoloTexto = {
    regex: /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/,
    msg: 'Solo se permiten letras.'
};

const reglaSoloNumeros = {
    regex: /^[0-9]+$/,
    msg: 'Solo se permiten números.'
};

// Validaciones
const reglasValidacion = {
    'nombres': reglaSoloTexto,
    'apellido': reglaSoloTexto,
    'nacionalidad': reglaSoloTexto,
    'pais': reglaSoloTexto,
    'provincia': reglaSoloTexto,
    'localidad': reglaSoloTexto,
    'ocupacion': reglaSoloTexto,
    'numeroDocumento': reglaSoloNumeros,
    'codigoPostal': reglaSoloNumeros,
    'direccionNumero': reglaSoloNumeros,
    'direccionCalle': reglaSoloTexto,
    'telefono': { regex: /^[0-9+]+$/, msg: 'Solo números y el signo +.' },
    'cuit': { regex: /^[0-9-]+$/, msg: 'Formato de CUIT inválido (solo números y guiones).' }
};


// Mostrar errores por campo
function mostrarErrorCampo(nombreCampo, mensaje) {
    const input = document.querySelector(`[name="${nombreCampo}"]`);
    const errorTag = document.getElementById(`error-${nombreCampo}`);

    if (input) {
        input.classList.add('input-error');
    }
    if (errorTag) {
        errorTag.textContent = mensaje;
        errorTag.style.display = 'block';
    }
}

function limpiarErrores() {
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    document.querySelectorAll('.error-text').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
    msgError.style.display = 'none';
}

// Validacion en front
function validarInputs(formElement, reglas) {
    let esValido = true;
    let primerError = null;

    limpiarErrores(); // Limpiamos antes de validar

    for (const [nameCampo, regla] of Object.entries(reglas)) {
        const input = formElement.querySelector(`[name="${nameCampo}"]`);
        if (input) {
            const valor = input.value.trim();

            if (valor.length > 0 && !regla.regex.test(valor)) {
                // Mostramos el error usando la misma función
                mostrarErrorCampo(nameCampo, regla.msg);

                esValido = false;
                if (!primerError) primerError = input;
            }
        }
    }

    return esValido;
}

// Quitar error al escribir
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
        input.classList.remove('input-error');
        const errorTag = document.getElementById(`error-${input.name}`);
        if (errorTag) {
            errorTag.textContent = '';
            errorTag.style.display = 'none';
        }
    });
});


// Enviar formulario
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Validación Local
    if (!validarInputs(form, reglasValidacion)) {
        return;
    }

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

async function guardarHuesped(huespedData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(huespedData),
        });

        if (response.ok) {
            const nuevoHuesped = await response.json();
            mostrarModalExito(nuevoHuesped);

        } else if (response.status === 409) {
            const errorMsg = await response.text();
            datosHuespedTemporal = huespedData;
            mostrarModalAdvertencia(errorMsg);

        } else if (response.status === 400) {
            const erroresBackend = await response.json();

            // Recorremos el mapa que mandó el backend: { "apellido": "Apellido inválido", ... }
            Object.keys(erroresBackend).forEach(campo => {
                // Buscamos el mensaje que vino del backend
                const mensajeDelBackend = erroresBackend[campo];
                // Lo mostramos en pantalla
                mostrarErrorCampo(campo, mensajeDelBackend);
            });

            mostrarErrorGeneral("El servidor detectó datos inválidos.");

        } else {
            mostrarErrorGeneral('Ocurrió un error inesperado al guardar el huésped.');
        }

    } catch (error) {
        console.error('Error:', error);
        mostrarErrorGeneral('No se pudo conectar con el servidor.');
    }
}

async function forzarGuardadoHuesped(huespedData) {
    try {
        const response = await fetch(`${API_URL}?force=true`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(huespedData),
        });
        if (response.ok) {
            const nuevoHuesped = await response.json();
            mostrarModalExito(nuevoHuesped);
        } else {
            mostrarErrorGeneral('Error al forzar guardado.');
        }
    } catch (error) {
        mostrarErrorGeneral('Error de conexión.');
    }
}

function mostrarModalExito(h) {
    modalMensaje.textContent = `Huésped ${h.nombres} ${h.apellido} guardado exitosamente.`;
    modalExito.style.display = 'flex';
}
function mostrarModalAdvertencia(msg) {
    modalAdvertenciaMensaje.textContent = msg;
    modalAdvertencia.style.display = 'flex';
}
function mostrarErrorGeneral(msg) {
    msgError.textContent = msg;
    msgError.style.display = 'block';
}
function ocultarPaneles() {
    msgError.style.display = 'none';
    modalExito.style.display = 'none';
    modalAdvertencia.style.display = 'none';
}

btnCancelar.addEventListener('click', () => {
    if (confirm('¿Cancelar alta?')) {
        form.reset();
        limpiarErrores();
        ocultarPaneles();
    }
});
function cambiarVista(vista) {
    const secciones = document.querySelectorAll('.vista-seccion');
    secciones.forEach(seccion => {
        seccion.style.display = 'none';
    });


    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        link.classList.remove('active');
    });

    const vistaMostrar = document.getElementById(`vista-${vista}`);
    if (vistaMostrar) {
        vistaMostrar.style.display = 'block';
    } else {
        console.error(`No se encontró la vista con ID: vista-${vista}`);
    }

    const linkActivo = Array.from(links).find(link => link.getAttribute('onclick').includes(`'${vista}'`));
    if (linkActivo) {
        linkActivo.classList.add('active');
    }
}

const btnBuscarAccion = document.getElementById('btn-buscar-accion');
if (btnBuscarAccion) {
    btnBuscarAccion.addEventListener('click', buscarHuespedes);
}

// Listener para buscar con Enter en los campos de búsqueda
const formBusqueda = document.getElementById('form-busqueda');
if (formBusqueda) {
    const inputs = formBusqueda.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                buscarHuespedes();
            }
        });
    });
}

async function buscarHuespedes() {
    const tbody = document.getElementById('tabla-huespedes-body');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Buscando...</td></tr>';

    const nombre = document.getElementById('busqueda-nombre').value.trim();
    const apellido = document.getElementById('busqueda-apellido').value.trim();
    const tipoDoc = document.getElementById('busqueda-tipoDoc').value;
    const numDoc = document.getElementById('busqueda-numDoc').value.trim();

    // Construir URL con parámetros
    const params = new URLSearchParams();
    if (nombre) params.append('nombre', nombre);
    if (apellido) params.append('apellido', apellido);
    if (tipoDoc) params.append('tipoDocumento', tipoDoc);
    if (numDoc) params.append('numeroDocumento', numDoc);

    const url = `${API_URL}/buscar?${params.toString()}`;

    try {
        const response = await fetch(url);

        if (response.ok) {
            const listaHuespedes = await response.json();
            tbody.innerHTML = '';

            if (listaHuespedes.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No se encontraron resultados</td></tr>';
                return;
            }

            listaHuespedes.forEach(h => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td style="text-align:center;"><input type="checkbox" value="${h.idHuesped}"></td>
                    <td>${h.nombres}</td>
                    <td>${h.apellido}</td>
                    <td>${h.tipoDocumento}</td>
                    <td>${h.numeroDocumento}</td>
                `;
                tbody.appendChild(fila);
            });
        } else {
            console.error("Error al buscar:", response.status);
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Error al buscar datos</td></tr>';
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Error de conexión</td></tr>';
    }
}

btnModalSi.addEventListener('click', () => { modalExito.style.display = 'none'; form.reset(); limpiarErrores(); });
btnModalNo.addEventListener('click', () => { modalExito.style.display = 'none'; });
btnModalCorregir.addEventListener('click', () => { modalAdvertencia.style.display = 'none'; datosHuespedTemporal = null; });
btnModalAceptar.addEventListener('click', () => {
    modalAdvertencia.style.display = 'none';
    if (datosHuespedTemporal) forzarGuardadoHuesped(datosHuespedTemporal);
    datosHuespedTemporal = null;
});