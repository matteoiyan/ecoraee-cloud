import { useEffect, useMemo, useRef, useState } from 'react';
import Button from '../../components/Button.jsx';
import { api } from '../../services/api.js';
import { pretty } from '../../utils/format.js';

function localDateTime(value) {
  if (!value) return '';
  const date = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(date.valueOf())) return String(value).slice(0, 16);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function initialValue(field, row, creating) {
  if (row) return field.type === 'datetime' ? localDateTime(row[field.name]) : row[field.name] ?? '';
  if (field.hasDefault && field.type === 'datetime') return localDateTime(new Date().toISOString());
  if (field.hasDefault && field.type === 'select') return field.options[0];
  return field.type === 'bool' ? Boolean(creating && field.hasDefault) : '';
}

function validate(field, value, creating) {
  if (field.type === 'bool') return '';
  const empty = value === '' || value == null;
  if (empty) return field.required && !(creating && field.hasDefault) ? 'Este campo es obligatorio.' : '';
  if (field.type === 'number' && !Number.isFinite(Number(value))) return 'Escribe un número válido.';
  if (field.type === 'number' && field.min !== undefined && Number(value) < field.min) return `Debe ser ${field.min} o más.`;
  if (field.max && typeof value === 'string' && value.length > field.max) return `Máximo ${field.max} caracteres.`;
  if (field.pattern && !new RegExp(field.pattern).test(value)) return field.patternMsg || 'Formato no válido.';
  return '';
}

export default function ResourceForm({ name, resource, row, generatedCode, referenceOptions, onClose, onSaved }) {
  const creating = row === null;
  const fields = useMemo(() => resource.fields.filter((field) => !field.readonly), [resource]);
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((field) => [field.name, creating && field.name === (name === 'dispositivo' ? 'codigo_trazabilidad' : 'codigo') && generatedCode ? generatedCode : initialValue(field, row, creating)])));
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => { dialogRef.current?.showModal(); fields[0] && dialogRef.current?.querySelector(`[name="${fields[0].name}"]`)?.focus(); }, [fields]);

  function update(field, value) {
    setValues((current) => ({ ...current, [field.name]: value }));
    if (errors[field.name]) setErrors((current) => ({ ...current, [field.name]: validate(field, value, creating) }));
  }

  async function submit(event) {
    event.preventDefault();
    const nextErrors = Object.fromEntries(fields.map((field) => [field.name, validate(field, values[field.name], creating)]).filter(([, message]) => message));
    setErrors(nextErrors); setBanner('');
    if (Object.keys(nextErrors).length) {
      dialogRef.current?.querySelector(`[name="${Object.keys(nextErrors)[0]}"]`)?.focus();
      return;
    }
    const body = Object.fromEntries(fields.map((field) => [field.name, field.type === 'bool' ? values[field.name] : values[field.name]]));
    setSaving(true);
    try {
      await api(creating ? name : `${name}/${row[resource.pk]}`, { method: creating ? 'POST' : 'PUT', body });
      onSaved();
    } catch (error) {
      const fieldErrors = Object.fromEntries(Object.entries(error.fields ?? {}).filter(([key]) => key !== '_'));
      setErrors(fieldErrors); setBanner(error.message);
      const first = Object.keys(fieldErrors)[0];
      if (first) dialogRef.current?.querySelector(`[name="${first}"]`)?.focus();
    } finally { setSaving(false); }
  }

  function renderControl(field) {
    const generated = creating && field.name === (name === 'dispositivo' ? 'codigo_trazabilidad' : 'codigo') && generatedCode;
    const common = { id: `field-${field.name}`, name: field.name, value: values[field.name] ?? '', required: field.required && !(creating && field.hasDefault), disabled: saving || Boolean(generated), 'aria-invalid': Boolean(errors[field.name]), 'aria-describedby': errors[field.name] ? `error-${field.name}` : field.hint ? `hint-${field.name}` : undefined, onChange: (event) => update(field, event.target.value) };
    if (field.type === 'bool') return <label className="check-field"><input type="checkbox" name={field.name} checked={Boolean(values[field.name])} disabled={saving} onChange={(event) => update(field, event.target.checked)} /><span>{field.label}</span></label>;
    if (field.type === 'select' || field.type === 'ref') {
      const options = field.type === 'select' ? field.options.map((value) => [value, pretty(value)]) : [...(referenceOptions[field.ref] ?? new Map()).entries()];
      return <select {...common}><option value="">Selecciona…</option>{options.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select>;
    }
    if (field.type === 'textarea') return <textarea {...common} maxLength={field.max} rows={3} />;
    const type = field.type === 'number' ? 'number' : field.type === 'datetime' ? 'datetime-local' : 'text';
    return <input {...common} type={type} step={type === 'number' ? 'any' : undefined} min={field.min} maxLength={field.max} inputMode={type === 'number' ? 'decimal' : undefined} />;
  }

  return <dialog className="form-dialog" ref={dialogRef} aria-labelledby="resource-form-title" onCancel={(event) => { event.preventDefault(); if (!saving) onClose(); }} onClick={(event) => { if (event.target === dialogRef.current && !saving) onClose(); }}>
    <form className="resource-form" onSubmit={submit} noValidate>
      <div className="dialog-heading"><div><h2 id="resource-form-title">{creating ? `Crear ${resource.singular}` : `Editar ${resource.singular}`}</h2></div><Button variant="ghost" aria-label="Cerrar formulario" disabled={saving} onClick={onClose}>Cerrar</Button></div>
      {banner && <p className="form-banner" role="alert">{banner}</p>}
      <div className="form-fields">{fields.map((field) => <div className={`form-field${field.type === 'textarea' ? ' wide' : ''}`} key={field.name}>
        {field.type === 'bool' ? renderControl(field) : <><label htmlFor={`field-${field.name}`}>{field.label}{field.required && !(creating && field.hasDefault) && <span aria-hidden="true"> *</span>}</label>{renderControl(field)}</>}
        {field.hint && <small id={`hint-${field.name}`}>{field.hint}</small>}{errors[field.name] && <small className="field-error" id={`error-${field.name}`} role="alert">{errors[field.name]}</small>}
      </div>)}</div>
      <div className="dialog-actions"><Button variant="ghost" disabled={saving} onClick={onClose}>Cancelar</Button><Button type="submit" variant="primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</Button></div>
    </form>
  </dialog>;
}
