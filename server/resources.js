// Definicion unica de cada entidad. El backend la usa para validar y generar el CRUD,
// y el frontend la recibe en /api/meta para dibujar tablas y formularios.
// Campo: { name, label, type, required, max, min, pattern, hint, options, ref, hasDefault, readonly }

const t = (name, label, extra = {}) => ({ name, label, type: 'text', ...extra });
const n = (name, label, extra = {}) => ({ name, label, type: 'number', ...extra });
const s = (name, label, options, extra = {}) => ({ name, label, type: 'select', options, ...extra });
const r = (name, label, ref, extra = {}) => ({ name, label, type: 'ref', ref, ...extra });
const b = (name, label, extra = {}) => ({ name, label, type: 'bool', ...extra });
const d = (name, label, extra = {}) => ({ name, label, type: 'datetime', ...extra });

export const SIGUIENTES = {
  REGISTRADO: ['RECIBIDO'],
  RECIBIDO: ['EVALUADO'],
  EVALUADO: ['EN_TRATAMIENTO'],
  EN_TRATAMIENTO: ['REACONDICIONADO', 'RECICLADO', 'DISPUESTO'],
  REACONDICIONADO: ['DONADO', 'CERRADO'],
  RECICLADO: ['CERRADO'],
  DISPUESTO: ['CERRADO'],
  DONADO: ['CERRADO'],
  CERRADO: [],
};

const ESTADOS = Object.keys(SIGUIENTES);
const EMAIL = '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$';

