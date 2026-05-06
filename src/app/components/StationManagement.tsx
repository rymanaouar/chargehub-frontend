import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Edit, Trash2, MapPin, Battery, DollarSign, Power } from 'lucide-react';

interface Station {
  id: string; name: string; city: string; address: string;
  totalPorts: number; availablePorts: number; powerOutput: string;
  pricePerKwh: number; status: 'operational' | 'maintenance' | 'offline';
}

const initialStations: Station[] = [
  { id: '1', name: 'Tesla Supercharger - Centre Ville', city: 'Paris',       address: '123 Rue de la République', totalPorts: 8,  availablePorts: 6,  powerOutput: '250 kW', pricePerKwh: 0.45, status: 'operational' },
  { id: '2', name: 'Tesla Supercharger - Gare du Nord', city: 'Paris',       address: '45 Boulevard de Denain',   totalPorts: 10, availablePorts: 2,  powerOutput: '250 kW', pricePerKwh: 0.42, status: 'operational' },
  { id: '3', name: 'Tesla Supercharger - La Défense',   city: 'La Défense',  address: '1 Parvis de la Défense',   totalPorts: 12, availablePorts: 12, powerOutput: '250 kW', pricePerKwh: 0.48, status: 'operational' },
  { id: '4', name: 'Tesla Supercharger - Orly',         city: 'Orly',        address: 'Aéroport Paris-Orly',      totalPorts: 6,  availablePorts: 0,  powerOutput: '150 kW', pricePerKwh: 0.50, status: 'maintenance' },
];

const emptyForm = { name: '', city: '', address: '', totalPorts: '', availablePorts: '', powerOutput: '250 kW', pricePerKwh: '', status: 'operational' as Station['status'] };

