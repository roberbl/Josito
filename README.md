# Quiniela Familiar 2026/2027

Aplicación web mobile-first para gestionar una quiniela familiar con jornadas semanales, Pleno al 15, copita, eliminaciones, tablas de temporada, clasificación individual/equipos y administración de usuarios registrados.

## Stack

- Next.js App Router + TypeScript.
- Tailwind CSS con diseño mobile-first.
- Supabase Auth, Postgres y Row Level Security.
- Preparada para Vercel sin servicios de pago obligatorios.

## Funcionalidad incluida

- Registro público con nombre visible, email, contraseña y confirmación.
- Login con email/contraseña usando Supabase Auth.
- Middleware que redirige usuarios no autenticados a `/login` y protege `/admin` para admins.
- Perfil con email, rol, equipo, estado y cierre de sesión.
- Página principal responsive con jornada actual, estados claros, tarjetas en móvil, botones grandes 1/X/2 y botón fijo inferior para guardar pronósticos.
- Clasificación mobile-first con tarjetas en móvil y tabla solo en escritorio.
- Tablas de temporada con cierre el 14/08/2026 a las 12:00 UTC.
- Panel admin con indicadores de usuarios pendientes, activos y bloqueados.
- `/admin/usuarios` con búsqueda, filtros y acciones para rol, estado, equipo y dinero ganado.
- Lógica reutilizable en `lib/scoring.ts` para validar quinielas, generar no presentados, calcular puntos y tablas.
- SQL completo en `supabase/schema.sql` con tablas, relaciones, índices, triggers, RLS y políticas.
- Semillas en `supabase/seed.sql` para 12 participantes de ejemplo, 4 equipos y una jornada.

## Configuración local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Configura en `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=only-for-local-admin-scripts
```

## Configurar Supabase Auth

1. Crea un proyecto gratuito en Supabase.
2. En **Authentication > Providers > Email**, activa Email/Password.
3. Si quieres registro sin confirmar email durante pruebas, desactiva temporalmente **Confirm email**.
4. En **SQL Editor**, ejecuta `supabase/schema.sql`.
5. Ejecuta `supabase/seed.sql` para datos de ejemplo de equipos/jornada.
6. En Vercel o `.env.local`, añade `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Cómo funciona el registro público

- Cualquier persona con el enlace puede entrar en `/registro`.
- Al crear un usuario, el trigger `handle_new_user()` crea automáticamente:
  - una fila en `profiles`, con `role='participant'`;
  - una fila en `participants`;
  - una fila inicial en `money_winnings`.
- El estado inicial es `participant_status='pending'`.
- Solo usuarios `active` pueden enviar pronósticos.
- Usuarios `pending` pueden iniciar sesión y leer instrucciones, pero no participar.
- Usuarios `blocked` no pueden participar.

## Hacer admin a un usuario

Tras registrarte con email/password, ejecuta en Supabase SQL Editor:

```sql
update profiles
set role = 'admin', participant_status = 'active'
where email = 'tu-email@example.com';
```

Después vuelve a iniciar sesión. El menú mostrará el panel de administración y `/admin/usuarios`.

## Probar login y registro

1. Ejecuta `npm run dev`.
2. Abre `http://localhost:3000/registro`.
3. Crea un usuario con nombre, email y contraseña.
4. Comprueba en Supabase que existen filas en `auth.users`, `profiles`, `participants` y `money_winnings`.
5. Activa al usuario desde `/admin/usuarios` o con SQL:

```sql
update profiles set participant_status='active' where email='usuario@example.com';
```

6. Entra en `/perfil` para verificar rol, equipo y estado.

## Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. Añade variables de entorno `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Despliega con `npm run build`.

## Reglas importantes implementadas en base de datos

- Cada usuario puede leer y editar su perfil básico.
- Usuarios no admin no pueden cambiar su rol, estado, equipo ni dinero.
- Solo admin ve todos los usuarios y cambia roles/estados/equipos/dinero.
- Solo perfiles/participantes `active` pueden enviar pronósticos.
- Después del cierre todos pueden leer pronósticos de la jornada.
- Las tablas de temporada son privadas hasta `2026-08-14 12:00:00+00`.
- Las acciones críticas de admin registran auditoría.
