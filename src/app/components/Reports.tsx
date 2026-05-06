import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  FileDown, FileText, TrendingUp, Zap, DollarSign, Users,
  Calendar, Filter, CheckCircle2,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const monthlyData = [
  { month: 'Jan', revenue: 12500, sessions: 450, energy: 18200, users: 120 },
  { month: 'Fév', revenue: 15200, sessions: 520, energy: 22400, users: 145 },
  { month: 'Mar', revenue: 13800, sessions: 480, energy: 19600, users: 138 },
  { month: 'Avr', revenue: 16900, sessions: 590, energy: 24800, users: 162 },
  { month: 'Mai', revenue: 18200, sessions: 640, energy: 27100, users: 178 },
  { month: 'Juin', revenue: 19500, sessions: 680, energy: 29300, users: 195 },
];

const stationData = [
  { name: 'Centre Ville', sessions: 210, revenue: 5800, energy: 9200 },
  { name: 'Gare du Nord', sessions: 185, revenue: 4900, energy: 7800 },
  { name: 'La Défense',   sessions: 165, revenue: 4200, energy: 6900 },
  { name: 'Montparnasse', sessions: 120, revenue: 3100, energy: 5100 },
];

const paymentData = [
  { name: 'Carte bancaire', value: 52, color: '#3b82f6' },
  { name: 'Application mobile', value: 31, color: '#10b981' },
  { name: 'Abonnement', value: 17, color: '#f59e0b' },
];

type Period = '1m' | '3m' | '6m' | '1y';
type ReportType = 'revenue' | 'sessions' | 'energy' | 'users';

const periodLabels: Record<Period, string> = {
  '1m': '1 mois', '3m': '3 mois', '6m': '6 mois', '1y': '1 an',
};

const reportTypes: { key: ReportType; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'revenue',  label: 'Revenus',       icon: DollarSign, color: 'text-emerald-600' },
  { key: 'sessions', label: 'Sessions',      icon: Zap,        color: 'text-blue-600' },
  { key: 'energy',   label: 'Énergie (kWh)', icon: TrendingUp, color: 'text-amber-600' },
  { key: 'users',    label: 'Utilisateurs',  icon: Users,      color: 'text-purple-600' },
];

