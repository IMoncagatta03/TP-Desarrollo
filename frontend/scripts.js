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

// --- LOGIN LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const vistaLogin = document.getElementById('vista-login');
    const appPrincipal = document.getElementById('app-principal');
    const formLogin = document.getElementById('form-login');
    const modalErrorLogin = document.getElementById('modal-error-login');
    const btnCerrarErrorLogin = document.getElementById('btn-cerrar-error-login');
    const inputUsuario = document.getElementById('login-usuario');
    const inputPassword = document.getElementById('login-password');

    // Focus inicial
    if (inputUsuario) inputUsuario.focus();

    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const usuario = inputUsuario.value.trim(); // Permitir espacios si es necesario, pero trim es standard
            const password = inputPassword.value;

            // Credenciales Hardcodeadas: admin / root
            if (usuario === 'admin' && password === 'root') {
                // Login Exitoso
                vistaLogin.style.display = 'none';
                appPrincipal.style.display = 'block';
                // Inicializar vista por defecto (Inicio)
                cambiarVista('inicio');
            } else {
                // Login Fallido
                alert("Usuario o contraseña incorrectos");
                inputUsuario.value = '';
                inputPassword.value = '';
                inputUsuario.focus();
            }
        });
    }
});

function logout() {
    if (confirm('¿Está seguro que desea salir?')) {
        location.reload(); // Recargar página vuelve al login
    }
}

// --- END LOGIN LOGIC ---

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

    // 1. Validar campos obligatorios (required)
    const inputs = formElement.querySelectorAll('input, select');
    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            mostrarErrorCampo(input.name, 'Este campo es obligatorio.');
            esValido = false;
            if (!primerError) primerError = input;
        }
    });

    // 1.5 Validar CUIT si es Responsable Inscripto
    const posIva = formElement.querySelector('#posicionIva');
    const cuit = formElement.querySelector('#cuit');
    if (posIva && posIva.value === 'RESPONSABLE_INSCRIPTO' && cuit && !cuit.value.trim()) {
        mostrarErrorCampo('cuit', 'El CUIT es obligatorio para Responsable Inscripto.');
        esValido = false;
        if (!primerError) primerError = cuit;
    }

    // 2. Validar reglas específicas (regex)
    for (const [nameCampo, regla] of Object.entries(reglas)) {
        const input = formElement.querySelector(`[name="${nameCampo}"]`);
        if (input) {
            const valor = input.value.trim();

            // Solo validamos regex si tiene valor (si está vacío y es required, ya saltó el error arriba)
            if (valor.length > 0 && !regla.regex.test(valor)) {
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
    modalMensaje.textContent = `El huésped ${h.nombres} ${h.apellido} ha sido satisfactoriamente cargado al sistema.`;
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
    document.getElementById('modal-cancelar-alta').style.display = 'flex';
});

// Lógica Modal Cancelar Alta
document.getElementById('btn-modal-cancelar-no').addEventListener('click', () => {
    document.getElementById('modal-cancelar-alta').style.display = 'none';
});

document.getElementById('btn-modal-cancelar-si').addEventListener('click', () => {
    document.getElementById('modal-cancelar-alta').style.display = 'none';
    form.reset();
    limpiarErrores();
    ocultarPaneles();
    cambiarVista('inicio');
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

// Listener del botón eliminado, ahora se maneja con el submit del formulario

// Lógica del botón SIGUIENTE en Búsqueda
const btnSiguienteBusqueda = document.getElementById('btn-siguiente-busqueda');
if (btnSiguienteBusqueda) {
    btnSiguienteBusqueda.addEventListener('click', () => {
        // 1. Buscar si hay algún checkbox seleccionado
        const checkboxSeleccionado = document.querySelector('#tabla-huespedes-body input[type="checkbox"]:checked');

        if (checkboxSeleccionado) {
            // CASO 1: Hay selección -> Ir a Modificar (CU10)

            // Intentamos obtener datos de la fila para pre-llenar (UX)
            const fila = checkboxSeleccionado.closest('tr');
            const celdas = fila.querySelectorAll('td');
            // Indices: 0=Checkbox, 1=Nombre, 2=Apellido, 3=TipoDoc, 4=NumDoc

            const nombre = celdas[1].textContent;
            const apellido = celdas[2].textContent;
            const tipoDoc = celdas[3].textContent;
            const numDoc = celdas[4].textContent;

            cambiarVista('modificar');

            // Pre-llenar formulario de modificación
            document.getElementById('mod-nombres').value = nombre;
            document.getElementById('mod-apellido').value = apellido;
            document.getElementById('mod-tipoDocumento').value = tipoDoc;
            document.getElementById('mod-numeroDocumento').value = numDoc;

        } else {
            // CASO 2: NO hay selección -> Ir a Alta (CU11)
            irAAltaConDatos();
        }
    });
}

// Listener para buscar con Enter en los campos de búsqueda
// --- REQUERIMIENTOS ESPECIALES ---

// 1. Forzar Mayúsculas en Inputs de Texto (Excluyendo Login)
document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'text') {
        // Excluir inputs del login
        if (e.target.id === 'login-usuario' || e.target.id === 'login-password') return;

        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        e.target.value = e.target.value.toUpperCase();
        e.target.setSelectionRange(start, end);
    }
});

