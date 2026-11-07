import { pretty } from '../utils/format.js';

function NavIcon({ name }) {
  const paths = {
    panel: <><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="5" rx="1" /><rect x="13" y="10" width="8" height="11" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /></>,
    lote: <><path d="m4 7 8-4 8 4-8 4-8-4Z" /><path d="M4 7v10l8 4 8-4V7M12 11v10" /></>,
    dispositivo: <><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M10 6h4M11 18h2M4 7v10M20 7v10" /></>,
    traslado: <><path d="M3 7h13l-3-3M21 17H8l3 3" /><path d="M16 4 13 7l3 3M8 14l3 3-3 3" /></>,
    evaluacion: <><path d="M6 3h12v18H6zM9 8h6M9 12h3" /><path d="m13 16 2 2 4-5" /></>,
    tratamiento: <><path d="M4 7h11a4 4 0 0 1 4 4v1M20 17H9a4 4 0 0 1-4-4v-1" /><path d="m16 9 3 3 3-3M8 15l-3-3-3 3" /></>,
    organizacion: <><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1M14 9h1M9 13h1M14 13h1M10 21v-4h4v4" /></>,
    sede: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2" /></>,
    ruta: <><circle cx="5" cy="6" r="2" /><circle cx="19" cy="18" r="2" /><path d="M7 6h5a3 3 0 0 1 0 6h0a3 3 0 0 0 0 6h5" /></>,
    usuario: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    categoria_raee: <><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" /></>,
    tipo_tratamiento: <><path d="M14 6 18 2l4 4-4 4M16 8 8 16M5 19l3-3 3 3-3 3-3-3Z" /></>,
  };
  return <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] ?? paths.lote}</svg>;
}

export default function SideNavigation({ resources, route }) {
  const groups = Object.entries(resources ?? {}).reduce((acc, [name, resource]) => {
    (acc[resource.group] ??= []).push([name, resource]);
    return acc;
  }, {});

  return (
    <aside className="side-navigation">
      <nav aria-label="Principal" className="nav-links">
        <a className="nav-link nav-mobile-panel" href="#/panel" aria-current={route === 'panel' ? 'page' : undefined}><NavIcon name="panel" /><span>Panel</span></a>
        {Object.entries(groups).map(([group, items]) => (
          <div className="nav-group" key={group}>
            <h2>{group}</h2>
            {items.map(([name, resource]) => (
              <a className="nav-link" href={`#/${name}`} aria-current={route === name ? 'page' : undefined} key={name}>
                <NavIcon name={name} /><span>{resource.title || pretty(name)}</span>
              </a>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
