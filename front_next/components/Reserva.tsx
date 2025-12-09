'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GrillaDisponibilidad from './GrillaDisponibilidad';
import { getApiBaseUrl, API_ROUTES } from '@/lib/api';

export default function Reserva() {
    const [reservations, setReservations] = useState<{ numero: string, fechaDesde: string, fechaHasta: string, tipo: string }[]>([]);
    const [pendingSelection, setPendingSelection] = useState<{ numero: string, fecha: string, tipo: string } | null>(null);
    const [roomData, setRoomData] = useState<any[]>([]);

    const [showModal, setShowModal] = useState(false);
    const [modalStep, setModalStep] = useState<'VERIFICATION' | 'FORM'>('VERIFICATION');
    const [guestData, setGuestData] = useState({ nombres: '', apellido: '', telefono: '' });
    const [modalError, setModalError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({ nombres: false, apellido: false, telefono: false });

    const router = useRouter();

    const handleDataLoaded = (data: any[]) => {
        setRoomData(data);
    };

    const handleCellClick = (numero: string, fecha: string, status: string, tipo?: string) => {
        // Si se hace click en una reserva existente, se la quita
        const existingIndex = reservations.findIndex(r => r.numero === numero && isDateInRange(fecha, r.fechaDesde, r.fechaHasta));
        if (existingIndex !== -1) {
            const newReservations = [...reservations];
            newReservations.splice(existingIndex, 1);
            setReservations(newReservations);
            setPendingSelection(null);
            return;
        }

        if (status !== 'LIBRE') {
            alert('La habitación no se encuentra disponible en la fecha seleccionada.');
            return;
        }

        // Si no hay una seleccion pendiente, se inicia una
        if (!pendingSelection) {
            setPendingSelection({ numero, fecha, tipo: tipo || '' });
            return;
        }

        // Si la seleccion pendiente existe
        if (pendingSelection.numero === numero) {
            // Mismo numero de habitacion
            let start = pendingSelection.fecha;
            let end = fecha;

            if (new Date(fecha) < new Date(pendingSelection.fecha)) {
                start = fecha;
                end = pendingSelection.fecha;
            }

            // Validar disponibilidad de la habitacion en el rango de fechas
            const room = roomData.find(r => r.numero === numero);
            if (room) {
                // Generar todas las fechas en el rango
                let currentDate = new Date(start + 'T00:00:00');
                const stopDate = new Date(end + 'T00:00:00');
                let hasConflict = false;

                while (currentDate <= stopDate) {
                    const dateKey = currentDate.toISOString().split('T')[0];
                    const dayStatus = room.estadosPorFecha[dateKey] || 'LIBRE';

                    if (dayStatus !== 'LIBRE') {
                        hasConflict = true;
                        break;
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                if (hasConflict) {
                    alert('El rango seleccionado contiene fechas no disponibles.');
                    setPendingSelection(null);
                    return;
                }
            }

            // Agregar a la lista de reservas
            const newReservation = {
                numero,
                fechaDesde: start,
                fechaHasta: end,
                tipo: pendingSelection.tipo
            };

            setReservations([...reservations, newReservation]);
            setPendingSelection(null);
        } else {
            // Si es una habitacion diferente, se inicia una nueva seleccion
            setPendingSelection({ numero, fecha, tipo: tipo || '' });
        }
    };

    const isDateInRange = (dateStr: string, startStr: string, endStr: string) => {
        return dateStr >= startStr && dateStr <= endStr;
    };

    const getCellStyle = (numero: string, fecha: string, status: string) => {
        let baseClass = '';
        if (status === 'LIBRE') baseClass = 'bg-[#28a745] text-white hover:bg-[#218838]';
        else if (status === 'OCUPADO') baseClass = 'bg-[#dc3545] text-white';
        else if (status === 'RESERVADO') baseClass = 'bg-[#ffc107] text-black';
        else baseClass = 'bg-gray-200';

        // Si la habitacion ya esta reservada en la lista
        const inReservation = reservations.find(r => r.numero === numero && isDateInRange(fecha, r.fechaDesde, r.fechaHasta));
        if (inReservation) {
            return '!bg-[#3498db] !text-white';
        }

        // Si la habitacion es la misma de la seleccion pendiente
        if (pendingSelection && pendingSelection.numero === numero) {
            if (pendingSelection.fecha === fecha) {
                return `!bg-white !text-black ring-2 ring-[#3498db] ring-inset z-10 relative`;
            }
        }

        return baseClass;
    };

    const handleNext = () => {
        if (reservations.length > 0) {
            setModalStep('VERIFICATION');
            setShowModal(true);
            setModalError('');
        }
    };

    const handleVerificationAccept = () => {
        setModalStep('FORM');
        setGuestData({ nombres: '', apellido: '', telefono: '' });
        setModalError('');
        setFieldErrors({ nombres: false, apellido: false, telefono: false });
    };

    const validateForm = () => {
        const errors = { nombres: false, apellido: false, telefono: false };
        let isValid = true;
        let errorMsg = '';

        const textRegex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
        const phoneRegex = /^[0-9+]+$/;

        if (!guestData.nombres.trim()) {
            errors.nombres = true;
            isValid = false;
        } else if (!textRegex.test(guestData.nombres)) {
            errors.nombres = true;
            isValid = false;
            errorMsg = 'El nombre solo puede contener letras.';
        }

        if (!guestData.apellido.trim()) {
            errors.apellido = true;
            isValid = false;
        } else if (!textRegex.test(guestData.apellido)) {
            errors.apellido = true;
            isValid = false;
            errorMsg = errorMsg || 'El apellido solo puede contener letras.';
        }

        if (!guestData.telefono.trim()) {
            errors.telefono = true;
            isValid = false;
        } else if (!phoneRegex.test(guestData.telefono)) {
            errors.telefono = true;
            isValid = false;
            errorMsg = errorMsg || 'El teléfono solo puede contener números y +.';
        }

        setFieldErrors(errors);
        if (!isValid) {
            setModalError(errorMsg || 'Todos los campos son obligatorios y deben ser válidos.');
        }
        return isValid;
    };

    const handleReservationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (reservations.length === 0) return;

        if (!validateForm()) return;

        // Preparar payload con todas las reservas
        const reservaPayload = reservations.map(r => ({
            numeroHabitacion: r.numero,
            fechaDesde: r.fechaDesde,
            fechaHasta: r.fechaHasta,
            nombres: guestData.nombres,
            apellido: guestData.apellido,
            telefono: guestData.telefono
        }));

        try {
            const response = await fetch(`${getApiBaseUrl()}/reservas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reservaPayload)
            });

            if (response.ok) {
                alert("Reservas creadas con éxito!");
                setShowModal(false);
                setReservations([]);
                setPendingSelection(null);
                window.location.reload();
            } else {
                const msg = await response.text();
                setModalError(`Error al crear reserva: ${msg}`);
            }
        } catch (error) {
            console.error(error);
            setModalError('Error de conexión.');
        }
    };


    const handleRechazar = () => {
        setShowModal(false);
        setReservations([]);
        setPendingSelection(null);
    }

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr + 'T00:00:00');
        const dayName = new Intl.DateTimeFormat('es-AR', { weekday: 'long' }).format(date);
        const dayNameCap = dayName.charAt(0).toUpperCase() + dayName.slice(1);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${dayNameCap}, ${day}/${month}/${year}`;
    };

    return (
        <GrillaDisponibilidad
            title="Reservar Habitación"
            onCellClick={handleCellClick}
            getCellStyle={getCellStyle}
            onDataLoaded={handleDataLoaded}
            minDate={new Date().toISOString().split('T')[0]}
            footerChildren={
                reservations.length > 0 || pendingSelection ? (
                    <button
                        onClick={handleNext}
                        className={`btn-submit bg-[#0056b3] hover:bg-[#004494] text-white px-4 py-2 rounded ${reservations.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={reservations.length === 0}
                    >
                        SIGUIENTE {reservations.length > 0 ? `(${reservations.length})` : ''}
                    </button>
                ) : null
            }
        >
            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">

                        {modalStep === 'VERIFICATION' && (
                            <>
                                <h3 className="text-xl font-bold mb-4 text-[#0056b3] text-center">Verificar Reserva(s)</h3>
                                <div className="mb-6 border-b pb-4">
                                    {reservations.map((res, idx) => (
                                        <div key={idx} className="mb-4 border-b border-gray-100 pb-2 last:border-0">
                                            <p className="mb-1 font-bold text-gray-700">Habitación {res.numero} ({res.tipo || 'Estándar'})</p>
                                            <p className="mb-1 text-sm">
                                                <span className="text-green-600 font-bold">✔ Ingreso:</span> {formatDate(res.fechaDesde)}, 12:00hs
                                            </p>
                                            <p className="mb-1 text-sm">
                                                <span className="text-red-600 font-bold">✔ Egreso:</span> {formatDate(res.fechaHasta)}, 10:00hs
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-center gap-4">
                                    <button onClick={handleRechazar} className="btn-cancel bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-2 rounded">RECHAZAR</button>
                                    <button onClick={handleVerificationAccept} className="btn-submit bg-[#0056b3] hover:bg-[#004494] text-white px-4 py-2 rounded">ACEPTAR</button>
                                </div>
                            </>
                        )}

                        {modalStep === 'FORM' && (
                            <>
                                <h3 className="text-xl font-bold mb-4 text-[#0056b3]">Confirmar Reserva</h3>
                                <div className="mb-4 text-sm text-gray-600">
                                    Reserva a nombre de:
                                </div>

                                <form onSubmit={handleReservationSubmit}>
                                    <div className="form-group mb-3">
                                        <label className="block mb-1 font-medium">Apellido:</label>
                                        <input
                                            type="text"
                                            className={`w-full p-2 border rounded uppercase ${fieldErrors.apellido ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            value={guestData.apellido}
                                            onChange={e => setGuestData({ ...guestData, apellido: e.target.value.toUpperCase() })}
                                            maxLength={50}
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="block mb-1 font-medium">Nombre:</label>
                                        <input
                                            type="text"
                                            className={`w-full p-2 border rounded uppercase ${fieldErrors.nombres ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            value={guestData.nombres}
                                            onChange={e => setGuestData({ ...guestData, nombres: e.target.value.toUpperCase() })}
                                            maxLength={50}
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="block mb-1 font-medium">Teléfono:</label>
                                        <input
                                            type="text"
                                            className={`w-full p-2 border rounded ${fieldErrors.telefono ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            value={guestData.telefono}
                                            onChange={e => setGuestData({ ...guestData, telefono: e.target.value })}
                                            maxLength={20}
                                        />
                                    </div>

                                    {modalError && <p className="text-red-500 text-sm mb-2 font-bold">{modalError}</p>}

                                    <div className="flex justify-end gap-3 mt-4">
                                        <button type="button" onClick={() => setShowModal(false)} className="btn-cancel bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-2 rounded">CANCELAR</button>
                                        <button type="submit" className="btn-submit bg-[#0056b3] hover:bg-[#004494] text-white px-4 py-2 rounded">ACEPTAR</button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </GrillaDisponibilidad>
    );
}
