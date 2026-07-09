# Design

## Theme
Kids, brillante y dinámico, mobile-first. Fondo claro tipo cielo despejado en modo claro, azul noche profundo en oscuro. Paleta multicolor saturada (azul, dorado, morado, rosa, verde, rojo) usada libremente en CTAs, insignias, tarjetas y estados — sin miedo al color, pensado para enganchar a lectores infantiles.

## Color (CSS custom properties, `frontend/src/styles/tokens.css`, swapped por `.dark` en `<html>`)

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--color-bg` | `#f5faff` | `#12172b` | fondo de página |
| `--color-surface` | `#ffffff` | `#1c2340` | tarjetas, modales, header |
| `--color-surface-alt` | `#fff4d6` | `#232b4d` | badges neutros, fondos secundarios |
| `--color-ink` | `#1f2937` | `#f1f5ff` | texto principal |
| `--color-ink-muted` | `#5b6472` | `#a9b4d0` | texto secundario |
| `--color-border` | `#dcebfb` | `#313b63` | bordes |
| `--color-accent` / `-hover` / `-soft` / `-ink` | `#2f7bf6` / `#1e63d6` / `#dbe9fe` / `#fff` | `#5b9dff` / `#7cb1ff` / `#23345f` / `#0c0f1e` | marca, CTAs, enlaces |
| `--color-purple` / `-hover` / `-soft` | `#a855f7` / `#9333ea` / `#f1e2fe` | `#c084fc` / `#d3a5fd` / `#362b57` | acento secundario, variedad visual |
| `--color-pink` / `-hover` / `-soft` | `#ff5fa2` / `#f43f89` / `#ffe0ee` | `#ff8fc7` / `#ffa8d4` / `#4a2a3d` | acento secundario, variedad visual |
| `--color-gold` / `-soft` | `#f5a623` / `#ffedcc` | `#ffd666` / `#4a3a17` | ratings, selección staff, insignias |
| `--color-success` / `-soft` | `#22c55e` / `#dcf9e4` | `#4ade80` / `#1c3a29` | disponible, confirmaciones |
| `--color-danger` / `-soft` | `#ff5757` / `#ffe0e0` | `#ff8484` / `#4a2323` | prestado, eliminar, error |

Mapeados en `tailwind.config.js` como `bg-*`, `text-*`, `border-*` (`bg`, `surface`, `surface-alt`, `ink`, `ink-muted`, `edge`, `accent`, `accent-hover`, `accent-soft`, `accent-ink`, `purple`, `purple-hover`, `purple-soft`, `pink`, `pink-hover`, `pink-soft`, `gold`, `gold-soft`, `success`, `success-soft`, `danger`, `danger-soft`).

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
