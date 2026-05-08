import { useState } from 'react';
import { Eye, EyeOff, Zap, Mail, Lock, AlertCircle, Smartphone } from 'lucide-react';

interface LoginProps {
  onLogin: (role: 'front' | 'back') => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        'https://keycloak-production-6edd.up.railway.app/realms/chargehub/protocol/openid-connect/token',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'password',
            client_id: 'chargehub-frontend',
            username: email,
            password: password,
            ...(step === 'otp' && { otp: otp }), // Add OTP if in second step
          }),
        }
      );

      if (response.status === 401) {
        const errorData = await response.json();
        // Check if OTP is required
        if (errorData.error === 'invalid_grant' && 
            errorData.error_description?.includes('required')) {
          setStep('otp');
          setError('Un code OTP est requis');
          setLoading(false);
          return;
        }
        setError('Identifiants incorrects');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setError('Erreur de connexion');
        setLoading(false);
        return;
      }

      const data = await response.json();
      const tokenPayload = JSON.parse(atob(data.access_token.split('.')[1]));
      const roles: string[] = tokenPayload?.realm_access?.roles || [];

      if (roles.includes('back-office')) {
        onLogin('back');
      } else if (roles.includes('front-office')) {
        onLogin('front');
      } else {
        setError('Aucun rôle assigné à ce compte');
      }

    } catch (err) {
      setError('Erreur de connexion. Vérifiez que Keycloak est démarré');
    }

    setLoading(false);
  };

  const fillDemo = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setError('');
    setStep('credentials');
    setOtp('');
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600 rounded-full opacity-10 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 mb-4">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Charge Hub</h1>
          <p className="text-sm text-white/50 mt-1">AI-Powered EV Charging Network</p>
        </div>

        <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-white mb-1">
            {step === 'credentials' ? 'Connexion' : 'Code OTP'}
          </h2>
          <p className="text-sm text-white/50 mb-6">
            {step === 'credentials' 
              ? 'Accédez à votre espace de gestion' 
              : 'Entrez le code généré par votre application d\'authentification'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 'credentials' ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/70 uppercase tracking-wider">Adresse e-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="email" required value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      placeholder="votre@email.fr"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.07] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/70 uppercase tracking-wider">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type={showPwd ? 'text' : 'password'} required value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.07] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                    />
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/70 uppercase tracking-wider">Code OTP</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text" required value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.07] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                  />
                </div>
                <p className="text-xs text-white/40">
                  Ouvrez Google Authenticator et entrez le code à 6 chiffres
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl bg-white text-[#0a0c10] text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  {step === 'otp' ? 'Vérification...' : 'Connexion…'}
                </span>
              ) : (step === 'otp' ? 'Vérifier' : 'Se connecter')}
            </button>

            {step === 'otp' && (
              <button
                type="button"
                onClick={() => { setStep('credentials'); setOtp(''); setError(''); }}
                className="w-full text-xs text-white/40 hover:text-white/60 transition-colors"
              >
                ← Retour
              </button>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-white/40 text-center mb-3">Comptes de démonstration</p>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button" 
                onClick={() => fillDemo('agent.front@chargerhub.fr', 'front123')}
                className="py-2 px-3 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-left">
                <div className="text-xs font-medium text-white/80">Agent Front-Office</div>
                <div className="text-[10px] text-white/40 mt-0.5 truncate">agent.front@chargerhub.fr</div>
              </button>
              <button 
                type="button"
                onClick={() => fillDemo('agent.back@chargerhub.fr', 'back123')}
                className="py-2 px-3 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-left">
                <div className="text-xs font-medium text-white/80">Agent Back-Office</div>
                <div className="text-[10px] text-white/40 mt-0.5 truncate">agent.back@chargerhub.fr</div>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-white/25 mt-6">
          Authentification sécurisée via Keycloak + OTP
        </p>
      </div>
    </div>
  );
}