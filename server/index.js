import express from 'express';
import { db, driver } from './db.js';
import { resources, meta, clean, SIGUIENTES } from './resources.js';

const app = express();
app.use(express.json({ limit: '100kb' }));
app.use(express.static('dist'));

const wrap = (fn) => (req, res) => fn(req, res).catch((e) => fail(res, e));

class HttpError extends Error {
  constructor(status, message, fields) { super(message); this.status = status; this.fields = fields; }
}

function fail(res, e) {
  if (e instanceof HttpError) return res.status(e.status).json({ error: e.message, fields: e.fields });
  const m = String(e.message);
  console.error(e);
  if (/UNIQUE|duplicate key|2627|2601/i.test(m)) return res.status(409).json({ error: 'Ya existe un registro con ese valor único (código, RUC, cédula, serie o correo).' });
  if (/FOREIGN KEY|REFERENCE/i.test(m)) return res.status(409).json({ error: 'No se puede completar: el registro está relacionado con otros registros o apunta a uno que no existe.' });
  if (/CHECK constraint/i.test(m)) return res.status(400).json({ error: 'Un valor no cumple las restricciones de la base de datos.' });
  res.status(500).json({ error: 'Error interno del servidor.' });
}

const find = (name) => {
  const r = resources[name];
  if (!r) throw new HttpError(404, 'Recurso no encontrado.');
  return r;
};
const idOf = (req) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(400, 'Identificador no válido.');
  return id;
};

// ---- Metadatos y panel ----
app.get('/api/meta', (_req, res) => res.json({ resources: meta, estados: SIGUIENTES, driver }));

app.get('/api/dashboard', wrap(async (_req, res) => {
  const one = async (q) => (await db.all(q))[0];
  const [tot, porEstado, porCategoria, eventos, rutas] = await Promise.all([
    one(`SELECT (SELECT COUNT(*) FROM dispositivo) AS dispositivos,
                (SELECT COALESCE(SUM(peso_kg), 0) FROM dispositivo) AS kg,
                (SELECT COUNT(*) FROM lote WHERE estado <> 'CERRADO') AS lotes_abiertos,
                (SELECT COUNT(*) FROM traslado WHERE estado IN ('PROGRAMADO', 'EN_CURSO')) AS traslados_pendientes`),
    db.all('SELECT estado_actual AS estado, COUNT(*) AS n FROM dispositivo GROUP BY estado_actual'),
    db.all(`SELECT c.nombre, COUNT(*) AS n, SUM(d.peso_kg) AS kg FROM dispositivo d
            JOIN categoria_raee c ON c.id_categoria = d.id_categoria GROUP BY c.nombre ORDER BY kg DESC`),
    db.all(`SELECT e.id_dispositivo, d.codigo_trazabilidad AS codigo, e.estado_nuevo, e.fecha_hora, e.descripcion,
                   CONCAT(u.nombres, ' ', u.apellidos) AS responsable
            FROM evento_trazabilidad e JOIN dispositivo d ON d.id_dispositivo = e.id_dispositivo
            JOIN usuario u ON u.id_usuario = e.id_usuario ORDER BY e.fecha_hora DESC ${db.limit(6)}`),
    db.all(`SELECT r.id_ruta, so.nombre AS origen, sd.nombre AS destino, r.capacidad_kg_mes AS capacidad,
                   COALESCE((SELECT SUM(t.peso_kg) FROM traslado t WHERE t.id_ruta = r.id_ruta AND t.estado <> 'CANCELADO'), 0) AS asignado
            FROM ruta r JOIN sede so ON so.id_sede = r.id_sede_origen JOIN sede sd ON sd.id_sede = r.id_sede_destino
            WHERE r.activa = 1 ORDER BY asignado DESC ${db.limit(5)}`),
  ]);
  res.json({ tot, porEstado, porCategoria, eventos, rutas });
}));

// ---- Trazabilidad de un dispositivo ----
app.get('/api/dispositivo/:id/historial', wrap(async (req, res) => {
  const id = idOf(req);
  const [dispositivo] = await db.all(`SELECT d.*, c.nombre AS categoria FROM dispositivo d
    JOIN categoria_raee c ON c.id_categoria = d.id_categoria WHERE d.id_dispositivo = ?`, [id]);
  if (!dispositivo) throw new HttpError(404, 'Dispositivo no encontrado.');
  const eventos = await db.all(`SELECT e.*, CONCAT(u.nombres, ' ', u.apellidos) AS responsable FROM evento_trazabilidad e
    JOIN usuario u ON u.id_usuario = e.id_usuario WHERE e.id_dispositivo = ? ORDER BY e.fecha_hora, e.id_evento`, [id]);
  res.json({ dispositivo, eventos, siguientes: SIGUIENTES[dispositivo.estado_actual] });
}));