// 2. Ordenamiento de Tabla
let ordenAscendente = true;
function ordenarTabla(n) {
    const table = document.querySelector(".results-table");
    const tbody = document.getElementById("tabla-huespedes-body");
    let rows, switching, i, x, y, shouldSwitch;
    switching = true;

    // Invertir orden si es la misma columna, sino resetear a ascendente
    // (Simplificación: alternamos siempre por ahora, idealmente trackear por columna)
    ordenAscendente = !ordenAscendente;

    while (switching) {
        switching = false;
        rows = tbody.rows;

        for (i = 0; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];

            let xVal = x.textContent || x.innerText;
            let yVal = y.textContent || y.innerText;

            if (ordenAscendente) {
                if (xVal.toLowerCase() > yVal.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            } else {
                if (xVal.toLowerCase() < yVal.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}

// 3. Manejo de Búsqueda (Submit Form)
const formBusqueda = document.getElementById('form-busqueda');
if (formBusqueda) {
    formBusqueda.addEventListener('submit', (e) => {
        e.preventDefault(); // Evitar recarga
        buscarHuespedes();
    });
}

// 4. Botón Cancelar Búsqueda
const btnCancelarBusqueda = document.getElementById('btn-cancelar-busqueda');
if (btnCancelarBusqueda) {
    btnCancelarBusqueda.addEventListener('click', () => {
        document.getElementById('form-busqueda').reset();
        document.getElementById('tabla-huespedes-body').innerHTML = '';
        cambiarVista('inicio');
    });
}

// Función para comportamiento de "Radio Button Deseleccionable"
function seleccionarUnico(checkboxActual) {
    if (checkboxActual.checked) {
        // Si se marcó este, desmarcar todos los demás
        const todos = document.querySelectorAll('.select-huesped');
        todos.forEach(cb => {
            if (cb !== checkboxActual) {
                cb.checked = false;
            }
        });
    }
}

function seleccionarConEnter(event, checkbox) {
    if (event.key === 'Enter') {
        event.preventDefault();
        checkbox.checked = !checkbox.checked;
        seleccionarUnico(checkbox);
    }
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
                // MODIFICACION: Botón para ir a dar de alta
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align:center;">
                            <p>No se encontraron resultados.</p>
                            <button class="btn-submit" onclick="irAAltaConDatos()" style="margin-top: 10px;">
                                <i class="fas fa-user-plus"></i> Dar de Alta
                            </button>
                        </td>
                    </tr>`;
                return;
            }

            listaHuespedes.forEach(h => {
                const fila = document.createElement('tr');
                // MODIFICACION: Checkbox con lógica de exclusión mutua (Radio behavior but toggleable)
                fila.innerHTML = `
                    <td style="text-align:center;">
                        <input type="checkbox" class="select-huesped" value="${h.idHuesped}" onchange="seleccionarUnico(this)" onkeydown="seleccionarConEnter(event, this)">
                    </td>
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

function irAAltaConDatos() {
    // 1. Obtener datos de la búsqueda
    const nombre = document.getElementById('busqueda-nombre').value.trim();
    const apellido = document.getElementById('busqueda-apellido').value.trim();
    const tipoDoc = document.getElementById('busqueda-tipoDoc').value;
    const numDoc = document.getElementById('busqueda-numDoc').value.trim();

    // 2. Cambiar a la vista de Alta
    cambiarVista('alta');

    // 3. Pre-llenar el formulario
    if (nombre) document.getElementById('nombres').value = nombre;
    if (apellido) document.getElementById('apellido').value = apellido;
    if (tipoDoc) document.getElementById('tipoDocumento').value = tipoDoc;
    if (numDoc) document.getElementById('numeroDocumento').value = numDoc;
}

btnModalSi.addEventListener('click', () => {
    modalExito.style.display = 'none';
    form.reset();
    limpiarErrores();
    ocultarPaneles();
    // Se mantiene en la vista actual (Alta)
});

btnModalNo.addEventListener('click', () => {
    modalExito.style.display = 'none';
    form.reset();
    limpiarErrores();
    ocultarPaneles();
    cambiarVista('inicio');
});
btnModalCorregir.addEventListener('click', () => {
    modalAdvertencia.style.display = 'none';
    datosHuespedTemporal = null;

    // Highlight fields
    const tipoDocInput = document.getElementById('tipoDocumento');
    const numDocInput = document.getElementById('numeroDocumento');

    if (tipoDocInput) tipoDocInput.classList.add('input-error');
    if (numDocInput) numDocInput.classList.add('input-error');

    // Focus
    if (tipoDocInput) tipoDocInput.focus();
});
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

// Botón Limpiar y Salir (Estado Habitaciones)
const btnLimpiarSalirEstado = document.getElementById('btn-limpiar-salir-estado');
if (btnLimpiarSalirEstado) {
    btnLimpiarSalirEstado.addEventListener('click', () => {
        // 1. Limpiar Fechas
        const fechaDesdeInput = document.getElementById('estado-fecha-desde');
        const fechaHastaInput = document.getElementById('estado-fecha-hasta');
        if (fechaDesdeInput) fechaDesdeInput.value = '';
        if (fechaHastaInput) fechaHastaInput.value = '';

        // 2. Limpiar Errores
        const errorDesde = document.getElementById('error-estado-fecha-desde');
        const errorHasta = document.getElementById('error-estado-fecha-hasta');
        if (errorDesde) { errorDesde.style.display = 'none'; errorDesde.textContent = ''; }
        if (errorHasta) { errorHasta.style.display = 'none'; errorHasta.textContent = ''; }
        if (fechaDesdeInput) fechaDesdeInput.classList.remove('input-error');
        if (fechaHastaInput) fechaHastaInput.classList.remove('input-error');

        // 3. Limpiar Grilla
        document.getElementById('status-table-head').innerHTML = '';
        document.getElementById('status-table-body').innerHTML = '';

        // 4. Resetear Filtros (Todos marcados por defecto)
        document.querySelectorAll('.filter-type, .filter-status').forEach(cb => cb.checked = true);

        // 5. Volver a Inicio
        cambiarVista('inicio');
    });
}

// Enter Key Support for Date Inputs
const fechaDesdeInput = document.getElementById('estado-fecha-desde');
const fechaHastaInput = document.getElementById('estado-fecha-hasta');

if (fechaDesdeInput) {
    fechaDesdeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') buscarEstadoHabitaciones();
    });
}
if (fechaHastaInput) {
    fechaHastaInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') buscarEstadoHabitaciones();
    });
}

// Filtros
const handleFilterKeydown = (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        e.target.checked = !e.target.checked;
        aplicarFiltrosEstado();
    }
};

