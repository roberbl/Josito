# Quiniela Familiar 2026/2027

Aplicación web para gestionar una quiniela familiar con 12 participantes, jornadas semanales, Pleno al 15, copita, eliminaciones, tablas de temporada, clasificación individual y por equipos.

## Stack

- Next.js App Router + TypeScript.
- Tailwind CSS.
- Supabase Auth, Postgres y Row Level Security.
- Preparada para Vercel sin servicios de pago obligatorios.

## Funcionalidad incluida

- Página principal con jornada actual, boletín móvil/escritorio y formulario de pronósticos.
- Clasificación individual y por equipos con puntos, copitas, dinero y estados.
- Tablas de temporada con cierre el 14/08/2026 a las 12:00 UTC.
- Página de instrucciones con formato, puntuaciones, eliminaciones, copita, empates y premios.
- Panel admin para participantes, equipos, jornadas, partidos, resultados y cálculo.
- Lógica reutilizable en `lib/scoring.ts` para validar quinielas, generar no presentados, calcular puntos y tablas.
- SQL completo en `supabase/schema.sql` con tablas, relaciones, índices, RLS y políticas.
- Semillas en `supabase/seed.sql` para 12 participantes, 4 equipos y una jornada.

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

## Supabase

1. Crea un proyecto gratuito en Supabase.
2. Abre SQL Editor y ejecuta `supabase/schema.sql`.
3. Ejecuta `supabase/seed.sql` para datos de ejemplo.
4. Crea usuarios en Supabase Auth desde el panel y vincúlalos a `profiles`/`participants`.
5. Asigna `role='admin'` al perfil administrador.

## Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. Añade `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en Environment Variables.
3. Despliega. El comando de build es `npm run build`.

## Reglas importantes implementadas en base de datos

- Un participante solo lee/modifica sus pronósticos antes del cierre.
- Después del cierre todos pueden leer los pronósticos.
- Solo administradores gestionan jornadas, partidos, resultados, dinero, desempates y auditoría.
- Las tablas de temporada son privadas hasta `2026-08-14 12:00:00+00`.
- El cálculo puede repetirse con `upsert` sobre tablas de puntuación para no duplicar datos.

## Próximos pasos recomendados

- Conectar los formularios mock actuales a Server Actions de Supabase.
- Añadir tests unitarios para más escenarios de desempate.
- Añadir invitaciones de Auth usando service role en scripts locales de administración.
