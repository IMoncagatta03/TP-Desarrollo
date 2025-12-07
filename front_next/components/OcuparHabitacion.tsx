'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GrillaDisponibilidad, { RoomStatus } from '@/components/GrillaDisponibilidad';
import BusquedaHuesped from '@/components/BusquedaHuesped';
import { getApiBaseUrl } from '@/lib/api';
import { ArrowLeft, Check, Users } from 'lucide-react';

interface Huesped {
    nombres: string;
    apellido: string;
    tipoDocumento: string;
    numeroDocumento: string;
}

export default function OcuparHabitacion() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    // Room Selection State
    // Single confirmed selection
    const [selectedRoom, setSelectedRoom] = useState<{ numero: string, start: string, end: string } | null>(null);
    // Stores current pending selection (first click)
    const [pendingSelection, setPendingSelection] = useState<{ numero: string, start: string } | null>(null);
    const [roomData, setRoomData] = useState<any[]>([]);

    // Conflict Modal State
    const [conflictData, setConflictData] = useState<{ show: boolean, guestName: string, dates: string[] } | null>(null);

    // Guest Selection State
    const [responsibleGuest, setResponsibleGuest] = useState<Huesped | null>(null);
    const [companions, setCompanions] = useState<Huesped[]>([]);

    // Success Modal State
    const [successData, setSuccessData] = useState<{ show: boolean, estadiaId: number | null }>({ show: false, estadiaId: null });

    // UI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDataLoaded = (data: any[]) => {
        setRoomData(data);
    };

    const handleRoomSelection = (numero: string, fecha: string, status: string, tipo: string) => {
        if (status !== 'LIBRE' && status !== 'RESERVADO') return;

        // Determine if we are interacting with the currently active room (pending or confirmed)
        const isCurrentRoom = (pendingSelection && pendingSelection.numero === numero) ||
            (selectedRoom && selectedRoom.numero === numero);

        // Case 1: Clicking a DIFFERENT room -> Reset everything and start fresh here
        if (!isCurrentRoom) {
            setSelectedRoom(null);
            setPendingSelection({ numero, start: fecha });
            setSuccessData({ show: false, estadiaId: null });
            return;
        }

        // Case 2: Clicking the SAME room that is already CONFIRMED -> Reset and start fresh (Edit mode)
        if (selectedRoom) {
            setSelectedRoom(null);
            setPendingSelection({ numero, start: fecha });
            setSuccessData({ show: false, estadiaId: null });
            return;
        }

        // Case 3: Clicking the SAME room that is PENDING -> Confirm the range
        if (pendingSelection) {
            let start = pendingSelection.start;
            let end = fecha;

            if (fecha < start) {
                start = fecha;
                end = pendingSelection.start;
            }

            // Validate availability
            // ... (Logic remains same, stripped for brevity in tool call but keeping logic in mind)
            const room = roomData.find(r => r.numero === numero);
            if (room) {
                let currentDate = new Date(start + 'T00:00:00');
                const stopDate = new Date(end + 'T00:00:00');
                let hasConflict = false;

                while (currentDate <= stopDate) {
                    const dateKey = currentDate.toISOString().split('T')[0];
                    const dayStatus = room.estadosPorFecha[dateKey] || 'LIBRE';

                    if (dayStatus !== 'LIBRE' && dayStatus !== 'RESERVADO') {
                        hasConflict = true;
                        break;
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                if (hasConflict) {
                    alert('El rango seleccionado contiene fechas no disponibles (OCUPADAS).');
                    setPendingSelection(null);
                    return;
                }
            }

            // Confirm selection
            setSelectedRoom({ numero, start, end });
            setPendingSelection(null);
        }
    };

    const getCellStyle = (numero: string, fecha: string, status: string) => {
        // ... (Keep existing logic)
        let baseClass = '';
        if (status === 'LIBRE') baseClass = 'bg-[#28a745] text-white hover:bg-[#218838]';
        else if (status === 'OCUPADO') baseClass = 'bg-[#dc3545] text-white';
        else if (status === 'RESERVADO') baseClass = 'bg-[#ffc107] text-black';
        else baseClass = 'bg-gray-200';

        if (selectedRoom && selectedRoom.numero === numero) {
            if (fecha >= selectedRoom.start && fecha <= selectedRoom.end) {
                return '!bg-[#3498db] !text-white';
            }
        }

        if (pendingSelection && pendingSelection.numero === numero) {
            if (pendingSelection.start === fecha) {
                return `!bg-white !text-black ring-2 ring-[#3498db] ring-inset z-10 relative`;
            }
        }

        return baseClass;
    };

    const confirmRoomSelection = () => {
        if (selectedRoom) {
            // Check for RESERVADO conflict
            const room = roomData.find(r => r.numero === selectedRoom.numero);
            if (room) {
                const startStr = selectedRoom.start;
                const endStr = selectedRoom.end;

                const conflictedDates: string[] = [];
                let guestName = 'Desconocido';

                Object.keys(room.estadosPorFecha).forEach(dateKey => {
                    if (dateKey >= startStr &&
                        dateKey <= endStr &&
                        room.estadosPorFecha[dateKey] === 'RESERVADO') {

                        conflictedDates.push(dateKey);
                        // Asumimos que es el mismo huesped para todo el rango continuo, 
                        // tomamos el nombre del primero que encontramos o el ultimo
                        if (room.detallesPorFecha?.[dateKey]) {
                            guestName = room.detallesPorFecha[dateKey];
                        }
                    }
                });

                if (conflictedDates.length > 0) {
                    conflictedDates.sort();
                    setConflictData({ show: true, guestName, dates: conflictedDates });
                    return;
                }
            }

            setStep(2);
            setError('');
        } else {
            setError('Seleccione una habitación y un rango de fechas.');
        }
    };

    // ... (Keep existing conflict handlers)
    const handleConflictCancel = () => {
        setSelectedRoom(null);
        setConflictData(null);
    };

    const handleConflictProceed = () => {
        setConflictData(null);
        setStep(2);
    };

    const handleGuestSelection = (selected: Huesped[]) => {

        // Seguir cargando, agregamos los huespedes a los acompañantes
        if (successData.estadiaId) {
            // Filtramos los huespedes que ya estan en la estadia
            const currentDocNums = new Set([
                responsibleGuest?.numeroDocumento,
                ...companions.map(c => c.numeroDocumento)
            ]);

            const newUniqueGuests = selected.filter(g => !currentDocNums.has(g.numeroDocumento));

            setCompanions(prev => [...prev, ...newUniqueGuests]);
            setStep(3);
            return;
        }

        // Creacion de la estadia
        const currentRespDoc = responsibleGuest?.numeroDocumento;
        const newResponsible = selected.find(g => g.numeroDocumento === currentRespDoc) || selected[0];

        setResponsibleGuest(newResponsible);

        // Los acompañantes son todos los demás respecto al NUEVO huesped responsable
        const newCompanions = selected.filter(g => g.numeroDocumento !== newResponsible.numeroDocumento);
        setCompanions(newCompanions);

        setStep(3);
    };

    // Permite cambiar el huesped responsable en el paso 3
    const handleChangeResponsible = (docNumero: string) => {
        // Recopilamos todos los huespedes seleccionados
        const allGuests = [responsibleGuest!, ...companions];
        const newResponsible = allGuests.find(g => g.numeroDocumento === docNumero);

        if (newResponsible) {
            setResponsibleGuest(newResponsible);
            const newCompanions = allGuests.filter(g => g.numeroDocumento !== docNumero);
            setCompanions(newCompanions);
        }
    };

    const handleConfirmStay = async () => {
        if (!selectedRoom || !responsibleGuest) return;

        setLoading(true);
        setError('');

        const payload = {
            idResponsable: responsibleGuest.numeroDocumento,
            idsAcompanantes: companions.map(c => c.numeroDocumento),
            idHabitacion: selectedRoom.numero,
            fechaDesde: selectedRoom.start,
            fechaHasta: selectedRoom.end
        };

        try {
            // Si tenemos un estadiaId, significa que estamos ACTUALIZANDO una estadia existente (Seguir cargando)
            // De lo contrario, creamos una nueva estadia.
            const url = successData.estadiaId
                ? `${getApiBaseUrl()}/estadias/${successData.estadiaId}`
                : `${getApiBaseUrl()}/estadias`;

            const method = successData.estadiaId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                // Mostramos modal de exito
                setSuccessData({ show: true, estadiaId: data.id });
            } else {
                const msg = await response.text();
                setError(`Error al ocupar la habitación: ${msg}`);
            }
        } catch (err) {
            console.error(err);
            setError('Error de conexión.');
        } finally {
            setLoading(false);
        }
    };

    const handleSuccessExit = () => {
        router.push('/');
    };

    const handleSuccessLoadAnother = () => {
        // Resetear todo
        setStep(1);
        setSelectedRoom(null);
        setPendingSelection(null);
        setResponsibleGuest(null);
        setCompanions([]);
        setError('');
        setSuccessData({ show: false, estadiaId: null });
    };

    const handleSuccessContinue = () => {
        // Volver al paso 2 (Seleccion de huespedes) para agregar mas
        // Mantener estadiaId en el estado para que handleConfirmStay sepa que debe ACTUALIZAR
        setSuccessData({ ...successData, show: false });
        setStep(2);
    };

    return (
        <div className="h-full flex flex-col relative">
            {/* Modal de conflicto */}
            {conflictData && conflictData.show && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full text-center">
                        <div className="mb-4 text-yellow-600 flex justify-center">
                            <span className="text-4xl">⚠️</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Habitación Reservada</h3>
                        <p className="text-gray-600 mb-4">
                            La habitación que se intenta ocupar tiene una reserva a nombre de <span className="font-bold">{conflictData.guestName}</span>.
                        </p>

                        {conflictData.dates && conflictData.dates.length > 0 && (
                            <div className="bg-yellow-50 p-3 rounded mb-6 text-sm">
                                <p className="font-bold text-yellow-800 mb-1">Días reservados:</p>
                                <p className="text-yellow-900">
                                    {conflictData.dates.map(date => {
                                        const [y, m, d] = date.split('-');
                                        return `${d}/${m}/${y}`;
                                    }).join(', ')}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-4 justify-center">
                            <button onClick={handleConflictCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium transition-colors">Cancelar</button>
                            <button onClick={handleConflictProceed} className="px-4 py-2 bg-[#0056b3] text-white rounded hover:bg-blue-700 font-medium transition-colors">Ocupar igual</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de exito */}
            {successData.show && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full text-center">
                        <div className="mb-4 text-green-600 flex justify-center">
                            <Check size={48} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-6">La habitación fue ocupada con éxito</h3>

                        <div className="flex flex-col gap-3">
                            <button onClick={handleSuccessExit} className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium">
                                Salir
                            </button>
                            <button onClick={handleSuccessContinue} className="w-full px-4 py-2 bg-[#0056b3] text-white rounded hover:bg-blue-700 font-medium">
                                Seguir cargando
                            </button>
                            <button onClick={handleSuccessLoadAnother} className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium">
                                Cargar otra habitación
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {step === 1 && (
                <GrillaDisponibilidad
                    title="Ocupar Habitación - Selección de Habitación"
                    onCellClick={handleRoomSelection}
                    getCellStyle={getCellStyle}
                    onDataLoaded={handleDataLoaded}
                    footerChildren={
                        <button
                            onClick={confirmRoomSelection}
                            disabled={!selectedRoom}
                            className="btn-submit bg-[#0056b3] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            CONTINUAR <Users size={16} />
                        </button>
                    }
                >
                    {error && <p className="text-red-500 font-bold text-center mt-2">{error}</p>}
                </GrillaDisponibilidad>
            )}

            {step === 2 && (
                <BusquedaHuesped
                    isMultiple={true}
                    onSelect={handleGuestSelection}
                    onCancel={() => setStep(1)}
                />
            )}

            {step === 3 && (
                <div className="container mx-auto p-5 max-w-[800px]">
                    <h2 className="text-[#0056b3] text-2xl font-bold mb-6 border-b-2 border-[#0056b3] pb-2">Confirmar Ocupación</h2>

                    <div className="bg-white shadow rounded p-6 mb-6">
                        <h3 className="text-lg font-bold mb-4">Detalles de la Estadía</h3>
                        {/* Mantener los detalles de la habitacion */}
                        <div className="mb-6 pb-2 border-b border-gray-100">
                            <p className="font-bold text-[#0056b3]">Habitación {selectedRoom?.numero}</p>
                            <p className="text-gray-600 text-sm">Fecha: {selectedRoom?.start} al {selectedRoom?.end}</p>
                        </div>

                        <h3 className="text-lg font-bold mb-4 mt-6">Selección de Responsable</h3>

                        {/* Si estamos en modo editar (seguir cargando), el responsable es fijo (solo lectura)*/}
                        {successData.estadiaId ? (
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
                                <p className="text-sm text-gray-600 mb-1">Responsable (Ya asignado):</p>
                                <p className="font-bold text-lg">{responsibleGuest?.apellido}, {responsibleGuest?.nombres}</p>
                                <p className="text-sm text-gray-500">{responsibleGuest?.tipoDocumento}: {responsibleGuest?.numeroDocumento}</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-gray-500 mb-2 text-sm">Seleccione quién será el responsable de la habitación:</p>

                                <div className="flex flex-col gap-2 mb-6">
                                    {[responsibleGuest, ...companions].filter(Boolean).map((h) => (
                                        <label key={h!.numeroDocumento} className={`flex items-center gap-3 p-3 rounded border cursor-pointer hover:bg-gray-50 ${responsibleGuest?.numeroDocumento === h!.numeroDocumento ? 'border-[#0056b3] bg-blue-50' : 'border-gray-200'}`}>
                                            <input
                                                type="radio"
                                                name="responsible"
                                                checked={responsibleGuest?.numeroDocumento === h!.numeroDocumento}
                                                onChange={() => handleChangeResponsible(h!.numeroDocumento)}
                                                className="w-5 h-5 text-[#0056b3]"
                                            />
                                            <div>
                                                <p className="font-bold">{h!.apellido}, {h!.nombres}</p>
                                                <p className="text-sm text-gray-500">{h!.tipoDocumento}: {h!.numeroDocumento}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Siempre mostrar la lista de acompañantes*/}
                        {successData.estadiaId && companions.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold mb-4">Acompañantes ({companions.length})</h3>
                                <ul className="list-disc list-inside">
                                    {companions.map(c => (
                                        <li key={c.numeroDocumento} className="mb-1">
                                            {c.apellido}, {c.nombres} <span className="text-gray-500 text-sm">({c.numeroDocumento})</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {error && <p className="text-red-500 font-bold text-center mb-4">{error}</p>}

                    <div className="flex justify-end gap-4">
                        <button onClick={() => setStep(2)} className="btn-cancel flex items-center gap-2">
                            <ArrowLeft size={16} /> VOLVER
                        </button>
                        <button
                            onClick={handleConfirmStay}
                            disabled={loading}
                            className="btn-submit bg-[#28a745] hover:bg-[#218838] flex items-center gap-2"
                        >
                            {loading ? 'PROCESANDO...' : 'CONFIRMAR'} <Check size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
