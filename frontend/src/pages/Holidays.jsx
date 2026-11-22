import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { Plus, Trash2, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import ConfirmDialog from '../components/ConfirmDialog';

const Holidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    year: new Date().getFullYear(),
    description: ''
  });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await api.get('/holidays');
      setHolidays(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch holidays');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/holidays', formData);
      toast.success('Holiday created');
      setShowModal(false);
      setFormData({ name: '', date: '', year: new Date().getFullYear(), description: '' });
      fetchHolidays();
    } catch (error) {
      toast.error('Failed to create holiday');
    }
  };

  const handleDelete = async () => {
    if (!selectedHoliday) return;
    try {
      await api.delete(`/holidays/${selectedHoliday._id}`);
      toast.success('Holiday deleted');
      setShowDeleteDialog(false);
      setSelectedHoliday(null);
      fetchHolidays();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Public Holidays</h1>
          <p className="text-sm text-gray-600 mt-1">Manage company holidays</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} />Add Holiday
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {holidays.map((holiday) => (
          <div key={holiday._id} className="card hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">{holiday.name}</h3>
                <p className="text-sm text-primary-600 mt-1">{format(new Date(holiday.date), 'MMMM dd, yyyy')}</p>
                <p className="text-xs text-gray-500 mt-2">{holiday.description}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedHoliday(holiday);
                  setShowDeleteDialog(true);
                }}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Holiday">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  setFormData({ ...formData, date: e.target.value, year: date.getFullYear() });
                }}
                className="input-field"
                required
              />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows="2"
            />
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
          setSelectedHoliday(null);
        }}
        onConfirm={handleDelete}
        title="Delete Holiday"
        message={`Are you sure you want to delete ${selectedHoliday?.name}?`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Holidays;
