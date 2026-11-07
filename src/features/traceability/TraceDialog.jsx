import { useEffect, useRef, useState } from 'react';
import Button from '../../components/Button.jsx';
import { TraceSkeleton } from '../../components/LoadingSkeletons.jsx';
import RailScrollHint from '../../components/RailScrollHint.jsx';
import StatusText from '../../components/StatusText.jsx';
import { api } from '../../services/api.js';
import { formatDate, formatNumber, pretty } from '../../utils/format.js';

const STAGES = [['REGISTRADO'], ['RECIBIDO'], ['EVALUADO'], ['EN_TRATAMIENTO'], ['REACONDICIONADO', 'RECICLADO', 'DISPUESTO', 'DONADO'], ['CERRADO']];
const STAGE_NAMES = ['Registrado', 'Recibido', 'Evaluado', 'En tratamiento', 'Resultado', 'Cerrado'];

export default function TraceDialog({ deviceId, onClose, onChanged }) {
  const dialogRef = useRef(null);
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [retry, setRetry] = useState(0);
  const [selectedState, setSelectedState] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    if (!dialogRef.current?.open) dialogRef.current?.showModal(); setData(null); setError(''); setSelectedState('');
    Promise.all([api(`dispositivo/${deviceId}/historial`, { signal: controller.signal }), api('usuario/options', { signal: controller.signal })])
      .then(([history, options]) => { setData(history); setUsers(options); })
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message); });
    return () => controller.abort();
  }, [deviceId, retry]);

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form));
    body.estado_nuevo = selectedState;
    if (!body.estado_nuevo || !body.id_usuario) { setError('Selecciona un estado y a la persona responsable.'); return; }
    setSaving(true); setError('');
    try {
      await api(`dispositivo/${deviceId}/estado`, { method: 'POST', body });
      onChanged();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  const device = data?.dispositivo;
  const currentStage = device ? STAGES.findIndex((states) => states.includes(device.estado_actual)) : -1;

  return <dialog className="trace-dialog" ref={dialogRef} aria-labelledby="trace-title" onCancel={(event) => { event.preventDefault(); if (!saving) onClose(); }} onClick={(event) => { if (event.target === dialogRef.current && !saving) onClose(); }}>
    <div className="trace-content">
      {error && <p className="form-banner" role="alert">{error} {!data && <button type="button" className="text-link" onClick={() => setRetry((value) => value + 1)}>Reintentar</button>}</p>}
      {!data ? <TraceSkeleton /> : <>
        <div className="dialog-heading"><div><h2 id="trace-title">Trazabilidad</h2><p className="trace-code code">{device.codigo_trazabilidad}</p><p className="dialog-subtitle">{[device.marca, device.modelo].filter(Boolean).join(' ') || 'Sin marca ni modelo'} · {device.categoria} · {formatNumber(device.peso_kg)} kg</p></div><Button variant="ghost" onClick={onClose}>Cerrar</Button></div>
        <section className="trace-lifecycle" aria-label="Etapas del ciclo de vida"><ol>{STAGE_NAMES.map((stage, index) => <li className={index < currentStage ? 'past' : index === currentStage ? 'current' : ''} key={stage}><span className="trace-dot" aria-hidden="true" /><span>{stage}</span></li>)}</ol></section>
        <RailScrollHint />
        <section className="trace-section"><h3>Historial</h3>{data.eventos.length ? <ol className="timeline">{data.eventos.map((event) => <li key={event.id_evento}><StatusText value={event.estado_nuevo} tone="auto" /><small>{formatDate(event.fecha_hora)} · {event.responsable}</small>{event.descripcion && <p>{event.descripcion}</p>}</li>)}</ol> : <p className="empty-inline">Todavía no hay movimientos.</p>}</section>
        <section className="trace-section"><h3>Registrar movimiento</h3>{data.siguientes.length ? <form className="movement-form" onSubmit={submit}>
          <fieldset className="state-choice"><legend>Avanzar a</legend><div className="trace-state-actions">{data.siguientes.map((state) => <Button type="button" size="small" variant={selectedState === state ? 'primary' : 'ghost'} aria-pressed={selectedState === state} key={state} onClick={() => setSelectedState(state)}>{pretty(state)}</Button>)}</div></fieldset>
          <label>Responsable<select name="id_usuario" required defaultValue=""><option value="">Selecciona…</option>{users.map((user) => <option value={user.id} key={user.id}>{user.label}</option>)}</select></label>
          <label className="wide">Nota<input name="descripcion" maxLength="300" /></label>
          <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Guardando…' : 'Registrar movimiento'}</Button>
        </form> : <p className="empty-inline">El dispositivo llegó al final de su ciclo. No admite más movimientos.</p>}</section>
      </>}
    </div>
  </dialog>;
}
