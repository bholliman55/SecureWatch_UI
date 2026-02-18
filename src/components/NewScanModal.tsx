import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { scannerService } from '../services/scannerService';

interface NewScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanCreated: () => void;
}

export default function NewScanModal({ isOpen, onClose, onScanCreated }: NewScanModalProps) {
  const [scanType, setScanType] = useState('vulnerability');
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await scannerService.createScan({
        scan_type: scanType,
        target: target,
        status: 'running',
        severity_summary: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          info: 0
        },
        vulnerabilities_found: 0,
        assets_scanned: 0,
        started_at: new Date().toISOString()
      });

      onScanCreated();
      onClose();
      setScanType('vulnerability');
      setTarget('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create scan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        <div className="relative w-full max-w-md transform rounded-lg bg-white dark:bg-slate-800 p-6 shadow-xl transition-all">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              New Scan
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Scan Type
              </label>
              <select
                value={scanType}
                onChange={(e) => setScanType(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="vulnerability">Vulnerability Scan</option>
                <option value="compliance">Compliance Audit</option>
                <option value="network">Network Scan</option>
                <option value="web_application">Web Application Scan</option>
                <option value="penetration_test">Penetration Test</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Target
              </label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g., 192.168.1.0/24, example.com, or Full Network"
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Enter an IP address, CIDR range, hostname, or scan description
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  'Start Scan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
