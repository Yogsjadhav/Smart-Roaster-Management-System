import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';
import { Plus, Search, Edit, Trash2, GitBranch } from 'lucide-react';

const Pods = () => {
  const [pods, setPods] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPod, setSelectedPod] = useState(null);
  const [formData, setFormData] = useState({
    podName: '',
    podLead: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchPods();
    fetchEmployees();
  }, []);

  const fetchPods = async () => {
    try {
      const response = await api.get('/pods');
      setPods(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch pods');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data.data);
    } catch (error) {
      console.error('Failed to fetch employees');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedPod) {
        await api.put(`/pods/${selectedPod._id}`, formData);
        toast.success('Pod updated successfully');
      } else {
        await api.post('/pods', formData);
        toast.success('Pod created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchPods();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/pods/${selectedPod._id}`);
      toast.success('Pod deleted successfully');
      setShowDeleteDialog(false);
      setSelectedPod(null);
      fetchPods();
    } catch (error) {
      toast.error('Failed to delete pod');
    }
  };

  const handleEdit = (pod) => {
    setSelectedPod(pod);
    setFormData({
      podName: pod.podName,
      podLead: pod.podLead?._id || '',
      description: pod.description || '',
      isActive: pod.isActive
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setSelectedPod(null);
    setFormData({
      podName: '',
      podLead: '',
      description: '',
      isActive: true
    });
  };

  const filteredPods = pods.filter(pod =>
    pod.podName.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Operational Pods</h1>
          <p className="text-sm text-gray-600 mt-1">Manage team pods</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Pod
        </button>
      </div>

      <div className="card">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search pods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {filteredPods.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPods.map((pod) => (
            <div key={pod._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{pod.podName}</h3>
                  <p className="text-sm text-gray-500 mt-1">{pod.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  pod.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {pod.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <span className="text-gray-600 font-medium w-24">Pod Lead:</span>
                  <span className="text-gray-900">{pod.podLead?.fullName || 'Not Assigned'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-600 font-medium w-24">Members:</span>
                  <span className="text-gray-900">{pod.employees?.length || 0} employees</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-600 font-medium w-24">Brands:</span>
                  <span className="text-gray-900">{pod.assignedBrands?.length || 0} assigned</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleEdit(pod)}
                  className="flex-1 btn-secondary text-sm py-2"
                >
                  <Edit size={16} className="inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setSelectedPod(pod);
                    setShowDeleteDialog(true);
                  }}
                  className="flex-1 btn-danger text-sm py-2"
                >
                  <Trash2 size={16} className="inline mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <EmptyState
            icon={GitBranch}
            title="No pods found"
            description="Start by adding your first operational pod."
            action={
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                Add Pod
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
        title={selectedPod ? 'Edit Pod' : 'Add Pod'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pod Name *
            </label>
            <input
              type="text"
              value={formData.podName}
              onChange={(e) => setFormData({ ...formData, podName: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pod Lead
            </label>
            <select
              value={formData.podLead}
              onChange={(e) => setFormData({ ...formData, podLead: e.target.value })}
              className="input-field"
            >
              <option value="">Select Pod Lead</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.fullName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows="3"
            />
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
              {selectedPod ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedPod(null);
        }}
        onConfirm={handleDelete}
        title="Delete Pod"
        message={`Are you sure you want to delete ${selectedPod?.podName}?`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Pods;
