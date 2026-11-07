import { createRoot } from 'react-dom/client';
import App from './app/App.jsx';
import './styles/tokens.css';
import './styles/global.css';
import './styles/layout.css';
import './styles/components.css';

// React 19 root entry: https://react.dev/reference/react-dom/client/createRoot
createRoot(document.getElementById('root')).render(<App />);
