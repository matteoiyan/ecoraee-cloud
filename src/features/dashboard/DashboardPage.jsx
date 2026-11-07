import { useEffect, useState } from 'react';
import { DashboardSkeleton } from '../../components/LoadingSkeletons.jsx';
import LoadError from '../../components/LoadError.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import RailScrollHint from '../../components/RailScrollHint.jsx';
import StatusText from '../../components/StatusText.jsx';
import { api } from '../../services/api.js';
import { formatDate, formatNumber } from '../../utils/format.js';

const STAGES = [
  ['REGISTRADO'],
  ['RECIBIDO'],
  ['EVALUADO'],
  ['EN_TRATAMIENTO'],
  ['REACONDICIONADO', 'RECICLADO', 'DISPUESTO', 'DONADO'],
  ['CERRADO'],
];
const STAGE_NAMES = ['Registrado', 'Recibido', 'Evaluado', 'En tratamiento', 'Resultado', 'Cerrado'];

function Lifecycle({ counts }) {
  const stages = STAGES.map((states, i) => ({
    name: STAGE_NAMES[i],
    count: states.reduce((total, state) => total + Number(counts[state] || 0), 0),
  }));

  return (
    <section className="dashboard-card lifecycle-card" aria-labelledby="lifecycle-title">
      <div className="card-heading">
        <h2 id="lifecycle-title">Ciclo de vida</h2>
        <a className="text-link" href="#/dispositivo">Ver dispositivos</a>
      </div>
      <div className="lifecycle-rail-scroll"><div className="lifecycle-rail" role="list" aria-label="Etapas del ciclo de vida">
        {stages.map((stage, i) => (
          <div className={`lifecycle-step${stage.count ? ' has-count' : ''}`} role="listitem" key={stage.name} style={{ '--step': i }}>
            <strong>{stage.count}</strong>
            <span className="lifecycle-dot" aria-hidden="true" />
            <span>{stage.name}</span>
          </div>
        ))}
      </div></div>
      <RailScrollHint />
    </section>
  );
}

function CategoryWeights({ categories }) {
  const maxKg = Math.max(1, ...categories.map((item) => Number(item.kg) || 0));
  return (
    <section className="dashboard-card" aria-labelledby="categories-title">
      <div className="card-heading"><h2 id="categories-title">Peso por categoría</h2></div>
      {categories.length ? (
        <ul className="bar-list">
          {categories.map((item) => {
            const kg = Number(item.kg) || 0;
            return <li className="bar-row" key={item.nombre}>
              <span className="bar-label">{item.nombre}</span>
              <small>{formatNumber(kg)} kg · {item.n} equipo{Number(item.n) === 1 ? '' : 's'}</small>
              <span className="bar-track" aria-label={`${formatNumber(kg)} kg`}><i style={{ '--bar-width': `${Math.max(0, Math.min(100, kg / maxKg * 100))}%` }} /></span>
            </li>;
          })}
        </ul>
      ) : <p className="empty-inline">Aún no hay dispositivos registrados.</p>}
    </section>
  );
}

function RouteCapacity({ routes }) {
  return (
    <section className="dashboard-card" aria-labelledby="routes-title">
      <div className="card-heading"><h2 id="routes-title">Capacidad de rutas</h2><a className="text-link" href="#/ruta">Ver rutas</a></div>
      {routes.length ? (
        <ul className="bar-list">
          {routes.map((route) => {
            const capacity = Number(route.capacidad) || 0;
            const assigned = Number(route.asignado) || 0;
            const percent = capacity > 0 ? Math.min(100, assigned / capacity * 100) : 0;
            return <li className="bar-row" key={route.id_ruta}>
              <span className="bar-label">{route.origen} <span aria-hidden="true">→</span> {route.destino}</span>
              <small>{formatNumber(assigned)} de {formatNumber(capacity)} kg</small>
              <span className="bar-track" aria-label={`${formatNumber(percent)}% de capacidad`}><i className={percent > 80 ? 'hot' : ''} style={{ '--bar-width': `${percent}%` }} /></span>
            </li>;
          })}
        </ul>
      ) : <p className="empty-inline">No hay rutas activas.</p>}
    </section>
  );
}

function RecentActivity({ events, onTrace }) {
  const recentEvents = events.slice(0, 4);
  return (
    <section className="dashboard-card" aria-labelledby="activity-title">
      <div className="card-heading"><h2 id="activity-title">Últimos movimientos</h2><a className="text-link" href="#/dispositivo">Ver dispositivos</a></div>
      {recentEvents.length ? (
        <ul className="activity-list">
          {recentEvents.map((event) => (
            <li className="activity-item" key={`${event.id_dispositivo}-${event.fecha_hora}-${event.estado_nuevo}`}>
              <div className="activity-main">
                <button type="button" className="linkish code" onClick={() => onTrace?.(event.id_dispositivo)}>{event.codigo}</button>
                <StatusText value={event.estado_nuevo} tone="auto" />
              </div>
              <small>{event.responsable} · {formatDate(event.fecha_hora)}</small>
              {event.descripcion && <p>{event.descripcion}</p>}
            </li>
          ))}
        </ul>
      ) : <p className="empty-inline">Todavía no hay movimientos.</p>}
    </section>
  );
}

export default function DashboardPage({ onTrace }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError('');
    api('dashboard', { signal: controller.signal })
      .then(setData)
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message); });
    return () => controller.abort();
  }, [retry]);

  if (error) return <><PageHeader title="Resumen RAEE" /><LoadError message={error} onRetry={() => setRetry((n) => n + 1)} /></>;
  if (!data) return <DashboardSkeleton />;

  const counts = Object.fromEntries(data.porEstado.map(({ estado, n }) => [estado, Number(n)]));
  return (
    <div className="dashboard-page page-enter">
      <PageHeader title="Resumen RAEE" />
      <section className="metric-grid" aria-label="Indicadores operativos">
        <article className="metric-card metric-card-featured"><span>Dispositivos</span><strong>{formatNumber(data.tot.dispositivos)}</strong></article>
        <article className="metric-card"><span>Peso total</span><strong>{formatNumber(data.tot.kg)} <small>kg</small></strong></article>
        <article className="metric-card"><span>Lotes abiertos</span><strong>{formatNumber(data.tot.lotes_abiertos)}</strong></article>
        <article className="metric-card"><span>Traslados pendientes</span><strong>{formatNumber(data.tot.traslados_pendientes)}</strong></article>
      </section>
      <Lifecycle counts={counts} />
      <div className="dashboard-grid">
        <CategoryWeights categories={data.porCategoria} />
        <RouteCapacity routes={data.rutas} />
        <RecentActivity events={data.eventos} onTrace={onTrace} />
      </div>
    </div>
  );
}
