import React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Save, Shield, Bell, Globe, Loader2, Info } from 'lucide-react';
import api from '../../utils/api';

const AdminSettings = () => {
  // --- Fetch Current Settings ---
  const { data: config, isLoading } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: async () => {
      const res = await api.get('/api/admin/settings');
      return res?.data;
    }
  });

  // --- Update Mutation ---
  const updateMutation = useMutation({
    mutationFn: (newConfig) => api.put('/api/admin/settings', newConfig),
    onSuccess: () => alert('Settings updated successfully!')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    updateMutation.mutate(data);
  };

  if (isLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">System Settings</h2>
          <p className="text-slate-500">Configure global platform behavior and security.</p>
        </div>
        <button 
          type="submit"
          disabled={updateMutation.isPending}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70"
        >
          {updateMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid gap-6">
        {/* Security Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl">
              <Shield size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Security & Access</h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between py-2">
              <div className="max-w-[70%]">
                <p className="font-semibold text-slate-700">Allow Public Registrations</p>
                <p className="text-xs text-slate-500">When disabled, only admins can create new user accounts.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="allowRegistration" className="sr-only peer" defaultChecked={config?.allowRegistration} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Branding Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
              <Globe size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Platform Branding</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Platform Name</label>
              <input 
                name="platformName"
                type="text" 
                defaultValue={config?.platformName || "Survey Admin Portal"}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Support Email</label>
              <input 
                name="supportEmail"
                type="email" 
                defaultValue={config?.supportEmail || "support@company.com"}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Info Alert */}
        <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex gap-3 text-blue-700">
          <Info size={20} className="shrink-0" />
          <p className="text-xs leading-relaxed">
            Settings updated here affect all users globally. Changes to security protocols may require users to re-login.
          </p>
        </div>
      </div>
    </form>
  );
};

export default AdminSettings;