import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Thermometer, Zap, Wifi, WifiOff, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';

const temperatureData = [
  { time: '00:00', temp: 22 },
  { time: '04:00', temp: 20 },
  { time: '08:00', temp: 28 },
  { time: '12:00', temp: 35 },
  { time: '16:00', temp: 38 },
  { time: '20:00', temp: 32 },
];

interface ChargerData {
  id: string;
  station: string;
  power: number;
  temp: number;
  voltage: number;
  current: number;
  status: 'idle' | 'charging' | 'maintenance';
}

interface DataPoint {
  time: string;
  [key: string]: number | string;
}

const chargerColors = ['#22c55e', '#3b82f6', '#f97316', '#a855f7'];

export function IoTMonitoring() {
  const [chargers, setChargers] = useState<ChargerData[]>([]);
  const [history, setHistory] = useState<DataPoint[]>([]);
  const [connected, setConnected] = useState(false);
  const [selectedCharger, setSelectedCharger] = useState<string>('SC-001');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connect = () => {
      try {
        const ws = new WebSocket('ws://localhost:8765');
        wsRef.current = ws;

        ws.onopen = () => {
          setConnected(true);
          console.log('✅ Connected to Digital Twin');
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setChargers([...data.chargers]);

          const time = new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
          });

          const point: DataPoint = { time };
          data.chargers.forEach((c: ChargerData) => {
            point[c.id] = c.power;
          });

          setHistory(prev => {
            const updated = [...prev, point];
            return updated.slice(-30);
          });
        };

        ws.onclose = () => {
          setConnected(false);
          setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          setConnected(false);
          ws.close();
        };

      } catch (err) {
        setConnected(false);
      }
    };

    setTimeout(connect, 500);
    return () => wsRef.current?.close();
  }, []);

  const getStatusColor = (status: string) => {
    if (status === 'charging') return 'bg-green-500';
    if (status === 'maintenance') return 'bg-red-500';
    return 'bg-slate-400';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'charging') return 'En charge';
    if (status === 'maintenance') return 'Maintenance';
    return 'Inactif';
  };

  const totalPower = chargers.reduce((sum, c) => sum + c.power, 0);
  const avgTemp = chargers.length > 0
    ? Math.round(chargers.reduce((sum, c) => sum + c.temp, 0) / chargers.length)
    : 0;
  const activeCount = chargers.filter(c => c.status === 'charging').length;
  const alertCount = chargers.filter(c => c.status === 'maintenance' || c.temp > 40).length;

  return (
    <div className="space-y-6">

      {/* Connection status */}
      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium w-fit ${
        connected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
      }`}>
        {connected
          ? <><Wifi className="w-4 h-4" /> Jumeau Numérique connecté — données en temps réel</>
          : <><WifiOff className="w-4 h-4" /> Déconnecté — lancez le simulateur IoT</>
        }
      </div>

      {/* Live Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Chargeurs Actifs</CardTitle>
            <Wifi className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}/{chargers.length}</div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <CheckCircle2 className="size-3 text-green-600" />
              En charge
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Puissance Totale</CardTitle>
            <Zap className="size-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPower.toFixed(1)} kW</div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <TrendingUp className="size-3 text-green-600" />
              En temps réel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Température Moyenne</CardTitle>
            <Thermometer className="size-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgTemp}°C</div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <Activity className="size-3 text-blue-600" />
              Plage normale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alertes Actives</CardTitle>
            <AlertCircle className="size-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertCount}</div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <AlertCircle className="size-3 text-red-600" />
              {alertCount === 0 ? 'Aucune alerte' : 'Intervention requise'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Live power chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Courbes de puissance en temps réel
            </CardTitle>
            <CardDescription>Puissance de charge (kW) — mise à jour chaque seconde</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis domain={[0, 260]} tick={{ fontSize: 10 }} unit=" kW" />
                <Tooltip formatter={(v: any) => [`${v} kW`]} />
                <Legend />
                {chargers.map((c, i) => (
                  <Line
                    key={c.id}
                    type="monotone"
                    dataKey={c.id}
                    name={c.station.replace('Tesla ', '')}
                    stroke={chargerColors[i]}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Temperature chart */}
        <Card>
          <CardHeader>
            <CardTitle>Température Moyenne</CardTitle>
            <CardDescription>Évolution thermique des équipements</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={3} name="Température (°C)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Live Charger Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoring IoT en Temps Réel</CardTitle>
          <CardDescription>État détaillé de chaque chargeur</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {chargers.length === 0 ? (
              [...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse border-2">
                  <CardContent className="pt-4 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-8 bg-slate-200 rounded" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </CardContent>
                </Card>
              ))
            ) : chargers.map((charger, i) => (
              <Card
                key={charger.id}
                className={`border-2 cursor-pointer transition-all hover:shadow-md ${
                  selectedCharger === charger.id ? 'ring-2 ring-[#171a20]' : ''
                }`}
                onClick={() => setSelectedCharger(charger.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{charger.station}</CardTitle>
                      <CardDescription className="text-xs mt-1">{charger.id}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(charger.status)} ${
                        charger.status === 'charging' ? 'animate-pulse' : ''
                      }`} />
                      <Badge variant={
                        charger.status === 'charging' ? 'default' :
                        charger.status === 'maintenance' ? 'destructive' : 'secondary'
                      }>
                        {getStatusLabel(charger.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Puissance</div>
                      <div className="text-lg font-semibold flex items-center gap-2" style={{ color: chargerColors[i] }}>
                        <Zap className="size-4" />
                        {charger.power} kW
                      </div>
                      <Progress value={(charger.power / 250) * 100} className="h-1 mt-2" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Température</div>
                      <div className="text-lg font-semibold flex items-center gap-2">
                        <Thermometer className={`size-4 ${charger.temp > 40 ? 'text-red-600' : 'text-orange-600'}`} />
                        {charger.temp}°C
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Tension</div>
                      <div className="text-lg font-semibold">{charger.voltage} V</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Courant</div>
                      <div className="text-lg font-semibold">{charger.current} A</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Wifi className="size-3 text-green-600" />
                      <span className="text-xs text-slate-500">Connecté en temps réel</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected charger detail */}
      {chargers.find(c => c.id === selectedCharger) && (() => {
        const c = chargers.find(c => c.id === selectedCharger)!;
        const i = chargers.indexOf(c);
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" style={{ color: chargerColors[i] }} />
                Détail — {c.station}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Puissance', value: `${c.power} kW`, icon: Zap, color: chargerColors[i] },
                  { label: 'Tension', value: `${c.voltage} V`, icon: Activity, color: '#3b82f6' },
                  { label: 'Courant', value: `${c.current} A`, icon: Activity, color: '#f97316' },
                  { label: 'Température', value: `${c.temp} °C`, icon: Thermometer, color: c.temp > 35 ? '#ef4444' : '#22c55e' },
                ].map(m => (
                  <div key={m.label} className="text-center p-4 bg-slate-50 rounded-xl">
                    <m.icon className="w-6 h-6 mx-auto mb-2" style={{ color: m.color }} />
                    <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{m.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
}