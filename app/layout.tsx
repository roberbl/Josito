import './globals.css';
import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import { getSessionProfile } from '@/lib/auth';
export const metadata:Metadata={title:'Quiniela Familiar 2026/2027',description:'Gestión de quiniela familiar con Firebase'};
export default async function RootLayout({children}:{children:React.ReactNode}){const {profile}=await getSessionProfile();return <html lang="es"><body><Nav profile={profile}/><main className="mx-auto max-w-6xl px-3 pb-32 pt-5 sm:px-4 sm:py-8">{children}</main></body></html>}
