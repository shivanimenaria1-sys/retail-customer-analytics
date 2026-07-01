import React, { useState } from 'react';
import { Settings as SettingsIcon, Database, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';

const Settings = () => {
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:8000');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure database connections and platform preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Navigation Sidebar inside Settings */}
        <div className="space-y-1.5">
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 text-left">
            <SettingsIcon className="h-5 w-5" /> General Configuration
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-left">
            <Database className="h-5 w-5" /> Database Sync
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-left">
            <ShieldAlert className="h-5 w-5" /> Access Credentials
          </button>
        </div>

        {/* Configurations Forms */}
        <div className="md:col-span-2 space-y-6">
          
          {/* API Configuration */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-lg font-bold border-b border-slate-50 dark:border-slate-800 pb-2">API Connection Setup</h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">FastAPI Server Endpoint</label>
                <input
                  type="text"
                  required
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-500"
                  placeholder="http://localhost:8000"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors cursor-pointer text-sm"
                >
                  Save API Endpoint
                </button>
                {saved && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-455 font-semibold flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4" /> Changes applied.
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* System Environment */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-lg font-bold border-b border-slate-50 dark:border-slate-800 pb-2 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-slate-500" /> Platform Environment
            </h3>
            
            <div className="text-sm space-y-2.5 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-850 pb-2">
                <span>Frontend Server:</span>
                <span className="font-semibold text-slate-850 dark:text-slate-200">Vite v6.0.5</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-850 pb-2">
                <span>Framework:</span>
                <span className="font-semibold text-slate-850 dark:text-slate-200">React v18.3.1</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-850 pb-2">
                <span>Tailwind CSS:</span>
                <span className="font-semibold text-slate-850 dark:text-slate-200">v4.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Deployment Mode:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Development (Active Localhost)</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Settings;
