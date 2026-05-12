import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dashboard } from './Dashboard';
import { StationManagement } from './StationManagement';
import { IoTMonitoring } from './IoTMonitoring';
import { AIInsights } from './AIInsights';
import { UserManagement } from './UserManagement';
import { Reports } from './Reports';
import { Reservations } from './Reservations';

// Tab config for DRY rendering
const TABS = [
  { value: 'dashboard',     label: 'Dashboard' },
  { value: 'stations',      label: 'Stations' },
  { value: 'reservations',  label: 'Réservations' },
  { value: 'iot',           label: 'IoT Monitor' },
  { value: 'ai',            label: 'AI Insights' },
  { value: 'users',         label: 'Utilisateurs' },
  { value: 'reports',       label: 'Rapports' },
];

export function BackOffice() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="p-3 sm:p-4 lg:p-6 xl:p-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">

        {/* ─── DESKTOP: standard 7-column grid (lg+) ──────────────────────────
            On desktop this renders exactly as before: grid w-full grid-cols-7.
            On mobile/tablet we hide this and show the scrollable version below. */}
        <TabsList className="hidden lg:grid w-full grid-cols-7 max-w-4xl">
          {TABS.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ─── MOBILE/TABLET: horizontally scrollable pill row (below lg) ─────
            MOBILE FIX: instead of squishing 7 tabs into a fixed grid (which caused
            text collisions in screenshot 1), we render a flex row inside an
            overflow-x-auto container. Each tab stays full-width for its label.
            The scrollbar is hidden via [&::-webkit-scrollbar]:hidden for cleanliness.
            This pattern is common in mobile-first tab bars (e.g. YouTube mobile). */}
        <div className="lg:hidden">
          <div className="overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex gap-1 bg-muted p-1 rounded-lg w-max min-w-full">
              {TABS.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`
                    flex-shrink-0 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium
                    transition-all duration-200 whitespace-nowrap
                    ${activeTab === tab.value
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab content — unchanged, same on all breakpoints */}
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
