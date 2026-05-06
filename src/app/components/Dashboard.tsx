import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Zap, DollarSign, Users, Battery, AlertTriangle, CheckCircle2 } from 'lucide-react';

const revenueData = [
  { month: 'Jan', revenue: 12500, sessions: 450 },
  { month: 'Fév', revenue: 15200, sessions: 520 },
  { month: 'Mar', revenue: 13800, sessions: 480 },
  { month: 'Avr', revenue: 16900, sessions: 590 },
  { month: 'Mai', revenue: 18200, sessions: 640 },
  { month: 'Juin', revenue: 19500, sessions: 680 },
];

const energyData = [
  { hour: '00h', energy: 120 },
  { hour: '04h', energy: 80 },
  { hour: '08h', energy: 280 },
  { hour: '12h', energy: 350 },
  { hour: '16h', energy: 420 },
  { hour: '20h', energy: 380 },
];

const stationStatusData = [
  { name: 'Disponible', value: 45, color: '#10b981' },
  { name: 'En charge', value: 32, color: '#f59e0b' },
  { name: 'Maintenance', value: 8, color: '#ef4444' },
  { name: 'Hors service', value: 3, color: '#6b7280' },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenus Mensuels</CardTitle>
            <DollarSign className="size-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">19,500€</div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <TrendingUp className="size-3 text-green-600" />
              <span className="text-green-600">+12.5%</span> vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sessions de Charge</CardTitle>
            <Zap className="size-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">680</div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <TrendingUp className="size-3 text-green-600" />
              <span className="text-green-600">+8.2%</span> vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
            <Users className="size-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,345</div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <TrendingUp className="size-3 text-green-600" />
              <span className="text-green-600">+15.3%</span> vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Énergie Distribuée</CardTitle>
            <Battery className="size-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.2 MWh</div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <TrendingUp className="size-3 text-green-600" />
              <span className="text-green-600">+9.7%</span> vs mois dernier
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenus & Sessions</CardTitle>
            <CardDescription>Évolution mensuelle des revenus et sessions de charge</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#dc2626" name="Revenus (€)" key="revenue-bar" />
                <Bar yAxisId="right" dataKey="sessions" fill="#64748b" name="Sessions" key="sessions-bar" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consommation Énergétique</CardTitle>
            <CardDescription>Distribution de l'énergie sur 24h</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={energyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="energy" stroke="#dc2626" strokeWidth={2} name="Énergie (kWh)" key="energy-line" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Statut des Stations</CardTitle>
            <CardDescription>Répartition en temps réel</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stationStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  key="status-pie"
                >
                  {stationStatusData.map((entry, index) => (
                    <Cell key={`cell-status-${entry.name}-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Alertes & Notifications</CardTitle>
            <CardDescription>Événements importants du système</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="size-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Station Orly - Port 3 en panne</p>
                <p className="text-xs text-slate-600">Intervention technique requise • Il y a 2h</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="size-5 text-yellow-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Maintenance préventive recommandée</p>
                <p className="text-xs text-slate-600">Station La Défense - Port 7 • Il y a 5h</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="size-5 text-green-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Maintenance terminée avec succès</p>
                <p className="text-xs text-slate-600">Station Gare du Nord • Il y a 1j</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <CheckCircle2 className="size-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Nouvelle station activée</p>
                <p className="text-xs text-slate-600">Station Versailles - 12 ports • Il y a 2j</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}