import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { MapPin, Navigation, Battery, Clock, DollarSign, Zap, Bot } from 'lucide-react';
import type { ChargingStation } from './FrontOffice';
import { QRCodeSVG } from 'qrcode.react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { createSession } from '../../lib/api';

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: () => void;
  station: ChargingStation;
  onConfirm: (bookingData: BookingData) => void;
}

export interface BookingData {
  id: string;
  stationId: string;
  stationName: string;
  departureLocation: string;
  arrivalLocation: string;
  currentBattery: number;
  targetBattery: number;
  estimatedTime: number;
  estimatedDuration: number;
  energyNeeded: number;
  pricePerKwh: number;
  totalCost: number;
  startTime: Date;
}

export function BookingDialog({ isOpen, onClose, onFinish, station, onConfirm }: BookingDialogProps) {
  const [departureLocation, setDepartureLocation] = useState('Ma position actuelle');
  const [showQR, setShowQR] = useState(false);
  const [showSmartRec, setShowSmartRec] = useState(true);

  const [currentBattery] = useState(42);
  const targetBattery = 75;
  const batteryCapacity = 75;
  const energyNeeded = ((targetBattery - currentBattery) / 100) * batteryCapacity;
  const estimatedTime = Math.ceil((energyNeeded / 250) * 60);
  const totalCost = energyNeeded * station.pricePerKwh;

  const currentHour = new Date().getHours();
  const isOffPeak = currentHour >= 22 || currentHour < 6;
  const isPeak = currentHour >= 17 && currentHour <= 19;
  const offPeakPrice = station.pricePerKwh * 0.7;
  const peakPrice = station.pricePerKwh * 1.2;
  const effectivePrice = isPeak ? peakPrice : isOffPeak ? offPeakPrice : station.pricePerKwh;
  const savings = isOffPeak ? 0 : (station.pricePerKwh - offPeakPrice) * energyNeeded;
  const hoursUntilOffPeak = currentHour >= 22 ? 0 : 22 - currentHour;
  const co2Saved = (energyNeeded * 0.4).toFixed(1);
  const treesEquiv = (energyNeeded * 0.4 / 21).toFixed(2);

  const smartRecommendation = isOffPeak
    ? { type: 'now', message: `✅ Parfait timing ! Vous êtes en heures creuses. Prix: ${offPeakPrice.toFixed(2)}€/kWh — économisez 30% maintenant !`, color: 'green' }
    : isPeak
    ? { type: 'wait', message: `⚠️ Heure de pointe ! Prix majoré: ${peakPrice.toFixed(2)}€/kWh. Attendez ${hoursUntilOffPeak}h → ${offPeakPrice.toFixed(2)}€/kWh et économisez ${savings.toFixed(2)}€.`, color: 'orange' }
    : savings > 1
    ? { type: 'suggest', message: `💡 En attendant 22h00, vous paierez ${offPeakPrice.toFixed(2)}€/kWh au lieu de ${station.pricePerKwh.toFixed(2)}€/kWh. Économie estimée: ${savings.toFixed(2)}€.`, color: 'blue' }
    : { type: 'now', message: `✅ Bon moment pour recharger. Prix normal: ${station.pricePerKwh.toFixed(2)}€/kWh.`, color: 'green' };

  const qrValue = JSON.stringify({
    bookingId: Date.now().toString(),
    stationId: station.id,
    stationName: station.name,
    cost: totalCost.toFixed(2),
    energy: energyNeeded.toFixed(1),
    time: new Date().toISOString(),
  });

  const handleConfirm = async () => {
    const bookingData: BookingData = {
      id: Date.now().toString(),
      stationId: station.id,
      stationName: station.name,
      departureLocation,
      arrivalLocation: station.address,
      currentBattery,
      targetBattery,
      estimatedTime,
      estimatedDuration: estimatedTime,
      energyNeeded,
      pricePerKwh: station.pricePerKwh,
      totalCost,
      startTime: new Date(),
    };

    try {
      await createSession({
        userId: 'cmokmn4t20000hpot100ko4sn',
        stationId: station.id,
        batteryStart: currentBattery,
        batteryEnd: targetBattery,
        energyKwh: energyNeeded,
        durationMin: estimatedTime,
        cost: totalCost,
      });
    } catch (e) {
      console.error('Session save error:', e);
    }

    onConfirm(bookingData);
    setShowQR(true);
  };

  const handleClose = () => {
    setShowQR(false);
    setShowSmartRec(true);
    onClose();
  };

  const handleTerminer = () => {
    setShowQR(false);
    setShowSmartRec(true);
    onFinish();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {/*
        MOBILE FIX: DialogContent sizing strategy per screen:
        - QR screen: fixed max height with internal scroll so "Terminer" is always reachable
        - Other screens: unchanged (max-w-lg, 80vh scroll)
        - w-[calc(100vw-2rem)] prevents overflow on ~390px Android screens
      */}
      <DialogContent
        className={
          showQR
            ? 'w-[calc(100vw-2rem)] max-w-md p-0 gap-0 max-h-[92vh] flex flex-col overflow-hidden'
            : 'w-[calc(100vw-2rem)] max-w-lg max-h-[85vh] overflow-y-auto'
        }
      >

        {/* ── QR CODE SCREEN ─────────────────────────────────────────────── */}
        {showQR ? (
          /*
            MOBILE FIX: The QR screen is split into two zones:
            1. A scrollable middle section (flex-1 overflow-y-auto) with the QR + details
            2. A sticky bottom button that is ALWAYS visible regardless of scroll position

            This guarantees "Terminer" is never pushed off-screen on small phones.
          */
          <>
            {/* Scrollable content zone */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
              <div className="flex flex-col items-center gap-3 sm:gap-5">

                {/* Success icon — smaller on mobile */}
                <div className="flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-green-100 shrink-0">
                  <svg className="w-5 h-5 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                {/* Title — tighter on mobile */}
                <div className="text-center">
                  <h2 className="text-base sm:text-xl font-bold text-[#171a20]">Réservation confirmée !</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
                    Scannez ce QR code à la borne pour démarrer votre recharge
                  </p>
                </div>

                {/*
                  MOBILE FIX: QR size reduced from 200px to 150px on mobile.
                  Still fully scannable at 150px (QR codes are readable down to ~100px).
                  sm:size restores 200px on larger screens.
                */}
                <div className="p-3 sm:p-4 bg-white border-2 border-[#171a20] rounded-2xl shadow-lg shrink-0">
                  <QRCodeSVG
                    value={qrValue}
                    size={150}
                    bgColor="#ffffff"
                    fgColor="#171a20"
                    level="H"
                    includeMargin={false}
                    className="sm:hidden"
                  />
                  <QRCodeSVG
                    value={qrValue}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#171a20"
                    level="H"
                    includeMargin={true}
                    className="hidden sm:block"
                  />
                </div>

                {/* Eco badge — tighter padding on mobile */}
                <div className="w-full bg-green-50 border border-green-200 rounded-xl p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl shrink-0">🌱</span>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-green-800">Impact écologique</p>
                    <p className="text-[11px] sm:text-xs text-green-600">{co2Saved} kg CO2 économisés • {treesEquiv} arbres plantés 🌳</p>
                  </div>
                </div>

                {/* Booking summary — compact rows on mobile */}
                <div className="w-full bg-slate-50 rounded-xl p-3 sm:p-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Station</span>
                    <span className="font-medium text-slate-900 text-right max-w-[55%] truncate">{station.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Énergie</span>
                    <span className="font-medium text-slate-900">{energyNeeded.toFixed(1)} kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Durée estimée</span>
                    <span className="font-medium text-slate-900">{estimatedTime} min</span>
                  </div>
                  <div className="flex justify-between border-t pt-1.5 sm:pt-2 mt-1.5 sm:mt-2">
                    <span className="text-slate-500 font-semibold">Total</span>
                    <span className="font-bold text-[#171a20]">{totalCost.toFixed(2)} €</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 text-center pb-1">Ce QR code est valable 30 minutes.</p>
              </div>
            </div>

            {/*
              MOBILE FIX: "Terminer" button is OUTSIDE the scroll area — sticky at the bottom.
              Uses border-t + bg-white + safe padding so it's always tappable on any phone height.
              This is the key fix: previously the button was inside the flex column and got
              pushed below the fold on ~740px viewport-height Android devices.
            */}
            <div className="shrink-0 px-4 py-3 sm:py-4 border-t border-slate-100 bg-white">
              <button
                onClick={handleTerminer}
                className="w-full py-3 rounded-xl bg-[#171a20] text-white text-sm font-semibold hover:bg-slate-700 active:bg-slate-800 transition-colors"
              >
                Terminer → Voir ma recharge en cours
              </button>
            </div>
          </>

        ) : showSmartRec ? (
          /* ── SMART CHARGING SCREEN — unchanged ───────────────────────── */
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bot className="size-5 text-[#171a20]" />
                Eco-Advisor — Recommandation intelligente
              </DialogTitle>
              <DialogDescription>
                Analyse des prix en temps réel pour optimiser votre recharge
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-[#f4f4f4] rounded-xl">
                <Battery className="size-5 text-[#171a20]" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Données Teslascope — Tesla Model 3</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold">{currentBattery}%</span>
                    <Progress value={currentBattery} className="h-2 flex-1" />
                    <span className="text-sm font-bold text-green-600">{targetBattery}%</span>
                  </div>
                </div>
              </div>
              <div className={`p-4 rounded-xl border-2 ${
                smartRecommendation.color === 'green' ? 'bg-green-50 border-green-200' :
                smartRecommendation.color === 'orange' ? 'bg-orange-50 border-orange-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <p className="text-sm font-medium">{smartRecommendation.message}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className={`p-3 rounded-xl border ${isPeak ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-xs text-slate-500">Maintenant</p>
                  <p className="text-sm font-bold">{effectivePrice.toFixed(2)}€/kWh</p>
                  {isPeak && <p className="text-[10px] text-red-500">Heure de pointe</p>}
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500">Normal</p>
                  <p className="text-sm font-bold">{station.pricePerKwh.toFixed(2)}€/kWh</p>
                  <p className="text-[10px] text-slate-400">06h - 22h</p>
                </div>
                <div className="p-3 rounded-xl bg-green-50 border border-green-200">
                  <p className="text-xs text-slate-500">Heures creuses</p>
                  <p className="text-sm font-bold text-green-700">{offPeakPrice.toFixed(2)}€/kWh</p>
                  <p className="text-[10px] text-green-600">22h - 06h</p>
                </div>
              </div>
              {savings > 0.5 && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-lg">💰</span>
                  <p className="text-sm font-semibold text-emerald-700">
                    Économie possible: {savings.toFixed(2)}€ en attendant 22h00
                  </p>
                </div>
              )}
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl">
                <span className="text-lg">🌱</span>
                <p className="text-xs text-green-700">
                  Cette recharge économisera <strong>{co2Saved} kg de CO2</strong> — équivalent à <strong>{treesEquiv} arbres plantés</strong>
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowSmartRec(false)} className="flex-1">
                  ⚡ Recharger maintenant
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowSmartRec(false)}>
                  ⏰ Programmer à 22h00
                </Button>
              </div>
            </div>
          </>

        ) : (
          /* ── BOOKING FORM — unchanged ────────────────────────────────── */
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="size-5 text-[#171a20]" />
                Confirmer la réservation
              </DialogTitle>
              <DialogDescription>Vérifiez les détails de votre session de recharge</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="bg-[#f4f4f4] rounded p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Navigation className="size-5 text-[#171a20] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#5c5e62]">Départ</p>
                    <div className="mt-2">
                      <Label htmlFor="departure" className="sr-only">Point de départ</Label>
                      <Input id="departure" value={departureLocation} onChange={e => setDepartureLocation(e.target.value)} className="bg-white" />
                    </div>
                  </div>
                </div>
                <div className="border-l-2 border-[#e8e8e8] ml-2.5 h-6" />
                <div className="flex items-start gap-3">
                  <MapPin className="size-5 text-[#e82127] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#5c5e62]">Arrivée</p>
                    <p className="font-semibold">{station.name}</p>
                    <p className="text-sm text-[#5c5e62]">{station.address}, {station.city}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Battery className="size-5 text-[#171a20]" />
                    <span className="font-medium">Niveau de Batterie</span>
                  </div>
                  <Badge variant="secondary">{currentBattery}% → {targetBattery}%</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5c5e62]">Actuel</span>
                    <span className="font-semibold">{currentBattery}%</span>
                  </div>
                  <Progress value={currentBattery} className="h-3" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5c5e62]">Après recharge</span>
                    <span className="font-semibold">{targetBattery}%</span>
                  </div>
                  <Progress value={targetBattery} className="h-3" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[#5c5e62]">
                    <Clock className="size-4" /><span className="text-sm">Temps estimé</span>
                  </div>
                  <p className="text-2xl font-semibold">{estimatedTime} min</p>
                  <p className="text-xs text-[#5c5e62]">À {station.powerOutput}</p>
                </div>
                <div className="border rounded p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[#5c5e62]">
                    <Zap className="size-4" /><span className="text-sm">Énergie nécessaire</span>
                  </div>
                  <p className="text-2xl font-semibold">{energyNeeded.toFixed(1)} kWh</p>
                  <p className="text-xs text-[#5c5e62]">Capacité: {batteryCapacity} kWh</p>
                </div>
              </div>
              <div className="bg-[#f4f4f4] rounded p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#5c5e62]">Prix par kWh</span>
                  <span className="font-semibold">{station.pricePerKwh}€</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5c5e62]">Énergie ({energyNeeded.toFixed(1)} kWh)</span>
                  <span className="font-semibold">{totalCost.toFixed(2)}€</span>
                </div>
                <div className="border-t border-[#e8e8e8] pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="size-5 text-[#171a20]" />
                    <span className="font-semibold text-lg">Total à payer</span>
                  </div>
                  <span className="text-2xl font-bold text-[#e82127]">{totalCost.toFixed(2)}€</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl">
                <span className="text-lg">🌱</span>
                <p className="text-xs text-green-700">
                  Cette recharge économisera <strong>{co2Saved} kg de CO2</strong> — équivalent à <strong>{treesEquiv} arbres plantés</strong> 🌳
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleClose} className="flex-1">Annuler</Button>
                <Button onClick={handleConfirm} className="flex-1 bg-[#171a20] hover:bg-[#171a20]/90">
                  Confirmer la réservation
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
