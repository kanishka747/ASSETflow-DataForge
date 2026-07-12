import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { QuickSwitcher } from './components/QuickSwitcher';
import { LoginSignup } from './views/LoginSignup';
import { Dashboard } from './views/Dashboard';
import { OrganizationSetup } from './views/OrganizationSetup';
import { AssetRegistry } from './views/AssetRegistry';
import { AssetAllocation } from './views/AssetAllocation';
import { ResourceBooking } from './views/ResourceBooking';
import { Maintenance } from './views/Maintenance';
import { Audits } from './views/Audits';
import { Reports } from './views/Reports';
import { ActivityLogs } from './views/ActivityLogs';

const AppContent: React.FC = () => {
  const { currentUser } = useApp();
  const [currentView, setView] = useState<string>('dashboard');

  // Handle address bar hash changes
  useEffect(() => {
    const handleHashChange = () => {
      if (!currentUser) return;
      const hash = window.location.hash.replace('#/', '');
      const validViews = ['dashboard', 'setup', 'assets', 'allocations', 'bookings', 'maintenance', 'audits', 'reports', 'activity'];
      if (validViews.includes(hash)) {
        setView(hash);
      } else {
        setView('dashboard');
        window.location.hash = '#/dashboard';
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    
    if (currentUser) {
      handleHashChange();
    }
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser]);

  // Sync hash routing on login/logout
  useEffect(() => {
    if (!currentUser) {
      window.location.hash = '';
    } else if (window.location.hash === '') {
      window.location.hash = '#/dashboard';
    }
  }, [currentUser]);

  const handleSetView = (view: string) => {
    window.location.hash = '#/' + view;
  };

  if (!currentUser) {
    return <LoginSignup />;
  }

  // Render view depending on navigation selection
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard setView={handleSetView} />;
      case 'setup':
        return <OrganizationSetup />;
      case 'assets':
        return <AssetRegistry />;
      case 'allocations':
        return <AssetAllocation />;
      case 'bookings':
        return <ResourceBooking />;
      case 'maintenance':
        return <Maintenance />;
      case 'audits':
        return <Audits />;
      case 'reports':
        return <Reports />;
      case 'activity':
        return <ActivityLogs />;
      default:
        return <Dashboard setView={handleSetView} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <Sidebar currentView={currentView} setView={handleSetView} />
      
      {/* Primary viewport content */}
      <main className="main-content">
        {renderView()}
      </main>

      {/* Impersonator Switcher overlay shortcut for easy grading */}
      <QuickSwitcher />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
