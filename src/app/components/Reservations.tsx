import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Search, Calendar, Clock, MapPin, User, Zap, XCircle, CheckCircle2 } from 'lucide-react';

type ReservationStatus = 'ongoing' | 'completed' | 'cancelled';

interface Reservation {
  id: string;
  clientName: string;
  clientEmail: string;
  vehicle: string;
  stationName: string;
  city: string;
  date: string;
  time: string;
  duration: number;
  cost: number;
  energy: number;
  status: ReservationStatus;
}

const mockReservations: Reservation[] = [
  { id: 'R001', clientName: 'Sophie Martin',  clientEmail: 'sophie.martin@email.fr',  vehicle: 'Tesla Model 3',     stationName: 'Tesla Supercharger - Centre Ville', city: 'Paris',      date: '2026-03-20', time: '14:30', duration: 45, cost: 23.54, energy: 52.3, status: 'ongoing'   },
  { id: 'R002', clientName: 'Lucas Bernard',  clientEmail: 'lucas.bernard@email.fr',  vehicle: 'Tesla Model Y',     stationName: 'Tesla Supercharger - La Défense',   city: 'La Défense', date: '2026-03-20', time: '09:15', duration: 38, cost: 23.38, energy: 48.7, status: 'completed' },
  { id: 'R003', clientName: 'Amina Dubois',   clientEmail: 'amina.dubois@email.fr',   vehicle: 'Tesla Model S',     stationName: 'Tesla Supercharger - Gare du Nord', city: 'Paris',      date: '2026-03-19', time: '18:45', duration: 52, cost: 25.70, energy: 61.2, status: 'completed' },
  { id: 'R004', clientName: 'Thomas Leroy',   clientEmail: 'thomas.leroy@email.fr',   vehicle: 'Tesla Model X',     stationName: 'Tesla Supercharger - Orly',         city: 'Orly',       date: '2026-03-19', time: '11:00', duration: 30, cost: 15.00, energy: 30.0, status: 'cancelled' },
  { id: 'R005', clientName: 'Julien Moreau',  clientEmail: 'julien.moreau@email.fr',  vehicle: 'Tesla Model 3',     stationName: 'Tesla Supercharger - Centre Ville', city: 'Paris',      date: '2026-03-18', time: '16:20', duration: 60, cost: 31.20, energy: 69.3, status: 'completed' },
  { id: 'R006', clientName: 'Camille Petit',  clientEmail: 'camille.petit@email.fr',  vehicle: 'Tesla Cybertruck',  stationName: 'Tesla Supercharger - La Défense',   city: 'La Défense', date: '2026-03-18', time: '08:00', duration: 40, cost: 19.20, energy: 40.0, status: 'completed' },
];

const statusConfig: Record<ReservationStatus, { label: string; variant: 'default' | 'secondary' | 'destructive'; icon: React.ElementType }> = {
  ongoing:   { label: 'En cours',  variant: 'default',     icon: Zap          },
  completed: { label: 'Terminée',  variant: 'secondary',   icon: CheckCircle2 },
  cancelled: { label: 'Annulée',   variant: 'destructive', icon: XCircle      },
};

export function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState<ReservationStatus | 'all'>('all');

  const filtered = reservations.filter(r => {
    const matchSearch =
      r.clientName.toLowerCase().includes(search.toLowerCase()) ||
      r.stationName.toLowerCase().includes(search.toLowerCase()) ||
      r.vehicle.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const cancelReservation = (id: string) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' as const } : r));
  };

  const total    = reservations.length;
  const ongoing  = reservations.filter(r => r.status === 'ongoing').length;
  const completed = reservations.filter(r => r.status === 'completed').length;
  const cancelled = reservations.filter(r => r.status === 'cancelled').length;
  const totalRevenue = reservations.filter(r => r.status !== 'cancelled').reduce((s, r) => s + r.cost, 0);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total réservations', value: total,          color: 'text-blue-600',   bg: 'bg-blue-50'   },
          { label: 'En cours',           value: ongoing,        color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Terminées',          value: completed,      color: 'text-slate-600',  bg: 'bg-slate-50'  },
          { label: 'Revenus générés',    value: `${totalRevenue.toFixed(2)}€`, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="pt-5">
              <p className="text-xs text-slate-500 mb-1">{kpi.label}</p>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input className="pl-9" placeholder="Client, station, véhicule…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 flex-wrap">
          {(['all', 'ongoing', 'completed', 'cancelled'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filterStatus === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {s === 'all' ? 'Toutes' : statusConfig[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="size-5" />Réservations ({filtered.length})</CardTitle>
          <CardDescription>Vue d'ensemble de toutes les réservations clients</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Véhicule</TableHead>
                <TableHead>Station</TableHead>
                <TableHead>Date & Heure</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Coût</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-10 text-slate-400">Aucune réservation trouvée</TableCell></TableRow>
              ) : filtered.map(r => {
                const sc = statusConfig[r.status];
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-slate-400 shrink-0" />
                        <div>
                          <div className="font-medium text-sm">{r.clientName}</div>
                          <div className="text-xs text-slate-400">{r.clientEmail}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{r.vehicle}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="size-3 text-slate-400 shrink-0" />
                        <div>
                          <div>{r.stationName.replace('Tesla Supercharger - ', '')}</div>
                          <div className="text-xs text-slate-400">{r.city}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="size-3 text-slate-400" />
                        {new Date(r.date).toLocaleDateString('fr-FR')}
                        <Clock className="size-3 text-slate-400 ml-1" />
                        {r.time}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{r.duration} min</TableCell>
                    <TableCell className="text-sm font-semibold">{r.cost.toFixed(2)}€</TableCell>
                    <TableCell>
                      <Badge variant={sc.variant} className={r.status === 'ongoing' ? 'bg-emerald-600' : ''}>
                        <sc.icon className="size-3 mr-1" />
                        {sc.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {r.status === 'ongoing' && (
                        <Button variant="ghost" size="sm" onClick={() => cancelReservation(r.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <XCircle className="size-4 mr-1" />Annuler
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
