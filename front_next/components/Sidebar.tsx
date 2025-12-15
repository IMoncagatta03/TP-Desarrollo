'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, UserPlus, Search, Bed, CalendarCheck, UserCog, LogOut, Hotel, DoorOpen, FileText, UserMinus } from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const isActive = (href: string) => {
        const [path, query] = href.split('?');
        const itemParams = new URLSearchParams(query);

        if (pathname !== path) return false;

        // Si estamos en /huespedes/nuevo pero hay un numDoc en los params, significa que estamos Modificando, no dando de alta
        if (path === '/huespedes/nuevo' && searchParams.get('numDoc')) {
            return false;
        }

        // Diferenciar "Buscar" de "Dar Baja" usando el query param 'action'
        if (path === '/huespedes/buscar') {
            const currentAction = searchParams.get('action');
            const itemAction = itemParams.get('action');
            return currentAction === itemAction;
        }

        return true;
    };

    const menuItems = [
        { href: '/', icon: Home, label: 'Inicio' },
        { href: '/huespedes/nuevo', icon: UserPlus, label: 'Dar Alta Huésped' },
        { href: '/huespedes/buscar', icon: Search, label: 'Buscar Huésped' },
        { href: '/huespedes/buscar?action=delete', icon: UserMinus, label: 'Dar Baja Huésped' },
        { href: '/habitaciones', icon: Bed, label: 'Estado Habitaciones' },
        { href: '/reservas', icon: CalendarCheck, label: 'Reservar Habitación' },
        { href: '/reservas/cancelar', icon: LogOut, label: 'Cancelar Reserva' },
        { href: '/ocupar-habitacion', icon: DoorOpen, label: 'Ocupar Habitación' },
        { href: '/facturacion', icon: FileText, label: 'Facturar' },
    ];

    const logout = () => {
        if (confirm('¿Está seguro que desea salir?')) {
            sessionStorage.removeItem('isLoggedIn');
            window.location.href = '/login';
        }
    };

    if (pathname === '/login') return null;

    return (
        <nav className="w-[260px] bg-[#0056b3] text-white flex flex-col shadow-[2px_0_5px_rgba(0,0,0,0.2)] shrink-0 h-full">
            <div className="text-[1.4rem] font-bold p-[20px] border-b border-white/10 flex items-center gap-[10px]">
                <Hotel /> Gestión Hotelera
            </div>
            <ul className="list-none p-0 mt-[20px] flex-1">
                {menuItems.map((item) => (
                    <li key={item.href}>
                        <Link
                            href={item.href}
                            className={`flex items-center gap-[15px] py-[15px] px-[25px] text-white/80 font-medium transition-all hover:bg-white/10 hover:text-white border-l-4 ${isActive(item.href) ? 'bg-white/15 text-white border-white' : 'border-transparent'
                                }`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </Link>
                    </li>
                ))}

                <li className="mt-auto border-t border-white/10">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-[15px] py-[15px] px-[25px] text-white/80 font-medium transition-all hover:bg-white/10 hover:text-white border-l-4 border-transparent text-left cursor-pointer"
                    >
                        <LogOut size={20} />
                        Salir
                    </button>
                </li>
            </ul>
        </nav>
    );
}
