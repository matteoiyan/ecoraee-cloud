import { useEffect, useRef } from 'react';
import AppTopbar from './AppTopbar.jsx';
import SideNavigation from './SideNavigation.jsx';

export default function AppLayout({ resources, route, children }) {
  const mainRef = useRef(null);

  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
  }, [route]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">Saltar al contenido</a>
      <AppTopbar resources={resources} route={route} />
      <SideNavigation resources={resources} route={route} />
      <main id="main" ref={mainRef} tabIndex={-1} className="main-content">{children}</main>
    </div>
  );
}