export const resources = {
  lote: {
    pk: 'id_lote', title: 'Lotes', singular: 'lote', group: 'Operación',
    label: 'codigo', cols: ['codigo', 'id_organizacion_generador', 'id_sede_actual', 'peso_total_kg', 'estado', 'fecha_registro'],
    order: 'fecha_registro DESC',
    fields: [
      t('codigo', 'Código', { required: true, max: 20, hint: 'Ejemplo: L-2026-0003' }),
      r('id_organizacion_generador', 'Generador', 'organizacion', { required: true }),
      r('id_sede_actual', 'Sede actual', 'sede', { required: true }),
      n('peso_total_kg', 'Peso total (kg)', { required: true, min: 0.01 }),
      s('estado', 'Estado', ['REGISTRADO', 'RECIBIDO', 'EN_TRASLADO', 'EN_PROCESO', 'CERRADO'], { required: true, hasDefault: true }),
      d('fecha_registro', 'Fecha de registro', { required: true, hasDefault: true }),
    ],
  },
  dispositivo: {
    pk: 'id_dispositivo', title: 'Dispositivos', singular: 'dispositivo', group: 'Operación', trace: true,
    label: 'codigo_trazabilidad', cols: ['codigo_trazabilidad', 'marca', 'modelo', 'id_categoria', 'id_lote', 'peso_kg', 'estado_actual'],
    order: 'id_dispositivo DESC',
    fields: [
      t('codigo_trazabilidad', 'Código de trazabilidad', { required: true, max: 30, hint: 'Ejemplo: ECO-000006' }),
      r('id_lote', 'Lote', 'lote', { required: true }),
      r('id_categoria', 'Categoría', 'categoria_raee', { required: true }),
      t('marca', 'Marca', { max: 60 }),
      t('modelo', 'Modelo', { max: 60 }),
      t('numero_serie', 'Número de serie', { max: 60 }),
      n('peso_kg', 'Peso (kg)', { required: true, min: 0.01 }),
      s('estado_actual', 'Estado', ESTADOS, { readonly: true, hasDefault: true }),
    ],
  },
  traslado: {
    pk: 'id_traslado', title: 'Traslados', singular: 'traslado', group: 'Operación',
    label: 'id_traslado', cols: ['id_lote', 'id_ruta', 'peso_kg', 'fecha_salida', 'fecha_llegada', 'estado'],
    order: 'fecha_salida DESC',
    fields: [
      r('id_lote', 'Lote', 'lote', { required: true }),
      r('id_ruta', 'Ruta', 'ruta', { required: true }),
      n('peso_kg', 'Peso (kg)', { required: true, min: 0.01 }),
      d('fecha_salida', 'Salida', { required: true }),
      d('fecha_llegada', 'Llegada'),
      s('estado', 'Estado', ['PROGRAMADO', 'EN_CURSO', 'ENTREGADO', 'CANCELADO'], { required: true, hasDefault: true }),
    ],
    rules: (x) => x.fecha_llegada && x.fecha_llegada < x.fecha_salida && 'La llegada no puede ser anterior a la salida.',
    async check(x, db) {
      const [ruta] = await db.all('SELECT capacidad_kg_mes, activa FROM ruta WHERE id_ruta = ?', [x.id_ruta]);
      if (!ruta) return 'La ruta no existe.';
      if (!ruta.activa) return 'La ruta está inactiva.';
      if (x.peso_kg > ruta.capacidad_kg_mes) return `El peso supera la capacidad de la ruta (${ruta.capacidad_kg_mes} kg/mes).`;
    },
  },
  evaluacion: {
    pk: 'id_evaluacion', title: 'Evaluaciones', singular: 'evaluación', group: 'Operación',
    label: 'id_evaluacion', cols: ['id_dispositivo', 'id_tecnico', 'condicion', 'es_funcional', 'datos_borrados', 'fecha'],
    order: 'fecha DESC',
    fields: [
      r('id_dispositivo', 'Dispositivo', 'dispositivo', { required: true }),
      r('id_tecnico', 'Técnico', 'usuario', { required: true }),
      s('condicion', 'Condición', ['BUENA', 'REPARABLE', 'DANADA', 'IRRECUPERABLE'], { required: true }),
      r('id_tipo_recomendado', 'Tratamiento recomendado', 'tipo_tratamiento'),
      b('es_funcional', 'Funciona'),
      b('datos_borrados', 'Datos borrados'),
      d('fecha', 'Fecha', { required: true, hasDefault: true }),
      { name: 'observacion', label: 'Observación', type: 'textarea', max: 500 },
    ],
  },
  tratamiento: {
    pk: 'id_tratamiento', title: 'Tratamientos', singular: 'tratamiento', group: 'Operación',
    label: 'id_tratamiento', cols: ['id_dispositivo', 'id_tipo_tratamiento', 'id_organizacion_ejecutora', 'resultado', 'kg_recuperados', 'fecha_inicio'],
    order: 'fecha_inicio DESC',
    fields: [
      r('id_dispositivo', 'Dispositivo', 'dispositivo', { required: true }),
      r('id_tipo_tratamiento', 'Tipo de tratamiento', 'tipo_tratamiento', { required: true }),
      r('id_organizacion_ejecutora', 'Organización ejecutora', 'organizacion', { required: true }),
      d('fecha_inicio', 'Inicio', { required: true }),
      d('fecha_fin', 'Fin'),
      s('resultado', 'Resultado', ['EN_PROCESO', 'EXITOSO', 'FALLIDO'], { required: true, hasDefault: true }),
      n('kg_recuperados', 'Kg recuperados', { min: 0 }),
    ],
    rules: (x) => x.fecha_fin && x.fecha_fin < x.fecha_inicio && 'El fin no puede ser anterior al inicio.',
  },
  organizacion: {
    pk: 'id_organizacion', title: 'Organizaciones', singular: 'organización', group: 'Red',
    label: 'razon_social', cols: ['razon_social', 'ruc', 'tipo', 'telefono', 'email'], order: 'razon_social',
    fields: [
      t('razon_social', 'Razón social', { required: true, max: 150 }),
      t('ruc', 'RUC', { required: true, pattern: '^\\d{13}$', hint: '13 dígitos', patternMsg: 'El RUC debe tener 13 dígitos.' }),
      s('tipo', 'Tipo', ['GENERADOR', 'CENTRO_RECOLECCION', 'REACONDICIONADOR', 'GESTOR_RECICLAJE', 'BENEFICIARIA'], { required: true }),
      t('telefono', 'Teléfono', { pattern: '^\\d{7,15}$', patternMsg: 'Usa solo números, entre 7 y 15 dígitos.' }),
      t('email', 'Correo', { max: 120, pattern: EMAIL, patternMsg: 'Escribe un correo válido.' }),
    ],
  },
  sede: {
    pk: 'id_sede', title: 'Sedes', singular: 'sede', group: 'Red',
    label: 'nombre', cols: ['nombre', 'id_organizacion', 'ciudad', 'tipo_nodo', 'capacidad_kg_mes'], order: 'nombre',
    fields: [
      t('nombre', 'Nombre', { required: true, max: 100 }),
      r('id_organizacion', 'Organización', 'organizacion', { required: true }),
      t('direccion', 'Dirección', { required: true, max: 200 }),
      t('ciudad', 'Ciudad', { required: true, max: 60 }),
      s('tipo_nodo', 'Tipo de nodo', ['FUENTE', 'ACOPIO', 'TRANSFERENCIA', 'DESTINO'], { required: true }),
      n('capacidad_kg_mes', 'Capacidad (kg/mes)', { required: true, min: 0 }),
    ],
  },
  ruta: {
    pk: 'id_ruta', title: 'Rutas', singular: 'ruta', group: 'Red',
    label: "CONCAT((SELECT nombre FROM sede WHERE id_sede = ruta.id_sede_origen), ' a ', (SELECT nombre FROM sede WHERE id_sede = ruta.id_sede_destino))",
    cols: ['id_sede_origen', 'id_sede_destino', 'capacidad_kg_mes', 'distancia_km', 'costo_unitario', 'activa'], order: 'id_ruta',
    fields: [
      r('id_sede_origen', 'Origen', 'sede', { required: true }),
      r('id_sede_destino', 'Destino', 'sede', { required: true }),
      n('capacidad_kg_mes', 'Capacidad (kg/mes)', { required: true, min: 0.01 }),
      n('distancia_km', 'Distancia (km)', { required: true, min: 0 }),
      n('costo_unitario', 'Costo por kg (USD)', { required: true, min: 0 }),
      b('activa', 'Ruta activa', { hasDefault: true }),
    ],
    rules: (x) => x.id_sede_origen === x.id_sede_destino && 'El origen y el destino deben ser distintos.',
  },
  usuario: {
    pk: 'id_usuario', title: 'Usuarios', singular: 'usuario', group: 'Administración',
    label: "CONCAT(nombres, ' ', apellidos)", cols: ['nombres', 'apellidos', 'id_organizacion', 'rol', 'email'], order: 'apellidos',
    fields: [
      t('nombres', 'Nombres', { required: true, max: 80 }),
      t('apellidos', 'Apellidos', { required: true, max: 80 }),
      t('cedula', 'Cédula', { required: true, pattern: '^\\d{10}$', hint: '10 dígitos', patternMsg: 'La cédula debe tener 10 dígitos.' }),
      t('email', 'Correo', { required: true, max: 120, pattern: EMAIL, patternMsg: 'Escribe un correo válido.' }),
      r('id_organizacion', 'Organización', 'organizacion', { required: true }),
      s('rol', 'Rol', ['ADMINISTRADOR', 'OPERADOR', 'TECNICO', 'AUDITOR'], { required: true }),
    ],
  },
  categoria_raee: {
    pk: 'id_categoria', title: 'Categorías RAEE', singular: 'categoría', group: 'Administración',
    label: 'nombre', cols: ['nombre', 'peligrosidad', 'descripcion'], order: 'nombre',
    fields: [
      t('nombre', 'Nombre', { required: true, max: 80 }),
      s('peligrosidad', 'Peligrosidad', ['BAJA', 'MEDIA', 'ALTA'], { required: true }),
      t('descripcion', 'Descripción', { max: 250 }),
    ],
  },
  tipo_tratamiento: {
    pk: 'id_tipo_tratamiento', title: 'Tipos de tratamiento', singular: 'tipo de tratamiento', group: 'Administración',
    label: 'nombre', cols: ['nombre', 'descripcion'], order: 'nombre',
    fields: [
      t('nombre', 'Nombre', { required: true, max: 40 }),
      t('descripcion', 'Descripción', { max: 250 }),
    ],
  },
};

