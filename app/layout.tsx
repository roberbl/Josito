import './globals.css';
import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
export const metadata:Metadata={title:'Quiniela Familiar 2026/2027',description:'Gestión de quiniela familiar con Supabase'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body><Nav/><main className="mx-auto max-w-6xl px-4 py-8">{children}</main></body></html>}