app.post('/api/dispositivo/:id/estado', wrap(async (req, res) => {
  const id = idOf(req);
  const { estado_nuevo, id_usuario, descripcion } = req.body ?? {};
  const fields = {};
  if (!estado_nuevo) fields.estado_nuevo = 'Selecciona el nuevo estado.';
  if (!Number.isInteger(Number(id_usuario)) || !id_usuario) fields.id_usuario = 'Selecciona al responsable.';
  if (descripcion && String(descripcion).length > 300) fields.descripcion = 'Máximo 300 caracteres.';
  if (Object.keys(fields).length) throw new HttpError(400, 'Revisa los campos marcados.', fields);

  await db.tx(async (t) => {
    const [d] = await t.all('SELECT estado_actual FROM dispositivo WHERE id_dispositivo = ?', [id]);
    if (!d) throw new HttpError(404, 'Dispositivo no encontrado.');
    if (!SIGUIENTES[d.estado_actual].includes(estado_nuevo))
      throw new HttpError(409, `No se puede pasar de ${d.estado_actual} a ${estado_nuevo}.`, { estado_nuevo: 'Transición no permitida.' });
    if (estado_nuevo === 'EVALUADO') {
      const [{ n }] = await t.all('SELECT COUNT(*) AS n FROM evaluacion WHERE id_dispositivo = ?', [id]);
      if (!n) throw new HttpError(409, 'Registra una evaluación técnica antes de marcar el dispositivo como evaluado.');
    }
    await t.run('UPDATE dispositivo SET estado_actual = ? WHERE id_dispositivo = ?', [estado_nuevo, id]);
    await t.run(
      'INSERT INTO evento_trazabilidad (id_dispositivo, id_usuario, fecha_hora, estado_anterior, estado_nuevo, descripcion) VALUES (?, ?, ?, ?, ?, ?)',
      [id, Number(id_usuario), new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 19), d.estado_actual, estado_nuevo, descripcion?.trim() || null]);
  });
  res.json({ ok: true });
}));

// ---- CRUD genérico ----
app.get('/api/:res/options', wrap(async (req, res) => {
  const r = find(req.params.res);
  res.json(await db.all(`SELECT ${r.pk} AS id, ${r.label} AS label FROM ${req.params.res} ORDER BY 2`));
}));

app.get('/api/:res', wrap(async (req, res) => {
  const r = find(req.params.res);
  res.json(await db.all(`SELECT * FROM ${req.params.res} ORDER BY ${r.order}`));
}));

app.get('/api/:res/:id', wrap(async (req, res) => {
  const r = find(req.params.res);
  const [row] = await db.all(`SELECT * FROM ${req.params.res} WHERE ${r.pk} = ?`, [idOf(req)]);
  if (!row) throw new HttpError(404, 'Registro no encontrado.');
  res.json(row);
}));

async function save(req, res, creating) {
  const name = req.params.res, r = find(name);
  const id = creating ? null : idOf(req);
  const { data, errors } = clean(r, req.body ?? {}, creating);
  if (Object.keys(errors).length) throw new HttpError(400, errors._ || 'Revisa los campos marcados.', errors);
  const bad = await r.check?.(data, db);
  if (bad) throw new HttpError(400, bad);
  const keys = Object.keys(data), vals = keys.map((k) => data[k]);
  if (creating) {
    const out = await db.run(`INSERT INTO ${name} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`, vals);
    return res.status(201).json({ id: out.id });
  }
  const out = await db.run(`UPDATE ${name} SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE ${r.pk} = ?`, [...vals, id]);
  if (!out.changes) throw new HttpError(404, 'Registro no encontrado.');
  res.json({ id });
}

app.post('/api/:res', wrap((req, res) => save(req, res, true)));
app.put('/api/:res/:id', wrap((req, res) => save(req, res, false)));

app.delete('/api/:res/:id', wrap(async (req, res) => {
  const r = find(req.params.res);
  const out = await db.run(`DELETE FROM ${req.params.res} WHERE ${r.pk} = ?`, [idOf(req)]);
  if (!out.changes) throw new HttpError(404, 'Registro no encontrado.');
  res.status(204).end();
}));

app.use('/api', (_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

app.get('*', (_req, res) => res.sendFile('dist/index.html', { root: process.cwd() }));

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`EcoRAEE Cloud local en http://localhost:${port}  (base de datos: ${driver})`));