const DT = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?/;

// Valida y normaliza un cuerpo JSON. Devuelve { data, errors }.
export function clean(res, body, creating) {
  const data = {}, errors = {};
  for (const f of res.fields) {
    if (f.readonly) continue;
    let v = body[f.name];
    if (v === '' || v === undefined) v = null;
    if (v === null) {
      if (f.type === 'bool') v = 0;
      else if (f.required && !(creating && f.hasDefault)) { errors[f.name] = 'Este campo es obligatorio.'; continue; }
      else { if (!(creating && f.hasDefault)) data[f.name] = null; continue; }
    }
    if (f.type === 'number' || f.type === 'ref') {
      v = Number(v);
      if (!Number.isFinite(v)) { errors[f.name] = 'Escribe un número válido.'; continue; }
      if (f.type === 'ref' && !Number.isInteger(v)) { errors[f.name] = 'Selecciona una opción.'; continue; }
      if (f.min !== undefined && v < f.min) { errors[f.name] = `Debe ser ${f.min} o más.`; continue; }
    } else if (f.type === 'bool') {
      v = v === true || v === 1 || v === '1' || v === 'true' ? 1 : 0;
    } else if (f.type === 'datetime') {
      v = String(v);
      if (!DT.test(v)) { errors[f.name] = 'Fecha y hora no válidas.'; continue; }
      v = v.replace(' ', 'T').slice(0, 19);
      if (v.length === 16) v += ':00';
    } else {
      v = String(v).trim();
      if (f.max && v.length > f.max) { errors[f.name] = `Máximo ${f.max} caracteres.`; continue; }
      if (f.type === 'select' && !f.options.includes(v)) { errors[f.name] = 'Selecciona una opción válida.'; continue; }
      if (f.pattern && v && !new RegExp(f.pattern).test(v)) { errors[f.name] = f.patternMsg || 'Formato no válido.'; continue; }
    }
    data[f.name] = v;
  }
  if (!Object.keys(errors).length) {
    const msg = res.rules?.(data);
    if (msg) errors._ = msg;
  }
  return { data, errors };
}

// Versión pública (sin funciones) para el frontend.
export const meta = Object.fromEntries(Object.entries(resources).map(([k, { rules, check, label, ...v }]) => [k, v]));
