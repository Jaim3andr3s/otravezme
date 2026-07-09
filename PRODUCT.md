# Product

## Register

product

## Users
Lectores de una biblioteca comunitaria en Colombia — familias, niños, jóvenes y adultos que exploran el catálogo, se anotan a eventos, siguen planes de lectura y ahora también juegan minijuegos con temática literaria. Usan la app tanto desde el navegador como desde una app Android empaquetada (Capacitor), a menudo en sesiones cortas, casuales, desde el celular.

## Product Purpose
BiblioSueños conecta a la comunidad con su biblioteca: catálogo de libros, eventos, planes de lectura guiados y un perfil de lector con favoritos e historial. La capa de juegos e insignias añade una motivación lúdica para explorar el catálogo (trivia, memorama, ahorcado, rompecabezas de portadas) y recompensa tanto la actividad de lectura como el juego con logros coleccionables.

## Brand Personality
Divertida, cálida, dinámica — pensada para enganchar a lectores infantiles sin dejar de sentirse cuidada. Tres palabras: **lúdica, colorida, cálida**. Tipografía serif con carácter (Fraunces) + sans limpia (Inter), paleta multicolor saturada (azul, dorado, morado, rosa, verde) sobre fondos claros y alegres. Los juegos deben sentirse como una extensión natural de esa misma identidad — "arcade de biblioteca para niños" — coherente en color y tipografía en toda la app.

## Anti-references
- Nada de dashboards SaaS fríos con tarjetas de métricas genéricas sin color ni personalidad.
- Nada de "gamification" corporativa fría (barras de progreso genéricas tipo LinkedIn Learning).
- Evitar mezclar demasiados acentos en una misma vista sin jerarquía — el color debe guiar, no saturar cada elemento por igual.

## Design Principles
- Los juegos son una extensión del mismo sistema visual, no una skin distinta: misma tipografía, misma paleta, mismo lenguaje de tarjetas/bordes/sombra.
- El feedback de victoria/derrota debe sentirse vivo y colorido — animaciones claras de acierto/error, sin volverse un flash de neón desordenado.
- Las insignias son objetos de colección con peso visual propio (como una medalla), no íconos planos intercambiables.
- Todo funciona igual de bien empaquetado en Capacitor (WebView Android) que en navegador — evitar dependencias de hover-only para las interacciones clave.

## Accessibility & Inclusion
- Contraste AA mínimo en ambos temas (claro/oscuro), ya validado en el resto de la app.
- Todas las animaciones deben respetar `prefers-reduced-motion`.
- Los juegos deben ser jugables solo con teclado/tap (sin depender exclusivamente de drag-and-drop fino, dado el uso mobile-first).
