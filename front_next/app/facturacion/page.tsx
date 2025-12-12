'use client';

import { useState, useRef } from 'react';
import { Search, DollarSign, FileText, ArrowLeft, User, Building } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FacturacionPage() {
    const router = useRouter();

    // Steps: 1 = Search, 2 = Payers, 3 = Items/Final
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Step 1: Search Inputs
    const [habitacion, setHabitacion] = useState('');
    const [horaSalida, setHoraSalida] = useState('10:00');
    const habitacionRef = useRef<HTMLInputElement>(null);
    const horaRef = useRef<HTMLInputElement>(null);

    // Data
    const [detalle, setDetalle] = useState<any>(null);
    const [terceroData, setTerceroData] = useState<any>(null);

    // Selection
    const [selectedPayerType, setSelectedPayerType] = useState<'huesped' | 'tercero'>('huesped');
    const [selectedHuespedDoc, setSelectedHuespedDoc] = useState('');
    const [cuitTercero, setCuitTercero] = useState('');

    // Checkboxes
    const [checkEstadia, setCheckEstadia] = useState(true);
    const [selectedConsumos, setSelectedConsumos] = useState<number[]>([]);

    // ----------------------------------------------------
    // FLOW 1: Search
    // ----------------------------------------------------
    const buscarHabitacion = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors = [];

        if (!habitacion.trim()) errors.push('Número de habitación faltante');
        if (!horaSalida.trim()) errors.push('Hora faltante o incorrecta');

        if (errors.length > 0) {
            setErrorMsg(errors.join('. '));
            if (!habitacion.trim()) habitacionRef.current?.focus();
            else if (!horaSalida.trim()) horaRef.current?.focus();
            return;
        }

        setLoading(true);
        setErrorMsg('');
        setDetalle(null);

        try {
            const res = await fetch(`http://localhost:8080/facturacion/detalle?habitacion=${habitacion}`);
            if (res.ok) {
                const data = await res.json();
                setDetalle(data);
                setSelectedConsumos(data.consumos.map((c: any) => c.id));
                setStep(2);
            } else {
                setErrorMsg('Habitación no ocupada o no encontrada.');
                habitacionRef.current?.focus();
            }
        } catch (err) {
            setErrorMsg('Error de conexión.');
        } finally {
            setLoading(false);
        }
    };

    // ----------------------------------------------------
    // FLOW 2: Payer Selection
    // ----------------------------------------------------
    const handleHuespedSelect = (huesped: any) => {
        // Age Check
        const birth = new Date(huesped.fechaNacimiento);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) age--;

        if (age < 18) {
            alert('La persona seleccionada es menor de edad. Por favor elija otra');
            return;
        }

        setSelectedHuespedDoc(huesped.numeroDocumento);
        setSelectedPayerType('huesped');

        // Clear Third Party selection if exists
        setTerceroData(null);
        setCuitTercero('');
    };

    const handleBuscarTercero = async () => {
        if (!cuitTercero) {
            if (confirm('CUIT Vacío. ¿Desea dar de alta un nuevo Responsable de Pago?')) {
                alert('Redirigiendo a Alta Responsable...');
            }
            return;
        }

        // Deselect guest when searching CUIT
        setSelectedHuespedDoc('');

        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/facturacion/responsable/${cuitTercero}`);
            if (res.ok) {
                const data = await res.json();
                setTerceroData(data);
                setSelectedPayerType('tercero');
            } else {
                alert('Responsable no encontrado.');
                setTerceroData(null);
            }
        } catch (e) {
            alert('Error al buscar tercero');
        } finally {
            setLoading(false);
        }
    };

    const aceptarTercero = () => {
        // Already set in state, just visual confirmation or move to next step
        setStep(3);
    };

    const cancelarTercero = () => {
        setTerceroData(null);
        setCuitTercero('');
        // Optionally re-select default or leave empty
    };

    // ----------------------------------------------------
    // FLOW 3: Creation
    // ----------------------------------------------------
    const toggleConsumo = (id: number) => {
        setSelectedConsumos(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const calcularTotal = () => {
        if (!detalle) return 0;
        let total = 0;
        if (checkEstadia) total += detalle.montoEstadia;
        detalle.consumos.forEach((c: any) => {
            if (selectedConsumos.includes(c.id)) total += c.precio * c.cantidad;
        });
        return total;
    };

    const generarFactura = async () => {
        try {
            setLoading(true);
            // Identify correct Payer ID (Mock Logic for 'tercero')
            let responsableId = null;
            if (selectedPayerType === 'huesped') {
                // Find huesped ID logic would be here, usually passed in DTO. 
                // For now relying on backend finding it or redundant check.
            } else {
                responsableId = terceroData.id;
            }

            const res = await fetch('http://localhost:8080/facturacion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idEstadia: detalle.estadia.id,
                    tipoFactura: 'B',
                    facturarEstadia: checkEstadia,
                    idsConsumos: selectedConsumos,
                    // Add responsableId param to backend if needed
                })
            });

            if (res.ok) {
                alert('Factura generada y guardada como PENDIENTE DE PAGO.');
                router.push('/');
            } else {
                alert('Error al generar factura.');
            }
        } catch (e) {
            alert('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    // ----------------------------------------------------
    // RENDER
    // ----------------------------------------------------
    const renderPayerLabel = () => {
        if (selectedPayerType === 'tercero' && terceroData) {
            return `${terceroData.razonSocial} (CUIT: ${cuitTercero})`;
        }
        const h = detalle.ocupantes.find((o: any) => o.numeroDocumento === selectedHuespedDoc);
        return h ? `${h.apellido}, ${h.nombres} (Doc: ${h.numeroDocumento})` : 'Seleccione responsable';
    };

    return (
        <div className="p-8 max-w-5xl mx-auto min-h-screen flex flex-col">
            <h1 className="text-3xl font-bold text-[#2c3e50] mb-6 flex items-center gap-2">
                <FileText /> Facturación
            </h1>

            <div className="flex-1">
                {step === 1 && (
                    <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in border-t-4 border-blue-600">
                        <form onSubmit={buscarHabitacion}>
                            <div className="flex gap-4 items-end mb-6">
                                <div className="w-48">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nº Habitación</label>
                                    <input
                                        ref={habitacionRef}
                                        type="text"
                                        value={habitacion}
                                        onChange={(e) => setHabitacion(e.target.value)}
                                        className={`w-full p-2 border rounded-md outline-none ${errorMsg.includes('habitación') ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'}`}
                                        placeholder="Ej: 101"
                                    />
                                </div>
                                <div className="w-48">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora Salida</label>
                                    <input
                                        ref={horaRef}
                                        type="time"
                                        value={horaSalida}
                                        onChange={(e) => setHoraSalida(e.target.value)}
                                        className={`w-full p-2 border rounded-md outline-none ${errorMsg.includes('Hora') ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'}`}
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex justify-between items-center pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => router.push('/')}
                                    className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 font-semibold shadow-sm"
                                >
                                    CANCELAR
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-600 text-white px-8 py-2 rounded-md hover:bg-blue-700 font-semibold shadow-sm"
                                >
                                    {loading ? 'BUSCANDO...' : 'BUSCAR'}
                                </button>
                            </div>
                        </form>
                        {errorMsg && (
                            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-200 font-medium animate-pulse">
                                {errorMsg}
                            </div>
                        )}
                    </div>
                )}

                {step === 2 && detalle && (
                    <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in border-t-4 border-blue-600">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Seleccionar Responsable de Pago</h2>
                            <div className="text-sm text-gray-500">Habitación {habitacion}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left: Occupants */}
                            <div className={`p-4 rounded-lg border-2 transition-all ${selectedPayerType === 'huesped' ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 border-dashed hover:border-gray-300'}`}>
                                <div className="flex items-center gap-2 mb-4 text-blue-800 font-semibold">
                                    <User size={20} /> De la Habitación
                                </div>
                                <div className="space-y-2">
                                    {detalle.ocupantes.map((h: any) => (
                                        <label key={h.numeroDocumento} className="flex items-center p-3 bg-white border rounded cursor-pointer hover:shadow-sm transition-shadow">
                                            <input
                                                type="radio"
                                                name="payer"
                                                checked={selectedHuespedDoc === h.numeroDocumento}
                                                onChange={() => handleHuespedSelect(h)}
                                                className="h-4 w-4 text-blue-600 mr-3"
                                            />
                                            <div>
                                                <div className="font-medium">{h.apellido}, {h.nombres}</div>
                                                <div className="text-xs text-gray-500">Doc: {h.numeroDocumento}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Third Party */}
                            <div className={`p-4 rounded-lg border-2 transition-all ${selectedPayerType === 'tercero' ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 border-dashed hover:border-gray-300'}`}>
                                <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold">
                                    <Building size={20} /> Tercero / Empresa
                                </div>
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={cuitTercero}
                                        onChange={(e) => setCuitTercero(e.target.value)}
                                        className="flex-1 p-2 border rounded text-sm"
                                        placeholder="CUIT (sin guiones)"
                                    />
                                    <button onClick={handleBuscarTercero} className="bg-gray-800 text-white px-3 py-2 rounded text-sm hover:bg-gray-900">
                                        <Search size={16} />
                                    </button>
                                </div>

                                {terceroData && (
                                    <div className="bg-white p-4 rounded shadow-sm border border-green-200">
                                        <p className="font-bold text-green-800 text-sm mb-1">¡Encontrado!</p>
                                        <p className="text-lg font-semibold mb-1">{terceroData.razonSocial}</p>
                                        <p className="text-xs text-gray-500 mb-3">
                                            {terceroData.direccion
                                                ? `${terceroData.direccion.direccionCalle} ${terceroData.direccion.direccionNumero}, ${terceroData.direccion.localidad}`
                                                : 'Sin dirección'
                                            }
                                        </p>
                                        <div className="flex gap-2">
                                            <button onClick={aceptarTercero} className="flex-1 bg-green-600 text-white py-1 rounded text-sm hover:bg-green-700 font-medium">
                                                Usar este
                                            </button>
                                            <button onClick={cancelarTercero} className="px-3 py-1 text-red-600 text-sm hover:bg-red-50 rounded">
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-between items-center pt-4 border-t">
                            <button onClick={() => router.push('/')} className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 font-semibold shadow-sm">
                                CANCELAR
                            </button>
                            {selectedPayerType === 'huesped' && selectedHuespedDoc && (
                                <button onClick={() => setStep(3)} className="bg-blue-600 text-white px-8 py-2 rounded-md hover:bg-blue-700 font-semibold shadow-sm">
                                    CONTINUAR
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {step === 3 && detalle && (
                    <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in border-t-4 border-green-600">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setStep(2)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><ArrowLeft size={20} /></button>
                                <h2 className="text-xl font-bold text-gray-800">Confirmar Facturación</h2>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Responsable de Pago</div>
                                <div className="font-bold text-lg text-blue-900">{renderPayerLabel()}</div>
                            </div>
                        </div>

                        <table className="w-full mb-8">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="p-3 w-16 text-center">Pagar</th>
                                    <th className="p-3 text-left">Concepto</th>
                                    <th className="p-3 text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="hover:bg-gray-50 transition-colors border-b">
                                    <td className="p-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={checkEstadia}
                                            onChange={(e) => setCheckEstadia(e.target.checked)}
                                            className="w-5 h-5 cursor-pointer accent-blue-600"
                                        />
                                    </td>
                                    <td className="p-3">
                                        <div className="font-medium text-gray-800">Estadía</div>
                                        <div className="text-xs text-gray-500">{detalle.estadia.fechaDesde} - {detalle.estadia.fechaHasta}</div>
                                    </td>
                                    <td className="p-3 text-right font-medium">${detalle.montoEstadia}</td>
                                </tr>
                                {detalle.consumos.map((c: any) => (
                                    <tr key={c.id} className="hover:bg-gray-50 transition-colors border-b">
                                        <td className="p-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedConsumos.includes(c.id)}
                                                onChange={() => toggleConsumo(c.id)}
                                                className="w-5 h-5 cursor-pointer accent-blue-600"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <div className="font-medium text-gray-800">{c.nombre}</div>
                                            <div className="text-xs text-gray-500">Cantidad: {c.cantidad}</div>
                                        </td>
                                        <td className="p-3 text-right font-medium">${c.precio * c.cantidad}</td>
                                    </tr>
                                ))}
                                <tr className="bg-blue-50/50">
                                    <td colSpan={2} className="p-4 text-right">
                                        <span className="text-gray-600 font-medium">TOTAL A PAGAR</span>
                                        <div className="text-xs text-gray-500">IVA Incluido</div>
                                    </td>
                                    <td className="p-4 text-right text-2xl font-bold text-green-700">
                                        ${calcularTotal()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="flex justify-end gap-3 mt-auto">
                            <button
                                onClick={() => router.push('/')}
                                className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 font-bold shadow-sm transition-transform active:scale-95"
                            >
                                CANCELAR
                            </button>
                            <button
                                onClick={generarFactura}
                                className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-bold shadow-lg flex items-center gap-2 transition-transform active:scale-95"
                            >
                                <DollarSign size={20} /> ACEPTAR Y FACTURAR
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
