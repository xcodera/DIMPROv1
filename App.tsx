
import React, { useState } from 'react';
import Layout from './components/Layout';
// Fix: Changed to a named import for Dashboard as it does not have a default export.
import { Dashboard } from './components/Dashboard';
import AIChat from './components/AIChat';
import Attendance from './components/Attendance';
import Sliks from './components/Sliks';
import { AppView, Activity, SlikLog } from './types';
import { Camera, ChevronLeft, ShieldCheck, MapPin, Settings, Info, LogOut, ChevronRight, History, BarChart3, Search } from 'lucide-react';
import { MOCK_ACCOUNT } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([
    { id: 'initial-1', type: 'Absensi', title: 'Clock In', status: 'Hadir Tepat Waktu', timestamp: new Date(Date.now() - 3600000 * 2) },
    { id: 'initial-2', type: 'Slik', title: 'Pengecekan KTP', status: 'Berhasil di Verifikasi', timestamp: new Date(Date.now() - 3600000 * 5) }
  ]);
  const [slikHistory, setSlikHistory] = useState<SlikLog[]>([]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const addActivity = (activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = {
      ...activity,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 5));
  };

  const addSlikLog = (log: SlikLog) => {
    setSlikHistory(prev => [log, ...prev].slice(0, 10)); // Simpan sampai 10 di state, tapi nanti di UI tampilkan 5
  };

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <Dashboard isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} setActiveView={setActiveView} activities={activities} />;
      case 'ai-assistant':
        return <AIChat isDarkMode={isDarkMode} />;
      case 'attendance':
        return <Attendance isDarkMode={isDarkMode} setActiveView={setActiveView} addActivity={addActivity} />;
      case 'sliks':
        return (
          <Sliks 
            isDarkMode={isDarkMode} 
            setActiveView={setActiveView} 
            addActivity={addActivity} 
            history={slikHistory}
            addSlikLog={addSlikLog}
          />
        );
      case 'qris':
        return (
          <div className="h-full bg-black flex flex-col items-center justify-center text-white p-6 relative">
            <button onClick={() => setActiveView('home')} className="absolute top-6 left-6 p-2 bg-white/10 rounded-full active:scale-90 transition-transform">
              <ChevronLeft size={24} />
            </button>
            <div className="w-72 h-72 border-2 border-white/50 rounded-2xl relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-transparent"></div>
                <div className="w-full h-1 bg-blue-50 absolute top-0 animate-[scan_2s_linear_infinite]"></div>
                <Camera size={48} className="text-white/20" />
            </div>
            <h3 className="mt-8 text-xl font-bold">Pindai QRIS</h3>
            <p className="text-gray-400 text-center mt-2 text-sm max-w-[240px]">Arahkan kamera ke kode QR untuk melakukan pembayaran</p>
            <style>{`
              @keyframes scan {
                0% { top: 0; }
                100% { top: 100%; }
              }
            `}</style>
          </div>
        );
      case 'history':
        return (
          <div className={`px-6 py-8 space-y-7 h-full ${isDarkMode ? 'bg-[#0f172a]' : 'bg-gray-50'}`}>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-[#004691]'}`}>Riwayat Aktivitas</h2>
            <div className="grid grid-cols-1 gap-4">
              <HistoryOption 
                isDarkMode={isDarkMode}
                onClick={() => setActiveView('attendance')}
                icon={<div className={`${isDarkMode ? 'bg-green-900/50' : 'bg-green-100'} p-3.5 rounded-2xl`}><History size={22} color={isDarkMode ? '#4ade80' : '#059669'} /></div>} 
                title="Riwayat Absensi" 
                desc="Lihat log presensi harian Anda" 
              />
              <HistoryOption 
                isDarkMode={isDarkMode}
                onClick={() => setActiveView('sliks')}
                icon={<div className={`${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'} p-3.5 rounded-2xl`}><Search size={22} color={isDarkMode ? '#60a5fa' : '#004691'} /></div>} 
                title="Riwayat Sliks" 
                desc="Cek status verifikasi KTP" 
              />
              <HistoryOption 
                isDarkMode={isDarkMode}
                icon={<div className={`${isDarkMode ? 'bg-purple-900/50' : 'bg-purple-100'} p-3.5 rounded-2xl`}><BarChart3 size={22} color={isDarkMode ? '#c084fc' : '#7e22ce'} /></div>} 
                title="Riwayat Laporan" 
                desc="Laporan finansial & performa" 
              />
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className={`h-full ${isDarkMode ? 'bg-[#0f172a]' : 'bg-gray-50'}`}>
             <div className={`${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-b'} px-6 py-10 flex flex-col items-center shadow-sm`}>
                <div className={`w-28 h-28 rounded-full mb-4 border-4 overflow-hidden shadow-xl transition-all ${
                  isDarkMode ? 'border-blue-400/30' : 'border-white'
                }`}>
                    <img 
                      src={MOCK_ACCOUNT.avatarUrl} 
                      alt={MOCK_ACCOUNT.name} 
                      className="w-full h-full object-cover"
                    />
                </div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-[#004691]'}`}>{MOCK_ACCOUNT.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight ${
                    isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-[#004691]'
                  }`}>
                    {MOCK_ACCOUNT.role}
                  </span>
                  <p className="text-gray-500 text-sm font-medium">{MOCK_ACCOUNT.jobTitle}</p>
                </div>
                <p className="text-gray-400 text-xs mt-2 opacity-70">m.rizky@example.com • BCA-992102</p>
             </div>
             <div className="px-6 py-6 space-y-3">
                <MenuLink isDarkMode={isDarkMode} icon={<Settings size={18} />} title="Pengaturan Aplikasi" />
                <MenuLink isDarkMode={isDarkMode} icon={<ShieldCheck size={18} />} title="Keamanan & Password" />
                <MenuLink isDarkMode={isDarkMode} icon={<Info size={18} />} title="Pusat Bantuan" />
                <div className="h-4"></div>
                <MenuLink 
                  isDarkMode={isDarkMode} 
                  icon={<LogOut size={18} className="text-red-500" />} 
                  title="Log Out" 
                  color="text-red-500" 
                  onClick={() => {
                    setSlikHistory([]); // Clear history on logout simulation
                    setActiveView('home');
                  }}
                />
             </div>
          </div>
        );
      default:
        return <Dashboard isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} setActiveView={setActiveView} activities={activities} />;
    }
  };

  return (
    <Layout activeView={activeView} setActiveView={setActiveView} isDarkMode={isDarkMode}>
      {renderView()}
    </Layout>
  );
};

const HistoryOption: React.FC<{icon: React.ReactNode, title: string, desc: string, isDarkMode: boolean, onClick?: () => void}> = ({icon, title, desc, isDarkMode, onClick}) => (
  <button onClick={onClick} className={`flex items-center justify-between p-4 rounded-2xl shadow-sm border active:scale-[0.98] transition-all w-full text-left ${
    isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-gray-100'
  }`}>
    <div className="flex items-center gap-4">
      {icon}
      <div>
        <h4 className={`font-bold text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{title}</h4>
        <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>{desc}</p>
      </div>
    </div>
    <ChevronRight size={18} className="text-gray-400" />
  </button>
);

const MenuLink: React.FC<{icon: React.ReactNode, title: string, color?: string, isDarkMode: boolean, onClick?: () => void}> = ({icon, title, color, isDarkMode, onClick}) => (
  <button onClick={onClick} className={`flex items-center justify-between p-4 rounded-2xl w-full active:scale-[0.98] transition-all border shadow-sm ${
    isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-gray-100'
  }`}>
    <div className={`flex items-center gap-4 ${color || (isDarkMode ? 'text-gray-200' : 'text-gray-700')}`}>
      <div className="opacity-80">{icon}</div>
      <span className="text-sm font-semibold">{title}</span>
    </div>
    <ChevronRight size={16} className="text-gray-400" />
  </button>
);

export default App;
