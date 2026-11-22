import React, { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Download, Printer, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';

const Reports = () => {
  const [rosters, setRosters] = useState([]);
  const [selectedRoster, setSelectedRoster] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRosters();
  }, []);

  useEffect(() => {
    if (selectedRoster) fetchEntries(selectedRoster);
  }, [selectedRoster]);

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

  const fetchEntries = async (rosterId) => {
    try {
      const response = await api.get(`/rosters/${rosterId}/entries`);
      setEntries(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch report data');
    }
  };

  const csvRows = () => [
    ['Employee', 'Employee ID', 'Brand', 'Process', 'Date', 'Status', 'Shift', 'Manual Override'],
    ...entries.map(entry => [
      entry.employee?.fullName || '',
      entry.employee?.employeeId || '',
      entry.brand?.brandName || '',
      entry.process?.processName || '',
      format(new Date(entry.date), 'yyyy-MM-dd'),
      entry.status,
      entry.shift,
      entry.isManualOverride ? 'Yes' : 'No'
    ])
  ];

  const downloadCsv = () => {
    const csv = csvRows().map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'monthly-roster.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded');
  };

  const downloadExcel = async () => {
    try {
      const { default: ExcelJS } = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Monthly Roster');
      csvRows().forEach(row => worksheet.addRow(row));
      worksheet.getRow(1).font = { bold: true };
      worksheet.columns.forEach(column => { column.width = 22; });
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'monthly-roster.xlsx';
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Excel report downloaded');
    } catch (error) {
      toast.error('Excel export failed');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" /></div>;

  const roster = rosters.find(item => item._id === selectedRoster);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Export</h1>
          <p className="text-sm text-gray-600 mt-1">Attendance, coverage, workload, and conflict reports</p>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadCsv} disabled={!entries.length} className="btn-secondary flex items-center gap-2">
            <Download size={18} /> CSV
          </button>
          <button onClick={downloadExcel} disabled={!entries.length} className="btn-primary flex items-center gap-2">
            <FileSpreadsheet size={18} /> Excel
          </button>
          <button onClick={() => window.print()} disabled={!entries.length} className="btn-secondary flex items-center gap-2">
            <Printer size={18} /> Print
          </button>
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Roster</label>
        <select value={selectedRoster} onChange={(e) => setSelectedRoster(e.target.value)} className="input-field max-w-md">
          {rosters.map(item => (
            <option key={item._id} value={item._id}>
              {format(new Date(item.year, item.month - 1), 'MMMM yyyy')} - {item.status}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          ['Entries', entries.length],
          ['Working', entries.filter(entry => entry.status === 'working').length],
          ['Leaves', entries.filter(entry => entry.status === 'approved-leave').length],
          ['Conflicts', roster?.totalConflicts || 0]
        ].map(([label, value]) => (
          <div key={label} className="card">
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          </div>
        ))}
      </div>

      {entries.length > 0 && (
        <div className="card p-0">
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  {['Employee', 'Brand', 'Process', 'Date', 'Status', 'Shift'].map(header => (
                    <th key={header} className="table-header-cell">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="table-body">
                {entries.slice(0, 250).map(entry => (
                  <tr key={entry._id}>
                    <td className="table-cell font-medium">{entry.employee?.fullName}</td>
                    <td className="table-cell">{entry.brand?.brandName}</td>
                    <td className="table-cell">{entry.process?.processName}</td>
                    <td className="table-cell">{format(new Date(entry.date), 'MMM dd, yyyy')}</td>
                    <td className="table-cell capitalize">{entry.status.replaceAll('-', ' ')}</td>
                    <td className="table-cell capitalize">{entry.shift}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
