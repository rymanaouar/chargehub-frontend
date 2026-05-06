import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Battery, Calendar, Clock, DollarSign, MapPin, Zap, CheckCircle2, X } from 'lucide-react';
import type { BookingData } from './BookingDialog';
import { getSessions } from '../../lib/api';

interface Booking {
  id: string;
  stationName: string;
  date: string;
  time: string;
  duration: number;
  energyCharged: number;
  cost: number;
  status: 'completed' | 'ongoing' | 'cancelled';
  currentBattery?: number;
  targetBattery?: number;
  startTime?: Date;
  estimatedDuration?: number;
}

interface BookingHistoryProps {
  newBookings?: BookingData[];
}

export function BookingHistory({ newBookings = [] }: BookingHistoryProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // ✅ À l'intérieur de la fonction — données réelles depuis la DB
  const [dbBookings, setDbBookings] = useState<Booking[]>([]);

  useEffect(() => {
    getSessions('cmokmn4t20000hpot100ko4sn')
      .then(sessions => {
        const mapped: Booking[] = sessions.map((s: any) => ({
          id: s.id,
          stationName: s.station?.name || s.stationId,
          date: new Date(s.createdAt).toISOString().split('T')[0],
          time: new Date(s.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          duration: s.durationMin,
          energyCharged: s.energyKwh,
          cost: s.cost,
          status: 'completed' as const,
        }));
        setDbBookings(mapped);
      })
      .catch(console.error);
  }, []);

  // Merge DB bookings with any new ones from FrontOffice
  const allBookings: Booking[] = [
    ...newBookings.map((b): Booking => ({
      id: b.id,
      stationName: b.stationName,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      duration: 0,
      energyCharged: 0,
      cost: b.totalCost,
      status: 'ongoing',
      currentBattery: b.currentBattery,
      targetBattery: b.targetBattery,
      startTime: b.startTime instanceof Date ? b.startTime : new Date(b.startTime),
      estimatedDuration: b.estimatedDuration ?? b.estimatedTime,
    })),
    ...dbBookings,
  ];

  const [toasts, setToasts] = useState<{ id: string; stationName: string; energy: number; cost: number; type: 'complete' | 'threshold80' | 'threshold50' | 'lowbattery' }[]>([]);
  const notifiedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fire toast when session hits 100%
  useEffect(() => {
    allBookings.forEach(booking => {
      if (booking.status !== 'ongoing' || notifiedIds.current.has(booking.id)) return;
      if (!booking.startTime || !booking.estimatedDuration) return;
      const elapsed = (currentTime.getTime() - booking.startTime.getTime()) / 1000 / 60;
      const progress = Math.min((elapsed / booking.estimatedDuration) * 100, 100);

      if (progress >= 100) {
        notifiedIds.current.add(booking.id);
        const energy = ((booking.targetBattery ?? 75) - (booking.currentBattery ?? 42)) * 0.75;
        setToasts(prev => [...prev, { id: booking.id, stationName: booking.stationName, energy, cost: booking.cost, type: 'complete' }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== booking.id)), 8000);
      }

      // Alert at 50% battery
      const battLevel50 = `${booking.id}-50`;
      if (!notifiedIds.current.has(battLevel50)) {
        const currentBatt = (booking.currentBattery ?? 42) + (((booking.targetBattery ?? 75) - (booking.currentBattery ?? 42)) * progress / 100);
        if (currentBatt >= 50) {
          notifiedIds.current.add(battLevel50);
          setToasts(prev => [...prev, { id: battLevel50, stationName: booking.stationName, energy: 0, cost: 0, type: 'threshold50' }]);
          setTimeout(() => setToasts(prev => prev.filter(t => t.id !== battLevel50)), 6000);
        }
      }

      // Alert at 80% battery
      const battLevel80 = `${booking.id}-80`;
      if (!notifiedIds.current.has(battLevel80)) {
        const currentBatt = (booking.currentBattery ?? 42) + (((booking.targetBattery ?? 75) - (booking.currentBattery ?? 42)) * progress / 100);
        if (currentBatt >= 80) {
          notifiedIds.current.add(battLevel80);
          setToasts(prev => [...prev, { id: battLevel80, stationName: booking.stationName, energy: 0, cost: 0, type: 'threshold80' }]);
          setTimeout(() => setToasts(prev => prev.filter(t => t.id !== battLevel80)), 6000);
        }
      }
    });
  }, [currentTime]);

  const dismissToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const calculateProgress = (booking: Booking) => {
    if (booking.status !== 'ongoing' || !booking.startTime || !booking.estimatedDuration) return 0;
    const elapsed = (currentTime.getTime() - booking.startTime.getTime()) / 1000 / 60;
    return Math.min((elapsed / booking.estimatedDuration) * 100, 100);
  };

  const calculateBatteryLevel = (booking: Booking) => {
    if (booking.status !== 'ongoing' || !booking.currentBattery || !booking.targetBattery) return booking.currentBattery || 0;
    const progress = calculateProgress(booking);
    return booking.currentBattery + ((booking.targetBattery - booking.currentBattery) * progress / 100);
  };

  const getElapsedTime  = (b: Booking) => !b.startTime ? 0 : Math.floor((currentTime.getTime() - b.startTime.getTime()) / 60000);
  const getRemainingTime = (b: Booking) => !b.estimatedDuration ? 0 : Math.max(b.estimatedDuration - getElapsedTime(b), 0);

  const totalEnergy   = allBookings.reduce((s, b) => s + b.energyCharged, 0);
  const totalCost     = allBookings.reduce((s, b) => s + b.cost, 0);
  const totalDuration = allBookings.reduce((s, b) => s + b.duration, 0);

  return (
    <div className="space-y-6">

      {/* Completion toast notifications */}
      {toasts.length > 0 && (
        <div className="fixed top-6 right-6 z-50 space-y-3 w-80">
          {toasts.map(toast => (
            <div key={toast.id} className={`flex items-start gap-3 bg-white rounded-2xl shadow-2xl p-4 border-2 ${
              toast.type === 'complete'     ? 'border-emerald-500' :
              toast.type === 'threshold80'  ? 'border-orange-400' :
              'border-blue-400'
            }`}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${
                toast.type === 'complete'    ? 'bg-emerald-100' :
                toast.type === 'threshold80' ? 'bg-orange-100' :
                'bg-blue-100'
              }`}>
                {toast.type === 'complete'
                  ? <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  : <Battery className="w-6 h-6 text-orange-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm">
                  {toast.type === 'complete'    && 'Recharge terminée !'}
                  {toast.type === 'threshold50' && '🔋 Batterie à 50%'}
                  {toast.type === 'threshold80' && '⚡ Batterie à 80% — bientôt terminé !'}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{toast.stationName}</p>
                {toast.type === 'complete' && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{toast.energy.toFixed(1)} kWh chargés</span>
                    <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">{toast.cost.toFixed(2)} €</span>
                  </div>
                )}
              </div>
              <button onClick={() => dismissToast(toast.id)} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0 mt-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Énergie Totale Chargée</CardDescription>
            <CardTitle className="text-3xl">{totalEnergy.toFixed(1)} kWh</CardTitle>
          </CardHeader>
          <CardContent><Battery className="size-8 text-green-600" /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Coût Total</CardDescription>
            <CardTitle className="text-3xl">{totalCost.toFixed(2)} €</CardTitle>
          </CardHeader>
          <CardContent><DollarSign className="size-8 text-blue-600" /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Temps de Charge Total</CardDescription>
            <CardTitle className="text-3xl">{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</CardTitle>
          </CardHeader>
          <CardContent><Clock className="size-8 text-purple-600" /></CardContent>
        </Card>
      </div>

      {/* Ongoing sessions */}
      {allBookings.some(b => b.status === 'ongoing') && (
        <Card className="border-2 border-[#e82127]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="size-5 text-[#e82127]" />
              Recharge en cours
            </CardTitle>
            <CardDescription>Suivi en temps réel de votre session de recharge</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {allBookings.filter(b => b.status === 'ongoing').map(booking => {
              const progress       = calculateProgress(booking);
              const currentBattery = calculateBatteryLevel(booking);
              const elapsed        = getElapsedTime(booking);
              const remaining      = getRemainingTime(booking);
              return (
                <div key={booking.id} className="space-y-4 p-4 bg-[#f4f4f4] rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{booking.stationName}</h4>
                      <p className="text-sm text-[#5c5e62]">Session démarrée à {booking.time}</p>
                    </div>
                    <Badge className="bg-[#e82127]">En cours</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2"><Battery className="size-4" />Niveau de batterie</span>
                      <span className="text-lg font-bold">{currentBattery.toFixed(1)}%</span>
                    </div>
                    <Progress value={currentBattery} className="h-3" />
                    <p className="text-xs text-[#5c5e62]">Objectif: {booking.targetBattery}%</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#5c5e62]">Progression</span>
                      <span className="font-semibold">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#e8e8e8]">
                    <div><p className="text-xs text-[#5c5e62]">Temps écoulé</p><p className="text-lg font-semibold">{elapsed} min</p></div>
                    <div><p className="text-xs text-[#5c5e62]">Temps restant</p><p className="text-lg font-semibold text-[#e82127]">~{remaining} min</p></div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* History table */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Charges</CardTitle>
          <CardDescription>Consultez l'historique de vos sessions de recharge</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Station</TableHead>
                <TableHead>Date & Heure</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Énergie</TableHead>
                <TableHead>Coût</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allBookings.map(booking => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-start gap-2">
                      <MapPin className="size-4 text-slate-400 mt-0.5 shrink-0" />
                      <span className="text-sm">{booking.stationName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="size-4 text-slate-400" />
                      {new Date(booking.date).toLocaleDateString('fr-FR')}
                      <Clock className="size-4 text-slate-400 ml-2" />
                      {booking.time}
                    </div>
                  </TableCell>
                  <TableCell>
                    {booking.status === 'ongoing'
                      ? <span className="text-sm font-semibold text-[#e82127]">{getElapsedTime(booking)} / {booking.estimatedDuration} min</span>
                      : <span className="text-sm">{booking.duration} min</span>}
                  </TableCell>
                  <TableCell>
                    {booking.status === 'ongoing'
                      ? <span className="text-sm font-semibold text-[#e82127]">{((calculateBatteryLevel(booking) - (booking.currentBattery || 0)) * 0.75).toFixed(1)} kWh</span>
                      : <span className="text-sm">{booking.energyCharged.toFixed(1)} kWh</span>}
                  </TableCell>
                  <TableCell><span className="text-sm font-semibold">{booking.cost.toFixed(2)} €</span></TableCell>
                  <TableCell>
                    <Badge
                      variant={booking.status === 'completed' ? 'default' : booking.status === 'ongoing' ? 'secondary' : 'destructive'}
                      className={booking.status === 'ongoing' ? 'bg-[#e82127]' : ''}
                    >
                      {booking.status === 'completed' ? 'Terminé' : booking.status === 'ongoing' ? 'En cours' : 'Annulé'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}