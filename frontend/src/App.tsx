import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { RoleNavigationBar } from './components/RoleNavigationBar';
import { CitizenPortal } from './pages/CitizenPortal';
import { Dashboard } from './pages/Dashboard';
import { FieldWorkerOps } from './pages/FieldWorkerOps';
import { NotificationDrawer } from './components/NotificationDrawer';
import { SettingsModal } from './components/SettingsModal';
import { CheckCircle2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentRole, toastMessage } = useApp();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#080D14] text-[#E8EDF3] select-none">
      {/* Top Multi-Role Navigation Bar */}
      <RoleNavigationBar />

      {/* Main View based on Selected Role */}
      <main className="flex-1 flex overflow-hidden relative">
        {currentRole === 'citizen' && <CitizenPortal />}
        {currentRole === 'commander' && <Dashboard />}
        {currentRole === 'field-worker' && <FieldWorkerOps />}
      </main>

      {/* Supporting Drawers & Modals */}
      <NotificationDrawer />
      <SettingsModal />

      {/* Global Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded bg-[#151F2A] border border-[#263342] text-xs shadow-2xl flex items-center gap-2.5 text-[#E8EDF3] animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-[#27A878] shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
