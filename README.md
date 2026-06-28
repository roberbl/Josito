# Quiniela Familiar 2026/2027

Aplicación web mobile-first para gestionar una quiniela familiar con jornadas semanales, Pleno al 15, copita, eliminaciones, tablas de temporada, clasificación individual/equipos y administración de usuarios registrados.

## Stack

- Next.js App Router + TypeScript.
- Tailwind CSS con diseño mobile-first.
- Firebase Authentication con email/contraseña.
- Cloud Firestore como base de datos.
- Compatible con Vercel. Firebase Hosting es opcional.

## Funcionalidad incluida

- Registro público con nombre visible, email, contraseña y confirmación.
- Login con email/contraseña usando Firebase Authentication.
- Middleware que redirige usuarios no autenticados a `/login` y protege `/admin` para admins.
- Perfil con email, rol, equipo, estado y cierre de sesión.
- Página principal responsive con jornada actual, estados claros, tarjetas en móvil, botones grandes 1/X/2 y botón fijo inferior para guardar pronósticos.
- Clasificación mobile-first con tarjetas en móvil y tabla solo en escritorio.
- Tablas de temporada con cierre el 14/08/2026 a las 12:00 UTC.
- Panel admin con indicadores de usuarios pendientes, activos y bloqueados.
- `/admin/usuarios` con búsqueda, filtros y acciones para rol, estado, equipo y dinero ganado.
- Lógica reutilizable en `lib/scoring.ts` para validar quinielas, generar no presentados, calcular puntos y tablas.
- Reglas de seguridad en `firebase/firestore.rules`.
- Modelo de colecciones documentado en `firebase/collections.md`.

## Configuración local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Configura en `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Configurar Firebase Authentication

1. Crea un proyecto gratuito en Firebase.
2. En **Authentication > Sign-in method**, activa **Email/Password**.
3. Copia la configuración web del proyecto en `.env.local` o en las variables de Vercel.
4. Publica `firebase/firestore.rules` en Firestore Rules.
5. Crea los equipos iniciales en `teams` o usa el modelo de `firebase/collections.md` para importarlos.

## Cómo funciona el registro público

- Cualquier persona con el enlace puede entrar en `/registro`.
- Al crear un usuario con Firebase Auth, la app crea `users/{uid}` en Firestore.
- El documento se crea con `role = "participant"` y `participantStatus = "pending"`.
- Solo usuarios `active` pueden enviar pronósticos.
- Usuarios `pending` pueden iniciar sesión y ver instrucciones/perfil, pero no participar.
- Usuarios `blocked` no pueden participar.

## Hacer admin a un usuario

En Firebase Console, edita el documento `users/{uid}` y cambia:

```json
{
  "role": "admin",
  "participantStatus": "active"
}
```

Después vuelve a iniciar sesión. El menú mostrará el panel de administración y `/admin/usuarios`.

## Probar login y registro

1. Ejecuta `npm run dev`.
2. Abre `http://localhost:3000/registro`.
3. Crea un usuario con nombre, email y contraseña.
4. Comprueba en Firebase Console que existe el usuario en Authentication y el documento `users/{uid}` en Firestore.
5. Activa al usuario desde `/admin/usuarios` con una cuenta admin o manualmente en Firestore con `participantStatus = "active"`.
6. Entra en `/perfil` para verificar rol, equipo y estado.

## Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. Añade todas las variables `NEXT_PUBLIC_FIREBASE_*`.
3. Despliega con `npm run build`.

## Reglas importantes implementadas en Firestore

- Cada usuario puede leer y editar su perfil básico.
- Usuarios no admin no pueden cambiar su rol, estado, equipo ni dinero.
- Solo admin ve todos los usuarios y cambia roles/estados/equipos/dinero.
- Solo usuarios `active` pueden enviar pronósticos.
- Después del cierre se pueden marcar pronósticos como públicos mediante `closed = true`.
- Las acciones críticas de admin quedan modeladas en `auditLogs`.

## Solución a “API key not valid”

Ese error aparece cuando `NEXT_PUBLIC_FIREBASE_API_KEY` no está configurada, sigue con el valor de ejemplo o no corresponde al proyecto Firebase usado. Para corregirlo:

1. Abre Firebase Console > Project settings > General > Your apps > Web app.
2. Copia `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId` y `appId` en `.env.local` usando los nombres `NEXT_PUBLIC_FIREBASE_*`.
3. Reinicia el servidor local con `npm run dev`; Next.js no recarga variables de entorno ya arrancadas.
4. Comprueba que Email/Password está activado en Authentication > Sign-in method.
