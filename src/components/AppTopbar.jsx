function BrandMark() {
  return <span className="brand-mark" aria-hidden="true" />;
}

export default function AppTopbar({ resources, route }) {
  const tabs = [
    { name: 'panel', label: 'Panel', routes: ['panel'] },
    { name: 'lote', label: resources?.lote?.title ?? 'Lotes', routes: ['lote'] },
    { name: 'dispositivo', label: resources?.dispositivo?.title ?? 'Dispositivos', routes: ['dispositivo', 'evaluacion', 'tratamiento'] },
    { name: 'traslado', label: resources?.traslado?.title ?? 'Traslados', routes: ['traslado'] },
    { name: 'ruta', label: 'Red', routes: ['organizacion', 'sede', 'ruta'] },
  ];

  return (
    <header className="app-topbar">
      <a className="brand" href="#/panel"><BrandMark />EcoRAEE <span>Cloud</span></a>
      <nav className="section-tabs" aria-label="Secciones">
        {tabs.map((tab) => <a className="section-tab" href={`#/${tab.name}`} aria-current={tab.routes.includes(route) ? 'page' : undefined} key={tab.name}>{tab.label}</a>)}
      </nav>
    </header>
  );
}
