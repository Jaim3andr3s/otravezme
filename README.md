# BiblioSueños

Plataforma comunitaria de biblioteca digital (catálogo de libros, eventos, planes de lectura y perfil de lector), con app web y app móvil (Android, vía Capacitor).

## Estructura del repositorio

```
frontend/   App React + Vite (web) empaquetada también como app Android con Capacitor
backend/    API REST en Node/Express + Prisma + PostgreSQL (Neon)
```

Monorepo con `npm workspaces`. Ver el plan de arquitectura completo en `docs/` (próximamente).

## Desarrollo local

```bash
npm install              # instala frontend y backend
npm run dev:backend      # levanta la API en http://localhost:4000
npm run dev:frontend     # levanta la web en http://localhost:5173
```

Cada workspace tiene su propio `.env` (ver `backend/.env.example`). Nunca commitear archivos `.env` reales.

## Stack

- **Frontend**: React 19, Vite, Tailwind CSS, react-router-dom, framer-motion, Capacitor (Android).
- **Backend**: Express, Prisma, PostgreSQL (Neon), JWT + bcrypt para auth de administrador.
- **Hosting gratuito**: Netlify (frontend), Render (backend), Neon (base de datos).
