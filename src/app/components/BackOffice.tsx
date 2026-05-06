import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dashboard } from './Dashboard';
import { StationManagement } from './StationManagement';
import { IoTMonitoring } from './IoTMonitoring';
import { AIInsights } from './AIInsights';
import { UserManagement } from './UserManagement';
import { Reports } from './Reports';
import { Reservations } from './Reservations';


export function BackOffice() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 max-w-4xl">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="stations">Stations</TabsTrigger>
          <TabsTrigger value="reservations">Réservations</TabsTrigger>
          <TabsTrigger value="iot">IoT Monitor</TabsTrigger>
          <TabsTrigger value="ai">AI Insights</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard"><Dashboard /></TabsContent>
        <TabsContent value="stations"><StationManagement /></TabsContent>
        <TabsContent value="reservations"><Reservations /></TabsContent>
        <TabsContent value="iot"><IoTMonitoring /></TabsContent>
        <TabsContent value="ai"><AIInsights /></TabsContent>
        <TabsContent value="users"><UserManagement /></TabsContent>
        <TabsContent value="reports"><Reports /></TabsContent>
      </Tabs>
    </div>
  );
}
