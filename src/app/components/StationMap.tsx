import { Card } from './ui/card';
import { MapPin } from 'lucide-react';
import { ChargingStation } from './FrontOffice';

interface StationMapProps {
  stations: ChargingStation[];
  selectedStation: ChargingStation | null;
  userLocation?: { lat: number; lng: number } | null;
}

export function StationMap({ stations, selectedStation, userLocation }: StationMapProps) {
  const lat = selectedStation ? selectedStation.lat : userLocation ? userLocation.lat : 33.8869;
const lng = selectedStation ? selectedStation.lng : userLocation ? userLocation.lng : 9.5375;
const zoom = userLocation ? 12 : selectedStation ? 14 : 6;

  const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;

  return (
    <Card className="h-[600px] relative overflow-hidden">
      <iframe
        key={`${lat}-${lng}-${zoom}`}
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        title="Station Map"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-md space-y-2 z-10">
        <div className="text-xs font-semibold mb-2">Légende</div>
        <div className="flex items-center gap-2 text-xs">
          <MapPin className="size-4 text-green-600 fill-green-100" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <MapPin className="size-4 text-orange-600 fill-orange-100" />
          <span>Occupé</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <MapPin className="size-4 text-red-600 fill-red-100" />
          <span>Maintenance</span>
        </div>
        {userLocation && (
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-blue-600 border border-white shadow" />
            <span>Vous</span>
          </div>
        )}
      </div>

      {/* User location badge */}
      {userLocation && (
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-md z-10 text-xs font-medium flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          Votre position
        </div>
      )}

      {/* Selected station info */}
      {selectedStation && (
        <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md z-10 max-w-xs">
          <p className="text-sm font-semibold">{selectedStation.name}</p>
          <p className="text-xs text-slate-500">{selectedStation.address}, {selectedStation.city}</p>
          <p className="text-xs mt-1">
            🔌 {selectedStation.availablePorts}/{selectedStation.totalPorts} ports &nbsp;·&nbsp;
            ⚡ {selectedStation.powerOutput} &nbsp;·&nbsp;
            💶 {selectedStation.pricePerKwh}€/kWh
          </p>
        </div>
      )}
    </Card>
  );
}