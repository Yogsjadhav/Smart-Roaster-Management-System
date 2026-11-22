import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';
import { Plus, Search, Edit, Trash2, Layers } from 'lucide-react';

const Processes = () => {
  const [processes, setProcesses] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [formData, setFormData] = useState({
    processName: '',
    processCode: '',
    brand: '',
    minimumStaffingRequirement: 1,
    operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    holidayPolicy: 'closed',
    sundayPolicy: 'closed',
    shiftRequirements: 'flexible',
    isActive: true
  });

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchProcesses();
    fetchBrands();
  }, []);

  const fetchProcesses = async () => {
    try {
      const response = await api.get('/processes');
      setProcesses(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch processes');
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await api.get('/brands');
      setBrands(response.data.data);
    } catch (error) {
      console.error('Failed to fetch brands');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedProcess) {
        await api.put(`/processes/${selectedProcess._id}`, formData);
        toast.success('Process updated successfully');
      } else {
        await api.post('/processes', formData);
        toast.success('Process created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchProcesses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/processes/${selectedProcess._id}`);
      toast.success('Process deleted successfully');
      setShowDeleteDialog(false);
      setSelectedProcess(null);
      fetchProcesses();
    } catch (error) {
      toast.error('Failed to delete process');
    }
  };

  const handleEdit = (process) => {
    setSelectedProcess(process);
    setFormData({
      processName: process.processName,
      processCode: process.processCode,
      brand: process.brand._id,
      minimumStaffingRequirement: process.minimumStaffingRequirement,
      operatingDays: process.operatingDays || [],
      holidayPolicy: process.holidayPolicy,
      sundayPolicy: process.sundayPolicy,
      shiftRequirements: process.shiftRequirements,
      isActive: process.isActive
    });
    setShowModal(true);
  };

  const toggleOperatingDay = (day) => {
    const days = [...formData.operatingDays];
    if (days.includes(day)) {
      setFormData({ ...formData, operatingDays: days.filter(d => d !== day) });
    } else {
      setFormData({ ...formData, operatingDays: [...days, day] });
    }
  };

  const resetForm = () => {
    setSelectedProcess(null);
    setFormData({
      processName: '',
      processCode: '',
      brand: '',
      minimumStaffingRequirement: 1,
      operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      holidayPolicy: 'closed',
      sundayPolicy: 'closed',
      shiftRequirements: 'flexible',
      isActive: true
    });
  };

  const filteredProcesses = processes.filter(process =>
    process.processName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.processCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.brand?.brandName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Processes</h1>
          <p className="text-sm text-gray-600 mt-1">Manage operational processes</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Process
        </button>
      </div>

      <div className="card">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search processes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {filteredProcesses.length > 0 ? (
        <div className="card p-0">
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Code</th>
                  <th className="table-header-cell">Process Name</th>
                  <th className="table-header-cell">Brand</th>
                  <th className="table-header-cell">Min Staff</th>
                  <th className="table-header-cell">Shift</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredProcesses.map((process) => (
                  <tr key={process._id}>
                    <td className="table-cell font-medium">{process.processCode}</td>
                    <td className="table-cell">{process.processName}</td>
                    <td className="table-cell">{process.brand?.brandName}</td>
                    <td className="table-cell">{process.minimumStaffingRequirement}</td>
                    <td className="table-cell">
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                        {process.shiftRequirements}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        process.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {process.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(process)}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProcess(process);
                            setShowDeleteDialog(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <EmptyState
            icon={Layers}
            title="No processes found"
            description="Start by adding your first process."
            action={
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                Add Process
              </button>
            }
          />
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={selectedProcess ? 'Edit Process' : 'Add Process'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Process Name *
              </label>
              <input
                type="text"
                value={formData.processName}
                onChange={(e) => setFormData({ ...formData, processName: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Process Code *
              </label>
              <input
                type="text"
                value={formData.processCode}
                onChange={(e) => setFormData({ ...formData, processCode: e.target.value.toUpperCase() })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand *
              </label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select Brand</option>
                {brands.map(brand => (
                  <option key={brand._id} value={brand._id}>{brand.brandName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Staffing *
              </label>
              <input
                type="number"
                value={formData.minimumStaffingRequirement}
                onChange={(e) => setFormData({ ...formData, minimumStaffingRequirement: parseInt(e.target.value) })}
                className="input-field"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operating Days *
            </label>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleOperatingDay(day)}
                  className={`px-2 py-2 text-xs rounded-lg font-medium transition-colors ${
                    formData.operatingDays.includes(day)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Holiday Policy *
              </label>
              <select
                value={formData.holidayPolicy}
                onChange={(e) => setFormData({ ...formData, holidayPolicy: e.target.value })}
                className="input-field"
                required
              >
                <option value="closed">Closed</option>
                <option value="open">Open</option>
                <option value="skeleton-staff">Skeleton Staff</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sunday Policy *
              </label>
              <select
                value={formData.sundayPolicy}
                onChange={(e) => setFormData({ ...formData, sundayPolicy: e.target.value })}
                className="input-field"
                required
              >
                <option value="closed">Closed</option>
                <option value="open">Open</option>
                <option value="skeleton-staff">Skeleton Staff</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shift Requirements *
              </label>
              <select
                value={formData.shiftRequirements}
                onChange={(e) => setFormData({ ...formData, shiftRequirements: e.target.value })}
                className="input-field"
                required
              >
                <option value="flexible">Flexible</option>
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
                <option value="24x7">24x7</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {selectedProcess ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedProcess(null);
        }}
        onConfirm={handleDelete}
        title="Delete Process"
        message={`Are you sure you want to delete ${selectedProcess?.processName}?`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Processes;
