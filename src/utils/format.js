const SPECIAL = {
  DANADA: 'Dañada',
  DISPOSICION_CONTROLADA: 'Disposición controlada',
  REACONDICIONAMIENTO: 'Reacondicionamiento',
  CENTRO_RECOLECCION: 'Centro de recolección',
  GESTOR_RECICLAJE: 'Gestor de reciclaje',
  TECNICO: 'Técnico',
  ADMINISTRADOR: 'Administrador',
  DONACION: 'Donación',
};

export function pretty(value) {
  if (value == null || value === '') return '';
  const text = String(value);
  return SPECIAL[text] ?? text[0] + text.slice(1).toLowerCase().replaceAll('_', ' ');
}

export function formatDate(value) {
  if (!value) return '';
  const date = new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(date.valueOf()) ? '' : date.toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatNumber(value) {
  if (value == null || value === '') return '';
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString('es-EC', { maximumFractionDigits: 2 }) : '';
}

export function statusClass(value) {
  if (['REGISTRADO', 'RECIBIDO', 'PROGRAMADO', 'BAJA', 'BUENA'].includes(value)) return 'early';
  if (['EVALUADO', 'EN_TRATAMIENTO', 'EN_PROCESO', 'EN_CURSO', 'EN_TRASLADO', 'MEDIA', 'REPARABLE'].includes(value)) return 'work';
  if (['CERRADO', 'CANCELADO'].includes(value)) return 'end';
  if (['ALTA', 'FALLIDO', 'DANADA', 'IRRECUPERABLE'].includes(value)) return 'bad';
  return 'done';
}
