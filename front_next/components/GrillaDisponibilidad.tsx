'use client';

import { useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getApiBaseUrl, API_ROUTES } from '@/lib/api';

export interface RoomStatus {
    numero: string;
    tipo: string;
    camas: string[];
    estadosPorFecha: Record<string, string>; // "YYYY-MM-DD": "STATUS"
}

interface GrillaDisponibilidadProps {
    title: string;
    onCellClick?: (numero: string, fecha: string, status: string, tipo: string) => void;
    getCellStyle?: (numero: string, fecha: string, status: string) => string;
    children?: ReactNode;
    footerChildren?: ReactNode;
    onDataLoaded?: (data: RoomStatus[]) => void;
}

export default function GrillaDisponibilidad({ title, onCellClick, getCellStyle, children, footerChildren, onDataLoaded }: GrillaDisponibilidadProps) {
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [habitaciones, setHabitaciones] = useState<RoomStatus[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    // Filters
    const [tipos, setTipos] = useState({
        INDIVIDUAL_ESTANDAR: true,
        DOBLE_ESTANDAR: true,
        SUPERIOR_FAMILY_PLAN: true,
        SUITE_DOBLE: true,
    });
    const [estados, setEstados] = useState({
        LIBRE: true,
        OCUPADO: true,
        RESERVADO: true,
    });

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!fechaDesde || !fechaHasta) {
            setError('Ingrese ambas fechas.');
            return;
        }
        if (fechaDesde > fechaHasta) {
            setError("La fecha 'Desde' no puede ser mayor a la fecha 'Hasta'.");
            return;
        }

        setLoading(true);
        setError('');

        try {
            const url = `${getApiBaseUrl()}${API_ROUTES.HABITACIONES_ESTADO}?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                // Ordenar por numero de habitacion
                data.sort((a: RoomStatus, b: RoomStatus) => a.numero.localeCompare(b.numero));
                setHabitaciones(data);
                if (onDataLoaded) onDataLoaded(data);
            } else {
                setError('Error al obtener los estados.');
            }
        } catch (err) {
            console.error(err);
            setError('Error de conexión.');
        } finally {
            setLoading(false);
        }
    };

    const getDatesInRange = (start: string, end: string) => {
        const dateArray = [];
        let currentDate = new Date(start + 'T00:00:00');
        const stopDate = new Date(end + 'T00:00:00');
        while (currentDate <= stopDate) {
            dateArray.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dateArray;
    };

    const dates = (fechaDesde && fechaHasta && !error) ? getDatesInRange(fechaDesde, fechaHasta) : [];

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'LIBRE': return 'bg-[#28a745] text-white';
            case 'OCUPADO': return 'bg-[#dc3545] text-white';
            case 'RESERVADO': return 'bg-[#ffc107] text-black';
            default: return 'bg-gray-200';
        }
    };

    // Logica de filtrado
    const filteredRooms = habitaciones.filter(h => {
        if (!tipos[h.tipo as keyof typeof tipos]) return false;

        // Si algun estado en el rango esta desactivado, se oculta la columna
        for (const date of dates) {
            const dateKey = date.toISOString().split('T')[0];
            const status = h.estadosPorFecha[dateKey] || 'LIBRE';
            if (!estados[status as keyof typeof estados]) return false;
        }
        return true;
    });

    return (
        <div className="container mx-auto p-5 h-full flex flex-col max-w-[1200px]">
            <h2 className="text-[#0056b3] text-2xl font-bold mb-6 text-center">{title}</h2>

            {/* Barra de busqueda */}
            <form onSubmit={handleSearch} className="flex gap-4 items-end mb-6 bg-white p-4 rounded shadow-sm">
                <div className="form-group flex-1">
                    <label htmlFor="estado-fecha-desde">Desde Fecha</label>
                    <input
                        type="date"
                        id="estado-fecha-desde"
                        value={fechaDesde}
                        onChange={(e) => setFechaDesde(e.target.value)}
                        min="2020-01-01" max="2030-12-31"
                        required
                    />
                </div>
                <div className="form-group flex-1">
                    <label htmlFor="estado-fecha-hasta">Hasta Fecha</label>
                    <input
                        type="date"
                        id="estado-fecha-hasta"
                        value={fechaHasta}
                        onChange={(e) => setFechaHasta(e.target.value)}
                        min="2020-01-01" max="2030-12-31"
                        required
                    />
                </div>
                <div className="form-group">
                    <button type="submit" className="btn-submit bg-[#0056b3] h-[42px]">Buscar</button>
                </div>
            </form>

            {error && <p className="text-red-500 font-bold text-center mb-4">{error}</p>}

            <div className="flex gap-5 flex-1 overflow-hidden">
                {/* Grilla */}
                <div className="flex-1 border border-gray-300 overflow-auto bg-white">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="sticky top-0 left-0 z-30 bg-[#e9ecef] border border-[#ccc] p-2 min-w-[100px]">Dia</th>
                                {filteredRooms.map(hab => (
                                    <th key={hab.numero} className="sticky top-0 z-20 bg-[#e9ecef] border border-[#ccc] p-2 min-w-[100px]">
                                        {hab.numero}
                                        <br />
                                        <span className="text-xs font-normal">{hab.camas.join(', ')}</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading && <tr><td colSpan={100} className="text-center p-10">Cargando...</td></tr>}

                            {!loading && dates.map(date => {
                                const dateKey = date.toISOString().split('T')[0];
                                const dateDisplay = date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

                                return (
                                    <tr key={dateKey}>
                                        <td className="sticky left-0 z-10 bg-[#f9f9f9] border border-[#ccc] p-2 font-bold text-center">{dateDisplay}</td>
                                        {filteredRooms.map(hab => {
                                            const status = hab.estadosPorFecha[dateKey] || 'LIBRE';

                                            // Determinar estilo celda
                                            let cellClass = 'bg-gray-100 text-gray-400';
                                            if (getCellStyle) {
                                                cellClass = getCellStyle(hab.numero, dateKey, status);
                                            } else {
                                                cellClass = getStatusClass(status);
                                            }

                                            return (
                                                <td
                                                    key={`${hab.numero}-${dateKey}`}
                                                    className={`border border-[#ccc] p-2 text-center ${cellClass} ${onCellClick ? 'cursor-pointer' : ''}`}
                                                    onClick={() => onCellClick && onCellClick(hab.numero, dateKey, status, hab.tipo)}
                                                >
                                                    {status === 'LIBRE' ? 'Libre' : (status === 'OCUPADO' ? 'Ocupada' : 'Reservada')}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Panel de filtros */}
                <div className="w-[250px] border border-gray-300 p-4 bg-white overflow-y-auto shrink-0">
                    <h3 className="text-lg font-bold mb-4 border-b-2 border-[#0056b3] pb-2">Filtros</h3>

                    <div className="flex flex-col gap-2 mb-4">
                        {Object.keys(tipos).map(tipo => (
                            <label key={tipo} className="cursor-pointer flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={tipos[tipo as keyof typeof tipos]}
                                    onChange={() => setTipos(prev => ({ ...prev, [tipo]: !prev[tipo as keyof typeof tipos] }))}
                                />
                                {tipo.replace(/_/g, ' ')}
                            </label>
                        ))}
                    </div>

                    <hr className="my-4" />

                    <div className="flex flex-col gap-2">
                        {Object.keys(estados).map(estado => (
                            <label key={estado} className="cursor-pointer flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={estados[estado as keyof typeof estados]}
                                    onChange={() => setEstados(prev => ({ ...prev, [estado]: !prev[estado as keyof typeof estados] }))}
                                />
                                {estado}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-center mt-4 gap-4">
                <button onClick={() => router.push('/')} className="btn-cancel bg-[#dc3545] hover:bg-[#c82333]">CANCELAR</button>
                {footerChildren}
            </div>

            {children}
        </div>
    );
}