document.querySelectorAll('.filter-type').forEach(cb => {
    cb.addEventListener('change', aplicarFiltrosEstado);
    cb.addEventListener('keydown', handleFilterKeydown);
});
document.querySelectorAll('.filter-status').forEach(cb => {
    cb.addEventListener('change', aplicarFiltrosEstado);
    cb.addEventListener('keydown', handleFilterKeydown);
});

async function buscarEstadoHabitaciones() {
    const fechaDesdeInput = document.getElementById('estado-fecha-desde');

    const fechaHastaInput = document.getElementById('estado-fecha-hasta');
    const errorDesde = document.getElementById('error-estado-fecha-desde');
    const errorHasta = document.getElementById('error-estado-fecha-hasta');

    // Limpiar errores previos
    if (errorDesde) { errorDesde.style.display = 'none'; errorDesde.textContent = ''; }
    if (errorHasta) { errorHasta.style.display = 'none'; errorHasta.textContent = ''; }
    if (fechaDesdeInput) fechaDesdeInput.classList.remove('input-error');
    if (fechaHastaInput) fechaHastaInput.classList.remove('input-error');

    // 3.A Validación Fecha Desde
    if (!fechaDesdeInput.value) {
        if (errorDesde) {
            errorDesde.textContent = "Por favor ingrese una fecha en 'Desde fecha'.";
            errorDesde.style.display = 'block';
        }
        fechaDesdeInput.classList.add('input-error');
        fechaDesdeInput.focus();
        return;
    }

    // 4.A Validación Fecha Hasta
    if (!fechaHastaInput.value) {
        if (errorHasta) {
            errorHasta.textContent = "Por favor ingrese una fecha en 'Hasta fecha'.";
            errorHasta.style.display = 'block';
        }
        fechaHastaInput.classList.add('input-error');
        fechaHastaInput.focus();
        return;
    }

    const fechaDesde = fechaDesdeInput.value;
    const fechaHasta = fechaHastaInput.value;

    // Validación de Año (2020 - 2030)
    const yearDesde = parseInt(fechaDesde.split('-')[0]);
    const yearHasta = parseInt(fechaHasta.split('-')[0]);

    if (yearDesde < 2020 || yearDesde > 2030) {
        if (errorDesde) {
            errorDesde.textContent = "El año debe estar entre 2020 y 2030.";
            errorDesde.style.display = 'block';
        }
        fechaDesdeInput.classList.add('input-error');
        fechaDesdeInput.focus();
        return;
    }

    if (yearHasta < 2020 || yearHasta > 2030) {
        if (errorHasta) {
            errorHasta.textContent = "El año debe estar entre 2020 y 2030.";
            errorHasta.style.display = 'block';
        }
        fechaHastaInput.classList.add('input-error');
        fechaHastaInput.focus();
        return;
    }

    if (fechaDesde > fechaHasta) {
        if (errorDesde) {
            errorDesde.textContent = "La fecha 'Desde' no puede ser mayor a la fecha 'Hasta'.";
            errorDesde.style.display = 'block';
        }
        fechaDesdeInput.classList.add('input-error');
        fechaDesdeInput.focus();
        return;
    }

    // Mostrar "Cargando..." y limpiar tabla
    const tbody = document.getElementById('status-table-body');
    const thead = document.getElementById('status-table-head');
    thead.innerHTML = '';
    tbody.innerHTML = '<tr><td colspan="100%" style="text-align:center; padding: 20px; font-weight: bold;">Cargando estado de habitaciones...</td></tr>';

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
                    statusText = 'Pago Pendiente';
                    break;
                default:
                    statusClass = 'status-libre';
                    statusText = 'Libre';
            }

            // Read-only cell (no onclick, no selection attributes)
            rowHtml += `<td class="col-room cell-status ${statusClass}" 
                            data-tipo="${hab.tipo}" 
                            data-status="${status}">
                            ${statusText}
                        </td>`;
        });
        rowHtml += '</tr>';
        tbody.innerHTML += rowHtml;

        current.setDate(current.getDate() + 1);
    }

    aplicarFiltrosEstado(); // Re-apply filters after render
}

