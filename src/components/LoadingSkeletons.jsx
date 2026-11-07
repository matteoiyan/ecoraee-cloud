function Skeleton({ className = '' }) {
  return <span className={`skeleton-shape ${className}`} aria-hidden="true" />;
}

export function BootSkeleton() {
  return (
    <div className="boot-skeleton" aria-busy="true" aria-live="polite" aria-label="Cargando EcoRAEE">
      <span className="brand-mark" aria-hidden="true" />
      <Skeleton className="boot-title" />
      <span className="sr-only">Cargando EcoRAEE Cloud…</span>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="loading-layout" aria-busy="true" aria-live="polite">
      <div className="skeleton-heading"><Skeleton className="line-title" /></div>
      <div className="skeleton-kpis">{Array.from({ length: 4 }, (_, i) => <Skeleton className="skeleton-kpi" key={i} />)}</div>
      <Skeleton className="skeleton-lifecycle" />
      <div className="skeleton-cards">{Array.from({ length: 3 }, (_, i) => <Skeleton className="skeleton-card" key={i} />)}</div>
      <span className="sr-only">Cargando resumen operativo…</span>
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="loading-layout" aria-busy="true" aria-live="polite">
      <div className="skeleton-heading"><Skeleton className="line-title" /><Skeleton className="line-copy" /></div>
      <div className="skeleton-table">{Array.from({ length: 6 }, (_, i) => <Skeleton className="skeleton-row" key={i} />)}</div>
      <span className="sr-only">Cargando registros…</span>
    </div>
  );
}

export function TraceSkeleton() {
  return (
    <div className="loading-layout trace-skeleton" aria-busy="true" aria-live="polite">
      <Skeleton className="line-title" /><Skeleton className="skeleton-lifecycle" />
      {Array.from({ length: 4 }, (_, i) => <Skeleton className="skeleton-row" key={i} />)}
      <span className="sr-only">Cargando historial de trazabilidad…</span>
    </div>
  );
}
