import { NextResponse, type NextRequest } from 'next/server';

const publicRoutes = ['/login', '/registro'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));
  const token = request.cookies.get('sb-access-token')?.value;
  if (!token && !isPublic) return NextResponse.redirect(new URL('/login', request.url));
  if (!token) return NextResponse.next();
  const userResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (!userResponse.ok && !isPublic) return NextResponse.redirect(new URL('/login', request.url));
  if (userResponse.ok && isPublic) return NextResponse.redirect(new URL('/', request.url));
  if (pathname.startsWith('/admin')) {
    const user = await userResponse.json();
    const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?select=role&id=eq.${user.id}`, { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, Authorization: `Bearer ${token}` }, cache: 'no-store' });
    const [profile] = await profileResponse.json().catch(() => []);
    if (profile?.role !== 'admin') return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'] };
