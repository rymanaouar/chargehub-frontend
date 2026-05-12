import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { MapPin, Search, Battery, DollarSign, Star, Navigation, Calendar, Loader2 } from 'lucide-react';
import { StationMap } from './StationMap';
import { BookingHistory } from './BookingHistory';
import { UserProfile } from './UserProfile';
import { VehicleVerification } from './VehicleVerification';
import { BookingDialog, type BookingData } from './BookingDialog';
import { EcoAdvisor } from './EcoAdvisor';
import { getStations, createBooking } from '../../lib/api';

export interface ChargingStation {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  availablePorts: number;
  totalPorts: number;
  pricePerKwh: number;
  powerOutput: string;
  rating: number;
  distance: number;
  amenities: string[];
  status: 'available' | 'busy' | 'maintenance';
}

export function FrontOffice() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [stationToBook, setStationToBook] = useState<ChargingStation | null>(null);
  const [activeBookings, setActiveBookings] = useState<BookingData[]>([]);
  const [locating, setLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activeTab, setActiveTab] = useState('stations');
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const data = await getStations();
        if (Array.isArray(data)) {
          setStations(data);
        } else if (data && data.data) {
          setStations(data.data);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des stations:', err);
        setError('Impossible de charger les stations.');
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocating(false);
      },
      () => {
        alert("Impossible d'obtenir votre position.");
        setLocating(false);
      }
    );
  };

  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const handleBookStation = (station: ChargingStation) => {
    setStationToBook(station);
    setBookingDialogOpen(true);
  };

  const handleConfirmBooking = async (bookingData: BookingData) => {
    try {
      await createBooking({
        userId: 'test-keycloak-id-001',
        stationId: bookingData.stationId,
        startTime: bookingData.startTime,
        endTime: new Date(bookingData.startTime.getTime() + bookingData.estimatedTime * 60000),
        estimatedEnergy: bookingData.energyNeeded,
        totalCost: bookingData.totalCost,
        status: 'pending',
      });
    } catch (err) {
      console.error('Erreur booking:', err);
    }
    setActiveBookings(prev => [bookingData, ...prev]);
  };

  const handleFinishBooking = () => {
    setBookingDialogOpen(false);
    setActiveTab('history');
  };

  const filteredStations = stations
    .filter(
      station =>
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.address.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(station => ({
      ...station,
      distance: userLocation
        ? Math.round(getDistance(userLocation.lat, userLocation.lng, station.lat, station.lng) * 10) / 10
        : station.distance,
    }))
    .sort((a, b) => (userLocation ? a.distance - b.distance : 0));

  if (!isVerified) {
    return <VehicleVerification onVerificationComplete={() => setIsVerified(true)} />;
  }

  return (
    // MOBILE FIX: overflow-x-hidden prevents horizontal scroll caused by
    // child elements (modals, fixed panels) overflowing the viewport width
    <div className="p-3 sm:p-4 lg:p-6 xl:p-8 overflow-x-hidden w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        {/* MOBILE FIX: TabsList was using max-w-md which can overflow on very small screens.
            w-full ensures it never exceeds the container. grid-cols-3 is kept for desktop. */}
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="stations">Stations</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="profile">Profil</TabsTrigger>
        </TabsList>

        <TabsContent value="stations" className="space-y-4 sm:space-y-6">
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              {/* MOBILE FIX: On very small screens the search + button row would overflow.
                  flex-wrap allows the button to wrap below the input on tiny screens. */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <div className="relative flex-1 min-w-0">
                  {/* min-w-0 prevents the input from overflowing its flex container */}
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    placeholder="Rechercher une station..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
                {/* MOBILE FIX: shrink-0 prevents button from being squeezed below readable size */}
                <Button onClick={handleNearMe} disabled={locating} className="shrink-0">
                  <Navigation className="size-4 mr-2" />
                  {locating ? 'Localisation...' : 'Près de moi'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="size-8 animate-spin text-red-500" />
              <p className="text-slate-500">Chargement des stations...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-500">{error}</div>
          ) : (
            // MOBILE FIX: On mobile (default), stack station list and map vertically.
            // lg:grid-cols-3 kicks in only on large screens, preserving desktop layout.
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Station list column */}
              <div className="lg:col-span-1 space-y-3 sm:space-y-4">
                <h2 className="font-semibold text-base sm:text-lg">
                  {userLocation ? 'Stations les plus proches' : 'Stations disponibles'} ({filteredStations.length})
                </h2>
                {/* MOBILE FIX: On mobile, limit list height less aggressively so it doesn't
                    consume the entire viewport. On desktop, keep max-h-[600px] as before. */}
                <div className="space-y-3 max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] overflow-y-auto pr-1 sm:pr-2">
                  {filteredStations.length === 0 ? (
                    <p className="text-slate-500 text-center py-10">Aucune station trouvée.</p>
                  ) : (
                    filteredStations.map(station => (
                      <Card
                        key={station.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedStation?.id === station.id ? 'ring-2 ring-red-500' : ''
                        }`}
                        onClick={() => setSelectedStation(station)}
                      >
                        <CardHeader className="pb-2 sm:pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              {/* MOBILE FIX: truncate prevents long station names from
                                  pushing the badge off-screen */}
                              <CardTitle className="text-sm sm:text-base truncate">{station.name}</CardTitle>
                              <CardDescription className="text-xs mt-1">
                                <MapPin className="size-3 inline mr-1" />
                                {station.city} • {station.distance} km
                                {userLocation && (
                                  <span className="ml-1 text-blue-600 font-medium">(de vous)</span>
                                )}
                              </CardDescription>
                            </div>
                            <Badge
                              variant={
                                station.status === 'available'
                                  ? 'default'
                                  : station.status === 'busy'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                              className="shrink-0 text-xs"
                            >
                              {station.status === 'available'
                                ? 'Disponible'
                                : station.status === 'busy'
                                ? 'Occupé'
                                : 'Maintenance'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 flex items-center gap-1">
                              <Battery className="size-4" />Ports
                            </span>
                            <span className="font-semibold">{station.availablePorts}/{station.totalPorts}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 flex items-center gap-1">
                              <DollarSign className="size-4" />Prix
                            </span>
                            <span className="font-semibold">{station.pricePerKwh}€/kWh</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 flex items-center gap-1">
                              <Star className="size-4 fill-yellow-400 text-yellow-400" />Note
                            </span>
                            <span className="font-semibold">{station.rating}/5</span>
                          </div>
                          {station.status === 'available' && (
                            <Button
                              className="w-full mt-2"
                              size="sm"
                              onClick={e => {
                                e.stopPropagation();
                                handleBookStation(station);
                              }}
                            >
                              <Calendar className="size-4 mr-2" />
                              Réserver
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Map column — on mobile takes full width, on desktop 2/3 */}
              <div className="lg:col-span-2">
                {/* MOBILE FIX: Constrain map height on mobile to avoid taking full screen */}
                <div className="h-[300px] sm:h-[400px] lg:h-full">
                  <StationMap
                    stations={filteredStations}
                    selectedStation={selectedStation}
                    userLocation={userLocation}
                  />
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <BookingHistory newBookings={activeBookings} />
        </TabsContent>

        <TabsContent value="profile">
          <UserProfile />
        </TabsContent>
      </Tabs>

      {/* MOBILE FIX: BookingDialog is rendered at root level — ensure the dialog itself
          uses mobile-safe classes (see note below about dialog wrapper requirements) */}
      {bookingDialogOpen && stationToBook && (
        <BookingDialog
          isOpen={bookingDialogOpen}
          onClose={() => setBookingDialogOpen(false)}
          onFinish={handleFinishBooking}
          station={stationToBook}
          onConfirm={handleConfirmBooking}
        />
      )}

      {/* EcoAdvisor — see App.tsx note: its container must be mobile-safe */}
      <EcoAdvisor />
    </div>
  );
}
