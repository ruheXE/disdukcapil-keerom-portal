import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  FileSpreadsheet, 
  RefreshCw, 
  ExternalLink, 
  LogOut, 
  User as UserIcon, 
  BarChart3,
  Layers,
  Settings,
  UploadCloud,
  MapPin,
  Mail,
  Phone,
  Map,
  Network,
  ShieldCheck
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GoogleSheetConfig } from '../types/population';

export type HeaderTabType = 'overview' | 'map' | 'districts' | 'villages' | 'demographics' | 'organization';

interface HeaderProps {
  user: User | null;
  token: string | null;
  sheetConfig: GoogleSheetConfig | null;
  activeTab: HeaderTabType;
  setActiveTab: (tab: HeaderTabType) => void;
  onLogin: () => void;
  onLogout: () => void;
  onSync: () => void;
  isSyncing: boolean;
  onOpenSheetConfig: () => void;
  onOpenExcelUpload: () => void;
  isLoggingIn: boolean;
  isAdminView?: boolean;
  onToggleAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  sheetConfig,
  activeTab,
  setActiveTab,
  onLogin,
  onLogout,
  onSync,
  isSyncing,
  onOpenSheetConfig,
  onOpenExcelUpload,
  isLoggingIn,
  isAdminView,
  onToggleAdmin,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      {/* Top Agency Bar with Left Logo, Center Title, and Right Logo */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-6">
          
          {/* LOGO 1 (KIRI): Lambang Daerah Kabupaten Keerom (Background Transparan) */}
          <div className="shrink-0 flex items-center justify-start">
            <div 
              className="bg-transparent p-0 flex items-center justify-center transition-transform hover:scale-105"
              title="Logo 1: Lambang Daerah Kabupaten Keerom"
            >
              <img
                src="/assets/logo_keerom.png"
                alt="Lambang Kabupaten Keerom"
                className="h-12 sm:h-16 md:h-18 w-auto object-contain bg-transparent drop-shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* TENGAH: Identitas Resmi & Kontak Dinas */}
          <div className="text-center flex-1 px-1 sm:px-4 min-w-0">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[9px] sm:text-[10px] font-mono font-black tracking-widest text-emerald-400 uppercase bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">
                PEMERINTAH KABUPATEN KEEROM
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">•</span>
              <span className="text-[10px] sm:text-xs text-slate-300 font-medium hidden sm:inline">Provinsi Papua</span>
              <span className="text-xs text-slate-500 hidden sm:inline">•</span>
              <span className="text-[10px] sm:text-xs text-slate-400 hidden sm:inline">Kemendagri RI</span>
            </div>

            <h1 className="text-xs sm:text-base md:text-lg lg:text-xl font-black text-white tracking-tight leading-tight mt-1 truncate sm:whitespace-normal">
              Dinas Kependudukan dan Pencatatan Sipil Kabupaten Keerom
            </h1>

            {/* Kontak & Lokasi (Desktop & Tablet) */}
            <div className="hidden sm:flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-300 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                Jl. Trans Irian - Arso Kota
              </span>
              <span className="text-slate-500">•</span>
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="text-slate-400">Email:</span> disdukcapil@keeromkab.go.id
              </span>
              <span className="text-slate-500">•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="text-slate-400">Phone:</span> (0967) 591-234
              </span>
            </div>
          </div>

          {/* LOGO 2 (KANAN): Logo Kementerian Dalam Negeri Kemendagri (Background Transparan) */}
          <div className="shrink-0 flex items-center justify-end">
            <div 
              className="bg-transparent p-0 flex items-center justify-center transition-transform hover:scale-105"
              title="Logo 2: Kementerian Dalam Negeri Republik Indonesia"
            >
              <img
                src="/assets/logo_kemendagri.svg"
                alt="Logo Kementerian Dalam Negeri Kemendagri"
                className="h-12 sm:h-16 md:h-18 w-auto object-contain bg-transparent drop-shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        {/* Mobile Contact Quick Sub-line */}
        <div className="flex sm:hidden items-center justify-center gap-2 text-[10px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-800/80">
          <span className="flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
            Arso Kota
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Phone className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
            (0967) 591-234
          </span>
          <span>•</span>
          <span className="text-emerald-400 font-medium">Portal Informasi Warga</span>
        </div>
      </div>

      {/* Navigation Sub-bar (Mobile-friendly horizontal scroll + Action buttons) */}
      <div className="bg-slate-950 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-2.5 py-2">
          
          {/* Navigation Links for Citizens */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none touch-pan-x">
            <button
              onClick={() => {
                if (isAdminView && onToggleAdmin) {
                  onToggleAdmin();
                }
                setActiveTab('overview');
              }}
              className={`relative flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                activeTab === 'overview' && !isAdminView
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              {activeTab === 'overview' && !isAdminView && (
                <motion.div
                  layoutId="headerNavIndicator"
                  className="absolute inset-0 bg-emerald-600 rounded-xl shadow-xs"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Ikhtisar Agregat</span>
              </span>
            </button>

            <button
              onClick={() => {
                if (isAdminView && onToggleAdmin) {
                  onToggleAdmin();
                }
                setActiveTab('map');
              }}
              className={`relative flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                activeTab === 'map' && !isAdminView
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              {activeTab === 'map' && !isAdminView && (
                <motion.div
                  layoutId="headerNavIndicator"
                  className="absolute inset-0 bg-emerald-600 rounded-xl shadow-xs"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                <Map className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Peta Sebaran Distrik</span>
              </span>
            </button>

            <button
              onClick={() => {
                if (isAdminView && onToggleAdmin) {
                  onToggleAdmin();
                }
                setActiveTab('districts');
              }}
              className={`relative flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                activeTab === 'districts' && !isAdminView
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              {activeTab === 'districts' && !isAdminView && (
                <motion.div
                  layoutId="headerNavIndicator"
                  className="absolute inset-0 bg-emerald-600 rounded-xl shadow-xs"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Agregat Per Distrik</span>
              </span>
            </button>

            <button
              onClick={() => {
                if (isAdminView && onToggleAdmin) {
                  onToggleAdmin();
                }
                setActiveTab('villages');
              }}
              className={`relative flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                activeTab === 'villages' && !isAdminView
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              {activeTab === 'villages' && !isAdminView && (
                <motion.div
                  layoutId="headerNavIndicator"
                  className="absolute inset-0 bg-emerald-600 rounded-xl shadow-xs"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Agregat Per Kampung</span>
              </span>
            </button>

            <button
              onClick={() => {
                if (isAdminView && onToggleAdmin) {
                  onToggleAdmin();
                }
                setActiveTab('demographics');
              }}
              className={`relative flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                activeTab === 'demographics' && !isAdminView
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              {activeTab === 'demographics' && !isAdminView && (
                <motion.div
                  layoutId="headerNavIndicator"
                  className="absolute inset-0 bg-emerald-600 rounded-xl shadow-xs"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Demografi & Usia</span>
              </span>
            </button>

            {/* TAB STRUKTUR ORGANISASI */}
            <button
              onClick={() => {
                if (isAdminView && onToggleAdmin) {
                  onToggleAdmin();
                }
                setActiveTab('organization');
              }}
              className={`relative flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                activeTab === 'organization' && !isAdminView
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              {activeTab === 'organization' && !isAdminView && (
                <motion.div
                  layoutId="headerNavIndicator"
                  className="absolute inset-0 bg-emerald-600 rounded-xl shadow-xs"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                <Network className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Struktur Organisasi</span>
              </span>
            </button>
          </nav>

          {/* Quick Data Operations (Excel Upload & Google Sheets) */}
          <div className="flex items-center gap-2 overflow-x-auto py-0.5 self-start md:self-auto shrink-0">
            {/* Dashboard Admin Button */}
            {onToggleAdmin && (
              <button
                id="btn-toggle-admin"
                onClick={onToggleAdmin}
                title="Akses Dashboard Admin Disdukcapil (Unggah Bagan Organisasi, Edit Pejabat, Kelola Data SIAK)"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0 ${
                  isAdminView
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300'
                    : 'bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-500/40 hover:border-amber-400'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isAdminView ? 'Mode Publik' : 'Dashboard Admin'}</span>
              </button>
            )}

            {/* Upload Excel Button */}
            <button
              id="btn-upload-excel"
              onClick={onOpenExcelUpload}
              title="Upload file Excel / CSV data kependudukan"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition-all cursor-pointer shadow-xs shrink-0"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Data Excel</span>
            </button>

            {/* Google Sheets Integration */}
            {user ? (
              <div className="flex items-center gap-1.5 shrink-0">
                {sheetConfig ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-[11px] truncate max-w-[100px] sm:max-w-[140px] text-white">
                      {sheetConfig.spreadsheetTitle}
                    </span>
                    <a
                      href={sheetConfig.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Buka Spreadsheet"
                      className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={onOpenSheetConfig}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Hubungkan Sheet</span>
                  </button>
                )}

                {/* Sync Button */}
                <button
                  id="btn-sync-sheets"
                  onClick={onSync}
                  disabled={isSyncing || !sheetConfig}
                  title="Sinkronkan dengan Google Sheets"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{isSyncing ? 'Sinkron...' : 'Sinkron'}</span>
                </button>

                {/* Config Modal Trigger */}
                <button
                  onClick={onOpenSheetConfig}
                  title="Pengaturan Spreadsheet"
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>

                {/* User Avatar & Logout */}
                <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-800">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full ring-1 ring-emerald-500"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                      <UserIcon className="w-3 h-3 text-slate-300" />
                    </div>
                  )}
                  <button
                    onClick={onLogout}
                    title="Keluar"
                    className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="btn-google-sign-in"
                onClick={onLogin}
                disabled={isLoggingIn}
                title="Hubungkan Google Sheets"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-all cursor-pointer shrink-0 disabled:opacity-60"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">{isLoggingIn ? 'Menghubungkan...' : 'Google Sheets'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
