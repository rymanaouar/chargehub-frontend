import { useState, useEffect } from 'react';
import { FrontOffice } from './components/FrontOffice';
import { BackOffice } from './components/BackOffice';
import { syncUser } from '../lib/api';

interface AppProps {
  keycloak: any;
}

export default function App({ keycloak }: AppProps) {
  const [role, setRole] = useState<'front' | 'back' | null>(null);

  useEffect(() => {
    const roles = keycloak?.tokenParsed?.realm_access?.roles || [];
    if (roles.includes('back-office')) {
      setRole('back');
    } else if (roles.includes('front-office')) {
      setRole('front');
    }

    if (keycloak?.tokenParsed) {
      syncUser({
        keycloakId: keycloak.tokenParsed.sub,
        email: keycloak.tokenParsed.email || '',
        username: keycloak.tokenParsed.preferred_username || '',
        role: roles.includes('back-office') ? 'back' : 'front',
      }).catch(console.error);
    }
  }, [keycloak]);

  const handleLogout = () => {
    keycloak.logout({ redirectUri: 'https://chargehub-frontend.vercel.app' });
  };

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-slate-500 text-sm animate-pulse">Chargement du profil...</p>
      </div>
    );
  }

  return (
    // MOBILE FIX: overflow-x-hidden on the root prevents any child (modals, panels,
    // EcoAdvisor popup) from creating a horizontal scrollbar on Android Chrome.
    <div className="min-h-screen bg-white overflow-x-hidden">
      <header className="bg-[#171a20] border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* MOBILE FIX: h-auto + py-2 instead of fixed h-16 so the header wraps
              gracefully on tiny screens without clipping content. On sm+ it stays h-16. */}
          <div className="flex items-center justify-between min-h-[56px] sm:h-16 py-2 sm:py-0 gap-2">
            {/* Logo + brand — shrink-0 keeps it from being squished */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <svg className="h-5 sm:h-7 w-auto" viewBox="0 0 342 35" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 .1a9.7 9.7 0 0 0 7 7h11l.5.1v27.6h6.8V7.3L26 7h11a9.8 9.8 0 0 0 7-7H0zm238.6 0h-6.8v34.8H263a9.7 9.7 0 0 0 6-6.8h-30.3V0zm-52.3 6.8c3.6-1 6.6-3.8 7.4-6.9l-38.1.1v20.6h31.1v7.2h-24.4a13.6 13.6 0 0 0-8.7 7h39.9v-21h-31.2v-7h24zm116.2 28h6.7v-14h24.6v14h6.7v-21h-38zM85.3 7h26a9.6 9.6 0 0 0 7.1-7H78.3a9.6 9.6 0 0 0 7 7zm0 13.8h26a9.6 9.6 0 0 0 7.1-7H78.3a9.6 9.6 0 0 0 7 7zm0 14.1h26a9.6 9.6 0 0 0 7.1-7H78.3a9.6 9.6 0 0 0 7 7zM308.5 7h26a9.6 9.6 0 0 0 7-7h-40a9.6 9.6 0 0 0 7 7z" fill="#ffffff"/>
              </svg>
              <div className="border-l border-white/20 pl-2 sm:pl-4">
                <h1 className="font-semibold text-sm sm:text-base text-white">Charge Hub</h1>
                {/* MOBILE FIX: hide subtitle on very small screens to save space */}
                <p className="text-xs text-white/60 hidden sm:block">AI-Powered Network</p>
              </div>
            </div>

            {/* Right side nav — MOBILE FIX: truncate username, hide it on xs if needed */}
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
              {/* MOBILE FIX: username hidden on mobile (xs), visible from sm upward */}
              <span className="text-xs text-white/50 hidden sm:block truncate max-w-[120px]">
                {keycloak.tokenParsed?.preferred_username}
              </span>

              {/* Role badge — keep visible but smaller on mobile */}
              <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium shrink-0 ${
                role === 'back' ? 'bg-purple-500/20 text-purple-300' : 'bg-teal-500/20 text-teal-300'
              }`}>
                {/* MOBILE FIX: abbreviated role label on small screens */}
                <span className="sm:hidden">{role === 'back' ? 'Back' : 'Front'}</span>
                <span className="hidden sm:inline">{role === 'back' ? 'Back-Office' : 'Front-Office'}</span>
              </span>

              <button
                onClick={handleLogout}
                className="text-xs text-white/50 hover:text-white border border-white/20 hover:border-white/40 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-colors shrink-0 whitespace-nowrap"
              >
                {/* MOBILE FIX: shorter label on mobile */}
                <span className="sm:hidden">←</span>
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE FIX: overflow-x-hidden here too, in case modals/popups escape main.
          max-w-[1920px] is kept exactly as-is for desktop. */}
      <main className="max-w-[1920px] mx-auto overflow-x-hidden">
        {role === 'front' ? <FrontOffice /> : <BackOffice />}
      </main>
    </div>
  );
}
