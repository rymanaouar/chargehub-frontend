import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import './styles/index.css';
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'https://keycloak-production-6edd.up.railway.app',
  realm: 'chargehub',
  clientId: 'chargehub-frontend',
});

keycloak.init({
  onLoad: 'login-required',
  checkLoginIframe: false,
  pkceMethod: 'S256',
}).then((authenticated) => {
  if (authenticated) {
    createRoot(document.getElementById('root')!).render(
      <App keycloak={keycloak} />
    );
  }
}).catch(console.error);