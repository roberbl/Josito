import { NextResponse, type NextRequest } from 'next/server';

const publicRoutes = ['/login', '/registro'];
const limitedAccountRoutes = ['/perfil', '/instrucciones'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));
  const token = request.cookies.get('firebase-id-token')?.value;
  if (!token && !isPublic) return NextResponse.redirect(new URL('/login', request.url));
  if (!token) return NextResponse.next();

  const lookup = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: token }),
    cache: 'no-store',
  });
  if (!lookup.ok && !isPublic) return NextResponse.redirect(new URL('/login', request.url));
  if (lookup.ok && isPublic) return NextResponse.redirect(new URL('/', request.url));

  const { users } = await lookup.json();
  const userId = users?.[0]?.localId;
  const profileResponse = await fetch(`https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${userId}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  const profile = await profileResponse.json().catch(() => null);
  const role = profile?.fields?.role?.stringValue;
  const status = profile?.fields?.participantStatus?.stringValue ?? 'pending';

  if (pathname.startsWith('/admin') && role !== 'admin') return NextResponse.redirect(new URL('/', request.url));
  if (role !== 'admin' && status !== 'active' && !limitedAccountRoutes.some((route) => pathname.startsWith(route))) return NextResponse.redirect(new URL('/perfil', request.url));
  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'] };
