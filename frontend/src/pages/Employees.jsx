import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';
import { Plus, Search, Edit, Trash2, Users as UsersIcon } from 'lucide-react';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    joiningDate: '',
    employmentStatus: 'active',
    operationalPod: '',
    isPodLead: false,
    weeklyOffPreferences: [],
    maxWorkingDaysPerMonth: 26,
    shiftPreferences: 'flexible'
  });

  useEffect(() => {
    fetchEmployees();
    fetchPods();
  }, []);

  const fetchPods = async () => {
    try {
      const response = await api.get('/pods');
      setPods(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch pods');
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const employeeData = {
        ...formData,
        operationalPod: formData.operationalPod || null
      };
      if (selectedEmployee) {
        await api.put(`/employees/${selectedEmployee._id}`, employeeData);
        toast.success('Employee updated successfully');
      } else {
        await api.post('/employees', employeeData);
        toast.success('Employee created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/employees/${selectedEmployee._id}`);
      toast.success('Employee deleted successfully');
      setShowDeleteDialog(false);
      setSelectedEmployee(null);
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to delete employee');
    }
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      employeeId: employee.employeeId,
      fullName: employee.fullName,
      email: employee.email,
      phone: employee.phone,
      designation: employee.designation,
      department: employee.department,
      joiningDate: employee.joiningDate?.split('T')[0] || '',
      employmentStatus: employee.employmentStatus,
      operationalPod: employee.operationalPod?._id || '',
      isPodLead: Boolean(employee.isPodLead),
      weeklyOffPreferences: employee.weeklyOffPreferences || [],
      maxWorkingDaysPerMonth: employee.maxWorkingDaysPerMonth || 26,
      shiftPreferences: employee.shiftPreferences || 'flexible'
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setSelectedEmployee(null);
    setFormData({
      employeeId: '',
      fullName: '',
      email: '',
      phone: '',
      designation: '',
      department: '',
      joiningDate: '',
      employmentStatus: 'active',
      operationalPod: '',
      isPodLead: false,
          weeklyOffPreferences: [],
      maxWorkingDaysPerMonth: 26,
      shiftPreferences: 'flexible'
    });
  };

  const filteredEmployees = employees.filter(emp =>
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your workforce</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Employee
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees by name, ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Table */}
      {filteredEmployees.length > 0 ? (
        <div className="card p-0">
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Employee ID</th>
                  <th className="table-header-cell">Name</th>
                  <th className="table-header-cell">Email</th>
                  <th className="table-header-cell">Designation</th>
                  <th className="table-header-cell">Department</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredEmployees.map((employee) => (
                  <tr key={employee._id}>
                    <td className="table-cell font-medium">{employee.employeeId}</td>
                    <td className="table-cell">{employee.fullName}</td>
                    <td className="table-cell">{employee.email}</td>
                    <td className="table-cell">{employee.designation}</td>
                    <td className="table-cell">{employee.department}</td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        employee.employmentStatus === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.employmentStatus}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEmployee(employee);
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
            icon={UsersIcon}
            title="No employees found"
            description="Start by adding your first employee to the system."
            action={
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                Add Employee
              </button>
            }
          />
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={selectedEmployee ? 'Edit Employee' : 'Add Employee'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID *
              </label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation *
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Joining Date *
              </label>
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Status *
              </label>
              <select
                value={formData.employmentStatus}
                onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                className="input-field"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operational Pod</label>
              <select
                value={formData.operationalPod}
                onChange={(event) => setFormData({ ...formData, operationalPod: event.target.value })}
                className="input-field"
              >
                <option value="">Not Assigned</option>
                {pods.map(pod => <option key={pod._id} value={pod._id}>{pod.podName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Working Days</label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.maxWorkingDaysPerMonth}
                onChange={(event) => setFormData({ ...formData, maxWorkingDaysPerMonth: parseInt(event.target.value) })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift Preference</label>
              <select
                value={formData.shiftPreferences}
                onChange={(event) => setFormData({ ...formData, shiftPreferences: event.target.value })}
                className="input-field"
              >
                <option value="flexible">Flexible</option>
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <label className="text-sm font-medium text-gray-700">Weekly Off Preferences</label>
            <div className="flex flex-wrap gap-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    weeklyOffPreferences: formData.weeklyOffPreferences.includes(day)
                      ? formData.weeklyOffPreferences.filter(item => item !== day)
                      : [...formData.weeklyOffPreferences, day]
                  })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    formData.weeklyOffPreferences.includes(day)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isPodLead}
              onChange={(event) => setFormData({ ...formData, isPodLead: event.target.checked })}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Pod lead</span>
          </label>

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
              {selectedEmployee ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedEmployee(null);
        }}
        onConfirm={handleDelete}
        title="Delete Employee"
        message={`Are you sure you want to delete ${selectedEmployee?.fullName}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Employees;
