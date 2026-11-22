import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { Plus, Check, X, Umbrella } from 'lucide-react';
import { format } from 'date-fns';

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    employee: '',
    leaveType: 'planned-leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await api.get('/leaves');
      setLeaves(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch leaves');
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
      await api.post('/leaves', formData);
      toast.success('Leave request created');
      setShowModal(false);
      setFormData({ employee: '', leaveType: 'planned-leave', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/leaves/${id}/approve`);
      toast.success('Leave approved');
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      try {
        await api.put(`/leaves/${id}/reject`, { rejectionReason: reason });
        toast.success('Leave rejected');
        fetchLeaves();
      } catch (error) {
        toast.error('Failed to reject');
      }
    }
  };

  const filteredLeaves = leaves.filter(leave => {
    if (filter === 'all') return true;
    return leave.status === filter;
  });

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage employee leave requests</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} />Request Leave
        </button>
      </div>

      <div className="card">
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                filter === status ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLeaves.map((leave) => (
          <div key={leave._id} className="card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{leave.employee?.fullName}</h3>
                <p className="text-xs text-gray-500 capitalize">{leave.leaveType.replace('-', ' ')}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                leave.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {leave.status}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">From:</span> {format(new Date(leave.startDate), 'MMM dd, yyyy')}</div>
              <div><span className="font-medium">To:</span> {format(new Date(leave.endDate), 'MMM dd, yyyy')}</div>
              <div><span className="font-medium">Reason:</span> {leave.reason}</div>
            </div>
            {leave.status === 'pending' && (
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <button onClick={() => handleApprove(leave._id)} className="flex-1 btn-primary text-sm py-2">
                  <Check size={16} className="inline mr-1" />Approve
                </button>
                <button onClick={() => handleReject(leave._id)} className="flex-1 btn-danger text-sm py-2">
                  <X size={16} className="inline mr-1" />Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Request Leave">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type *</label>
            <select
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              className="input-field"
              required
            >
              <option value="planned-leave">Planned Leave</option>
              <option value="sick-leave">Sick Leave</option>
              <option value="casual-leave">Casual Leave</option>
              <option value="comp-off">Comp Off</option>
              <option value="emergency-leave">Emergency Leave</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="input-field"
              rows="3"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Submit</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Leaves;
