import { useEffect, useMemo, useState } from 'react';
import Button from '../../components/Button.jsx';
import LoadError from '../../components/LoadError.jsx';
import { ListSkeleton } from '../../components/LoadingSkeletons.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusText from '../../components/StatusText.jsx';
import ResourceForm from './ResourceForm.jsx';
import { api } from '../../services/api.js';
import { formatDate, formatNumber, pretty } from '../../utils/format.js';

function cellValue(field, row, referenceOptions) {
  const value = row[field.name];
  if (value == null || value === '') return <span className="muted">Sin dato</span>;
  if (field.type === 'ref') return <span className={['lote', 'dispositivo'].includes(field.ref) ? 'code' : ''}>{referenceOptions[field.ref]?.get(Number(value)) ?? `#${value}`}</span>;
  if (field.type === 'select') return <StatusText value={value} tone={field.name.includes('estado') || field.name === 'peligrosidad' ? 'auto' : 'neutral'} />;
  if (field.type === 'bool') {
    const enabled = value === true || value === 1 || value === '1';
    return <StatusText value={enabled ? 'Sí' : 'No'} tone={enabled ? 'done' : 'bad'} />;
  }
  if (field.type === 'datetime') return formatDate(value);
  if (field.type === 'number') return formatNumber(value);
  return field.name.startsWith('codigo') ? <span className="code">{value}</span> : value;
}

function nextCode(name, rows) {
  if (name === 'dispositivo') {
    const max = rows.reduce((value, row) => Math.max(value, Number(row.codigo_trazabilidad?.match(/^ECO-(\d+)$/)?.[1] ?? 0)), 0);
    return `ECO-${String(max + 1).padStart(6, '0')}`;
  }
  if (name === 'lote') {
    const year = new Date().getFullYear();
    const prefix = `L-${year}-`;
    const max = rows.reduce((value, row) => Math.max(value, Number(row.codigo?.startsWith(prefix) ? row.codigo.slice(prefix.length) : 0)), 0);
    return `${prefix}${String(max + 1).padStart(4, '0')}`;
  }
  return undefined;
}