// --- LOGICA DE SELECCION Y RESERVA (MULTI-ROOM) ---

let selections = {}; // Map: { '101': { start: '2023-01-01', end: '2023-01-05' } }

function handleCellClick(celda) {
    const estado = celda.dataset.estado;
    const fecha = celda.dataset.fecha;
    const habitacion = celda.dataset.habitacion;

    if (estado !== 'LIBRE') {
        alert("Solo se pueden seleccionar días libres.");
        return;
    }

    // Initialize if not exists
    if (!selections[habitacion]) {
        selections[habitacion] = { start: null, end: null };
    }

    const currentSel = selections[habitacion];

    if (!currentSel.start) {
        // 1. First click: Start Date
        currentSel.start = fecha;
        celda.classList.add('status-selected-start');
    } else if (!currentSel.end) {
        // 2. Second click: End Date
        if (fecha < currentSel.start) {
            // If clicked before start, reset and set as new start
            limpiarSeleccionHabitacion(habitacion);
            selections[habitacion] = { start: fecha, end: null };
            celda.classList.add('status-selected-start');
        } else {
            // Validate range
            if (validarRango(habitacion, currentSel.start, fecha)) {
                // Remove start style from the first cell (it will get full style in marcarRango)
                const startCell = document.querySelector(`td[data-habitacion="${habitacion}"][data-fecha="${currentSel.start}"]`);
                if (startCell) startCell.classList.remove('status-selected-start');

                currentSel.end = fecha;
                marcarRango(habitacion, currentSel.start, fecha);
            } else {
                alert("El rango seleccionado contiene días ocupados.");
                limpiarSeleccionHabitacion(habitacion);
            }
        }
    } else {
        // 3. Third click: Deselect room
        limpiarSeleccionHabitacion(habitacion);
    }

    actualizarBotonConfirmar();
}

