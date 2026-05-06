import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Brain, TrendingUp, Lightbulb, AlertTriangle, Target, Sparkles, BarChart3, Zap } from 'lucide-react';

const predictionData = [
  { day: 'Lun', predicted: 580, actual: 562 },
  { day: 'Mar', predicted: 620, actual: 635 },
  { day: 'Mer', predicted: 590, actual: 585 },
  { day: 'Jeu', predicted: 640, actual: null },
  { day: 'Ven', predicted: 680, actual: null },
  { day: 'Sam', predicted: 520, actual: null },
  { day: 'Dim', predicted: 480, actual: null },
];

const maintenanceData = [
  { station: 'Centre Ville', score: 92, nextMaintenance: '45j' },
  { station: 'Gare du Nord', score: 88, nextMaintenance: '38j' },
  { station: 'La Défense', score: 95, nextMaintenance: '52j' },
  { station: 'Orly', score: 68, nextMaintenance: '12j' },
];

const optimizationData = [
  { hour: '00h', efficiency: 85 },
  { hour: '04h', efficiency: 92 },
  { hour: '08h', efficiency: 78 },
  { hour: '12h', efficiency: 72 },
  { hour: '16h', efficiency: 68 },
  { hour: '20h', efficiency: 75 },
];

const anomalyData = [
  { id: 1, x: 120, y: 35, severity: 'low' },
  { id: 2, x: 180, y: 42, severity: 'high' },
  { id: 3, x: 220, y: 38, severity: 'medium' },
  { id: 4, x: 150, y: 28, severity: 'low' },
  { id: 5, x: 240, y: 48, severity: 'high' },
];

export function AIInsights() {
  return (
    <div className="space-y-6">
      {/* AI Overview Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Score AI Global</CardTitle>
            <Brain className="size-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.5/100</div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <TrendingUp className="size-3 text-green-600" />
              +3.2 points ce mois
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Prédictions Actives</CardTitle>
            <Target className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <Sparkles className="size-3 text-blue-600" />
              Précision 94.2%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Optimisations</CardTitle>
            <Lightbulb className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <Sparkles className="size-3 text-green-600" />
              Recommandations
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Anomalies Détectées</CardTitle>
            <AlertTriangle className="size-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <AlertTriangle className="size-3 text-orange-600" />
              2 critiques
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Predictive Analytics */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="size-5 text-purple-600" />
              Prédiction de Demande
            </CardTitle>
            <CardDescription>
              Prévisions AI vs. données réelles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={predictionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#8b5cf6" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  name="Prédit (AI)" 
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#dc2626" 
                  strokeWidth={2} 
                  name="Réel" 
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start gap-2">
                <Sparkles className="size-4 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-purple-900">Prédiction pour demain</p>
                  <p className="text-xs text-purple-700 mt-1">
                    Le modèle AI prédit une augmentation de 8.7% de la demande jeudi.
                    Recommandation: Préparer des capacités supplémentaires.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5 text-blue-600" />
              Efficacité Énergétique
            </CardTitle>
            <CardDescription>
              Optimisation de la distribution d'énergie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={optimizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="efficiency" fill="#3b82f6" name="Efficacité (%)" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Lightbulb className="size-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Recommandation AI</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Réduire la charge de 15% entre 16h-20h pourrait améliorer l'efficacité globale de 4.2%.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="size-5 text-green-600" />
            Maintenance Prédictive
          </CardTitle>
          <CardDescription>
            Analyse AI de l'état des équipements et prédictions de maintenance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maintenanceData.map((station, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{station.station}</h4>
                    <p className="text-xs text-slate-500">
                      Prochaine maintenance recommandée dans {station.nextMaintenance}
                    </p>
                  </div>
                  <Badge
                    variant={
                      station.score >= 90 ? 'default' :
                      station.score >= 75 ? 'secondary' :
                      'destructive'
                    }
                  >
                    Score: {station.score}/100
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">État des équipements</span>
                    <span className="font-semibold">{station.score}%</span>
                  </div>
                  <Progress value={station.score} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Anomaly Detection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-orange-600" />
            Détection d'Anomalies
          </CardTitle>
          <CardDescription>
            Surveillance en temps réel par algorithmes de machine learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" name="Puissance (kW)" />
                  <YAxis dataKey="y" name="Température (°C)" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter 
                    name="Points de données" 
                    data={anomalyData} 
                    fill="#f59e0b"
                    shape={(props: any) => {
                      const { cx, cy, payload } = props;
                      const color = 
                        payload.severity === 'high' ? '#ef4444' :
                        payload.severity === 'medium' ? '#f59e0b' :
                        '#10b981';
                      return <circle cx={cx} cy={cy} r={6} fill={color} />;
                    }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="size-4 text-red-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-900">Anomalie Critique</p>
                    <p className="text-xs text-red-700 mt-1">
                      Station Orly - Port 3: Température anormale (48°C) détectée avec puissance faible
                    </p>
                    <Badge variant="destructive" className="mt-2 text-xs">
                      Priorité: Haute
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="size-4 text-orange-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-orange-900">Anomalie Modérée</p>
                    <p className="text-xs text-orange-700 mt-1">
                      Pattern inhabituel de consommation détecté sur 3 stations
                    </p>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      Priorité: Moyenne
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Sparkles className="size-4 text-green-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900">Système Optimal</p>
                    <p className="text-xs text-green-700 mt-1">
                      85% des stations fonctionnent dans les paramètres normaux
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card className="bg-gradient-to-br from-purple-50 via-blue-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="size-5 text-purple-600" />
            Recommandations IA
          </CardTitle>
          <CardDescription>
            Actions suggérées par l'intelligence artificielle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border-2 border-purple-200">
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <TrendingUp className="size-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">Optimisation Tarifaire</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Augmenter les prix de 8% pendant les heures de pointe pourrait générer +12,500€/mois
                  </p>
                  <Badge className="mt-2 text-xs">Impact: +15% revenus</Badge>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Target className="size-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">Expansion Stratégique</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Zone Versailles identifiée comme opportunité: 450+ demandes non satisfaites/mois
                  </p>
                  <Badge variant="secondary" className="mt-2 text-xs">ROI prédit: 18 mois</Badge>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border-2 border-green-200">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Lightbulb className="size-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">Efficacité Énergétique</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Load balancing intelligent pourrait réduire les coûts d'énergie de 7.2%
                  </p>
                  <Badge className="mt-2 text-xs bg-green-600">Économies: 2,400€/mois</Badge>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border-2 border-orange-200">
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <AlertTriangle className="size-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">Maintenance Prioritaire</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    4 stations nécessitent une intervention préventive dans les 2 prochaines semaines
                  </p>
                  <Badge variant="destructive" className="mt-2 text-xs">Action: Urgente</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