export default function ResourcePage({ name, resource, onTrace }) {
  const [rows, setRows] = useState(null);
  const [referenceOptions, setReferenceOptions] = useState({});
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(undefined);
  const [notice, setNotice] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setRows(null); setError('');
    Promise.all([
      api(name, { signal: controller.signal }),
      ...[...new Set(resource.fields.filter((field) => field.type === 'ref').map((field) => field.ref))]
        .map((ref) => api(`${ref}/options`, { signal: controller.signal }).then((items) => [ref, new Map(items.map((item) => [Number(item.id), item.label]))])),
    ]).then(([records, ...optionPairs]) => {
      setRows(records);
      setReferenceOptions(Object.fromEntries(optionPairs));
    }).catch((err) => { if (err.name !== 'AbortError') setError(err.message); });
    return () => controller.abort();
  }, [name, resource, retry]);

  const fields = useMemo(() => resource.cols.map((column) => resource.fields.find((field) => field.name === column)).filter(Boolean), [resource]);
  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), notice.error ? 5000 : 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const shown = useMemo(() => {
    if (!rows) return [];
    const needle = query.trim().toLocaleLowerCase('es');
    return rows.filter((row) => !needle || fields.map((field) => {
      const value = row[field.name];
      return field.type === 'ref' ? referenceOptions[field.ref]?.get(Number(value)) ?? value : pretty(String(value ?? ''));
    }).join(' ').toLocaleLowerCase('es').includes(needle));
  }, [rows, query, fields, referenceOptions]);

  const reload = () => { setEditing(undefined); setNotice(null); setRetry((value) => value + 1); };
  async function remove(row) {
    const labelField = resource.cols[0];
    const label = row[labelField] ?? `#${row[resource.pk]}`;
    if (!window.confirm(`Se eliminará ${resource.singular} «${label}». Esta acción no se puede deshacer.`)) return;
    setBusyId(row[resource.pk]); setNotice(null);
    try { await api(`${name}/${row[resource.pk]}`, { method: 'DELETE' }); setNotice({ message: 'Registro eliminado.', error: false }); setRetry((value) => value + 1); }
    catch (err) { setNotice({ message: err.message, error: true }); }
    finally { setBusyId(null); }
  }

  async function advanceTransfer(row) {
    const arriving = row.estado === 'EN_CURSO';
    const now = new Date();
    const fechaLlegada = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 19).replace('T', ' ');
    setBusyId(row[resource.pk]); setNotice(null);
    try {
      await api(`${name}/${row[resource.pk]}`, { method: 'PUT', body: { ...row, estado: arriving ? 'ENTREGADO' : 'EN_CURSO', ...(arriving ? { fecha_llegada: fechaLlegada } : {}) } });
      setNotice({ message: arriving ? 'Llegada registrada.' : 'Traslado iniciado.', error: false });
      setRetry((value) => value + 1);
    } catch (err) { setNotice({ message: err.message, error: true }); }
    finally { setBusyId(null); }
  }

  if (error) return <div className="page-enter"><PageHeader title={resource.title} description="Registros del sistema EcoRAEE." /><LoadError message={error} onRetry={() => setRetry((value) => value + 1)} /></div>;
  if (!rows) return <ListSkeleton />;

  return <div className="resource-page page-enter">
    <PageHeader title={resource.title} description={`${shown.length} de ${rows.length} registro${rows.length === 1 ? '' : 's'}`} actions={<Button variant="primary" onClick={() => setEditing(null)}>Crear {resource.singular}</Button>} />
    {notice && <p className={`notice${notice.error ? ' error' : ''}`} role={notice.error ? 'alert' : 'status'}>{notice.message}</p>}
    <div className="resource-toolbar"><label className="search-field"><span className="sr-only">Buscar en {resource.title}</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Buscar en ${resource.title.toLocaleLowerCase('es')}`} /></label></div>
    <div className="table-wrap"><table><thead><tr>{fields.map((field) => <th className={field.type === 'number' ? 'num' : ''} key={field.name}>{field.label}</th>)}<th className="act">Acciones</th></tr></thead>
      <tbody>{shown.map((row) => <tr key={row[resource.pk]}>{fields.map((field) => <td className={`${field.type === 'number' ? 'num' : ''} ${field.type === 'textarea' || field.type === 'ref' ? 'wrap' : ''}`} key={field.name}>{cellValue(field, row, referenceOptions)}</td>)}
        <td className="act"><div className="row-actions">{resource.trace && <Button size="small" variant="ghost" onClick={() => onTrace(row[resource.pk])}>Trazabilidad</Button>}{name === 'traslado' && ['PROGRAMADO', 'EN_CURSO'].includes(row.estado) && <Button size="small" variant="primary" disabled={busyId === row[resource.pk]} onClick={() => advanceTransfer(row)}>{busyId === row[resource.pk] ? 'Guardando…' : row.estado === 'PROGRAMADO' ? 'Iniciar traslado' : 'Registrar llegada'}</Button>}<Button size="small" variant="ghost" onClick={() => setEditing(row)}>Editar</Button><Button size="small" variant="ghost" disabled={busyId === row[resource.pk]} onClick={() => remove(row)}>Eliminar</Button></div></td>
      </tr>)}{shown.length === 0 && <tr><td colSpan={fields.length + 1}><div className="empty-state"><strong>{rows.length ? 'Sin coincidencias' : `Aún no hay ${resource.title.toLocaleLowerCase('es')}`}</strong><span>{rows.length ? 'Prueba con otra búsqueda.' : `Usa «Crear ${resource.singular}» para empezar.`}</span></div></td></tr>}</tbody>
    </table></div>
    {editing !== undefined && <ResourceForm name={name} resource={resource} row={editing} generatedCode={editing === null ? nextCode(name, rows) : undefined} referenceOptions={referenceOptions} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); setNotice({ message: editing ? 'Cambios guardados.' : 'Registro guardado.', error: false }); setRetry((value) => value + 1); }} />}
  </div>;
}
