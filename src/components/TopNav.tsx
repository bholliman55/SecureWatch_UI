import { useState, useEffect } from 'react';
import { Shield, Sun, Moon, RefreshCw, Settings, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface TopNavProps {
  isConnected?: boolean;
  lastUpdated?: string | null;
  onRefresh?: () => void | Promise<void>;
}

export default function TopNav({ onRefresh }: TopNavProps) {
  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleRefresh = () => {
    if (onRefresh) {
      void Promise.resolve(onRefresh());
    } else {
      window.location.reload();
    }
  };

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-600 to-purple-900 p-2 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-900 bg-clip-text text-transparent">
              SecureWatch
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Security Operations Center</p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="hidden md:flex flex-col items-end">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {formatTime(currentTime)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {formatDate(currentTime)}
            </div>
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105"
            title="Refresh data"
          >
            <RefreshCw className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          <button
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>

          <div className="flex items-center space-x-2 pl-4 border-l border-slate-200 dark:border-slate-700">
            <div className="hidden md:flex flex-col items-end">
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Admin User
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Security Analyst
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-purple-900 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
