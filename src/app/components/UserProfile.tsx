import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { User, Mail, Phone, Car, CreditCard, Shield, Bell, Zap, Leaf, Trophy, Star, TrendingUp, Plus, Trash2, CheckCircle2, Battery } from 'lucide-react';

// ── Eco-Score data ───────────────────────────────────────────────────────────
const ecoData = {
  totalWatts: 3240, totalKwh: 162.3, totalCO2Saved: 64.9, treesPlanted: 3.2,
  offPeakSessions: 8, totalSessions: 12, currentStreak: 4,
  level: 'Gold', nextLevel: 'Platinum', wattsToNext: 760,
  badges: [
    { icon: '🌙', label: 'Noctambule',    desc: '5 recharges en heures creuses', earned: true  },
    { icon: '🌱', label: 'Éco-Guerrier',  desc: '50 kg CO2 économisés',          earned: true  },
    { icon: '⚡', label: 'Power User',    desc: '10 sessions complétées',         earned: true  },
    { icon: '🏆', label: 'Champion Vert', desc: '100 kg CO2 économisés',          earned: false },
    { icon: '🚀', label: 'Tesla Master',  desc: '500 kWh chargés',               earned: false },
    { icon: '💎', label: 'Platinum',      desc: '4000 Watts accumulés',           earned: false },
  ],
  history: [
    { date: '20/02', watts: 523, offPeak: true  },
    { date: '18/02', watts: 487, offPeak: false },
    { date: '15/02', watts: 612, offPeak: true  },
    { date: '10/02', watts: 398, offPeak: true  },
    { date: '05/02', watts: 445, offPeak: false },
  ],
};

const levelConfig: Record<string, { color: string; bg: string; min: number; max: number }> = {
  Bronze:   { color: 'text-amber-700',  bg: 'bg-amber-100',  min: 0,    max: 1000  },
  Silver:   { color: 'text-slate-600',  bg: 'bg-slate-100',  min: 1000, max: 2000  },
  Gold:     { color: 'text-yellow-600', bg: 'bg-yellow-100', min: 2000, max: 4000  },
  Platinum: { color: 'text-blue-600',   bg: 'bg-blue-100',   min: 4000, max: 8000  },
  Diamond:  { color: 'text-purple-600', bg: 'bg-purple-100', min: 8000, max: 99999 },
};

// ── Virtual Garage ───────────────────────────────────────────────────────────
interface Vehicle {
  id: string; model: string; year: number; matricule: string; vin: string;
  battery: number; range: number; capacity: number; connector: string;
  color: string; isActive: boolean;
}

const initialVehicles: Vehicle[] = [
  { id: '1', model: 'Tesla Model 3', year: 2023, matricule: '123-TU-4567', vin: '5YJ3E1EA1KF000001', battery: 42, range: 580, capacity: 75, connector: 'CCS2', color: '#171a20', isActive: true  },
  { id: '2', model: 'Tesla Model Y', year: 2022, matricule: '456-TU-7890', vin: '5YJYGDEF0NF000002', battery: 78, range: 510, capacity: 75, connector: 'CCS2', color: '#e82127', isActive: false },
];

const TESLA_MODELS = [
  { model: 'Tesla Model S',    capacity: 100, range: 600,  connector: 'CCS2' },
  { model: 'Tesla Model 3',    capacity: 75,  range: 580,  connector: 'CCS2' },
  { model: 'Tesla Model X',    capacity: 100, range: 560,  connector: 'CCS2' },
  { model: 'Tesla Model Y',    capacity: 75,  range: 510,  connector: 'CCS2' },
  { model: 'Tesla Cybertruck', capacity: 123, range: 550,  connector: 'CCS2' },
  { model: 'Tesla Roadster',   capacity: 200, range: 1000, connector: 'CCS2' },
];