function limpiarSeleccionHabitacion(habitacion) {
    delete selections[habitacion];
    // Remove class from all cells of this room
    const celdas = document.querySelectorAll(`td[data-habitacion="${habitacion}"]`);
    celdas.forEach(c => {
        c.classList.remove('status-selected');
        c.classList.remove('status-selected-start');
    });
    actualizarBotonConfirmar();
}

function limpiarSeleccion() {
    selections = {};
    document.querySelectorAll('.status-selected').forEach(el => el.classList.remove('status-selected'));
    document.querySelectorAll('.status-selected-start').forEach(el => el.classList.remove('status-selected-start'));
    actualizarBotonConfirmar();
}

function validarRango(habitacion, inicio, fin) {
    const celdas = document.querySelectorAll(`td[data-habitacion="${habitacion}"]`);
    let valido = true;
    let enRango = false;

    celdas.forEach(celda => {
        const fecha = celda.dataset.fecha;
        if (fecha === inicio) enRango = true;

        if (enRango) {
            if (celda.dataset.estado !== 'LIBRE') {
                valido = false;
            }
        }

        if (fecha === fin) enRango = false;
    });

    return valido;
}

function marcarRango(habitacion, inicio, fin) {
    const celdas = document.querySelectorAll(`td[data-habitacion="${habitacion}"]`);
    let enRango = false;

    celdas.forEach(celda => {
        const fecha = celda.dataset.fecha;
        if (fecha === inicio) enRango = true;

        if (enRango) {
            celda.classList.add('status-selected');
        }

        if (fecha === fin) enRango = false;
    });
}

function actualizarBotonConfirmar() {
    let btn = document.getElementById('btn-confirmar-seleccion');
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'btn-confirmar-seleccion';
        btn.className = 'btn-submit';
        btn.textContent = 'CONFIRMAR SELECCIÓN';
        btn.style.marginTop = '10px';
        // btn.onclick = abrirModalReserva; // This will be handled by event listener below
        const container = document.querySelector('.action-buttons-container');
        container.insertBefore(btn, container.firstChild);
    }
    const hasSelections = Object.keys(selections).some(k => selections[k].start && selections[k].end);
    if (btn) btn.style.display = hasSelections ? 'inline-block' : 'none';
}

// --- VERIFICACION Y FORMULARIO ---

const modalVerificacion = document.getElementById('modal-verificacion-reserva');
const btnConfirmarSeleccion = document.getElementById('btn-confirmar-seleccion');
const btnRechazarReserva = document.getElementById('btn-rechazar-reserva');
const btnAceptarReserva = document.getElementById('btn-aceptar-reserva');

if (btnConfirmarSeleccion) {
    btnConfirmarSeleccion.addEventListener('click', () => {
        mostrarModalVerificacion();
    });
}

