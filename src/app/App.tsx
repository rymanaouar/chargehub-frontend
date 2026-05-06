import { useState, useEffect } from 'react';
import { FrontOffice } from './components/FrontOffice';
import { BackOffice } from './components/BackOffice';
import { syncUser } from '../lib/api'

interface AppProps {
  keycloak: any;
}

export default function App({ keycloak }: AppProps) {
  const [role, setRole] = useState<'front' | 'back' | null>(null);

  useEffect(() => {
    // Get role from Keycloak token
    const roles = keycloak?.tokenParsed?.realm_access?.roles || [];
    if (roles.includes('back-office')) {
      setRole('back');
    } else if (roles.includes('front-office')) {
      setRole('front');
    }


    // Sync utilisateur avec la DB
  if (keycloak?.tokenParsed) {
    syncUser({
      keycloakId: keycloak.tokenParsed.sub,
      email: keycloak.tokenParsed.email || '',
      username: keycloak.tokenParsed.preferred_username || '',
      role: roles.includes('back-office') ? 'back' : 'front'
    }).catch(console.error)
  }
  }, [keycloak]);

  const handleLogout = () => {
    keycloak.logout({ redirectUri: 'http://localhost:5173' });
  };

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-slate-500 text-sm animate-pulse">Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#171a20] border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <svg className="h-7 w-auto" viewBox="0 0 342 35" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 .1a9.7 9.7 0 0 0 7 7h11l.5.1v27.6h6.8V7.3L26 7h11a9.8 9.8 0 0 0 7-7H0zm238.6 0h-6.8v34.8H263a9.7 9.7 0 0 0 6-6.8h-30.3V0zm-52.3 6.8c3.6-1 6.6-3.8 7.4-6.9l-38.1.1v20.6h31.1v7.2h-24.4a13.6 13.6 0 0 0-8.7 7h39.9v-21h-31.2v-7h24zm116.2 28h6.7v-14h24.6v14h6.7v-21h-38zM85.3 7h26a9.6 9.6 0 0 0 7.1-7H78.3a9.6 9.6 0 0 0 7 7zm0 13.8h26a9.6 9.6 0 0 0 7.1-7H78.3a9.6 9.6 0 0 0 7 7zm0 14.1h26a9.6 9.6 0 0 0 7.1-7H78.3a9.6 9.6 0 0 0 7 7zM308.5 7h26a9.6 9.6 0 0 0 7-7h-40a9.6 9.6 0 0 0 7 7z" fill="#ffffff"/>
              </svg>
              <div className="border-l border-white/20 pl-4">
                <h1 className="font-semibold text-base text-white">Charge Hub</h1>
                <p className="text-xs text-white/60">AI-Powered Network</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/50">
                {keycloak.tokenParsed?.preferred_username}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                role === 'back' ? 'bg-purple-500/20 text-purple-300' : 'bg-teal-500/20 text-teal-300'
              }`}>
                {role === 'back' ? 'Back-Office' : 'Front-Office'}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs text-white/50 hover:text-white border border-white/20 hover:border-white/40 px-3 py-1.5 rounded-lg transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-[1920px] mx-auto">
        {role === 'front' ? <FrontOffice /> : <BackOffice />}
      </main>
    </div>
  );
}