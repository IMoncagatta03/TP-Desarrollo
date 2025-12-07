'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Hotel } from 'lucide-react';

export default function LoginForm() {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (usuario === 'admin' && password === 'root') {
            // Login Exitoso
            sessionStorage.setItem('isLoggedIn', 'true');
            router.push('/');
        } else {
            setError('Usuario o contraseña incorrectos');
            setUsuario('');
            setPassword('');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0056b3] to-[#002a5c]">
            <div className="bg-white p-10 rounded-lg shadow-2xl w-full max-w-md text-center">
                <div className="mb-8 text-[#0056b3]">
                    <Hotel size={48} className="mx-auto mb-2" />
                    <h2 className="text-3xl font-bold m-2">Bienvenido</h2>
                    <p className="text-gray-500 m-0">Sistema de Gestión Hotelera</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4 text-left">
                        <label htmlFor="login-usuario" className="block mb-1 font-bold">Usuario</label>
                        <div className="relative flex items-center">
                            <User className="absolute left-4 text-[#0056b3]" size={20} />
                            <input
                                type="text"
                                id="login-usuario"
                                placeholder="Ingrese su usuario"
                                required
                                autoFocus
                                className="pl-10 h-11 text-base w-full border border-gray-300 rounded focus:outline-none focus:border-[#0056b3]"
                                value={usuario}
                                onChange={(e) => setUsuario(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mb-4 text-left">
                        <label htmlFor="login-password" className="block mb-1 font-bold">Contraseña</label>
                        <div className="relative flex items-center">
                            <Lock className="absolute left-4 text-[#0056b3]" size={20} />
                            <input
                                type="password"
                                id="login-password"
                                placeholder="Ingrese su contraseña"
                                required
                                className="pl-10 h-11 text-base w-full border border-gray-300 rounded focus:outline-none focus:border-[#0056b3]"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 mb-4 font-bold">{error}</p>}

                    <button
                        type="submit"
                        className="w-full mt-5 h-11 text-lg bg-[#0056b3] text-white font-bold rounded hover:bg-[#004494] transition-colors"
                    >
                        INGRESAR
                    </button>
                </form>
            </div>
        </div>
    );
}
