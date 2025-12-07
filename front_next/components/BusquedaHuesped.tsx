'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiBaseUrl, API_ROUTES } from '@/lib/api';
import { Search, UserPlus, ArrowRight, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface Huesped {
    nombres: string;
    apellido: string;
    tipoDocumento: string;
    numeroDocumento: string;
}

type SortKey = keyof Huesped;

interface SortConfig {
    key: SortKey | null;
    direction: 'asc' | 'desc';
}

export interface BusquedaHuespedProps {
    onSelect?: (selectedGuests: Huesped[]) => void;
    isMultiple?: boolean;
    onCancel?: () => void;
}

export default function BusquedaHuesped({ onSelect, isMultiple = false, onCancel }: BusquedaHuespedProps) {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [tipoDoc, setTipoDoc] = useState('');
    const [numDoc, setNumDoc] = useState('');
    const [resultados, setResultados] = useState<Huesped[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

    const handleSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedResultados = [...resultados].sort((a, b) => {
        if (!sortConfig.key) return 0;

        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const router = useRouter();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResultados([]);

        if (!isMultiple) setSelectedDocs([]);

        const params = new URLSearchParams();
        if (nombre) params.append('nombre', nombre);
        if (apellido) params.append('apellido', apellido);
        if (tipoDoc) params.append('tipoDocumento', tipoDoc);
        if (numDoc) params.append('numeroDocumento', numDoc);

        try {
            const url = `${getApiBaseUrl()}${API_ROUTES.HUESPEDES}/buscar?${params.toString()}`;
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();
                setResultados(data);
            } else {
                setError('Error al buscar datos');
            }
        } catch (err) {
            console.error(err);
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (doc: string) => {
        if (isMultiple) {
            setSelectedDocs(prev =>
                prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc]
            );
        } else {
            setSelectedDocs([doc]);
        }
    };

    const handleNext = () => {
        if (onSelect) {
            const selected = resultados.filter(h => selectedDocs.includes(h.numeroDocumento));
            onSelect(selected);
        } else {
            if (selectedDocs.length > 0) {
                const selectedGuest = resultados.find(h => h.numeroDocumento === selectedDocs[0]);
                if (selectedGuest) {
                    const params = new URLSearchParams();
                    params.append('nombre', selectedGuest.nombres);
                    params.append('apellido', selectedGuest.apellido);
                    params.append('tipoDoc', selectedGuest.tipoDocumento);
                    params.append('numDoc', selectedGuest.numeroDocumento);
                    router.push(`/huespedes/nuevo?${params.toString()}`);
                }
            } else {
                const params = new URLSearchParams();
                if (nombre) params.append('nombre', nombre);
                if (apellido) params.append('apellido', apellido);
                if (tipoDoc) params.append('tipoDoc', tipoDoc);
                if (numDoc) params.append('numDoc', numDoc);
                router.push(`/huespedes/nuevo?${params.toString()}`);
            }
        }
    };

    return (
        <div className="container mx-auto p-5 h-full flex flex-col">
            <h2 className="text-[#0056b3] text-2xl font-bold mb-6 border-b-2 border-[#0056b3] pb-2">Buscar Huésped</h2>

            <div className="flex gap-10 h-full overflow-hidden">
                {/* Columna de busqueda */}
                <div className="w-[300px] shrink-0 overflow-y-auto pr-2">
                    <h3 className="text-lg font-bold mb-5 text-[#333] border-b-2 border-[#0056b3] pb-2 inline-block">Ingrese los datos</h3>
                    <form onSubmit={handleSearch}>
                        <div className="form-group">
                            <label htmlFor="busqueda-nombre">Nombre</label>
                            <input type="text" id="busqueda-nombre" value={nombre} onChange={(e) => setNombre(e.target.value.toUpperCase())} placeholder="Nombre" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="busqueda-apellido">Apellido</label>
                            <input type="text" id="busqueda-apellido" value={apellido} onChange={(e) => setApellido(e.target.value.toUpperCase())} placeholder="Apellido" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="busqueda-tipoDoc">Tipo de documento</label>
                            <select id="busqueda-tipoDoc" value={tipoDoc} onChange={(e) => setTipoDoc(e.target.value)}>
                                <option value="">Todos</option>
                                <option value="DNI">DNI</option>
                                <option value="LE">LE</option>
                                <option value="LC">LC</option>
                                <option value="Pasaporte">Pasaporte</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="busqueda-numDoc">Número de documento</label>
                            <input type="text" id="busqueda-numDoc" value={numDoc} onChange={(e) => setNumDoc(e.target.value)} placeholder="Número de documento" />
                        </div>

                        <button type="submit" className="btn-submit w-full mt-2 flex justify-center items-center gap-2">
                            <Search size={18} /> BUSCAR
                        </button>
                    </form>
                </div>

                {/* Columna de resultados */}
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <h3 className="text-lg font-bold mb-5 text-[#333] border-b-2 border-[#0056b3] pb-2 inline-block shrink-0">Resultado/s</h3>

                    <div className="table-responsive">
                        <table className="results-table">
                            <thead>
                                <tr>
                                    <th className="w-[50px] text-center">Seleccionar</th>
                                    <th
                                        className="cursor-pointer hover:bg-gray-100 group"
                                        onClick={() => handleSort('nombres')}
                                    >
                                        <div className="flex items-center justify-between">
                                            Nombre/s
                                            {sortConfig.key === 'nombres' ? (
                                                sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                            ) : (
                                                <ChevronsUpDown size={16} className="text-gray-400" />
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="cursor-pointer hover:bg-gray-100 group"
                                        onClick={() => handleSort('apellido')}
                                    >
                                        <div className="flex items-center justify-between">
                                            Apellido
                                            {sortConfig.key === 'apellido' ? (
                                                sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                            ) : (
                                                <ChevronsUpDown size={16} className="text-gray-400" />
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="cursor-pointer hover:bg-gray-100 group"
                                        onClick={() => handleSort('tipoDocumento')}
                                    >
                                        <div className="flex items-center justify-between">
                                            Tipo Documento
                                            {sortConfig.key === 'tipoDocumento' ? (
                                                sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                            ) : (
                                                <ChevronsUpDown size={16} className="text-gray-400" />
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="cursor-pointer hover:bg-gray-100 group"
                                        onClick={() => handleSort('numeroDocumento')}
                                    >
                                        <div className="flex items-center justify-between">
                                            Nro. Documento
                                            {sortConfig.key === 'numeroDocumento' ? (
                                                sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                            ) : (
                                                <ChevronsUpDown size={16} className="text-gray-400" />
                                            )}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr><td colSpan={5} className="text-center p-4">Buscando...</td></tr>
                                )}

                                {!loading && error && (
                                    <tr><td colSpan={5} className="text-center p-4 text-red-500">{error}</td></tr>
                                )}

                                {!loading && !error && sortedResultados.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center p-4">
                                            <p className="mb-2">No se encontraron resultados.</p>
                                            <button onClick={() => router.push('/huespedes/nuevo')} className="btn-submit inline-flex items-center gap-2">
                                                <UserPlus size={16} /> Dar de Alta
                                            </button>
                                        </td>
                                    </tr>
                                )}

                                {!loading && sortedResultados.map((h) => (
                                    <tr key={h.numeroDocumento} className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleSelection(h.numeroDocumento)}>
                                        <td className="text-center">
                                            <input
                                                type={isMultiple ? "checkbox" : "radio"}
                                                name="selectedGuest"
                                                checked={selectedDocs.includes(h.numeroDocumento)}
                                                onChange={() => toggleSelection(h.numeroDocumento)}
                                                className="cursor-pointer"
                                            />
                                        </td>
                                        <td>{h.nombres}</td>
                                        <td>{h.apellido}</td>
                                        <td>{h.tipoDocumento}</td>
                                        <td>{h.numeroDocumento}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex justify-end gap-4 shrink-0 pt-2 border-t border-gray-200">
                        <button type="button" onClick={() => {
                            if (onCancel) onCancel();
                            else {
                                setNombre(''); setApellido(''); setTipoDoc(''); setNumDoc(''); setResultados([]);
                                router.push('/');
                            }
                        }} className="btn-cancel">CANCELAR</button>

                        <button type="button" onClick={handleNext} className="btn-submit bg-[#0056b3] flex items-center gap-2">
                            {onSelect ? 'ACEPTAR' : 'SIGUIENTE'} <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
