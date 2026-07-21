export function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export const MASCOT_EVENTS = {
  logro: {
    mood: 'celebrando',
    variants: [
      '¡Has ganado una nueva insignia! 🌟',
      '¡Wow, insignia nueva en tu colección! 🏆',
      '¡Lo lograste! Esa insignia ya es tuya. ✨',
    ],
  },
  juego_ok: {
    mood: 'animando',
    variants: [
      '¡Bien jugado! Sigue así. 📚',
      '¡Excelente puntaje! Se nota que practicas. 🎉',
      '¡Así se hace! Vamos por el siguiente juego. 🙌',
    ],
  },
  juego_animo: {
    mood: 'animando',
    variants: [
      '¡Inténtalo de nuevo, seguro que mejoras! 💪',
      'Casi lo tienes, ¡una vez más! 🦊',
      'No pasa nada, cada intento cuenta. ¡Tú puedes! ✨',
    ],
  },
  reto_completo: {
    mood: 'celebrando',
    variants: [
      '¡Has completado un reto de lectura! 🎯',
      '¡Reto superado! Eres un lector imparable. 📖',
      '¡Lo lograste! Ese reto ya quedó en el pasado. 🎉',
    ],
    action: { label: 'Ver mis retos', to: '/club-de-lectura/retos' },
  },
  diploma: {
    mood: 'celebrando',
    variants: [
      '¡Has obtenido un diploma! 🏅',
      '¡Felicitaciones, tienes un diploma nuevo! 🎓',
      '¡Qué orgullo! Un diploma más para ti. 🏅',
    ],
    action: { label: 'Ver mi diploma', to: '/perfil/diplomas' },
  },
  curiosidad: {
    mood: 'curiosa',
    variants: [
      'Aquí hay algo interesante para ti. 👀',
      '¿Ya viste esta sección? Te va a gustar. ✨',
      'Ven, te muestro algo por aquí. 🦊',
    ],
  },
};

export const IDLE_CHATTER = [
  '¿Buscamos tu próxima lectura? 📖',
  '¡Hola! ¿Ya viste los libros nuevos de esta semana? 🦊',
  '¿Sabías que puedes ganar insignias jugando? 🏅',
  'Cuéntame, ¿qué te gustaría leer hoy? ✨',
  '¡Aquí estoy! Toca el ícono de juegos si quieres divertirte un rato. 🎮',
  '¿Ya revisaste tu plan de lectura? Puede que tengas algo pendiente. 📚',
];