function mostrarModalVerificacion() {
    const listaContainer = document.getElementById('lista-verificacion-reserva');
    listaContainer.innerHTML = '';

    const ul = document.createElement('ul');
    ul.style.listStyleType = 'none';
    ul.style.padding = '0';

    Object.keys(selections).forEach(habNum => {
        const sel = selections[habNum];
        if (sel.start && sel.end) {
            // Get Room Type (hacky, from DOM)
            // Better: find a cell for this room
            const anyCell = document.querySelector(`td[data-habitacion="${habNum}"]`);
            const tipo = anyCell ? anyCell.dataset.tipo : 'Desconocido';

            const li = document.createElement('li');
            li.style.marginBottom = '10px';
            li.style.borderBottom = '1px solid #eee';
            li.style.paddingBottom = '5px';
            li.innerHTML = `
                <strong>Habitación ${habNum}</strong> (${tipo})<br>
                <span style="color: green;">✔ Ingreso:</span> ${formatDateForDisplay(sel.start)} 12:00hs<br>
                <span style="color: red;">✔ Egreso:</span> ${formatDateForDisplay(sel.end)} 10:00hs
            `;
            ul.appendChild(li);
        }
    });

    listaContainer.appendChild(ul);
    modalVerificacion.style.display = 'flex';
}

function formatDateForDisplay(isoDate) {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
}

if (btnRechazarReserva) {
    btnRechazarReserva.addEventListener('click', () => {
        modalVerificacion.style.display = 'none';
        limpiarSeleccion();
    });
}

if (btnAceptarReserva) {
    btnAceptarReserva.addEventListener('click', () => {
        modalVerificacion.style.display = 'none';
        document.getElementById('modal-reserva').style.display = 'flex';
        // Focus on first field
        setTimeout(() => document.getElementById('reserva-apellido').focus(), 100);
    });
}

// --- FORMULARIO GUEST ---

const modalReserva = document.getElementById('modal-reserva');
const formReserva = document.getElementById('form-reserva');
const btnCancelarReservaForm = document.getElementById('btn-cancelar-reserva');

if (btnCancelarReservaForm) {
    btnCancelarReservaForm.addEventListener('click', () => {
        modalReserva.style.display = 'none';
        formReserva.reset();
        limpiarSeleccion();
        cambiarVista('inicio');
    });
}

