# Design

## Theme
Editorial cálido, mobile-first. Fondo tipo papel en claro, tinta cálida casi negra en oscuro. Un solo acento fuerte (terracota) domina CTAs/enlaces/marca; dorado, verde salvia y rojo ladrillo se usan como colores semánticos puntuales (rating/staff-pick, disponible, prestado/eliminar), no decorativos.

## Color (CSS custom properties, `frontend/src/styles/tokens.css`, swapped por `.dark` en `<html>`)

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--color-bg` | `#fbf6ed` | `#1b1712` | fondo de página |
| `--color-surface` | `#ffffff` | `#24201a` | tarjetas, modales, header |
| `--color-surface-alt` | `#f3ead9` | `#2e2820` | badges neutros, fondos secundarios |
| `--color-ink` | `#2b2117` | `#f3eadc` | texto principal |
| `--color-ink-muted` | `#6b5d4f` | `#b3a493` | texto secundario |
| `--color-border` | `#e7dcc8` | `#3b332a` | bordes |
| `--color-accent` / `-hover` / `-soft` / `-ink` | `#b4502e` / `#9a4025` / `#f1ddd0` / `#fff` | `#e0774e` / `#ef8b62` / `#3a281f` / `#1b1712` | marca, CTAs, enlaces |
| `--color-gold` / `-soft` | `#a8791f` / `#f5e6c4` | `#d9ac5c` / `#3a2f1c` | ratings, selección staff |
| `--color-success` / `-soft` | `#3f6b4a` / `#dce9dd` | `#7fae8b` / `#223225` | disponible, confirmaciones |
| `--color-danger` / `-soft` | `#a23b33` / `#f1dad6` | `#d97d73` / `#3a2320` | prestado, eliminar, error |

Mapeados en `tailwind.config.js` como `bg-*`, `text-*`, `border-*` (`bg`, `surface`, `surface-alt`, `ink`, `ink-muted`, `edge`, `accent`, `accent-hover`, `accent-soft`, `accent-ink`, `gold`, `gold-soft`, `success`, `success-soft`, `danger`, `danger-soft`).

## Typography
- **Display/headings**: Fraunces (serif), self-hosted vía `@fontsource/fraunces` (400/500/600/700 + 600-italic). Clase `font-serif`.
- **UI/cuerpo**: Inter (sans), self-hosted vía `@fontsource/inter` (400/500/600/700). Es la fuente por defecto del `body`.
- Encabezados usan `font-serif font-semibold`, nunca `font-extrabold` (evita el peso 800 que no está cargado).

## Componentes existentes (`frontend/src/components/ui/`)
- `Button` — variantes `primary/success/purple/pink/danger/secondary/ghost`, todas resuelven a los tokens de arriba (purple/pink están unificados al acento por cohesión editorial).
- `Badge` — pastilla `bg-*-soft text-*` con ícono opcional.
- `Modal` — overlay `bg-black/75`, panel `bg-surface`, título `font-serif text-accent`.
- `Input` — borde `border-edge`, focus ring `accent`.
- `FullPageLoader`, `NotificationToast`, `DarkModeToggle`, `IconButton`.

## Layout
- `AppShell` — header sticky + `<Outlet/>` + footer + modal global de libro. Ancho contenido vía `container mx-auto px-4`.
- Tarjetas: `bg-surface border border-edge rounded-xl shadow-sm hover:shadow-lg`, elevación sutil en hover (`hover:-translate-y-1`), no glassmorphism, no gradientes decorativos salvo el hero de Home (`bg-accent` sólido).
- Grillas responsive: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` para catálogos de tarjetas.

## Motion
- `framer-motion` ya es dependencia. Entradas de página: `initial={{opacity:0,x:20}} animate={{opacity:1,x:0}}`. Modales: spring `damping:20 stiffness:300`. Nada de bounce/elastic decorativo fuera de eso.
- Pendiente para la sección de juegos: micro-interacciones de acierto/error, flip de cartas, confirmación de logro desbloqueado — deben usar curvas ease-out, respetar `prefers-reduced-motion`.
