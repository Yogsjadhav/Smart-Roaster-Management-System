import React, { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';
import { AlertTriangle, RefreshCw, Users } from 'lucide-react';
import { format } from 'date-fns';

const Conflicts = () => {
  const [rosters, setRosters] = useState([]);
  const [selectedRoster, setSelectedRoster] = useState('');
  const [conflicts, setConflicts] = useState([]);
  const [severity, setSeverity] = useState('all');
  const [loading, setLoading] = useState(true);
  const [revalidating, setRevalidating] = useState(false);

  useEffect(() => {
    fetchRosters();
  }, []);

  useEffect(() => {
    if (selectedRoster) fetchConflicts(selectedRoster);
  }, [selectedRoster, severity]);

  const fetchRosters = async () => {
    try {
      const response = await api.get('/rosters');
      setRosters(response.data.data);
      if (response.data.data.length) setSelectedRoster(response.data.data[0]._id);
    } catch (error) {
      toast.error('Failed to fetch rosters');
    } finally {
      setLoading(false);
    }
  };

  const fetchConflicts = async (rosterId) => {
    try {
      const response = await api.get(`/rosters/${rosterId}/conflicts`);
      setConflicts(severity === 'all'
        ? response.data.data
        : response.data.data.filter(conflict => conflict.severity === severity));
    } catch (error) {
      toast.error('Failed to fetch conflicts');
    }
  };

  const revalidate = async () => {
    if (!selectedRoster) return;
    setRevalidating(true);
    try {
      const response = await api.post(`/rosters/${selectedRoster}/revalidate`);
      setConflicts(response.data.data.conflicts);
      toast.success(response.data.data.roster.isValid ? 'Roster is valid' : 'Coverage gaps remain');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Revalidation failed');
    } finally {
      setRevalidating(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Conflict Center</h1>
        <p className="text-sm text-gray-600 mt-1">Review coverage gaps and eligible backup employees</p>
      </div>

      <div className="card flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Roster</label>
          <select value={selectedRoster} onChange={(e) => setSelectedRoster(e.target.value)} className="input-field">
            <option value="">Select roster</option>
            {rosters.map(roster => (
              <option key={roster._id} value={roster._id}>
                {format(new Date(roster.year, roster.month - 1), 'MMMM yyyy')} - {roster.status}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
          <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="input-field">
            {['all', 'critical', 'high', 'medium', 'low'].map(item => (
              <option key={item} value={item}>{item === 'all' ? 'All severities' : item}</option>
            ))}
          </select>
        </div>
        <button onClick={revalidate} disabled={!selectedRoster || revalidating} className="btn-primary flex items-center gap-2">
          <RefreshCw size={18} className={revalidating ? 'animate-spin' : ''} />
          Revalidate
        </button>
      </div>

      {conflicts.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={AlertTriangle}
            title="No conflicts found"
            description="The selected roster has no conflicts matching this filter."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {conflicts.map(conflict => (
            <div key={conflict._id} className="card border-l-4 border-red-500">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={18} className="text-red-600" />
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {conflict.conflictType.replaceAll('-', ' ')}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{conflict.explanation}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(new Date(conflict.date), 'MMM dd, yyyy')} • {conflict.brand?.brandName || 'Unknown brand'} • {conflict.process?.processName || 'Unknown process'}
                  </p>
                  {conflict.possibleResolution && (
                    <p className="text-sm text-blue-700 mt-3">Suggested resolution: {conflict.possibleResolution}</p>
                  )}
                </div>
                <div className="md:text-right">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 capitalize">
                    {conflict.severity}
                  </span>
                  <p className="text-sm text-gray-600 mt-2">
                    Required: {conflict.requiredEmployees} • Available: {conflict.availableEmployees}
                  </p>
                </div>
              </div>
              {conflict.backupEmployees?.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Users size={16} /> Eligible backups
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {conflict.backupEmployees.map(employee => (
                      <span key={employee._id} className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                        {employee.fullName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Conflicts;
