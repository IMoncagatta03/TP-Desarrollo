'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UserPlus, Search, Bed, CalendarCheck, UserCog, LogOut, Hotel, DoorOpen } from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const menuItems = [
        { href: '/', icon: Home, label: 'Inicio' },
        { href: '/huespedes/nuevo', icon: UserPlus, label: 'Dar Alta Huésped' },
        { href: '/huespedes/buscar', icon: Search, label: 'Buscar Huésped' },
        { href: '/habitaciones', icon: Bed, label: 'Estado Habitaciones' },
        { href: '/reservas', icon: CalendarCheck, label: 'Reservar Habitación' },
        { href: '/ocupar-habitacion', icon: DoorOpen, label: 'Ocupar Habitación' },
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
                        className="w-full flex items-center gap-[15px] py-[15px] px-[25px] text-white/80 font-medium transition-all hover:bg-white/10 hover:text-white border-l-4 border-transparent text-left"
                    >
                        <LogOut size={20} />
                        Salir
                    </button>
                </li>
            </ul>
        </nav>
    );
}
