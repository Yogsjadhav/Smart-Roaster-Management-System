import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { Plus, Trash2, GitBranch } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [brands, setBrands] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employee: '',
    brand: '',
    process: ''
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [assignRes, empRes, brandRes, procRes] = await Promise.all([
        api.get('/assignments'),
        api.get('/employees'),
        api.get('/brands'),
        api.get('/processes')
      ]);
      setAssignments(assignRes.data.data);
      setEmployees(empRes.data.data);
      setBrands(brandRes.data.data);
      setProcesses(procRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assignments', formData);
      toast.success('Assignment created successfully');
      setShowModal(false);
      setFormData({ employee: '', brand: '', process: '' });
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!selectedAssignment) return;
    try {
      await api.delete(`/assignments/${selectedAssignment._id}`);
      toast.success('Assignment deleted');
      setShowDeleteDialog(false);
      setSelectedAssignment(null);
      fetchAll();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const filteredProcesses = processes.filter(p => p.brand?._id === formData.brand);

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-sm text-gray-600 mt-1">Manage employee-brand-process assignments</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} />Add Assignment
        </button>
      </div>

      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Employee</th>
                <th className="table-header-cell">Brand</th>
                <th className="table-header-cell">Process</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {assignments.map((assignment) => (
                <tr key={assignment._id}>
                  <td className="table-cell">{assignment.employee?.fullName}</td>
                  <td className="table-cell">{assignment.brand?.brandName}</td>
                  <td className="table-cell">{assignment.process?.processName}</td>
                  <td className="table-cell">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      assignment.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {assignment.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setShowDeleteDialog(true);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Assignment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
            <select
              value={formData.employee}
              onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
            <select
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value, process: '' })}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Process *</label>
            <select
              value={formData.process}
              onChange={(e) => setFormData({ ...formData, process: e.target.value })}
              className="input-field"
              required
              disabled={!formData.brand}
            >
              <option value="">Select Process</option>
              {filteredProcesses.map(proc => (
                <option key={proc._id} value={proc._id}>{proc.processName}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedAssignment(null);
        }}
        onConfirm={handleDelete}
        title="Delete Assignment"
        message="Are you sure you want to remove this employee assignment?"
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Assignments;
