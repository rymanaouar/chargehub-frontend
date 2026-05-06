import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Users, Search, UserPlus, Shield, ShieldOff, Pencil, Trash2,
  Mail, Phone, Car, CalendarDays, CheckCircle2, XCircle, Clock,
} from 'lucide-react';


const TESLA_MODELS = ['Tesla Model S', 'Tesla Model 3', 'Tesla Model X', 'Tesla Model Y', 'Tesla Cybertruck', 'Tesla Roadster', 'Tesla Semi'];

type UserStatus = 'active' | 'suspended' | 'pending';
type UserRole = 'client' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  role: UserRole;
  status: UserStatus;
  registeredAt: string;
  totalSessions: number;
  totalSpent: number;
}

const mockUsers: User[] = [
  {
    id: 'U001', name: 'Sophie Martin', email: 'sophie.martin@email.fr',
    phone: '+33 6 12 34 56 78', vehicle: 'Tesla Model 3', role: 'client',
    status: 'active', registeredAt: '2024-01-15', totalSessions: 42, totalSpent: 318.60,
  },
  {
    id: 'U002', name: 'Lucas Bernard', email: 'lucas.bernard@email.fr',
    phone: '+33 6 98 76 54 32', vehicle: 'Tesla Model Y', role: 'client',
    status: 'active', registeredAt: '2024-02-08', totalSessions: 27, totalSpent: 189.40,
  },
  {
    id: 'U003', name: 'Amina Dubois', email: 'amina.dubois@email.fr',
    phone: '+33 7 11 22 33 44', vehicle: 'Tesla Model S', role: 'client',
    status: 'suspended', registeredAt: '2023-11-20', totalSessions: 15, totalSpent: 94.50,
  },
  {
    id: 'U004', name: 'Thomas Leroy', email: 'thomas.leroy@email.fr',
    phone: '+33 6 55 66 77 88', vehicle: 'Tesla Model X', role: 'admin',
    status: 'active', registeredAt: '2023-09-01', totalSessions: 8, totalSpent: 74.20,
  },
  {
    id: 'U005', name: 'Camille Petit', email: 'camille.petit@email.fr',
    phone: '+33 7 44 55 66 77', vehicle: 'Tesla Cybertruck', role: 'client',
    status: 'pending', registeredAt: '2024-06-10', totalSessions: 0, totalSpent: 0,
  },
  {
    id: 'U006', name: 'Julien Moreau', email: 'julien.moreau@email.fr',
    phone: '+33 6 33 44 55 66', vehicle: 'Tesla Model 3', role: 'client',
    status: 'active', registeredAt: '2024-03-22', totalSessions: 63, totalSpent: 512.80,
  },
];

