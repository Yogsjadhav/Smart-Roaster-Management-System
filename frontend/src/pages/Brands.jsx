import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [formData, setFormData] = useState({
    brandName: '',
    brandCode: '',
    description: '',
    status: 'active',
    assignedPod: '',
    operatingCalendar: 'except-sundays-holidays',
    publicHolidayPolicy: 'closed',
    sundayPolicy: 'closed',
    minimumStaffingRequirement: 1
  });

  useEffect(() => {
    fetchBrands();
    fetchPods();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await api.get('/brands');
      setBrands(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch brands');
    } finally {
      setLoading(false);
    }
  };

  const fetchPods = async () => {
    try {
      const response = await api.get('/pods');
      setPods(response.data.data);
    } catch (error) {
      console.error('Failed to fetch pods');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const brandData = {
        ...formData,
        assignedPod: formData.assignedPod || null
      };
      if (selectedBrand) {
        await api.put(`/brands/${selectedBrand._id}`, brandData);
        toast.success('Brand updated successfully');
      } else {
        await api.post('/brands', brandData);
        toast.success('Brand created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchBrands();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/brands/${selectedBrand._id}`);
      toast.success('Brand deleted successfully');
      setShowDeleteDialog(false);
      setSelectedBrand(null);
      fetchBrands();
    } catch (error) {
      toast.error('Failed to delete brand');
    }
  };

  const handleEdit = (brand) => {
    setSelectedBrand(brand);
    setFormData({
      brandName: brand.brandName,
      brandCode: brand.brandCode,
      description: brand.description || '',
      status: brand.status,
      assignedPod: brand.assignedPod?._id || '',
      operatingCalendar: brand.operatingCalendar,
      publicHolidayPolicy: brand.publicHolidayPolicy,
      sundayPolicy: brand.sundayPolicy,
      minimumStaffingRequirement: brand.minimumStaffingRequirement
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setSelectedBrand(null);
    setFormData({
      brandName: '',
      brandCode: '',
      description: '',
      status: 'active',
      assignedPod: '',
      operatingCalendar: 'except-sundays-holidays',
      publicHolidayPolicy: 'closed',
      sundayPolicy: 'closed',
      minimumStaffingRequirement: 1
    });
  };

  const filteredBrands = brands.filter(brand =>
    brand.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.brandCode.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your brand portfolio</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Brand
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search brands by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Table */}
      {filteredBrands.length > 0 ? (
        <div className="card p-0">
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Brand Code</th>
                  <th className="table-header-cell">Brand Name</th>
                  <th className="table-header-cell">Operating Calendar</th>
                  <th className="table-header-cell">Pod</th>
                  <th className="table-header-cell">Min Staff</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredBrands.map((brand) => (
                  <tr key={brand._id}>
                    <td className="table-cell font-medium">{brand.brandCode}</td>
                    <td className="table-cell">{brand.brandName}</td>
                    <td className="table-cell">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {brand.operatingCalendar.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="table-cell">{brand.assignedPod?.podName || 'Not Assigned'}</td>
                    <td className="table-cell">{brand.minimumStaffingRequirement}</td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        brand.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {brand.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(brand)}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBrand(brand);
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
            icon={Package}
            title="No brands found"
            description="Start by adding your first brand to the system."
            action={
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                Add Brand
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
        title={selectedBrand ? 'Edit Brand' : 'Add Brand'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand Name *
              </label>
              <input
                type="text"
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand Code *
              </label>
              <input
                type="text"
                value={formData.brandCode}
                onChange={(e) => setFormData({ ...formData, brandCode: e.target.value.toUpperCase() })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows="2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Pod
              </label>
              <select
                value={formData.assignedPod}
                onChange={(e) => setFormData({ ...formData, assignedPod: e.target.value })}
                className="input-field"
              >
                <option value="">Select Pod</option>
                {pods.map(pod => (
                  <option key={pod._id} value={pod._id}>{pod.podName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operating Calendar *
              </label>
              <select
                value={formData.operatingCalendar}
                onChange={(e) => setFormData({ ...formData, operatingCalendar: e.target.value })}
                className="input-field"
                required
              >
                <option value="365-days">365 Days</option>
                <option value="except-holidays">Except Holidays</option>
                <option value="except-sundays-holidays">Except Sundays & Holidays</option>
                <option value="custom">Custom</option>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Public Holiday Policy *
              </label>
              <select
                value={formData.publicHolidayPolicy}
                onChange={(e) => setFormData({ ...formData, publicHolidayPolicy: e.target.value })}
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
              {selectedBrand ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedBrand(null);
        }}
        onConfirm={handleDelete}
        title="Delete Brand"
        message={`Are you sure you want to delete ${selectedBrand?.brandName}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Brands;
