import { useState, FormEvent } from 'react';
import { 
  Settings, 
  CreditCard, 
  Key, 
  BellRing, 
  Cpu, 
  Database, 
  ArrowRightCircle, 
  Info, 
  Check, 
  Trash2, 
  RefreshCw, 
  Download, 
  Upload 
} from 'lucide-react';
import { AdminSettings, SubscriptionPlan } from '../types';
import { formatINR, GymFlowStore } from '../dataStore';

interface SettingSectionProps {
  settings: AdminSettings;
  onSaveSettings: (settings: AdminSettings) => void;
  onResetDatabase: () => void;
  onImportBackup: (jsonStr: string) => boolean;
}

export default function SettingSection({
  settings,
  onSaveSettings,
  onResetDatabase,
  onImportBackup
}: SettingSectionProps) {
  const [activeTab, setActiveTab] = useState<'prices' | 'reminders' | 'credentials' | 'security' | 'database'>('prices');

  // Pricing inputs
  const [mFirst, setMFirst] = useState(settings.plans.find(p => p.id === 'monthly')?.firstMonthFee || 1500);
  const [mRenew, setMRenew] = useState(settings.plans.find(p => p.id === 'monthly')?.renewalFee || 1200);
  const [p3Month, setP3Month] = useState(settings.plans.find(p => p.id === '3-month')?.price || 3000);
  const [p6Month, setP6Month] = useState(settings.plans.find(p => p.id === '6-month')?.price || 5500);
  const [p1Year, setP1Year] = useState(settings.plans.find(p => p.id === '1-year')?.price || 10000);

  // Security pass
  const [adminPassword, setAdminPassword] = useState(settings.adminPasswordHash);
  
  // Notification options
  const [dailyAfter, setDailyAfter] = useState(settings.reminderDailyAfterExpiry);
  const [lastDay, setLastDay] = useState(settings.reminderOnLastDay);
  const [threeDays, setThreeDays] = useState(settings.reminder3DaysBefore);
  const [sevenDays, setSevenDays] = useState(settings.reminder7DaysBefore);

  // Providers
  const [smsProvider, setSmsProvider] = useState(settings.smsProvider);
  const [smsKey, setSmsKey] = useState(settings.smsApiKey);
  const [emailProvider, setEmailProvider] = useState(settings.emailProvider);
  const [emailKey, setEmailKey] = useState(settings.emailApiKey);

  // Status flags
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'idle' | 'success' | 'error'; msg: string }>({ type: 'idle', msg: '' });
  const [backupJson, setBackupJson] = useState('');

  const triggerSave = (e: FormEvent) => {
    e.preventDefault();
    
    // Build updated plans
    const updatedPlans: SubscriptionPlan[] = [
      { id: 'monthly', name: 'Monthly Plan', firstMonthFee: Number(mFirst), renewalFee: Number(mRenew), durationMonths: 1 },
      { id: '3-month', name: '3-Month Plan', price: Number(p3Month), durationMonths: 3 },
      { id: '6-month', name: '6-Month Plan', price: Number(p6Month), durationMonths: 6 },
      { id: '1-year', name: '1-Year Plan', price: Number(p1Year), durationMonths: 12 }
    ];

    const newSettings: AdminSettings = {
      plans: updatedPlans,
      adminPasswordHash: adminPassword,
      smsProvider,
      smsApiKey: smsKey,
      emailProvider,
      emailApiKey: emailKey,
      reminderDailyAfterExpiry: dailyAfter,
      reminderOnLastDay: lastDay,
      reminder3DaysBefore: threeDays,
      reminder7DaysBefore: sevenDays
    };

    onSaveSettings(newSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDownloadBackup = () => {
    const rawData = GymFlowStore.exportFullBackup();
    const blob = new Blob([rawData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GymFlow_Database_Backup_${new Date().toISOString().substring(0, 10)}.json`;
    link.click();
  };

  const handleImportClick = () => {
    if (!backupJson.trim()) {
      setImportStatus({ type: 'error', msg: 'Please paste database backup JSON first.' });
      return;
    }
    const result = onImportBackup(backupJson);
    if (result) {
      setImportStatus({ type: 'success', msg: 'Backup restored successfully! Core database hot-swapped.' });
      setBackupJson('');
    } else {
      setImportStatus({ type: 'error', msg: 'Invalid JSON signature. Parse failed.' });
    }
    setTimeout(() => setImportStatus({ type: 'idle', msg: '' }), 5000);
  };

  return (
    <div id="settings-component" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs flex flex-col min-h-[400px]">
      
      {/* Top Scrollbar / Horizontal Tabs Navigation */}
      <div id="settings-tabs-nav" className="w-full bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-150 dark:border-zinc-855 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          <h3 className="text-xxs font-extrabold uppercase font-mono tracking-widest text-zinc-400 dark:text-zinc-550 flex items-center space-x-1">
            <Settings className="w-3.5 h-3.5 text-orange-500" />
            <span>Settings Console</span>
          </h3>
          {savedSuccess && (
            <span className="text-[10px] text-green-600 dark:text-green-400 font-extrabold animate-pulse">
              ✔ Saved!
            </span>
          )}
        </div>

        <nav className="flex space-x-1 overflow-x-auto scrollbar-none pb-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('prices')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wider uppercase transition shrink-0 ${
              activeTab === 'prices' ? 'bg-orange-600 text-white shadow-sm' : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <CreditCard className="w-3 h-3" />
            <span>Prices</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reminders')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wider uppercase transition shrink-0 ${
              activeTab === 'reminders' ? 'bg-orange-600 text-white shadow-sm' : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <BellRing className="w-3 h-3" />
            <span>Reminders</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wider uppercase transition shrink-0 ${
              activeTab === 'security' ? 'bg-orange-600 text-white shadow-sm' : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <Key className="w-3 h-3" />
            <span>Security</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wider uppercase transition shrink-0 ${
              activeTab === 'database' ? 'bg-orange-600 text-white shadow-sm' : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <Database className="w-3 h-3" />
            <span>Database</span>
          </button>
        </nav>
      </div>

      {/* Main settings settings field */}
      <div id="settings-tab-view" className="flex-1 p-4 md:p-5 flex flex-col justify-between bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
        
        <form onSubmit={triggerSave} className="space-y-4">
          
          {savedSuccess && (
            <div className="p-2.5 bg-green-50 dark:bg-green-955/20 border-l-4 border-green-500 rounded-xl text-xxs font-bold text-green-700 dark:text-green-400 flex items-center space-x-2 animate-slide-in">
              <Check className="w-3.5 h-3.5" />
              <span>Configurations Saved Successfully. Store parameters loaded!</span>
            </div>
          )}

          {/* Pricing Config Tab */}
          {activeTab === 'prices' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h4 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-1.5 leading-none">Fit Pack Prices</h4>
                <p className="text-xs text-zinc-450 mt-1.5">Adjust custom gym membership plans. Rates are instantly mapped onto new assignments.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-zinc-50/50 dark:bg-zinc-950/40 p-4 border border-zinc-150 dark:border-zinc-850 rounded-2xl">
                  <span className="text-xxs uppercase tracking-wider text-orange-600 dark:text-orange-400 font-extrabold font-mono block mb-3">Modular Monthly Plan Rate (Customizable)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">First Month Entry Fee (₹)</label>
                      <input
                        type="number"
                        value={mFirst}
                        onChange={(e) => setMFirst(Number(e.target.value))}
                        className="w-full text-sm font-semibold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-xl px-3.5 py-2 focus:border-orange-500 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Subsequent Renewal Fee (₹)</label>
                      <input
                        type="number"
                        value={mRenew}
                        onChange={(e) => setMRenew(Number(e.target.value))}
                        className="w-full text-sm font-semibold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-xl px-3.5 py-2 focus:border-orange-500 outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border border-zinc-150 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 rounded-2xl">
                    <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-1 font-mono">3-Month Term Fee (₹)</label>
                    <input
                      type="number"
                      value={p3Month}
                      onChange={(e) => setP3Month(Number(e.target.value))}
                      className="w-full text-sm font-semibold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl px-3 py-1.5 focus:border-orange-500 outline-none transition"
                    />
                  </div>
                  <div className="border border-zinc-150 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 rounded-2xl">
                    <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-1 font-mono">6-Month Term Fee (₹)</label>
                    <input
                      type="number"
                      value={p6Month}
                      onChange={(e) => setP6Month(Number(e.target.value))}
                      className="w-full text-sm font-semibold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl px-3 py-1.5 focus:border-orange-500 outline-none transition"
                    />
                  </div>
                  <div className="border border-zinc-150 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 rounded-2xl">
                    <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-1 font-mono">1-Year Term Fee (₹)</label>
                    <input
                      type="number"
                      value={p1Year}
                      onChange={(e) => setP1Year(Number(e.target.value))}
                      className="w-full text-sm font-semibold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl px-3 py-1.5 focus:border-orange-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reminder Timing Selector */}
          {activeTab === 'reminders' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h4 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-1.5 leading-none">Automatic Reminder Schedule</h4>
                <p className="text-xs text-zinc-450 mt-1.5">Gym Flow auto-generates notifications and places alerts in your dashboard according to this calendar.</p>
              </div>

              <div className="space-y-3 p-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950">
                <label className="flex items-center space-x-3 text-xs font-bold text-zinc-650 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={dailyAfter}
                    onChange={(e) => setDailyAfter(e.target.checked)}
                    className="rounded border-zinc-300 dark:border-zinc-700 text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                  <span>Daily Reminders AFTER Membership has officially Expired</span>
                </label>

                <label className="flex items-center space-x-3 text-xs font-bold text-zinc-650 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={lastDay}
                    onChange={(e) => setLastDay(e.target.checked)}
                    className="rounded border-zinc-300 dark:border-zinc-700 text-orange-600 focus:ring-orange-505 w-4 h-4"
                  />
                  <span>Reminder on the LAST DAY option (24 hours remaining)</span>
                </label>

                <label className="flex items-center space-x-3 text-xs font-bold text-zinc-650 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={threeDays}
                    onChange={(e) => setThreeDays(e.target.checked)}
                    className="rounded border-zinc-300 dark:border-zinc-700 text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                  <span>Warning notification 3 Days Before official Expiry</span>
                </label>

                <label className="flex items-center space-x-3 text-xs font-bold text-zinc-650 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={sevenDays}
                    onChange={(e) => setSevenDays(e.target.checked)}
                    className="rounded border-zinc-300 dark:border-zinc-700 text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                  <span>Introductory reminder 7 Days Before official Expiry</span>
                </label>
              </div>

              <div className="p-3 bg-orange-50/10 border border-orange-500/10 text-orange-605 dark:text-orange-400 rounded-xl flex items-start space-x-2 text-xxs leading-relaxed">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-orange-500" />
                <span>Simulated SMS/Email message strings read: "Hello Rajesh Kumar, your Gym Flow membership expires on 2026-06-30. Please renew your subscription."</span>
              </div>
            </div>
          )}

          {/* Admin Password resets */}
          {activeTab === 'security' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h4 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-1.5 leading-none">Security Locks & Passwords</h4>
                <p className="text-xs text-zinc-450 mt-1.5">Reset administrative lock passwords to secure client edits, membership cancels, or fee modulators.</p>
              </div>

              <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-sm bg-zinc-50/20 dark:bg-zinc-950/25 space-y-3 font-semibold">
                <span className="text-xxs uppercase font-bold text-zinc-400 dark:text-zinc-550 block font-mono">Owner Password Lockout</span>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">New Administrative PasswordKey</label>
                  <input
                    type="text"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter security passcode..."
                    className="w-full text-sm font-semibold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl px-3.5 py-2.5 focus:border-orange-500 outline-none transition font-mono"
                  />
                  <p className="text-xxs text-zinc-400 dark:text-zinc-500 mt-1 leading-relaxed">Entering the password keeps configuration adjustments safe. Default is **admin123**.</p>
                </div>
              </div>
            </div>
          )}

          {/* Database Actions */}
          {activeTab === 'database' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h4 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-1.5 leading-none">System Database Protocol</h4>
                <p className="text-xs text-zinc-455 mt-1.5">Manage Gym Flow's local cloud datastore state. Perfect for downloading files or clean-wiping records.</p>
              </div>

              {importStatus.type !== 'idle' && (
                <div className={`p-3 rounded-lg text-xs font-bold leading-relaxed ${
                  importStatus.type === 'success' ? 'bg-green-50 dark:bg-green-955/20 text-green-700 dark:text-green-400 border-l-4 border-green-500' : 'bg-red-50 dark:bg-red-955/20 text-red-700 dark:text-red-400 border-l-4 border-red-500'
                }`}>
                  {importStatus.msg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Protocol 1: Export Backup */}
                <div className="border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl space-y-3 bg-white dark:bg-zinc-950/20 font-semibold">
                  <span className="text-xs font-extrabold uppercase text-orange-600 dark:text-orange-400 font-mono tracking-wider block">1. Security Auto-Backup</span>
                  <p className="text-xs text-zinc-450 leading-relaxed">Examine full, offline-encrypted local database blocks. Downloads all history, members, records, and settings.</p>
                  
                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 cursor-pointer" />
                    <span>Download DB State File (.json)</span>
                  </button>
                </div>

                {/* Protocol 2: Import Backup JSON */}
                <div className="border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl space-y-3 bg-white dark:bg-zinc-950/20 font-semibold">
                  <span className="text-xs font-extrabold uppercase text-orange-600 dark:text-orange-400 font-mono tracking-wider block">2. Restore Data State</span>
                  <p className="text-xs text-zinc-450 leading-relaxed">Hot-swap system files instantly. Paste backup JSON here and hit upload.</p>
                  <textarea
                    rows={2}
                    value={backupJson}
                    onChange={(e) => setBackupJson(e.target.value)}
                    placeholder="Paste valid backup JSON template key..."
                    className="w-full text-xxs font-mono border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl p-2 focus:border-orange-505 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleImportClick}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload & Restore Backup</span>
                  </button>
                </div>

                {/* Protocol 3: Hard reset */}
                <div className="md:col-span-2 border border-red-500/25 dark:border-red-955/40 p-4 rounded-2xl bg-red-50/5 dark:bg-red-955/5 space-y-3 font-semibold">
                  <span className="text-xs font-extrabold uppercase text-red-650 dark:text-red-400 font-mono tracking-wider block animate-none">3. Factory Default Reset</span>
                  <p className="text-xs text-zinc-450 leading-relaxed">Wipe all customized records, active check-ins, and membership schedules. This restores pristine demo indices.</p>
                  
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('WARNING: This completely wipes all active members and restores demo records. Proceed?')) {
                        onResetDatabase();
                      }
                    }}
                    className="bg-red-50 dark:bg-red-955/15 text-red-700 dark:text-red-450 hover:bg-red-100 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900 font-bold py-2 px-4 rounded-xl text-xs transition flex items-center space-x-2 shadow-xs cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span>Hard Reset Database</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Action trigger footer */}
          <div className="flex justify-end pt-4 border-t border-zinc-150 dark:border-zinc-800">
            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-500 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-md shadow-orange-550/15 transition cursor-pointer"
            >
              <span>Save Configurations</span>
              <ArrowRightCircle className="w-4 h-4 text-orange-200" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