if (formReserva) {
    // Reglas de validación específicas para Reserva
    const reglasReserva = {
        'nombres': reglaSoloTexto,
        'apellido': reglaSoloTexto,
        'telefono': { regex: /^[0-9+]+$/, msg: 'Solo números y el signo +.' }
    };

    function mostrarErrorReservaCampo(nombreCampo, mensaje) {
        const input = document.getElementById(`reserva-${nombreCampo}`);
        const errorTag = document.getElementById(`error-reserva-${nombreCampo}`);

        if (input) {
            input.classList.add('input-error');
        }
        if (errorTag) {
            errorTag.textContent = mensaje;
            errorTag.style.display = 'block';
        }
    }

    function limpiarErroresReserva() {
        const inputs = formReserva.querySelectorAll('input');
        inputs.forEach(input => input.classList.remove('input-error'));

        const errorTags = formReserva.querySelectorAll('.error-text');
        errorTags.forEach(tag => {
            tag.textContent = '';
            tag.style.display = 'none';
        });
    }

    function validarInputsReserva() {
        let esValido = true;
        let primerError = null;

        limpiarErroresReserva();

        // 1. Validar campos obligatorios
        const inputs = formReserva.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                // Extraer el nombre del campo del ID (reserva-nombres -> nombres)
                const nombreCampo = input.name;
                mostrarErrorReservaCampo(nombreCampo, 'El campo no puede estar vacío.');
                esValido = false;
                if (!primerError) primerError = input;
            }
        });

        // 2. Validar reglas regex
        for (const [nombreCampo, regla] of Object.entries(reglasReserva)) {
            const input = document.getElementById(`reserva-${nombreCampo}`);
            if (input) {
                const valor = input.value.trim();
                if (valor.length > 0 && !regla.regex.test(valor)) {
                    mostrarErrorReservaCampo(nombreCampo, regla.msg);
                    esValido = false;
                    if (!primerError) primerError = input;
                }
            }
        }

        if (primerError) {
            primerError.focus();
        }

        return esValido;
    }

    // Uppercase enforcement y limpieza de errores al escribir
    const inputs = formReserva.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            input.value = input.value.toUpperCase();

            // Limpiar error de este campo
            input.classList.remove('input-error');
            const nombreCampo = input.name;
            const errorTag = document.getElementById(`error-reserva-${nombreCampo}`);
            if (errorTag) {
                errorTag.style.display = 'none';
                errorTag.textContent = '';
            }
        });
    });

    formReserva.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validarInputsReserva()) {
            return;
        }

        const apellido = document.getElementById('reserva-apellido').value.trim();
        const nombre = document.getElementById('reserva-nombres').value.trim();
        const telefono = document.getElementById('reserva-telefono').value.trim();

        const reservasDTO = [];
        Object.keys(selections).forEach(habNum => {
            const sel = selections[habNum];
            if (sel.start && sel.end) {
                reservasDTO.push({
                    numeroHabitacion: habNum,
                    fechaDesde: sel.start,
                    fechaHasta: sel.end,
                    nombres: nombre,
                    apellido: apellido,
                    telefono: telefono
                });
            }
        });

        if (reservasDTO.length === 0) {
            alert("No hay habitaciones seleccionadas.");
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/reservas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reservasDTO)
            });

            if (response.ok) {
                alert("Reservas creadas con éxito!");
                modalReserva.style.display = 'none';
                formReserva.reset();
                limpiarErroresReserva(); // Limpiar errores visuales también
                limpiarSeleccion();
                buscarHabitacionesParaReserva(); // Refresh grid
            } else {
                const msg = await response.text();
                alert("Error al crear reserva: " + msg);
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión.");
        }
    });
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
    // Actually, for status filter, it's usually "Show me rooms that are FREE now" or "Show me rooms that are OCCUPIED".
    // But in a timeline view, a room changes status.
    // If I uncheck "OCUPADO", should I hide rooms that have AT LEAST one occupied day in range?
    // Or just hide the occupied cells (which makes no sense in a grid)?
    // Let's assume: Hide rooms that have ANY status NOT in the checked list within the visible range?
    // No, that's too restrictive.
    // Let's stick to: Filter by Type only for now, as Status filter in a timeline is ambiguous.
    // OR: Just hide the columns that don't match the type. Status filter might be for "Current Status" which we don't easily know here without checking today's date.
    // Let's implement Type filter correctly and ignore Status filter for column visibility to avoid confusion, or implement it if the user insists.
    // The previous code tried to hide columns. Let's stick to Type filter for column hiding.

    // Apply visibility to Headers
    roomHeaders.forEach((th, index) => {
        th.style.display = colVisibility[index] ? '' : 'none';
    });

    // Apply visibility to Cells
    rows.forEach(row => {
        const cells = row.querySelectorAll('td.col-room');
        cells.forEach((cell, index) => {
            cell.style.display = colVisibility[index] ? '' : 'none';
        });
    });
}

// --- RESERVAR HABITACIÓN LOGIC (CU04 - Interactive) ---

const btnBuscarReserva = document.getElementById('btn-buscar-reserva');
const btnLimpiarSalirReserva = document.getElementById('btn-limpiar-salir-reserva');

if (btnBuscarReserva) {
    btnBuscarReserva.addEventListener('click', (e) => {
        e.preventDefault();
        buscarHabitacionesParaReserva();
    });
}

if (btnLimpiarSalirReserva) {
    btnLimpiarSalirReserva.addEventListener('click', () => {
        document.getElementById('form-buscar-reserva').reset();
        document.getElementById('reserva-table-head').innerHTML = '';
        document.getElementById('reserva-table-body').innerHTML = '';
        limpiarSeleccion();
        cambiarVista('inicio');
    });
}

// Listeners para filtros de Reserva (CU04)
document.querySelectorAll('.filter-type-reserva, .filter-status-reserva').forEach(cb => {
    cb.addEventListener('change', aplicarFiltrosReserva);
});

