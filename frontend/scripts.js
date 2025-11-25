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

// --- LOGICA ESTADO HABITACIONES ---

const btnBuscarEstado = document.getElementById('btn-buscar-estado');
if (btnBuscarEstado) {
    btnBuscarEstado.addEventListener('click', buscarEstadoHabitaciones);
}

// Filtros
document.querySelectorAll('.filter-type').forEach(cb => {
    cb.addEventListener('change', aplicarFiltrosEstado);
});
document.querySelectorAll('.filter-status').forEach(cb => {
    cb.addEventListener('change', aplicarFiltrosEstado);
});

async function buscarEstadoHabitaciones() {
    const fechaDesdeInput = document.getElementById('estado-fecha-desde');
    const fechaHastaInput = document.getElementById('estado-fecha-hasta');

    if (!fechaDesdeInput.value || !fechaHastaInput.value) {
        alert("Por favor seleccione ambas fechas.");
        return;
    }

    const fechaDesde = fechaDesdeInput.value;
    const fechaHasta = fechaHastaInput.value;

    if (fechaDesde > fechaHasta) {
        alert("La fecha desde no puede ser mayor a la fecha hasta.");
        return;
    }

    const url = `http://localhost:8080/habitaciones/estado?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`;

    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            renderTablaEstado(data, fechaDesde, fechaHasta);
        } else {
            console.error("Error al obtener estados:", response.status);
            alert("Error al obtener los estados de las habitaciones.");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("Error de conexión al servidor.");
    }
}

function renderTablaEstado(data, fechaDesdeStr, fechaHastaStr) {
    const thead = document.getElementById('status-table-head');
    const tbody = document.getElementById('status-table-body');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="100%">No hay habitaciones cargadas.</td></tr>';
        return;
    }

    // Sort rooms by number (optional but good)
    data.sort((a, b) => a.numero.localeCompare(b.numero));

    // 1. Generate Header (Room IDs)
    // First column is "Dia"
    let headerRow = '<tr><th>Dia</th>';
    data.forEach(hab => {
        // Add class for room type filtering
        let camasInfo = '';
        if (hab.camas && hab.camas.length > 0) {
            camasInfo = `<br><span style="font-size: 0.8em; font-weight: normal;">${hab.camas.join(', ')}</span>`;
        }
        headerRow += `<th class="col-room" data-tipo="${hab.tipo}">${hab.numero}${camasInfo}</th>`;
    });
    headerRow += '</tr>';
    thead.innerHTML = headerRow;

    // 2. Generate Rows (Dates)
    let current = new Date(fechaDesdeStr + 'T00:00:00'); // Append time to avoid timezone issues
    const end = new Date(fechaHastaStr + 'T00:00:00');
    // Helper to format date as YYYY-MM-DD for key lookup
    const formatDateKey = (date) => {
        return date.toISOString().split('T')[0];
    };

    // Helper to format date for display
    const formatDateDisplay = (date) => {
        return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    while (current <= end) {
        const dateKey = formatDateKey(current);
        let rowHtml = `<tr><td>${formatDateDisplay(current)}</td>`;

        data.forEach(hab => {
            const status = hab.estadosPorFecha[dateKey] || 'LIBRE'; // Default to LIBRE if missing
            let statusClass = '';
            let statusText = '';

            switch (status) {
                case 'LIBRE':
                    statusClass = 'status-libre';
                    statusText = 'Libre';
                    break;
                case 'OCUPADO':
                    statusClass = 'status-ocupado';
                    statusText = 'Ocupada';
                    break;
                case 'RESERVADO':
                    statusClass = 'status-reservado';
                    statusText = 'Reservada';
                    break;
                case 'PAGO_PENDIENTE':
                    statusClass = 'status-pago-pendiente';
                    statusText = 'Pendiente de Pago';
                    break;
                default:
                    statusText = status;
            }

            rowHtml += `<td class="col-room cell-status ${statusClass}" data-tipo="${hab.tipo}" data-status="${status}">${statusText}</td>`;
        });

        rowHtml += '</tr>';
        tbody.innerHTML += rowHtml;

        current.setDate(current.getDate() + 1);
    }

    aplicarFiltrosEstado(); // Apply filters initially
}

function aplicarFiltrosEstado() {
    // 1. Get Filter Values
    const checkedTypes = Array.from(document.querySelectorAll('.filter-type:checked')).map(cb => cb.value);
    const checkedStatuses = Array.from(document.querySelectorAll('.filter-status:checked')).map(cb => cb.value);

    // 2. Identify Columns (Headers)
    const roomHeaders = Array.from(document.querySelectorAll('#status-table-head th.col-room'));
    const tbody = document.getElementById('status-table-body');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    // 3. Determine Visibility per Column
    // Initialize all to true
    const colVisibility = new Array(roomHeaders.length).fill(true);

    // 3a. Check Room Type
    roomHeaders.forEach((th, index) => {
        const tipo = th.getAttribute('data-tipo');
        if (!checkedTypes.includes(tipo)) {
            colVisibility[index] = false;
        }
    });

    // 3b. Check Status (Strict: If ANY cell in the column has an unchecked status, hide the WHOLE column)
    rows.forEach(row => {
        const cells = row.querySelectorAll('td.col-room');
        cells.forEach((cell, index) => {
            // Optimization: If already hidden, skip
            if (!colVisibility[index]) return;

            const status = cell.getAttribute('data-status');
            if (!checkedStatuses.includes(status)) {
                colVisibility[index] = false;
            }
        });
    });

    // 4. Apply Visibility
    // Headers
    roomHeaders.forEach((th, index) => {
        th.style.display = colVisibility[index] ? '' : 'none';
    });

    // Cells
    rows.forEach(row => {
        const cells = row.querySelectorAll('td.col-room');
        cells.forEach((cell, index) => {
            cell.style.display = colVisibility[index] ? '' : 'none';

            // Reset styles if visible (in case they were modified by previous logic)
            if (colVisibility[index]) {
                cell.style.backgroundColor = '';
                cell.style.color = '';
            }
        });
    });
}