export function StationManagement() {
  const [stations, setStations]     = useState<Station[]>(initialStations);
  const [searchQuery, setSearchQuery] = useState('');
  const [addOpen, setAddOpen]       = useState(false);
  const [editStation, setEditStation] = useState<Station | null>(null);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [form, setForm]             = useState(emptyForm);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const filtered = stations.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAdd = () => { setForm(emptyForm); setAddOpen(true); };

  const openEdit = (s: Station) => {
    setForm({ name: s.name, city: s.city, address: s.address, totalPorts: String(s.totalPorts), availablePorts: String(s.availablePorts), powerOutput: s.powerOutput, pricePerKwh: String(s.pricePerKwh), status: s.status });
    setEditStation(s);
  };

  const handleAdd = () => {
    if (!form.name.trim() || !form.city.trim()) return;
    setStations(p => [...p, { id: Date.now().toString(), name: form.name, city: form.city, address: form.address, totalPorts: Number(form.totalPorts) || 0, availablePorts: Number(form.availablePorts) || 0, powerOutput: form.powerOutput, pricePerKwh: Number(form.pricePerKwh) || 0, status: form.status }]);
    setAddOpen(false);
  };

  const handleEdit = () => {
    if (!editStation) return;
    setStations(p => p.map(s => s.id !== editStation.id ? s : { ...s, name: form.name, city: form.city, address: form.address, totalPorts: Number(form.totalPorts) || s.totalPorts, availablePorts: Number(form.availablePorts) || s.availablePorts, powerOutput: form.powerOutput, pricePerKwh: Number(form.pricePerKwh) || s.pricePerKwh, status: form.status }));
    setEditStation(null);
  };

  const handleDelete = () => { if (deleteId) { setStations(p => p.filter(s => s.id !== deleteId)); setDeleteId(null); } };

  const FormFields = () => (
    <div className="grid gap-4 py-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Nom *</Label><Input placeholder="Tesla Supercharger..." value={form.name} onChange={e => set('name', e.target.value)} /></div>
        <div className="space-y-2"><Label>Ville *</Label><Input placeholder="Paris" value={form.city} onChange={e => set('city', e.target.value)} /></div>
      </div>
      <div className="space-y-2"><Label>Adresse</Label><Input placeholder="123 Rue de..." value={form.address} onChange={e => set('address', e.target.value)} /></div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Ports totaux</Label><Input type="number" value={form.totalPorts} onChange={e => set('totalPorts', e.target.value)} /></div>
        <div className="space-y-2"><Label>Ports disponibles</Label><Input type="number" value={form.availablePorts} onChange={e => set('availablePorts', e.target.value)} /></div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2"><Label>Puissance</Label>
          <Select value={form.powerOutput} onValueChange={v => set('powerOutput', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="150 kW">150 kW</SelectItem><SelectItem value="250 kW">250 kW</SelectItem><SelectItem value="350 kW">350 kW</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label>Prix/kWh (€)</Label><Input type="number" step="0.01" value={form.pricePerKwh} onChange={e => set('pricePerKwh', e.target.value)} /></div>
        <div className="space-y-2"><Label>Statut</Label>
          <Select value={form.status} onValueChange={v => set('status', v as Station['status'])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="operational">Opérationnelle</SelectItem><SelectItem value="maintenance">Maintenance</SelectItem><SelectItem value="offline">Hors ligne</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Nouvelle Station</DialogTitle><DialogDescription>Ajoutez une nouvelle station de recharge au réseau</DialogDescription></DialogHeader>
          <FormFields />
          <div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setAddOpen(false)}>Annuler</Button><Button className="bg-[#171a20] hover:bg-slate-700 text-white" onClick={handleAdd}>Créer la station</Button></div>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editStation} onOpenChange={open => { if (!open) setEditStation(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Modifier la Station</DialogTitle><DialogDescription>Modifiez les informations de la station</DialogDescription></DialogHeader>
          <FormFields />
          <div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setEditStation(null)}>Annuler</Button><Button className="bg-[#171a20] hover:bg-slate-700 text-white" onClick={handleEdit}>Enregistrer</Button></div>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleteId} onOpenChange={open => { if (!open) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Confirmer la suppression</DialogTitle><DialogDescription>Cette action est irréversible.</DialogDescription></DialogHeader>
          <div className="flex justify-end gap-3 pt-2"><Button variant="outline" onClick={() => setDeleteId(null)}>Annuler</Button><Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>Supprimer</Button></div>
        </DialogContent>
      </Dialog>

      {/* Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <Input placeholder="Rechercher une station..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="sm:max-w-xs" />
            <Button className="bg-[#171a20] hover:bg-slate-700 text-white gap-2" onClick={openAdd}><Plus className="size-4" />Ajouter une station</Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle>Gestion des Stations ({filtered.length})</CardTitle><CardDescription>Gérez toutes les stations de recharge du réseau</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Station</TableHead><TableHead>Localisation</TableHead><TableHead>Ports</TableHead>
                <TableHead>Puissance</TableHead><TableHead>Prix/kWh</TableHead><TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0
                ? <TableRow><TableCell colSpan={7} className="text-center py-10 text-slate-400">Aucune station trouvée</TableCell></TableRow>
                : filtered.map(station => (
                <TableRow key={station.id}>
                  <TableCell className="font-medium">{station.name}</TableCell>
                  <TableCell><div className="flex items-center gap-2 text-sm"><MapPin className="size-4 text-slate-400" />{station.city}</div></TableCell>
                  <TableCell><div className="flex items-center gap-2"><Battery className="size-4 text-slate-400" /><span className="text-sm">{station.availablePorts}/{station.totalPorts}</span></div></TableCell>
                  <TableCell><div className="flex items-center gap-2"><Power className="size-4 text-slate-400" /><span className="text-sm">{station.powerOutput}</span></div></TableCell>
                  <TableCell><div className="flex items-center gap-2"><DollarSign className="size-4 text-slate-400" /><span className="text-sm font-semibold">{station.pricePerKwh}€</span></div></TableCell>
                  <TableCell>
                    <Badge variant={station.status === 'operational' ? 'default' : station.status === 'maintenance' ? 'secondary' : 'destructive'}>
                      {station.status === 'operational' ? 'Opérationnelle' : station.status === 'maintenance' ? 'Maintenance' : 'Hors ligne'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(station)}><Edit className="size-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(station.id)}><Trash2 className="size-4 text-red-600" /></Button>
                    </div>
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
