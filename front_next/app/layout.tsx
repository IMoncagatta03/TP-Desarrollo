import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Gestión Hotelera",
  description: "Sistema de Gestión Hotelera",
};

import Autenticacion from "@/components/Autenticacion";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <Autenticacion>
              {children}
            </Autenticacion>
          </main>
        </div>
      </body>
    </html>
  );
}
