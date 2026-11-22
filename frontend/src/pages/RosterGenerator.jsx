import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Calendar, AlertTriangle } from 'lucide-react';

const RosterGenerator = () => {
  const navigate = useNavigate();
  const [pods, setPods] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    pods: [],
    brands: []
  });
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [podRes, brandRes] = await Promise.all([
        api.get('/pods'),
        api.get('/brands')
      ]);
      setPods(podRes.data.data);
      setBrands(brandRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data');
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const response = await api.post('/rosters/generate', formData);
      setResult(response.data.data);
      toast.success('Roster generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate roster');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Roster Generator</h1>
        <p className="text-sm text-gray-600 mt-1">Generate monthly rosters with intelligent scheduling</p>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month *</label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                className="input-field"
                required
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i+1} value={i+1}>
                    {new Date(2024, i, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Pods (Leave empty for all)
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {pods.map(pod => (
                <label key={pod._id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.pods.includes(pod._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, pods: [...formData.pods, pod._id] });
                      } else {
                        setFormData({ ...formData, pods: formData.pods.filter(p => p !== pod._id) });
                      }
                    }}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="ml-2 text-sm">{pod.podName}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Brands (Leave empty for all)
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {brands.map(brand => (
                <label key={brand._id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.brands.includes(brand._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, brands: [...formData.brands, brand._id] });
                      } else {
                        setFormData({ ...formData, brands: formData.brands.filter(b => b !== brand._id) });
                      }
                    }}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="ml-2 text-sm">{brand.brandName}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Generating Roster...
              </>
            ) : (
              <>
                <Calendar size={20} />
                Generate Roster
              </>
            )}
          </button>
        </form>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card bg-blue-50 border-blue-200">
              <h3 className="text-sm font-medium text-blue-900">Total Entries</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{result.entries?.length || 0}</p>
            </div>
            <div className="card bg-green-50 border-green-200">
              <h3 className="text-sm font-medium text-green-900">Valid Roster</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{result.roster?.isValid ? 'Yes' : 'No'}</p>
            </div>
            <div className="card bg-red-50 border-red-200">
              <h3 className="text-sm font-medium text-red-900">Conflicts</h3>
              <p className="text-3xl font-bold text-red-600 mt-2">{result.conflicts?.length || 0}</p>
            </div>
          </div>

          {result.conflicts && result.conflicts.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="text-red-600" />
                <h3 className="text-lg font-semibold">Scheduling Conflicts</h3>
              </div>
              <div className="space-y-3">
                {result.conflicts.map((conflict, index) => (
                  <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-red-900">{conflict.conflictType.replace('-', ' ')}</p>
                        <p className="text-sm text-red-700 mt-1">{conflict.explanation}</p>
                        {conflict.possibleResolution && (
                          <p className="text-xs text-red-600 mt-2">💡 {conflict.possibleResolution}</p>
                        )}
                      </div>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-200 text-red-900">
                        {conflict.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/monthly-roster')}
              className="btn-primary"
            >
              View Roster
            </button>
            <button
              onClick={() => navigate('/conflicts')}
              className="btn-secondary"
            >
              Manage Conflicts
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RosterGenerator;
