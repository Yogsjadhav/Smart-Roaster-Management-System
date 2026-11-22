import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';

const MonthlyRoster = () => {
  const navigate = useNavigate();
  const [rosters, setRosters] = useState([]);
  const [selectedRoster, setSelectedRoster] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [publishConflicts, setPublishConflicts] = useState([]);

  useEffect(() => {
    fetchRosters();
  }, []);

  const fetchRosters = async () => {
    try {
      const response = await api.get('/rosters');
      setRosters(response.data.data);
      if (response.data.data.length > 0) {
        fetchRosterEntries(response.data.data[0]._id);
        setSelectedRoster(response.data.data[0]);
      }
    } catch (error) {
      toast.error('Failed to fetch rosters');
    } finally {
      setLoading(false);
    }
  };

  const fetchRosterEntries = async (rosterId) => {
    try {
      const response = await api.get(`/rosters/${rosterId}/entries`);
      setEntries(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch entries');
    }
  };

  const handleRosterChange = (roster) => {
    setSelectedRoster(roster);
    setPublishConflicts([]);
    fetchRosterEntries(roster._id);
  };

  const handlePublish = async () => {
    if (!selectedRoster) return;
    try {
      const response = await api.put(`/rosters/${selectedRoster._id}/publish`);
      setSelectedRoster(response.data.data.roster);
      setEntries(response.data.data.entries);
      toast.success('Roster published successfully');
      setRosters(current => current.map(roster =>
        roster._id === response.data.data.roster._id ? response.data.data.roster : roster
      ));
      setPublishConflicts([]);
    } catch (error) {
      setPublishConflicts(error.response?.data?.conflicts || []);
      if (error.response?.data?.roster) {
        setSelectedRoster(error.response.data.roster);
        setRosters(current => current.map(roster =>
          roster._id === error.response.data.roster._id ? error.response.data.roster : roster
        ));
      }
      toast.error(error.response?.data?.message || 'Failed to publish');
    }
  };

  const handleRevalidate = async () => {
    if (!selectedRoster) return;
    try {
      const response = await api.post(`/rosters/${selectedRoster._id}/revalidate`);
      setSelectedRoster(response.data.data.roster);
      setEntries(response.data.data.entries);
      setPublishConflicts(response.data.data.conflicts.filter(conflict => conflict.severity === 'critical'));
      setRosters(current => current.map(roster =>
        roster._id === response.data.data.roster._id ? response.data.data.roster : roster
      ));
      toast.success(response.data.data.roster.isValid ? 'Roster revalidated successfully' : 'Coverage conflicts detected');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to revalidate');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" /></div>;

  const dates = selectedRoster ? eachDayOfInterval({
    start: startOfMonth(new Date(selectedRoster.year, selectedRoster.month - 1, 1)),
    end: endOfMonth(new Date(selectedRoster.year, selectedRoster.month - 1, 1))
  }) : [];

  const getStatusColor = (status) => {
    switch(status) {
      case 'working': return 'bg-green-100 text-green-800';
      case 'weekly-off': return 'bg-gray-100 text-gray-800';
      case 'public-holiday': return 'bg-blue-100 text-blue-800';
      case 'approved-leave': return 'bg-orange-100 text-orange-800';
      case 'comp-off': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monthly Roster</h1>
          <p className="text-sm text-gray-600 mt-1">View and manage monthly schedules</p>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-4 items-center">
          <label className="text-sm font-medium">Select Roster:</label>
          <select
            value={selectedRoster?._id || ''}
            onChange={(e) => {
              const roster = rosters.find(r => r._id === e.target.value);
              if (roster) handleRosterChange(roster);
            }}
            className="input-field max-w-xs"
          >
            {rosters.map(roster => (
              <option key={roster._id} value={roster._id}>
                {format(new Date(roster.year, roster.month - 1), 'MMMM yyyy')} - {roster.status}
              </option>
            ))}
          </select>
          {selectedRoster && selectedRoster.status === 'draft' && (
            <button onClick={handlePublish} className="btn-primary">
              Publish Roster
            </button>
          )}
          {selectedRoster && (
            <button onClick={handleRevalidate} className="btn-secondary">
              Revalidate
            </button>
          )}
        </div>
      </div>
      {publishConflicts.length > 0 && (
        <div className="card border border-red-200 bg-red-50">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-red-900">Publishing blocked: critical coverage gaps</h3>
              <p className="text-sm text-red-800 mt-1">
                Assign qualified, available employees to the affected processes, then revalidate. The roster cannot be published until required coverage is met.
              </p>
            </div>
            <button type="button" onClick={() => navigate('/assignments')} className="btn-secondary shrink-0">
              Manage Assignments
            </button>
          </div>
          <ul className="mt-4 space-y-2">
            {publishConflicts.map((conflict, index) => (
              <li key={conflict._id || `${conflict.process}-${index}`} className="text-sm text-red-900">
                {conflict.explanation || `Required ${conflict.requiredEmployees}, available ${conflict.availableEmployees}`}
                {conflict.brand?.brandName && ` — ${conflict.brand.brandName}`}
                {conflict.process?.processName && ` / ${conflict.process.processName}`}
                {conflict.possibleResolution && (
                  <span className="block mt-1 text-red-800">
                    Recommended action: {conflict.possibleResolution}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {selectedRoster && (
        <div className="card flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search employee..."
            className="input-field md:max-w-xs"
          />
          <select value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)} className="input-field md:max-w-xs">
            <option value="all">All brands</option>
            {[...new Map(entries.filter(entry => entry.brand).map(entry => [entry.brand._id, entry.brand])).values()].map(brand => (
              <option key={brand._id} value={brand._id}>{brand.brandName}</option>
            ))}
          </select>
        </div>
      )}

      {selectedRoster && (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {format(new Date(selectedRoster.year, selectedRoster.month - 1), 'MMMM yyyy')}
            </h3>
            <div className="flex gap-4 text-sm">
              <span>Total Assignments: {selectedRoster.metadata?.totalAssignments || 0}</span>
              <span className={selectedRoster.isValid ? 'text-green-600' : 'text-red-600'}>
                {selectedRoster.isValid ? '✓ Valid' : '✗ Has Conflicts'}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Employee</th>
                  {dates.map(date => (
                    <th key={date.toString()} className="px-2 py-2 text-center text-xs font-medium text-gray-500">
                      {format(date, 'EEE dd')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {Array.from(new Set(entries
                  .filter(e => brandFilter === 'all' || e.brand?._id === brandFilter)
                  .filter(e => !searchTerm || e.employee?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(e => e.employee?._id))).map(empId => {
                  const empEntries = entries.filter(e => e.employee?._id === empId);
                  const employee = empEntries[0]?.employee;
                  return (
                    <tr key={empId}>
                      <td className="px-4 py-2 text-sm font-medium">{employee?.fullName}</td>
                      {dates.map(date => {
                        const entry = empEntries.find(e => 
                          format(new Date(e.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                        );
                        return (
                          <td key={date.toString()} className="px-2 py-2">
                            {entry && (
                              <div className={`text-xs px-2 py-1 rounded text-center ${getStatusColor(entry.status)}`}>
                                {entry.status === 'working' ? 'W' :
                                 entry.status === 'weekly-off' ? 'OFF' :
                                 entry.status === 'public-holiday' ? 'H' :
                                 entry.status === 'approved-leave' ? 'L' : '-'}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Legend:</h4>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-6 h-6 bg-green-100 rounded"></div> Working
              </span>
              <span className="flex items-center gap-1">
                <div className="w-6 h-6 bg-gray-100 rounded"></div> Weekly Off
              </span>
              <span className="flex items-center gap-1">
                <div className="w-6 h-6 bg-blue-100 rounded"></div> Holiday
              </span>
              <span className="flex items-center gap-1">
                <div className="w-6 h-6 bg-orange-100 rounded"></div> Leave
              </span>
            </div>
          </div>
        </div>
      )}

      {!selectedRoster && rosters.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No rosters generated yet. Go to Roster Generator to create one.</p>
        </div>
      )}
    </div>
  );
};

export default MonthlyRoster;
