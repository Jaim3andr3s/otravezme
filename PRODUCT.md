# Product

## Register

product

## Users
Lectores de una biblioteca comunitaria en Colombia — familias, niños, jóvenes y adultos que exploran el catálogo, se anotan a eventos, siguen planes de lectura y ahora también juegan minijuegos con temática literaria. Usan la app tanto desde el navegador como desde una app Android empaquetada (Capacitor), a menudo en sesiones cortas, casuales, desde el celular.

## Product Purpose
BiblioSueños conecta a la comunidad con su biblioteca: catálogo de libros, eventos, planes de lectura guiados y un perfil de lector con favoritos e historial. La capa de juegos e insignias añade una motivación lúdica para explorar el catálogo (trivia, memorama, ahorcado, rompecabezas de portadas) y recompensa tanto la actividad de lectura como el juego con logros coleccionables.

## Brand Personality
Cálida, literaria, acogedora — no corporativa ni infantil. Tres palabras: **editorial, cálida, artesanal**. Tipografía serif con carácter (Fraunces) + sans limpia (Inter), paleta terracota/dorado/verde salvia/rojo ladrillo sobre fondo papel. Los juegos deben sentirse como una extensión cuidada de esa misma identidad — "arcade de biblioteca", no un plugin de juegos genérico pegado encima.

## Anti-references
- Nada de plantillas de "juego casual" genéricas con colores primarios saturados, confeti brillante estilo app de trivia móvil masiva, o iconografía infantil tipo guardería.
- Nada de dashboards SaaS con tarjetas de métricas y gradientes — eso ya se evitó en el resto de la app y no debe colarse en la sección de juegos/insignias.
- Nada de "gamification" corporativa fría (barras de progreso genéricas tipo LinkedIn Learning).

## Design Principles
- Los juegos son una extensión del mismo sistema editorial, no una skin distinta: misma tipografía, misma paleta, mismo lenguaje de tarjetas/bordes/sombra.
- El feedback de victoria/derrota debe sentirse artesanal y cálido (papel, tinta, textura), no un flash de neón.
- Las insignias son objetos de colección con peso visual propio (como un sello o medalla impresa), no íconos planos intercambiables.
- Todo funciona igual de bien empaquetado en Capacitor (WebView Android) que en navegador — evitar dependencias de hover-only para las interacciones clave.

## Accessibility & Inclusion
- Contraste AA mínimo en ambos temas (claro/oscuro), ya validado en el resto de la app.
- Todas las animaciones deben respetar `prefers-reduced-motion`.
- Los juegos deben ser jugables solo con teclado/tap (sin depender exclusivamente de drag-and-drop fino, dado el uso mobile-first).