async function buscarHabitacionesParaReserva() {
    const fechaDesdeInput = document.getElementById('reserva-fecha-desde');
    const fechaHastaInput = document.getElementById('reserva-fecha-hasta');

    const fechaDesde = fechaDesdeInput.value;
    const fechaHasta = fechaHastaInput.value;

    // Validaciones básicas (se pueden mejorar)
    if (!fechaDesde || !fechaHasta) {
        alert("Ingrese ambas fechas.");
        return;
    }
    if (fechaDesde > fechaHasta) {
        alert("La fecha desde no puede ser mayor a la fecha hasta.");
        return;
    }

    // Mostrar "Cargando..."
    const tbody = document.getElementById('reserva-table-body');
    const thead = document.getElementById('reserva-table-head');
    thead.innerHTML = '';
    tbody.innerHTML = '<tr><td colspan="100%" style="text-align:center; padding: 20px; font-weight: bold;">Cargando disponibilidad...</td></tr>';

    const url = `http://localhost:8080/habitaciones/estado?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`;

    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            renderTablaReserva(data, fechaDesde, fechaHasta);
        } else {
            alert("Error al obtener disponibilidad.");
        }
    } catch (error) {
        console.error(error);
        alert("Error de conexión.");
    }
}

function renderTablaReserva(data, fechaDesdeStr, fechaHastaStr) {
    const thead = document.getElementById('reserva-table-head');
    const tbody = document.getElementById('reserva-table-body');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="100%">No hay habitaciones cargadas.</td></tr>';
        return;
    }

    data.sort((a, b) => a.numero.localeCompare(b.numero));

    // Header
    let headerRow = '<tr><th>Dia</th>';
    data.forEach(hab => {
        let camasInfo = '';
        if (hab.camas && hab.camas.length > 0) {
            camasInfo = `<br><span style="font-size: 0.8em; font-weight: normal;">${hab.camas.join(', ')}</span>`;
        }
        headerRow += `<th class="col-room" data-tipo="${hab.tipo}">${hab.numero}${camasInfo}</th>`;
    });
    headerRow += '</tr>';
    thead.innerHTML = headerRow;

    // Rows
    let current = new Date(fechaDesdeStr + 'T00:00:00');
    const end = new Date(fechaHastaStr + 'T00:00:00');

    const formatDateKey = (date) => date.toISOString().split('T')[0];
    const formatDateDisplay = (date) => date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    while (current <= end) {
        const dateKey = formatDateKey(current);
        let rowHtml = `<tr><td>${formatDateDisplay(current)}</td>`;

        data.forEach(hab => {
            const status = hab.estadosPorFecha[dateKey] || 'LIBRE';
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
                    statusText = 'Pago Pendiente';
                    break;
                default:
                    statusClass = 'status-libre';
                    statusText = 'Libre';
            }

            // Interactive cell
            rowHtml += `<td class="col-room cell-status ${statusClass}" 
                            data-fecha="${dateKey}" 
                            data-habitacion="${hab.numero}" 
                            data-estado="${status}"
                            data-tipo="${hab.tipo}"
                            onclick="handleCellClick(this)">
                            ${statusText}
                        </td>`;
        });
        rowHtml += '</tr>';
        tbody.innerHTML += rowHtml;

        current.setDate(current.getDate() + 1);
    }

    aplicarFiltrosReserva();
}

function aplicarFiltrosReserva() {
    const checkedTypes = Array.from(document.querySelectorAll('.filter-type-reserva:checked')).map(cb => cb.value);
    const checkedStatuses = Array.from(document.querySelectorAll('.filter-status-reserva:checked')).map(cb => cb.value);

    const roomHeaders = Array.from(document.querySelectorAll('#reserva-table-head th.col-room'));
    const tbody = document.getElementById('reserva-table-body');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    const colVisibility = new Array(roomHeaders.length).fill(true);

    roomHeaders.forEach((th, index) => {
        const tipo = th.getAttribute('data-tipo');
        if (!checkedTypes.includes(tipo)) {
            colVisibility[index] = false;
        }
    });

    roomHeaders.forEach((th, index) => {
        th.style.display = colVisibility[index] ? '' : 'none';
    });

    rows.forEach(row => {
        const cells = row.querySelectorAll('td.col-room');
        cells.forEach((cell, index) => {
            cell.style.display = colVisibility[index] ? '' : 'none';
        });
    });
}