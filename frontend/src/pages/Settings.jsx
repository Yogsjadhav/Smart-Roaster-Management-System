import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const defaults = {
  companyName: 'Smart Roster Operations',
  workingDays: 6,
  weeklyOff: 'Sunday',
  shiftStart: '09:00',
  shiftEnd: '18:00',
  schedulingPreference: 'balanced',
  minimumStaffing: 1
};

const Settings = () => {
  const [settings, setSettings] = useState(defaults);

  useEffect(() => {
    const saved = localStorage.getItem('smartRosterSettings');
    if (saved) setSettings({ ...defaults, ...JSON.parse(saved) });
  }, []);

  const saveSettings = (event) => {
    event.preventDefault();
    localStorage.setItem('smartRosterSettings', JSON.stringify(settings));
    toast.success('Settings saved');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600 mt-1">Configure company defaults and scheduling preferences</p>
      </div>

      <form onSubmit={saveSettings} className="card max-w-3xl space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
          <input
            value={settings.companyName}
            onChange={(event) => setSettings({ ...settings, companyName: event.target.value })}
            className="input-field"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default working days per week</label>
            <input type="number" min="1" max="7" value={settings.workingDays}
              onChange={(event) => setSettings({ ...settings, workingDays: Number(event.target.value) })}
              className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default weekly off</label>
            <select value={settings.weeklyOff} onChange={(event) => setSettings({ ...settings, weeklyOff: event.target.value })} className="input-field">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default shift start</label>
            <input type="time" value={settings.shiftStart}
              onChange={(event) => setSettings({ ...settings, shiftStart: event.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default shift end</label>
            <input type="time" value={settings.shiftEnd}
              onChange={(event) => setSettings({ ...settings, shiftEnd: event.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scheduling preference</label>
            <select value={settings.schedulingPreference}
              onChange={(event) => setSettings({ ...settings, schedulingPreference: event.target.value })} className="input-field">
              <option value="balanced">Balanced workload</option>
              <option value="preference-first">Respect preferences</option>
              <option value="minimum-change">Minimum-change scheduling</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default minimum staffing</label>
            <input type="number" min="0" value={settings.minimumStaffing}
              onChange={(event) => setSettings({ ...settings, minimumStaffing: Number(event.target.value) })} className="input-field" />
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t">
          <button type="submit" className="btn-primary">Save Settings</button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
