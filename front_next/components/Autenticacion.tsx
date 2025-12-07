'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Autenticacion({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // Permitir acceso a la pagina de login sin chequeos
        if (pathname === '/login') {
            setAuthorized(true);
            return;
        }

        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            setAuthorized(false);
            router.push('/login');
        } else {
            setAuthorized(true);
        }
    }, [pathname, router]);

    if (!authorized && pathname !== '/login') {
        return null;
    }

    return <>{children}</>;
}