export function Reports() {
  const [period, setPeriod] = useState<Period>('6m');
  const [activeMetric, setActiveMetric] = useState<ReportType>('revenue');
  const [exported, setExported] = useState<string | null>(null);

  const totalRevenue  = monthlyData.reduce((s, d) => s + d.revenue, 0);
  const totalSessions = monthlyData.reduce((s, d) => s + d.sessions, 0);
  const totalEnergy   = monthlyData.reduce((s, d) => s + d.energy, 0);
  const totalUsers    = monthlyData[monthlyData.length - 1].users;

  const handleExportCSV = () => {
    const headers = ['Mois', 'Revenus (€)', 'Sessions', 'Énergie (kWh)', 'Utilisateurs'];
    const rows = monthlyData.map(d => [d.month, d.revenue, d.sessions, d.energy, d.users]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport_chargerhub_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setExported('CSV');
    setTimeout(() => setExported(null), 3000);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFillColor(23, 26, 32);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Charge Hub — Rapport Mensuel', 14, 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}  |  Période: ${periodLabels[period]}`, 14, 23);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Indicateurs clés', 14, 42);

    const kpis = [
      ['Revenus totaux', `${totalRevenue.toLocaleString()} €`],
      ['Sessions totales', totalSessions.toLocaleString()],
      ['Énergie délivrée', `${totalEnergy.toLocaleString()} kWh`],
      ['Utilisateurs actifs', String(totalUsers)],
    ];

    autoTable(doc, {
      startY: 46,
      head: [['Indicateur', 'Valeur']],
      body: kpis,
      theme: 'grid',
      headStyles: { fillColor: [23, 26, 32], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      margin: { left: 14, right: 14 },
    });

    const afterKpi = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Données mensuelles détaillées', 14, afterKpi);

    autoTable(doc, {
      startY: afterKpi + 4,
      head: [['Mois', 'Revenus (€)', 'Sessions', 'Énergie (kWh)', 'Utilisateurs']],
      body: monthlyData.map(d => [d.month, `${d.revenue.toLocaleString()} €`, d.sessions, `${d.energy.toLocaleString()} kWh`, d.users]),
      theme: 'striped',
      headStyles: { fillColor: [23, 26, 32], textColor: 255, fontStyle: 'bold' },
      margin: { left: 14, right: 14 },
    });

    const afterMonthly = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Performance par station', 14, afterMonthly);

    autoTable(doc, {
      startY: afterMonthly + 4,
      head: [['Station', 'Sessions', 'Revenus (€)', 'Énergie (kWh)']],
      body: stationData.map(s => [s.name, s.sessions, `${s.revenue.toLocaleString()} €`, `${s.energy.toLocaleString()} kWh`]),
      theme: 'striped',
      headStyles: { fillColor: [23, 26, 32], textColor: 255, fontStyle: 'bold' },
      margin: { left: 14, right: 14 },
    });

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Charge Hub — AI-Powered EV Charging Network — Confidentiel', 14, pageHeight - 8);

    doc.save(`rapport_chargerhub_${new Date().toISOString().split('T')[0]}.pdf`);
    setExported('PDF');
    setTimeout(() => setExported(null), 3000);
  };

  return (
    <div className="space-y-6">

      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-slate-500" />
          <span className="text-sm text-slate-600 font-medium">Période :</span>
          <div className="flex gap-1">
            {(['1m', '3m', '6m', '1y'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  period === p ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2 text-sm"
            onClick={handleExportCSV}
          >
            <FileText className="size-4" />
            Exporter CSV
          </Button>
          <Button
            className="gap-2 text-sm bg-[#171a20] hover:bg-slate-700 text-white"
            onClick={handleExportPDF}
          >
            <FileDown className="size-4" />
            Exporter PDF
          </Button>
        </div>
      </div>

      {/* Export feedback */}
      {exported && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm">
          <CheckCircle2 className="size-4 text-emerald-600" />
          Rapport {exported} généré avec succès !
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Revenus totaux', value: `${totalRevenue.toLocaleString()}€`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Sessions totales', value: totalSessions.toLocaleString(), icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Énergie délivrée', value: `${totalEnergy.toLocaleString()} kWh`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Utilisateurs actifs', value: totalUsers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-600">{kpi.label}</CardTitle>
              <div className={`p-1.5 rounded-md ${kpi.bg}`}>
                <kpi.icon className={`size-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-slate-900">{kpi.value}</div>
              <p className="text-xs text-slate-500 mt-1">Période sélectionnée</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Metric selector + main chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle>Évolution mensuelle</CardTitle>
              <CardDescription>Données agrégées sur {periodLabels[period]}</CardDescription>
            </div>
            <div className="flex gap-1 flex-wrap">
              {reportTypes.map(rt => (
                <button
                  key={rt.key}
                  onClick={() => setActiveMetric(rt.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeMetric === rt.key
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <rt.icon className="size-3" />
                  {rt.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey={activeMetric}
                stroke="#171a20"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#171a20' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Station performance + payment methods */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance par station</CardTitle>
            <CardDescription>Sessions et revenus par borne</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="sessions" name="Sessions" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                <Bar dataKey="revenue"  name="Revenus (€)" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Méthodes de paiement</CardTitle>
            <CardDescription>Répartition des paiements (%)</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}
                  labelLine={false}
                >
                  {paymentData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              {paymentData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  {d.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="size-4" />
            Tableau détaillé mensuel
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="pb-3 pr-6 font-medium">Mois</th>
                <th className="pb-3 pr-6 font-medium">Revenus (€)</th>
                <th className="pb-3 pr-6 font-medium">Sessions</th>
                <th className="pb-3 pr-6 font-medium">Énergie (kWh)</th>
                <th className="pb-3 font-medium">Nouveaux utilisateurs</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((row, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 pr-6 font-medium text-slate-900">{row.month}</td>
                  <td className="py-2.5 pr-6 text-emerald-700 font-medium">{row.revenue.toLocaleString()}€</td>
                  <td className="py-2.5 pr-6">{row.sessions}</td>
                  <td className="py-2.5 pr-6">{row.energy.toLocaleString()}</td>
                  <td className="py-2.5">{row.users}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

    </div>
  );
}