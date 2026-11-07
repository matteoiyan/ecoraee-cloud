import { useCallback, useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout.jsx';
import Button from '../components/Button.jsx';
import { BootSkeleton, ListSkeleton } from '../components/LoadingSkeletons.jsx';
import Toast from '../components/Toast.jsx';
import { api } from '../services/api.js';
import { routeFromHash } from './routes.js';
import DashboardPage from '../features/dashboard/DashboardPage.jsx';
import ResourcePage from '../features/resources/ResourcePage.jsx';
import TraceDialog from '../features/traceability/TraceDialog.jsx';

export default function App() {
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [route, setRoute] = useState(() => routeFromHash());
  const [traceId, setTraceId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const syncRoute = () => setRoute(routeFromHash());
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    api('meta', { signal: controller.signal })
      .then((data) => { setMeta(data); setError(''); })
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message); });
    return () => controller.abort();
  }, [retry]);

  useEffect(() => {
    if (!meta || route === 'panel' || meta.resources[route]) return;
    window.location.hash = '#/panel';
  }, [meta, route]);

  const reloadMeta = useCallback(() => { setMeta(null); setError(''); setRetry((value) => value + 1); }, []);
  const dismissToast = useCallback(() => setToast(''), []);
  const movementSaved = useCallback(() => {
    setTraceId(null);
    setRefreshKey((key) => key + 1);
    setToast('Movimiento registrado');
  }, []);

  if (error) {
    return (
      <main className="boot-state" role="alert">
        <span className="brand-mark" aria-hidden="true" />
        <h1>No se pudo conectar</h1>
        <p>{error}</p>
        <Button variant="primary" onClick={reloadMeta}>Reintentar</Button>
      </main>
    );
  }
  if (!meta) return <BootSkeleton />;

  return (
    <AppLayout resources={meta.resources} route={route}>
      {route === 'panel' ? <DashboardPage key={refreshKey} onTrace={setTraceId} /> : meta.resources[route] ? <ResourcePage key={`${route}-${refreshKey}`} name={route} resource={meta.resources[route]} onTrace={setTraceId} /> : <ListSkeleton />}
      {traceId != null && <TraceDialog deviceId={traceId} onClose={() => setTraceId(null)} onChanged={movementSaved} />}
      {toast && <Toast key={toast} message={toast} onDismiss={dismissToast} />}
    </AppLayout>
  );
}
