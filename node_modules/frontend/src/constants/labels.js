export const BOOK_STATUS_LABEL = {
  DISPONIBLE: 'Disponible',
  PRESTADO: 'Prestado',
};

export const EVENT_TYPE_LABEL = {
  CLUB_LECTURA: 'Club de Lectura',
  TALLER: 'Taller',
  CUENTACUENTOS: 'Cuentacuentos',
  CONFERENCIA: 'Conferencia/Charla',
  GENERAL: 'General',
};

export const EVENT_TYPE_OPTIONS = Object.entries(EVENT_TYPE_LABEL).map(([value, label]) => ({ value, label }));
