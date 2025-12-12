'use client';

import { useState, useRef } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Reserva {
  id: number;
  habitacion: {
    numero: string;
    tipo: string;
  };
  fechaDesde: string;
  fechaHasta: string;
  nombres: string;
  apellido: string;
}

export default function CancelarReservaPage() {
  const router = useRouter();
  const apellidoRef = useRef<HTMLInputElement>(null);
  const [apellido, setApellido] = useState('');
  const [nombres, setNombres] = useState('');
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  // Force uppercase on input
  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string
  ) => {
    setter(value.toUpperCase());
  };

  const buscarReservas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apellido.trim()) {
      setMensaje('El campo apellido no puede estar vacío');
      apellidoRef.current?.focus();
      return;
    }

    setLoading(true);
    setMensaje('');
    setReservas([]);
    setSelectedIds([]);

    try {
      const query = new URLSearchParams({ apellido });
      if (nombres.trim()) query.append('nombres', nombres);

      const response = await fetch(`http://localhost:8080/reservas?${query.toString()}`);

      if (response.status === 204) {
        setMensaje('No existen reservas para los criterios de búsqueda');
        apellidoRef.current?.focus();
      } else if (response.ok) {
        const data = await response.json();
        setReservas(data);
      } else {
        setMensaje('Error al buscar reservas.');
      }
    } catch (error) {
      console.error(error);
      setMensaje('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const cancelarReservasSeleccionadas = async () => {
    if (selectedIds.length === 0) return;

    try {
      setLoading(true);
      // Execute all deletes in parallel
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`http://localhost:8080/reservas/${id}`, { method: 'DELETE' })
        )
      );

      setMensaje(`Se han cancelado ${selectedIds.length} reserva(s) exitosamente.`);
      // Refresh list (filtering out deleted ones)
      setReservas((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
      setSelectedIds([]);
    } catch (error) {
      console.error(error);
      setMensaje('Ocurrió un error al cancelar las reservas.');
    } finally {
      setLoading(false);
    }
  };

  const irAlInicio = () => {
    router.push('/');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <button onClick={() => router.back()} className="mr-4 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-[#2c3e50]">Cancelar Reserva</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <form onSubmit={buscarReservas} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
            <input
              ref={apellidoRef}
              type="text"
              value={apellido}
              onChange={(e) => handleInputChange(setApellido, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none uppercase"
              placeholder="INGRESE APELLIDO"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
            <input
              type="text"
              value={nombres}
              onChange={(e) => handleInputChange(setNombres, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none uppercase"
              placeholder="INGRESE NOMBRES"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Search size={20} />
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
        {mensaje && (
          <div className={`mt-4 p-3 rounded-md font-medium text-center ${mensaje.includes('exitosamente') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {mensaje}
          </div>
        )}
      </div>

      {reservas.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#2c3e50] text-white">
              <tr>
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4">Habitación</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Huésped</th>
                <th className="p-4">Desde</th>
                <th className="p-4">Hasta</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((reserva) => (
                <tr key={reserva.id} className="border-b hover:bg-gray-50 text-gray-700">
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(reserva.id)}
                      onChange={() => toggleSelect(reserva.id)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-4 font-semibold">{reserva.habitacion.numero}</td>
                  <td className="p-4 text-sm">{reserva.habitacion.tipo.replace(/_/g, ' ')}</td>
                  <td className="p-4 uppercase">{reserva.apellido}, {reserva.nombres}</td>
                  <td className="p-4">{reserva.fechaDesde}</td>
                  <td className="p-4">{reserva.fechaHasta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Buttons Area - Always visible if there are results or just logic per request? User said "when CANCELAR is pressed... takes to home". This implies these buttons might be always visible or part of the flow. Let's show them when results are present or general footer. But "ACEPTAR" cancels selected. So only show when results exist. */}

      {reservas.length > 0 && (
        <div className="flex justify-end gap-4 mt-6">
          {/* ACEPTAR Button -> Cancels selected */}
          <button
            onClick={cancelarReservasSeleccionadas}
            disabled={selectedIds.length === 0 || loading}
            className={`px-8 py-3 rounded-md font-bold text-white transition-colors ${selectedIds.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
              }`}
          >
            ACEPTAR
          </button>

          {/* CANCELAR Button -> Exits */}
          <button
            onClick={irAlInicio}
            className="px-8 py-3 rounded-md font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            CANCELAR
          </button>
        </div>
      )}
    </div>
  );
}
