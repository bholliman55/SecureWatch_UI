import { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { airtableService } from '../services/airtableService';
import { supabase } from '../services/supabaseClient';

export default function Settings() {
  const [baseId, setBaseId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected');

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      const { data } = await supabase
        .from('airtable_credentials')
        .select('base_id, api_key, is_connected')
        .maybeSingle();

      if (data) {
        setBaseId(data.base_id);
        setApiKey(data.api_key);
        setConnectionStatus(data.is_connected ? 'connected' : 'disconnected');
      }
    } catch (err) {
      console.error('Error loading credentials:', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (!baseId.trim() || !apiKey.trim()) {
      setError('Base ID and API Key are required');
      setSaving(false);
      return;
    }

    try {
      const saved = await airtableService.saveCredentials(baseId, apiKey);
      if (saved) {
        setSuccess('Credentials saved successfully');
        setConnectionStatus('disconnected');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to save credentials');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setError('');
    setSuccess('');
    setConnectionStatus('testing');

    try {
      const connected = await airtableService.testConnection();
      if (connected) {
        setSuccess('Connection successful! Airtable is accessible.');
        setConnectionStatus('connected');
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setError(message);
      setConnectionStatus('disconnected');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Airtable Configuration
        </h2>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Base ID
            </label>
            <input
              type="text"
              value={baseId}
              onChange={(e) => setBaseId(e.target.value)}
              placeholder="appXXXXXXXXXXXXXX"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Found in your Airtable base URL
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="patXXXXXXXXXXXXXX"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your Airtable personal access token
            </p>
          </div>

          {error && (
            <div className="flex items-start space-x-3 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900 dark:text-red-200">Error</h4>
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 dark:text-green-200">Success</h4>
                <p className="text-sm text-green-800 dark:text-green-300">{success}</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div
              className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-green-500'
                  : connectionStatus === 'testing'
                  ? 'bg-yellow-500 animate-pulse'
                  : 'bg-red-500'
              }`}
            />
            <span className="text-sm text-blue-900 dark:text-blue-200">
              Status:{' '}
              <span className="font-medium">
                {connectionStatus === 'connected'
                  ? 'Connected'
                  : connectionStatus === 'testing'
                  ? 'Testing...'
                  : 'Not Connected'}
              </span>
            </span>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-900 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Credentials</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || !baseId || !apiKey}
              className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Required Airtable Tables
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Scanner Agent</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Scan_Results</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Monitoring Agent</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Security_Alerts</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Compliance Agent</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Compliance_Audits</li>
                <li>• Audit_Findings</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Training Agent</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Training_Assignments</li>
              </ul>
            </div>
            <div className="md:col-span-2">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Incidents Agent</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Incidents</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