export function UserProfile() {
  const [activeTab, setActiveTab] = useState<'profile' | 'ecoscore' | 'garage'>('profile');

  // Eco-Score
  const level = levelConfig[ecoData.level];
  const progressToNext = ((ecoData.totalWatts - level.min) / (level.max - level.min)) * 100;
  const offPeakRatio = Math.round((ecoData.offPeakSessions / ecoData.totalSessions) * 100);

  // Garage
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ model: '', year: new Date().getFullYear(), matricule: '', vin: '', color: '#171a20' });

  const setActive    = (id: string) => setVehicles(prev => prev.map(v => ({ ...v, isActive: v.id === id })));
  const deleteVehicle = (id: string) => setVehicles(prev => prev.filter(v => v.id !== id));
  const addVehicle   = () => {
    if (!newVehicle.model || !newVehicle.matricule) return;
    const tpl = TESLA_MODELS.find(m => m.model === newVehicle.model) || TESLA_MODELS[1];
    setVehicles(prev => [...prev, {
      id: Date.now().toString(), model: newVehicle.model, year: newVehicle.year,
      matricule: newVehicle.matricule, vin: newVehicle.vin || '—',
      battery: 80, range: tpl.range, capacity: tpl.capacity, connector: tpl.connector,
      color: newVehicle.color, isActive: false,
    }]);
    setNewVehicle({ model: '', year: new Date().getFullYear(), matricule: '', vin: '', color: '#171a20' });
    setShowAddForm(false);
  };

  const activeVehicle = vehicles.find(v => v.isActive);

  return (
    <div className="space-y-6">

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'profile' ? 'bg-[#171a20] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          <User className="size-4" />Mon Profil
        </button>
        <button onClick={() => setActiveTab('garage')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'garage' ? 'bg-[#171a20] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          <Car className="size-4" />Garage Virtuel
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'garage' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>{vehicles.length}</span>
        </button>
        <button onClick={() => setActiveTab('ecoscore')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'ecoscore' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
          <Leaf className="size-4" />Eco-Score
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'ecoscore' ? 'bg-white/20 text-white' : 'bg-green-200 text-green-800'}`}>⚡ {ecoData.totalWatts.toLocaleString()}</span>
        </button>
      </div>

      {/* ── PROFILE ─────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="size-24"><AvatarFallback className="bg-red-600 text-white text-2xl">JD</AvatarFallback></Avatar>
                </div>
                <CardTitle>Jean Dupont</CardTitle>
                <CardDescription>Membre depuis Mars 2024</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-sm text-slate-600">Statut</span><Badge>Premium</Badge></div>
                <div className="flex items-center justify-between"><span className="text-sm text-slate-600">Eco-Score</span><span className="font-semibold text-green-600">⚡ {ecoData.totalWatts.toLocaleString()} Watts</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-slate-600">Niveau</span><Badge className={`${level.bg} ${level.color} border-0`}>🏆 {ecoData.level}</Badge></div>
                {activeVehicle && <div className="flex items-center justify-between"><span className="text-sm text-slate-600">Véhicule actif</span><span className="text-sm font-semibold">{activeVehicle.model.replace('Tesla ', '')}</span></div>}
              </CardContent>
            </Card>

            {activeVehicle && (
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Car className="size-5" />Véhicule Actif</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: activeVehicle.color + '15' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: activeVehicle.color + '25' }}>🚗</div>
                    <div>
                      <p className="font-semibold text-sm">{activeVehicle.model}</p>
                      <p className="text-xs text-slate-500">{activeVehicle.year} • {activeVehicle.matricule}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-500"><span>Batterie</span><span className="font-bold">{activeVehicle.battery}%</span></div>
                    <Progress value={activeVehicle.battery} className="h-2" />
                    <p className="text-xs text-slate-400">~{Math.round(activeVehicle.range * activeVehicle.battery / 100)} km d'autonomie</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><User className="size-5" />Informations Personnelles</CardTitle><CardDescription>Gérez vos informations de profil</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Prénom</Label><Input defaultValue="Jean" /></div>
                  <div className="space-y-2"><Label>Nom</Label><Input defaultValue="Dupont" /></div>
                </div>
                <div className="space-y-2"><Label className="flex items-center gap-2"><Mail className="size-4" />Email</Label><Input type="email" defaultValue="jean.dupont@example.com" /></div>
                <div className="space-y-2"><Label className="flex items-center gap-2"><Phone className="size-4" />Téléphone</Label><Input type="tel" defaultValue="+216 98 000 000" /></div>
                <Button>Enregistrer les modifications</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="size-5" />Moyen de Paiement</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-3 rounded"><CreditCard className="size-6" /></div>
                    <div><p className="font-semibold">•••• •••• •••• 4242</p><p className="text-sm text-slate-500">Expire 12/2027</p></div>
                  </div>
                  <Badge>Principal</Badge>
                </div>
                <Button variant="outline" className="w-full">Ajouter une carte</Button>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="size-5" />Notifications</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {['Alertes de charge', 'Promotions', 'Nouveautés'].map((label, i) => (
                    <label key={label} className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm">{label}</span>
                      <input type="checkbox" defaultChecked={i < 2} />
                    </label>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="size-5" />Sécurité</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">Changer le mot de passe</Button>
                  <Button variant="outline" className="w-full justify-start">Authentification 2FA</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ── GARAGE ──────────────────────────────────────────────────── */}
      {activeTab === 'garage' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Garage Virtuel 🚗</h2>
              <p className="text-sm text-slate-500">{vehicles.length} véhicule{vehicles.length > 1 ? 's' : ''} enregistré{vehicles.length > 1 ? 's' : ''}</p>
            </div>
            <Button onClick={() => setShowAddForm(v => !v)} className="bg-[#171a20] hover:bg-slate-700 text-white gap-2">
              <Plus className="size-4" />Ajouter un véhicule
            </Button>
          </div>

          {showAddForm && (
            <Card className="border-2 border-dashed border-slate-300">
              <CardHeader><CardTitle className="text-base">Nouveau véhicule</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Modèle Tesla *</Label>
                    <select value={newVehicle.model} onChange={e => setNewVehicle(p => ({ ...p, model: e.target.value }))}
                      className="w-full h-10 px-3 rounded border border-slate-200 bg-white text-sm">
                      <option value="">Sélectionner un modèle</option>
                      {TESLA_MODELS.map(m => <option key={m.model} value={m.model}>{m.model}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Année</Label>
                    <Input type="number" value={newVehicle.year} onChange={e => setNewVehicle(p => ({ ...p, year: Number(e.target.value) }))} />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Matricule *</Label>
                    <Input placeholder="123-TU-4567" value={newVehicle.matricule} onChange={e => setNewVehicle(p => ({ ...p, matricule: e.target.value.toUpperCase() }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>VIN (optionnel)</Label>
                    <Input placeholder="5YJ3E1EA1KF000000" value={newVehicle.vin} onChange={e => setNewVehicle(p => ({ ...p, vin: e.target.value.toUpperCase() }))} maxLength={17} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Couleur</Label>
                  <div className="flex gap-2">
                    {['#171a20', '#e82127', '#f8f8f8', '#3b82f6', '#22c55e', '#f97316'].map(color => (
                      <button key={color} onClick={() => setNewVehicle(p => ({ ...p, color }))}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${newVehicle.color === color ? 'scale-125 border-slate-400' : 'border-slate-200'}`}
                        style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addVehicle} className="bg-emerald-600 hover:bg-emerald-700 text-white">Ajouter</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>Annuler</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {vehicles.map(vehicle => (
              <Card key={vehicle.id} className={`transition-all ${vehicle.isActive ? 'border-2 border-[#171a20] shadow-lg' : 'hover:shadow-md'}`}>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                        style={{ backgroundColor: vehicle.color + '20', border: `2px solid ${vehicle.color}40` }}>🚗</div>
                      <div>
                        <p className="font-bold text-sm">{vehicle.model}</p>
                        <p className="text-xs text-slate-500">{vehicle.year} • {vehicle.matricule}</p>
                      </div>
                    </div>
                    {vehicle.isActive && (
                      <Badge className="bg-green-100 text-green-700 border-0 flex items-center gap-1">
                        <CheckCircle2 className="size-3" />Actif
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-slate-500"><Battery className="size-3" />Batterie</span>
                      <span className="font-bold">{vehicle.battery}%</span>
                    </div>
                    <Progress value={vehicle.battery} className="h-2" />
                    <p className="text-xs text-slate-400">~{Math.round(vehicle.range * vehicle.battery / 100)} km d'autonomie estimée</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center py-2 bg-slate-50 rounded-xl">
                    <div><p className="text-[10px] text-slate-400">Capacité</p><p className="text-xs font-bold">{vehicle.capacity} kWh</p></div>
                    <div><p className="text-[10px] text-slate-400">Autonomie</p><p className="text-xs font-bold">{vehicle.range} km</p></div>
                    <div><p className="text-[10px] text-slate-400">Connecteur</p><p className="text-xs font-bold">{vehicle.connector}</p></div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 font-mono">
                    <span>VIN:</span><span>{vehicle.vin}</span>
                  </div>

                  <div className="flex gap-2">
                    {!vehicle.isActive ? (
                      <>
                        <Button size="sm" className="flex-1 bg-[#171a20] hover:bg-slate-700 text-white" onClick={() => setActive(vehicle.id)}>
                          <CheckCircle2 className="size-3 mr-1" />Définir comme actif
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteVehicle(vehicle.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="size-4" />
                        </Button>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-xs text-green-600 font-medium gap-1 p-2">
                        <CheckCircle2 className="size-3" />Véhicule actif pour les réservations
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex gap-3">
                <Zap className="size-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Comment fonctionne le Garage Virtuel ?</p>
                  <p className="text-xs text-blue-700">Le véhicule actif est utilisé pour calculer l'énergie nécessaire lors des réservations. Tous vos véhicules partagent le même connecteur CCS2 compatible avec les Tesla Superchargers.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── ECO-SCORE ───────────────────────────────────────────────── */}
      {activeTab === 'ecoscore' && (
        <div className="space-y-6">
          <Card className="border-2 border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center text-3xl">🏆</div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Niveau actuel</p>
                    <p className={`text-2xl font-bold ${level.color}`}>{ecoData.level}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#171a20]">⚡ {ecoData.totalWatts.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">Watts accumulés</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{ecoData.level}</span><span>{ecoData.wattsToNext} Watts pour {ecoData.nextLevel}</span>
                </div>
                <Progress value={progressToNext} className="h-3" />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '⚡', label: 'Watts totaux',   value: ecoData.totalWatts.toLocaleString(), color: 'text-yellow-600', bg: 'bg-yellow-50' },
              { icon: '🌱', label: 'CO2 économisé',  value: `${ecoData.totalCO2Saved} kg`,        color: 'text-green-600',  bg: 'bg-green-50'  },
              { icon: '🌳', label: 'Arbres plantés', value: `${ecoData.treesPlanted}`,             color: 'text-emerald-600',bg: 'bg-emerald-50'},
              { icon: '🔥', label: 'Série actuelle', value: `${ecoData.currentStreak} sessions`,  color: 'text-orange-600', bg: 'bg-orange-50' },
            ].map(stat => (
              <Card key={stat.label} className={`${stat.bg} border-0`}>
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl mb-1">{stat.icon}</p>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="size-5 text-green-600" />Comment gagner des Watts ⚡</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { icon: '⚡', action: '1 kWh rechargé',         watts: '+10 Watts',       color: 'bg-yellow-50 border-yellow-200' },
                  { icon: '🌙', action: 'Recharge heures creuses', watts: '+20 Watts (x2)',  color: 'bg-blue-50 border-blue-200'   },
                  { icon: '🎯', action: 'Objectif 80% atteint',    watts: '+50 Watts bonus', color: 'bg-green-50 border-green-200' },
                ].map(rule => (
                  <div key={rule.action} className={`p-3 rounded-xl border-2 ${rule.color}`}>
                    <p className="text-2xl mb-2">{rule.icon}</p>
                    <p className="text-sm font-medium text-slate-700">{rule.action}</p>
                    <p className="text-sm font-bold text-green-700 mt-1">{rule.watts}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Leaf className="size-5 text-green-600" />Comportement Éco</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-slate-600">Recharges en heures creuses</span><span className="font-bold text-green-600">{offPeakRatio}%</span></div>
                <Progress value={offPeakRatio} className="h-3" />
                <p className="text-xs text-slate-500">{ecoData.offPeakSessions} sur {ecoData.totalSessions} sessions en heures creuses</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-slate-600">Énergie totale chargée</span><span className="font-bold">{ecoData.totalKwh} kWh</span></div>
                <Progress value={Math.min((ecoData.totalKwh / 500) * 100, 100)} className="h-3" />
                <p className="text-xs text-slate-500">Objectif 500 kWh pour badge 🚀 Tesla Master</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy className="size-5 text-yellow-600" />Badges & Récompenses</CardTitle>
              <CardDescription>{ecoData.badges.filter(b => b.earned).length} / {ecoData.badges.length} badges obtenus</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ecoData.badges.map(badge => (
                  <div key={badge.label} className={`p-3 rounded-xl border-2 text-center transition-all ${badge.earned ? 'border-yellow-300 bg-yellow-50' : 'border-slate-200 bg-slate-50 opacity-50'}`}>
                    <p className="text-3xl mb-1">{badge.icon}</p>
                    <p className="text-sm font-bold text-slate-800">{badge.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{badge.desc}</p>
                    {badge.earned && <span className="inline-block mt-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-medium">✅ Obtenu</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Star className="size-5 text-yellow-500" />Historique des Watts gagnés</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ecoData.history.map((session, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${session.offPeak ? 'bg-blue-100' : 'bg-slate-100'}`}>
                        {session.offPeak ? '🌙' : '☀️'}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Session du {session.date}</p>
                        <p className="text-xs text-slate-500">{session.offPeak ? 'Heures creuses — bonus x2' : 'Heures normales'}</p>
                      </div>
                    </div>
                    <span className="font-bold text-yellow-600">+{session.watts} ⚡</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
