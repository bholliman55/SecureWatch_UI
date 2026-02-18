import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import TopNav from './components/TopNav';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { useDashboardData } from './hooks/useDashboardData';

function App() {
  const [activeView, setActiveView] = useState('dashboard');

  const {
    metrics,
    alerts,
    timeline,
    posture,
    agents,
    loading,
    error,
    isConnected,
    lastUpdated,
    refresh
  } = useDashboardData(30000);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
          <TopNav
            isConnected={isConnected}
            lastUpdated={lastUpdated}
            onRefresh={refresh}
          />
          <div className="flex h-[calc(100vh-73px)]">
            <Sidebar activeView={activeView} onViewChange={setActiveView} />
            <Dashboard
              activeView={activeView}
              metrics={metrics}
              alerts={alerts}
              timeline={timeline}
              posture={posture}
              agents={agents}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
