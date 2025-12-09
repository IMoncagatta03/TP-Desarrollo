'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getApiBaseUrl, API_ROUTES } from '@/lib/api';

interface GuestData {
    nombres: string;
    apellido: string;
    email?: string;
    fechaNacimiento: string;
    tipoDocumento: string;
    numeroDocumento: string;
    nacionalidad: string;
    ocupacion: string;
    posicionIva: string;
    cuit?: string;
    telefono: string;
    direccion: {
        direccionCalle: string;
        direccionNumero: string;
        direccionPiso?: string;
        codigoPostal: string;
        localidad: string;
        provincia: string;
        pais: string;
    };
}

const initialData: GuestData = {
    nombres: '',
    apellido: '',
    email: '',
    fechaNacimiento: '',
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    nacionalidad: '',
    ocupacion: '',
    posicionIva: 'CONSUMIDOR_FINAL',
    cuit: '',
    telefono: '',
    direccion: {
        direccionCalle: '',
        direccionNumero: '',
        direccionPiso: '',
        codigoPostal: '',
        localidad: '',
        provincia: '',
        pais: ''
    }
};

export default function FormularioHuesped() {
    const [formData, setFormData] = useState<GuestData>(initialData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [warningMessage, setWarningMessage] = useState('');
    const [originalNumeroDocumento, setOriginalNumeroDocumento] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ show: boolean, type: 'BLOCK' | 'CONFIRM' | 'SUCCESS', message: React.ReactNode }>({ show: false, type: 'BLOCK', message: '' });
    const router = useRouter();
    const searchParams = useSearchParams();

    // Logica de precarga si es necesario 
    useEffect(() => {
        const numDoc = searchParams.get('numDoc');

        if (numDoc) {
            // Obtener datos completos del huesped desde backend
            const fetchGuestData = async () => {
                try {
                    const url = `${getApiBaseUrl()}${API_ROUTES.HUESPEDES}/${numDoc}`;
                    const response = await fetch(url);
                    if (response.ok) {
                        const guestData = await response.json();
                        const formattedDate = guestData.fechaNacimiento ? new Date(guestData.fechaNacimiento).toISOString().split('T')[0] : '';

                        setFormData({
                            ...guestData,
                            fechaNacimiento: formattedDate,
                            direccion: guestData.direccion || initialData.direccion
                        });
                        setOriginalNumeroDocumento(guestData.numeroDocumento);
                    } else {
                        console.error('Error fetching guest details');
                    }
                } catch (error) {
                    console.error('Error connecting to server', error);
                }
            };
            fetchGuestData();
        } else {
            const nombre = searchParams.get('nombre');
            const apellido = searchParams.get('apellido');
            const tipoDoc = searchParams.get('tipoDoc');

            if (nombre || apellido || tipoDoc) {
                setFormData(prev => ({
                    ...prev,
                    nombres: nombre || prev.nombres,
                    apellido: apellido || prev.apellido,
                    tipoDocumento: tipoDoc || prev.tipoDocumento,
                    numeroDocumento: numDoc || prev.numeroDocumento
                }));
            }
        }
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Manejar campos de direccion
        if (name.startsWith('direccion.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                direccion: {
                    ...prev.direccion,
                    [field]: value.toUpperCase()
                }
            }));
        } else {
            const finalValue = name === 'email' ? value : value.toUpperCase();
            setFormData(prev => ({ ...prev, [name]: finalValue }));
        }

        // Limpiar error al cambiar
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        const soloTexto = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
        const soloNumeros = /^[0-9]+$/;

        // Validaciones
        if (!formData.nombres.trim()) newErrors.nombres = 'Este campo es obligatorio.';
        else if (!soloTexto.test(formData.nombres)) newErrors.nombres = 'Solo se permiten letras.';

        if (!formData.apellido.trim()) newErrors.apellido = 'Este campo es obligatorio.';
        else if (!soloTexto.test(formData.apellido)) newErrors.apellido = 'Solo se permiten letras.';

        if (!formData.fechaNacimiento) {
            newErrors.fechaNacimiento = 'Este campo es obligatorio.';
        } else {
            // Validar rango de fecha
            const minDate = '1900-01-01';
            const todayStr = new Date().toISOString().split('T')[0];

            if (formData.fechaNacimiento < minDate || formData.fechaNacimiento > todayStr) {
                newErrors.fechaNacimiento = 'Fecha inválida';
            }
        }

        if (!formData.numeroDocumento.trim()) newErrors.numeroDocumento = 'Este campo es obligatorio.';
        else if (!soloNumeros.test(formData.numeroDocumento)) newErrors.numeroDocumento = 'Solo se permiten números.';

        if (!formData.nacionalidad.trim()) newErrors.nacionalidad = 'Este campo es obligatorio.';
        if (!formData.ocupacion.trim()) newErrors.ocupacion = 'Este campo es obligatorio.';

        if (!formData.telefono.trim()) newErrors.telefono = 'Este campo es obligatorio.';
        else if (!/^[0-9+]+$/.test(formData.telefono)) newErrors.telefono = 'Solo números y el signo +.';

        if (!formData.direccion.direccionCalle.trim()) newErrors['direccion.direccionCalle'] = 'Este campo es obligatorio.';
        else if (!soloTexto.test(formData.direccion.direccionCalle)) newErrors['direccion.direccionCalle'] = 'Solo se permiten letras.';

        if (!formData.direccion.direccionNumero.trim()) newErrors['direccion.direccionNumero'] = 'Este campo es obligatorio.';
        else if (!soloNumeros.test(formData.direccion.direccionNumero)) newErrors['direccion.direccionNumero'] = 'Solo se permiten números.';

        if (!formData.direccion.codigoPostal.trim()) newErrors['direccion.codigoPostal'] = 'Este campo es obligatorio.';
        else if (!soloNumeros.test(formData.direccion.codigoPostal)) newErrors['direccion.codigoPostal'] = 'Solo se permiten números.';

        if (!formData.direccion.localidad.trim()) newErrors['direccion.localidad'] = 'Este campo es obligatorio.';
        else if (!soloTexto.test(formData.direccion.localidad)) newErrors['direccion.localidad'] = 'Solo se permiten letras.';

        if (!formData.direccion.provincia.trim()) newErrors['direccion.provincia'] = 'Este campo es obligatorio.';
        else if (!soloTexto.test(formData.direccion.provincia)) newErrors['direccion.provincia'] = 'Solo se permiten letras.';

        if (!formData.direccion.pais.trim()) newErrors['direccion.pais'] = 'Este campo es obligatorio.';
        else if (!soloTexto.test(formData.direccion.pais)) newErrors['direccion.pais'] = 'Solo se permiten letras.';

        if (formData.posicionIva === 'RESPONSABLE_INSCRIPTO' && !formData.cuit?.trim()) {
            newErrors.cuit = 'El CUIT es obligatorio para R.I.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent, force = false) => {
        e.preventDefault();
        if (!force && !validate()) return;

        setServerError('');
        setSuccessMessage('');
        setWarningMessage('');

        try {
            let url = `${getApiBaseUrl()}${API_ROUTES.HUESPEDES}${force ? '?force=true' : ''}`;

            // Chequear si el documento cambió
            if (originalNumeroDocumento && originalNumeroDocumento !== formData.numeroDocumento) {
                url += `${url.includes('?') ? '&' : '?'}oldNumeroDocumento=${originalNumeroDocumento}`;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const nuevoHuesped = await response.json();
                setSuccessMessage(`El huésped ${nuevoHuesped.nombres} ${nuevoHuesped.apellido} ha sido satisfactoriamente cargado.`);
                setOriginalNumeroDocumento(nuevoHuesped.numeroDocumento);
            } else if (response.status === 409) {
                const errorMsg = await response.text();
                if (errorMsg === "Al menos una estadía asociada") {
                    setErrors(prev => ({ ...prev, numeroDocumento: 'Al menos una estadía asociada' }));
                } else {
                    setWarningMessage(errorMsg);
                }
            } else if (response.status === 400) {
                const erroresBackend = await response.json();
                const backendErrors: Record<string, string> = {};
                Object.keys(erroresBackend).forEach(key => {
                    backendErrors[key] = erroresBackend[key];
                });
                setErrors(prev => ({ ...prev, ...backendErrors }));
                setServerError("El servidor detectó datos inválidos.");
            } else {
                setServerError('Ocurrió un error inesperado al guardar el huésped.');
            }
        } catch (error) {
            console.error(error);
            setServerError('No se pudo conectar con el servidor.');
        }
    };

    const handleReset = () => {
        setFormData(initialData);
        setErrors({});
        setSuccessMessage('');
        setWarningMessage('');
        setServerError('');
    };

    const handleDelete = async () => {
        if (!formData.numeroDocumento) return;

        try {
            // Verificar si tiene estadias
            const checkUrl = `${getApiBaseUrl()}/estadias/check-huesped/${formData.numeroDocumento}`;
            const checkResponse = await fetch(checkUrl);
            const hasEstadias = await checkResponse.json();

            if (hasEstadias) {
                setDeleteModal({
                    show: true,
                    type: 'BLOCK',
                    message: (
                        <>
                            El huesped {formData.nombres}, {formData.apellido}, {formData.numeroDocumento} no puede ser eliminado pues se ha alojado en el hotel en alguna oportunidad
                            <br /><br />
                            <div className="text-center font-bold">Presione cualquier tecla para continuar...</div>
                        </>
                    )
                });
            } else {
                setDeleteModal({
                    show: true,
                    type: 'CONFIRM',
                    message: `El huesped ${formData.nombres}, ${formData.apellido}, ${formData.numeroDocumento} será eliminado del sistema`
                });
            }
        } catch (error) {
            console.error(error);
            setServerError('Error al verificar estadías.');
        }
    };

    const handleConfirmDelete = async () => {
        try {
            const url = `${getApiBaseUrl()}${API_ROUTES.HUESPEDES}/${formData.numeroDocumento}`;
            const response = await fetch(url, { method: 'DELETE' });

            if (response.ok) {
                setDeleteModal({
                    show: true,
                    type: 'SUCCESS',
                    message: (
                        <>
                            Los datos de {formData.nombres}, {formData.apellido}, <br /> {formData.numeroDocumento} han sido eliminados del sistema
                            <br /><br />
                            <div className="font-bold">Presione una tecla para continuar...</div>
                        </>
                    )
                });
            } else {
                setServerError('Error al eliminar el huésped.');
                setDeleteModal({ show: false, type: 'BLOCK', message: '' });
            }
        } catch (error) {
            console.error(error);
            setServerError('Error de conexión al eliminar.');
            setDeleteModal({ show: false, type: 'BLOCK', message: '' });
        }
    };

    // Listener global para cerrar modales
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!deleteModal.show) return;

            if (deleteModal.type === 'BLOCK') {
                setDeleteModal({ show: false, type: 'BLOCK', message: '' });
            } else if (deleteModal.type === 'SUCCESS') {
                router.push('/');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [deleteModal, router]);

    const isModification = !!searchParams.get('numDoc');

    return (
        <div className="container mx-auto p-2 bg-white rounded-lg shadow-md max-w-4xl">
            <h2 className="text-center text-[#0056b3] text-xl font-bold mb-4">{isModification ? 'Modificar Huésped' : 'Dar Alta de Huésped'}</h2>

            {successMessage && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
                        <p className="text-lg mb-5 text-gray-800">{successMessage}</p>
                        <p className="mb-5 text-gray-600">¿Desea cargar otro?</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => router.push('/')} className="btn-cancel">No</button>
                            <button onClick={handleReset} className="btn-submit">Si</button>
                        </div>
                    </div>
                </div>
            )}

            {warningMessage && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
                        <p className="text-lg mb-5 text-red-600 font-bold">
                            {isModification ? "¿Estás seguro que desea modificar el huesped?" : warningMessage}
                        </p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setWarningMessage('')} className="btn-cancel">
                                {isModification ? "Cancelar" : "CORREGIR"}
                            </button>
                            <button onClick={(e) => handleSubmit(e, true)} className="btn-submit">
                                {isModification ? "Aceptar" : "ACEPTAR IGUALMENTE"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Borrado */}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
                        <div className="text-lg mb-5 text-gray-800">
                            {deleteModal.message}
                        </div>

                        {deleteModal.type === 'CONFIRM' && (
                            <div className="flex justify-center gap-4 mt-4">
                                <button
                                    onClick={() => setDeleteModal({ show: false, type: 'BLOCK', message: '' })}
                                    className="btn-cancel"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="px-4 py-2 border border-[#dc3545] text-[#dc3545] rounded bg-transparent hover:bg-red-50 font-medium transition-colors cursor-pointer"
                                >
                                    Borrar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <form onSubmit={(e) => handleSubmit(e)} noValidate>
                <fieldset className="border border-gray-200 rounded p-3 mb-3">
                    <legend className="text-[#0056b3] font-bold px-2 text-base">Datos Personales</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

                        <div className="form-group mb-1 relative">
                            <label htmlFor="nombres" className="text-sm mb-1 block">Nombres:</label>
                            <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} className={`h-8 text-sm ${errors.nombres ? 'input-error' : ''}`} />
                            {errors.nombres && <small className="error-text block text-xs absolute -bottom-4 left-0 z-10">{errors.nombres}</small>}
                        </div>

                        <div className="form-group mb-1 relative">
                            <label htmlFor="apellido" className="text-sm mb-1 block">Apellido:</label>
                            <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} className={`h-8 text-sm ${errors.apellido ? 'input-error' : ''}`} />
                            {errors.apellido && <small className="error-text block text-xs absolute -bottom-4 left-0 z-10">{errors.apellido}</small>}
                        </div>

                        <div className="form-group mb-1">
                            <label htmlFor="email" className="text-sm mb-1 block">Email (Opcional):</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="h-8 text-sm" />
                        </div>

                        <div className="form-group mb-1 relative">
                            <label htmlFor="fechaNacimiento" className="text-sm mb-1 block">Fecha de Nacimiento:</label>
                            <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} min="1900-01-01" max={new Date().toISOString().split('T')[0]} className={`h-8 text-sm ${errors.fechaNacimiento ? 'input-error' : ''}`} />
                            {errors.fechaNacimiento && <small className="error-text block text-xs absolute -bottom-4 left-0 z-10">{errors.fechaNacimiento}</small>}
                        </div>

                        <div className="form-group mb-1">
                            <label htmlFor="tipoDocumento" className="text-sm mb-1 block">Tipo de Documento:</label>
                            <select name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange} className="h-8 text-sm">
                                <option value="DNI">DNI</option>
                                <option value="LE">LE</option>
                                <option value="LC">LC</option>
                                <option value="PASAPORTE">Pasaporte</option>
                                <option value="OTRO">Otro</option>
                            </select>
                        </div>

                        <div className="form-group mb-1 relative">
                            <label htmlFor="numeroDocumento" className="text-sm mb-1 block">Número de Documento:</label>
                            <input type="text" name="numeroDocumento" value={formData.numeroDocumento} onChange={handleChange} maxLength={8} className={`h-8 text-sm ${errors.numeroDocumento ? 'input-error' : ''}`} />
                            {errors.numeroDocumento && <small className="error-text block text-xs absolute -bottom-4 left-0 z-10">{errors.numeroDocumento}</small>}
                        </div>

                        <div className="form-group mb-1 relative">
                            <label htmlFor="nacionalidad" className="text-sm mb-1 block">Nacionalidad:</label>
                            <input type="text" name="nacionalidad" value={formData.nacionalidad} onChange={handleChange} className={`h-8 text-sm ${errors.nacionalidad ? 'input-error' : ''}`} />
                            {errors.nacionalidad && <small className="error-text block text-xs absolute -bottom-4 left-0 z-10">{errors.nacionalidad}</small>}
                        </div>

                        <div className="form-group mb-1 relative">
                            <label htmlFor="ocupacion" className="text-sm mb-1 block">Ocupación:</label>
                            <input type="text" name="ocupacion" value={formData.ocupacion} onChange={handleChange} className={`h-8 text-sm ${errors.ocupacion ? 'input-error' : ''}`} />
                            {errors.ocupacion && <small className="error-text block text-xs absolute -bottom-4 left-0 z-10">{errors.ocupacion}</small>}
                        </div>

                        <div className="form-group mb-1">
                            <label htmlFor="posicionIva" className="text-sm mb-1 block">Posición frente al IVA:</label>
                            <select name="posicionIva" value={formData.posicionIva} onChange={handleChange} className="h-8 text-sm">
                                <option value="CONSUMIDOR_FINAL">Consumidor Final</option>
                                <option value="RESPONSABLE_INSCRIPTO">Responsable Inscripto</option>
                                <option value="MONOTRIBUTISTA">Monotributista</option>
                                <option value="EXENTO">Exento</option>
                            </select>
                        </div>

                        <div className="form-group mb-1 relative">
                            <label htmlFor="cuit" className="text-sm mb-1 block">CUIT (Opcional):</label>
                            <input type="text" name="cuit" value={formData.cuit} onChange={handleChange} maxLength={13} className={`h-8 text-sm ${errors.cuit ? 'input-error' : ''}`} />
                            {errors.cuit && <small className="error-text block text-xs absolute -bottom-4 left-0 z-10">{errors.cuit}</small>}
                        </div>

                        <div className="form-group mb-1 relative">
                            <label htmlFor="telefono" className="text-sm mb-1 block">Teléfono:</label>
                            <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} maxLength={20} className={`h-8 text-sm ${errors.telefono ? 'input-error' : ''}`} />
                            {errors.telefono && <small className="error-text block text-xs absolute -bottom-4 left-0 z-10">{errors.telefono}</small>}
                        </div>

                    </div>
                </fieldset>

                <fieldset className="border border-gray-200 rounded p-3 mb-3">
                    <legend className="text-[#0056b3] font-bold px-2 text-base">Dirección</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

                        <div className="form-group mb-1 relative">
                            <label htmlFor="direccionCalle" className="text-sm mb-1 block">Calle:</label>
                            <input type="text" name="direccion.direccionCalle" value={formData.direccion.direccionCalle} onChange={handleChange} className={`h-8 text-sm ${errors['direccion.direccionCalle'] ? 'input-error' : ''}`} />
                            {errors['direccion.direccionCalle'] && <small className="error-text block text-xs absolute -bottom-4 left-0 z-10">{errors['direccion.direccionCalle']}</small>}
                        </div>

                        <div className="form-group mb-1 relative">
                            <label htmlFor="direccionNumero" className="text-sm mb-1 block">Número:</label>
                            <input type="text" name="direccion.direccionNumero" value={formData.direccion.direccionNumero} onChange={handleChange} maxLength={10} className={`h-8 text-sm ${errors['direccion.direccionNumero'] ? 'input-error' : ''}`} />
                            {errors['direccion.direccionNumero'] && <small className="error-text block text-xs absolute -bottom-4 left-0 z-10">{errors['direccion.direccionNumero']}</small>}
                        </div>

                        <div className="form-group mb-1">
                            <label htmlFor="direccionPiso" className="text-sm mb-1 block">Piso/Depto (Opcional):</label>
                            <input type="text" name="direccion.direccionPiso" value={formData.direccion.direccionPiso} onChange={handleChange} maxLength={10} className="h-8 text-sm" />
                        </div>

                        <div className="form-group mb-1 relative">
                            <label htmlFor="codigoPostal" className="text-sm mb-1 block">Código Postal:</label>
                            <input type="text" name="direccion.codigoPostal" value={formData.direccion.codigoPostal} onChange={handleChange} maxLength={10} className={`h-8 text-sm ${errors['direccion.codigoPostal'] ? 'input-error' : ''}`} />
                            {errors['direccion.codigoPostal'] && <small className="error-text block text-xs absolute -bottom-4 left-0 z-10">{errors['direccion.codigoPostal']}</small>}
                        </div>

                        <div className="form-group mb-1 relative">
                            <label htmlFor="localidad" className="text-sm mb-1 block">Localidad:</label>
                            <input type="text" name="direccion.localidad" value={formData.direccion.localidad} onChange={handleChange} className={`h-8 text-sm ${errors['direccion.localidad'] ? 'input-error' : ''}`} />
                            {errors['direccion.localidad'] && <small className="error-text block text-xs absolute -bottom-4 left-0 z-10">{errors['direccion.localidad']}</small>}
                        </div>

                        <div className="form-group mb-1 relative">
                            <label htmlFor="provincia" className="text-sm mb-1 block">Provincia:</label>
                            <input type="text" name="direccion.provincia" value={formData.direccion.provincia} onChange={handleChange} className={`h-8 text-sm ${errors['direccion.provincia'] ? 'input-error' : ''}`} />
                            {errors['direccion.provincia'] && <small className="error-text block text-xs absolute -bottom-4 left-0 z-10">{errors['direccion.provincia']}</small>}
                        </div>

                        <div className="form-group mb-1 relative">
                            <label htmlFor="pais" className="text-sm mb-1 block">País:</label>
                            <input type="text" name="direccion.pais" value={formData.direccion.pais} onChange={handleChange} className={`h-8 text-sm ${errors['direccion.pais'] ? 'input-error' : ''}`} />
                            {errors['direccion.pais'] && <small className="error-text block text-xs absolute -bottom-4 left-0 z-10">{errors['direccion.pais']}</small>}
                        </div>

                    </div>
                </fieldset>

                {serverError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{serverError}</div>}

                <div className="flex justify-center gap-4 mt-4">
                    <button type="button" onClick={() => router.push('/')} className="btn-cancel">CANCELAR</button>

                    {isModification && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="px-4 py-2 border border-[#dc3545] text-[#dc3545] rounded bg-transparent hover:bg-red-50 font-medium transition-colors cursor-pointer"
                        >
                            Borrar
                        </button>
                    )}

                    <button type="submit" className="btn-submit">GUARDAR</button>
                </div>
            </form>
        </div>
    );
}
