import { Suspense } from 'react';
import FormularioHuesped from '@/components/FormularioHuesped';

export default function NuevoHuespedPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <div className="p-[10px]">
                <FormularioHuesped />
            </div>
        </Suspense>
    );
}
