import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Volume2, 
  VolumeX, 
  Tv, 
  UserPlus, 
  Search, 
  SlidersHorizontal, 
  Bell, 
  RotateCcw,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { AppNotification } from '../types';

interface NavbarProps {
  activeTab: 'monitor' | 'register' | 'track' | 'staff';
  setActiveTab: (tab: 'monitor' | 'register' | 'track' | 'staff') => void;
  isAudioEnabled: boolean;
  setIsAudioEnabled: (enabled: boolean) => void;
  openTvMode: () => void;
  isConnected: boolean;
  notifications: AppNotification[];
  onResetDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAudioEnabled,
  setIsAudioEnabled,
  openTvMode,
  isConnected,
  notifications,
  onResetDemo,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short',
        })
      );
      setCurrentDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top utility bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
            <span className="text-slate-300">
              {isConnected ? 'Sistem Terhubung Real-Time (SSE Aktif)' : 'Menghubungkan ke Server...'}
            </span>
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">
            Dinas Kependudukan & Pencatatan Sipil • Layanan Prima Tanpa Pungli
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{currentDate}</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-mono font-bold tracking-wider">{currentTime}</span>
          </div>
          <button
            id="reset-demo-btn"
            onClick={onResetDemo}
            title="Reset data antrean ke contoh default"
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 gap-4">
          {/* Logo & Agency Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('monitor')}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-widest uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  DUKCAPIL CERIA
                </span>
                <span className="text-xs text-slate-500 hidden md:inline">Kementerian Dalam Negeri</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Sistem Antrean Pelayanan Publik
              </h1>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200/80">
            <button
              id="tab-monitor-btn"
              onClick={() => setActiveTab('monitor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'monitor'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>Dashboard Pemantau</span>
            </button>

            <button
              id="tab-register-btn"
              onClick={() => setActiveTab('register')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Pendaftaran Online</span>
            </button>

            <button
              id="tab-track-btn"
              onClick={() => setActiveTab('track')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'track'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Cek & Pantau Tiket</span>
            </button>

            <button
              id="tab-staff-btn"
              onClick={() => setActiveTab('staff')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'staff'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Panel Petugas Loket</span>
            </button>
          </nav>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Toggle */}
            <button
              id="toggle-audio-btn"
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              title={isAudioEnabled ? 'Panggilan Suara Aktif (Klik untuk Mematikan)' : 'Panggilan Suara Hening (Klik untuk Mengaktifkan)'}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                isAudioEnabled
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {isAudioEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span className="hidden sm:inline">Suara Panggilan Aktif</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-400" />
                  <span className="hidden sm:inline">Suara Muted</span>
                </>
              )}
            </button>

            {/* TV Screen Mode Button */}
            <button
              id="open-tv-mode-btn"
              onClick={openTvMode}
              title="Buka Mode Layar TV Ruang Tunggu"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
            >
              <Tv className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Layar TV Antrean</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                id="notification-bell-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                title="Notifikasi Antrean"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 pb-2 border-b border-slate-100 flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-900">Riwayat Notifikasi Real-time</span>
                    <span className="text-xs text-slate-500">{notifications.length} pembaruan</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        Belum ada aktivitas panggilan baru
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notif) => (
                        <div key={notif.id} className="p-3 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start gap-2.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-slate-800">{notif.title}</p>
                              <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 inline-block">
                                {new Date(notif.timestamp).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 gap-1.5 border-t border-slate-100 no-scrollbar">
          <button
            onClick={() => setActiveTab('monitor')}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'monitor' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Monitor</span>
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'register' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Pendaftaran</span>
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'track' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Cek Tiket</span>
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'staff' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Panel Petugas</span>
          </button>
        </div>
      </div>
    </header>
  );
};