const statusConfig: Record<UserStatus, { label: string; color: string; icon: React.ElementType }> = {
  active:    { label: 'Actif',    color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  suspended: { label: 'Suspendu', color: 'bg-red-100 text-red-800',         icon: XCircle },
  pending:   { label: 'En attente', color: 'bg-amber-100 text-amber-800',   icon: Clock },
};

const roleConfig: Record<UserRole, { label: string; color: string }> = {
  client: { label: 'Client', color: 'bg-blue-100 text-blue-800' },
  admin:  { label: 'Admin',  color: 'bg-purple-100 text-purple-800' },
};

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'all'>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', vehicle: '' });

  const filtered = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.vehicle.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(u =>
      u.id === id
        ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
        : u
    ));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const addUser = () => {
    if (!newUser.name || !newUser.email) return;
    const user: User = {
      id: `U${String(users.length + 1).padStart(3, '0')}`,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      vehicle: newUser.vehicle,
      role: 'client',
      status: 'pending',
      registeredAt: new Date().toISOString().split('T')[0],
      totalSessions: 0,
      totalSpent: 0,
    };
    setUsers(prev => [...prev, user]);
    setNewUser({ name: '', email: '', phone: '', vehicle: '' });
    setShowAddForm(false);
  };

  const saveEdit = () => {
    if (!editingUser) return;
    setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
  };

  const totalActive    = users.filter(u => u.status === 'active').length;
  const totalSuspended = users.filter(u => u.status === 'suspended').length;
  const totalPending   = users.filter(u => u.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total utilisateurs', value: users.length, icon: Users, color: 'text-blue-600' },
          { label: 'Actifs',    value: totalActive,    icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Suspendus', value: totalSuspended, icon: XCircle,      color: 'text-red-600' },
          { label: 'En attente', value: totalPending,  icon: Clock,        color: 'text-amber-600' },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{kpi.label}</CardTitle>
              <kpi.icon className={`size-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              className="pl-9 w-64"
              placeholder="Rechercher un utilisateur…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1">
            {(['all', 'active', 'suspended', 'pending'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filterStatus === s
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s === 'all' ? 'Tous' : statusConfig[s]?.label}
              </button>
            ))}
          </div>
        </div>
        <Button
          onClick={() => setShowAddForm(v => !v)}
          className="bg-[#171a20] hover:bg-slate-700 text-white gap-2"
        >
          <UserPlus className="size-4" />
          Ajouter un utilisateur
        </Button>
      </div>

      {/* Add user form */}
      {showAddForm && (
        <Card className="border-dashed border-2 border-slate-300">
          <CardHeader>
            <CardTitle className="text-base">Nouvel utilisateur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input placeholder="Nom complet *" value={newUser.name}    onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} />
              <Input placeholder="Email *"        value={newUser.email}   onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} />
              <Input placeholder="Téléphone"      value={newUser.phone}   onChange={e => setNewUser(p => ({ ...p, phone: e.target.value }))} />
              <Select value={newUser.vehicle} onValueChange={v => setNewUser(p => ({ ...p, vehicle: v }))}>
                <SelectTrigger><SelectValue placeholder="Véhicule Tesla" /></SelectTrigger>
                <SelectContent>{TESLA_MODELS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={addUser} className="bg-emerald-600 hover:bg-emerald-700 text-white">Créer</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit user form */}
      {editingUser && (
        <Card className="border-2 border-blue-300 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-base">Modifier : {editingUser.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input value={editingUser.name}    onChange={e => setEditingUser(p => p && ({ ...p, name: e.target.value }))} />
              <Input value={editingUser.email}   onChange={e => setEditingUser(p => p && ({ ...p, email: e.target.value }))} />
              <Input value={editingUser.phone}   onChange={e => setEditingUser(p => p && ({ ...p, phone: e.target.value }))} />
              <Select value={editingUser.vehicle} onValueChange={v => setEditingUser(p => p && ({ ...p, vehicle: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TESLA_MODELS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={saveEdit} className="bg-blue-600 hover:bg-blue-700 text-white">Enregistrer</Button>
              <Button variant="outline" onClick={() => setEditingUser(null)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Utilisateurs ({filtered.length})
          </CardTitle>
          <CardDescription>Gestion des comptes clients et administrateurs</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="pb-3 pr-4 font-medium">Utilisateur</th>
                <th className="pb-3 pr-4 font-medium hidden md:table-cell">Contact</th>
                <th className="pb-3 pr-4 font-medium hidden lg:table-cell">Véhicule</th>
                <th className="pb-3 pr-4 font-medium">Statut</th>
                <th className="pb-3 pr-4 font-medium">Rôle</th>
                <th className="pb-3 pr-4 font-medium hidden sm:table-cell">Sessions</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => {
                const sc = statusConfig[user.status];
                const rc = roleConfig[user.role];
                return (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.id}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <CalendarDays className="size-3" />
                        {user.registeredAt}
                      </div>
                    </td>
                    <td className="py-3 pr-4 hidden md:table-cell">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Mail className="size-3" />{user.email}
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 mt-0.5">
                        <Phone className="size-3" />{user.phone}
                      </div>
                    </td>
                    <td className="py-3 pr-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Car className="size-3" />{user.vehicle}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                        <sc.icon className="size-3" />
                        {sc.label}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${rc.color}`}>
                        {rc.label}
                      </span>
                    </td>
                    <td className="py-3 pr-4 hidden sm:table-cell">
                      <div className="font-medium">{user.totalSessions}</div>
                      <div className="text-xs text-slate-500">{user.totalSpent.toFixed(2)}€</div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <button
                          title="Modifier"
                          onClick={() => setEditingUser(user)}
                          className="p-1.5 rounded-md hover:bg-blue-100 text-blue-600 transition-colors"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          title={user.status === 'active' ? 'Suspendre' : 'Réactiver'}
                          onClick={() => toggleStatus(user.id)}
                          className={`p-1.5 rounded-md transition-colors ${
                            user.status === 'active'
                              ? 'hover:bg-red-100 text-red-600'
                              : 'hover:bg-emerald-100 text-emerald-600'
                          }`}
                        >
                          {user.status === 'active' ? <ShieldOff className="size-3.5" /> : <Shield className="size-3.5" />}
                        </button>
                        <button
                          title="Supprimer"
                          onClick={() => deleteUser(user.id)}
                          className="p-1.5 rounded-md hover:bg-red-100 text-red-600 transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
