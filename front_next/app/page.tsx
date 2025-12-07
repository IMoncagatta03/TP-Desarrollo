'use client';

import { Hotel } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center pt-12">
      <Hotel size={80} className="text-[#2c3e50] mb-5" />
      <h1 className="text-[#2c3e50] text-4xl font-bold mb-2">GESTIÓN HOTELERA</h1>
      <p className="text-xl text-[#7f8c8d]">Seleccione una opción del menú para comenzar.</p>
    </div>
  );
}
