import { useState } from 'react';
import {
  Radar,
  Shield,
  AlertTriangle,
  Server,
  Clock,
  Activity,
  ChevronRight,
  RefreshCw,
  Play,
  Search
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useScannerData } from '../hooks/useScannerData';
import { formatDistanceToNow } from '../utils/formatters';
import NewScanModal from './NewScanModal';

export default function Scanner() {
  const { metrics, scans, vulnerabilities, assets, severityDistribution, loading, error, refresh } = useScannerData();
  const [activeTab, setActiveTab] = useState<'scans' | 'vulnerabilities' | 'assets'>('scans');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [isNewScanModalOpen, setIsNewScanModalOpen] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'running': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'open': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredVulnerabilities = vulnerabilities.filter(vuln => {
    const matchesSearch = vuln.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vuln.affected_asset.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || vuln.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (asset.ip_address && asset.ip_address.includes(searchTerm))
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center justify-between gap-4">
          <p className="text-red-800 dark:text-red-400 text-sm">{error}</p>
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60 text-sm font-medium shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Scanner Agent
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Continuous vulnerability scanning and asset monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setIsNewScanModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            New Scan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Radar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {metrics?.totalScans || 0}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Total Scans
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              {metrics?.activeScans || 0} active
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {metrics?.totalVulnerabilities || 0}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Total Vulnerabilities
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-sm text-red-600 dark:text-red-400 font-medium">
              {metrics?.criticalVulnerabilities || 0} critical
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
              {metrics?.highVulnerabilities || 0} high
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Server className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {metrics?.assetsMonitored || 0}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Assets Monitored
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              All active
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {metrics?.lastScanTime ? formatDistanceToNow(metrics.lastScanTime) : 'Never'}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Last Scan
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Recent Scans
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Target
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Findings
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Started
                  </th>
                </tr>
              </thead>
              <tbody>
                {scans.map((scan) => (
                  <tr
                    key={scan.id}
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {scan.target}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {scan.assets_scanned} assets
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                        {scan.scan_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(scan.status)}`}>
                        {scan.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {scan.severity_summary.critical > 0 && (
                          <span className="text-xs font-medium text-red-600 dark:text-red-400">
                            {scan.severity_summary.critical} C
                          </span>
                        )}
                        {scan.severity_summary.high > 0 && (
                          <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                            {scan.severity_summary.high} H
                          </span>
                        )}
                        {scan.severity_summary.medium > 0 && (
                          <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                            {scan.severity_summary.medium} M
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                      {formatDistanceToNow(scan.started_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Vulnerability Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between p-6">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('scans')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'scans'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Scans
              </button>
              <button
                onClick={() => setActiveTab('vulnerabilities')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'vulnerabilities'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Vulnerabilities
              </button>
              <button
                onClick={() => setActiveTab('assets')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'assets'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Assets
              </button>
            </div>
            <div className="flex items-center gap-3">
              {activeTab === 'vulnerabilities' && (
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'vulnerabilities' && (
            <div className="space-y-4">
              {filteredVulnerabilities.length === 0 ? (
                <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                  No vulnerabilities found
                </div>
              ) : (
                filteredVulnerabilities.map((vuln) => (
                  <div
                    key={vuln.id}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(vuln.severity)}`}>
                            {vuln.severity.toUpperCase()}
                          </span>
                          {vuln.cvss_score && (
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                              CVSS: {vuln.cvss_score}
                            </span>
                          )}
                          {vuln.cve_id && (
                            <span className="text-sm text-blue-600 dark:text-blue-400 font-mono">
                              {vuln.cve_id}
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vuln.status)}`}>
                            {vuln.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                          {vuln.title}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {vuln.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Server className="w-4 h-4" />
                            {vuln.affected_asset}
                          </span>
                          {vuln.port && (
                            <span>Port: {vuln.port}</span>
                          )}
                          {vuln.service && (
                            <span>Service: {vuln.service}</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'assets' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Asset Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      IP Address
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Criticality
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Vulnerabilities
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((asset) => (
                    <tr
                      key={asset.id}
                      className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {asset.name}
                        </div>
                        {asset.operating_system && (
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {asset.operating_system}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 capitalize">
                        {asset.type.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 text-sm font-mono text-slate-600 dark:text-slate-400">
                        {asset.ip_address || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(asset.criticality)}`}>
                          {asset.criticality}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-medium ${asset.vulnerability_count > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {asset.vulnerability_count}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                          {asset.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <NewScanModal
        isOpen={isNewScanModalOpen}
        onClose={() => setIsNewScanModalOpen(false)}
        onScanCreated={refresh}
      />
    </div>
  );
}
