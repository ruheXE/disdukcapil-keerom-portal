import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import { OrgChartConfig } from '../types/organization';
import { Resident, GoogleSheetConfig } from '../types/population';
import { AdminOrgChartManager } from './AdminOrgChartManager';
import { ResidentTable } from './ResidentTable';
import { computeDukcapilAggregates } from '../services/aggregateService';
import { generateAggregatePdfReport } from '../services/aggregatePdfReport';
import { exportResidentsToCsv } from '../utils/exportCsv';
import { 
  Building2, 
  Users, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  FileSpreadsheet, 
  UploadCloud, 
  CheckCircle2, 
  Layers,
  Globe,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  RotateCcw,
  LogOut,
  ShieldAlert,
  FileDown,
  Download,
  Database,
  RefreshCw,
  ExternalLink,
  Settings,
  User as UserIcon,
  FileCheck,
  FileText,
  Loader2,
  HardDriveDownload,
  FolderSync
} from 'lucide-react';
import { 
  changeAdminPassword, 
  resetToDefaultPassword, 
  DEFAULT_ADMIN_PASSWORD, 
  DEFAULT_ADMIN_USERNAME,
  logoutAdminSession 
} from '../services/adminAuth';

interface AdminDashboardProps {
  residents: Resident[];
  orgChartConfig: OrgChartConfig;
  onSaveOrgChart: (updated: OrgChartConfig) => void;
  onExitAdmin: () => void;
  onOpenExcelUpload?: () => void;
  onViewResidentProfile?: (resident: Resident) => void;
  onEditResident?: (resident: Resident) => void;
  onDeleteResident?: (resident: Resident) => void;
  onViewFamily?: (noKk: string) => void;
  sheetConfig?: GoogleSheetConfig | null;
  user?: User | null;
  token?: string | null;
  isSyncing?: boolean;
  onOpenSheetConfig?: () => void;
  onSync?: () => void;
  onLogin?: () => void;
  onLogout?: () => void;
  isLoggingIn?: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  residents,
  orgChartConfig,
  onSaveOrgChart,
  onExitAdmin,
  onOpenExcelUpload,
  onViewResidentProfile,
  onEditResident,
  onDeleteResident,
  onViewFamily,
  sheetConfig,
  user,
  token,
  isSyncing = false,
  onOpenSheetConfig,
  onSync,
  onLogin,
  onLogout,
  isLoggingIn = false,
}) => {
  const [adminTab, setAdminTab] = useState<'orgChart' | 'residents' | 'dataHub' | 'security'>('orgChart');

  // Password change form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwdMessage, setPwdMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // PDF & Export State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const aggregates = useMemo(() => {
    return computeDukcapilAggregates(residents);
  }, [residents]);

  const handleLogoutAdmin = () => {
    logoutAdminSession();
    onExitAdmin();
  };

  const handleDownloadPdf = () => {
    try {
      setIsGeneratingPdf(true);
      setExportNotice(null);
      setTimeout(() => {
        generateAggregatePdfReport(aggregates, residents);
        setIsGeneratingPdf(false);
        setExportNotice('Laporan Agregat Resmi Kabupaten Keerom format PDF berhasil diunduh!');
        setTimeout(() => setExportNotice(null), 5000);
      }, 300);
    } catch (err) {
      console.error('Gagal mencetak laporan PDF:', err);
      setIsGeneratingPdf(false);
    }
  };

  const handleExportCsv = () => {
    try {
      exportResidentsToCsv(residents, `data-siak-keerom-${new Date().toISOString().slice(0, 10)}.csv`);
      setExportNotice(`Berhasil mengekspor ${residents.length} data penduduk ke format Excel/CSV!`);
      setTimeout(() => setExportNotice(null), 5000);
    } catch (err) {
      console.error('Gagal mengekspor CSV:', err);
    }
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMessage(null);

    if (!oldPassword.trim()) {
      setPwdMessage({ type: 'error', text: 'Harap masukkan kata sandi saat ini.' });
      return;
    }

    if (!newPassword.trim() || newPassword.length < 6) {
      setPwdMessage({ type: 'error', text: 'Kata sandi baru minimal harus 6 karakter.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdMessage({ type: 'error', text: 'Konfirmasi kata sandi baru tidak cocok.' });
      return;
    }

    const res = changeAdminPassword(oldPassword, newPassword);
    if (res.success) {
      setPwdMessage({ type: 'success', text: res.message });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPwdMessage({ type: 'error', text: res.message });
    }
  };

  const handleResetPasswordToDefault = () => {
    if (window.confirm(`Yakin ingin mereset kata sandi Administrator ke default bawaan ("${DEFAULT_ADMIN_PASSWORD}")?`)) {
      resetToDefaultPassword();
      setPwdMessage({
        type: 'success',
        text: `Kata sandi berhasil direset ke pengaturan awal: "${DEFAULT_ADMIN_PASSWORD}".`,
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notifikasi Ekspor/Unduh */}
      <AnimatePresence>
        {exportNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-emerald-800 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-600 max-w-md"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            <span className="text-xs font-semibold leading-relaxed">{exportNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Admin Navigation & Status Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-black px-2 py-0.5 rounded uppercase">
                ADMINISTRATOR DISDUKCAPIL
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-300">Kabupaten Keerom</span>
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-black text-white mt-0.5">
              Dashboard Administrasi & Pengelolaan Internal
            </h1>
          </div>
        </div>

        {/* Action Buttons: Kunci Sesi & Kembali ke Mode Publik */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleLogoutAdmin}
            title="Kunci sesi admin dan keluar"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-200 border border-rose-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Kunci & Keluar Admin</span>
          </button>

          <button
            onClick={onExitAdmin}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer shadow-xs"
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Lihat Mode Publik</span>
          </button>
        </div>
      </div>

      {/* Admin Module Navigation Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setAdminTab('orgChart')}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors shrink-0 cursor-pointer ${
            adminTab === 'orgChart'
              ? 'text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {adminTab === 'orgChart' && (
            <motion.div
              layoutId="adminTabIndicator"
              className="absolute inset-0 bg-emerald-600 rounded-xl shadow-xs"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span>Bagan Struktur Organisasi</span>
            {orgChartConfig.chartImageUrl && (
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            )}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('residents')}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors shrink-0 cursor-pointer ${
            adminTab === 'residents'
              ? 'text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {adminTab === 'residents' && (
            <motion.div
              layoutId="adminTabIndicator"
              className="absolute inset-0 bg-emerald-600 rounded-xl shadow-xs"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Database Data Penduduk (SIAK)</span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
              adminTab === 'residents' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {residents.length}
            </span>
          </span>
        </button>

        <button
          onClick={() => setAdminTab('dataHub')}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors shrink-0 cursor-pointer ${
            adminTab === 'dataHub'
              ? 'text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {adminTab === 'dataHub' && (
            <motion.div
              layoutId="adminTabIndicator"
              className="absolute inset-0 bg-emerald-600 rounded-xl shadow-xs"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <HardDriveDownload className="w-4 h-4" />
            <span>Pusat Upload & Unduh Data</span>
          </span>
        </button>

        <button
          onClick={() => setAdminTab('security')}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors shrink-0 cursor-pointer ${
            adminTab === 'security'
              ? 'text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {adminTab === 'security' && (
            <motion.div
              layoutId="adminTabIndicator"
              className="absolute inset-0 bg-emerald-600 rounded-xl shadow-xs"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <KeyRound className="w-4 h-4" />
            <span>Keamanan & Sandi Admin</span>
          </span>
        </button>
      </div>

      {/* Content depending on Active Admin Tab with Smooth Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={adminTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          {adminTab === 'orgChart' ? (
            <AdminOrgChartManager
              currentConfig={orgChartConfig}
              onSaveConfig={onSaveOrgChart}
              onViewPublicDashboard={onExitAdmin}
            />
          ) : adminTab === 'residents' ? (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Manajemen Data Agregat & Induk Penduduk (SIAK)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pencarian NIK/KK, pemutakhiran status rekam KTP-el, serta verifikasi kepemilikan Akta Catatan Sipil
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {onOpenExcelUpload && (
                    <button
                      onClick={onOpenExcelUpload}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition-all cursor-pointer shadow-xs"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload Data Excel</span>
                    </button>
                  )}
                  <button
                    onClick={handleExportCsv}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Ekspor CSV</span>
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white transition-all cursor-pointer shadow-xs disabled:opacity-60"
                  >
                    {isGeneratingPdf ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileDown className="w-4 h-4 text-emerald-200" />
                    )}
                    <span>Unduh PDF</span>
                  </button>
                </div>
              </div>

              <ResidentTable
                residents={residents}
                userRole="ADMIN"
                onViewProfile={onViewResidentProfile || (() => {})}
                onEditResident={onEditResident || (() => {})}
                onDeleteResident={onDeleteResident || (() => {})}
                onViewFamily={onViewFamily || (() => {})}
                onOpenExcelUpload={onOpenExcelUpload}
              />
            </div>
          ) : adminTab === 'dataHub' ? (
            /* PUSAT UPLOAD DAN UNDUH DATA KHUSUS ADMIN */
            <div className="space-y-6">
              {/* Header Box */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-md uppercase">
                        PUSAT OPERASI DATA ADMIN
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5">
                      Pusat Unggah (Upload) & Ekspor (Unduh) Data
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      Kelola sinkronisasi Google Sheets, impor data Excel/CSV, serta cetak laporan resmi PDF dan unduhan database kependudukan Kabupaten Keerom.
                    </p>
                  </div>
                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 text-left sm:text-right shrink-0">
                    <span className="text-[11px] text-slate-400 block">Total Data Terdata</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">
                      {residents.length.toLocaleString('id-ID')} Jiwa
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {aggregates.districts.length} Distrik • {aggregates.villages.length} Kampung
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid 2 Kolom: Kiri = Unduh/Ekspor, Kanan = Upload/Sinkronisasi */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* KOLOM 1: FITUR UNDUH & EKSPOR DATA */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                    <Download className="w-5 h-5 text-emerald-700" />
                    <span>Fitur Unduh & Ekspor Dokumen Resmi</span>
                  </div>

                  {/* Card 1: Unduh Laporan PDF Agregat Resmi */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-emerald-300 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                            Laporan Agregat Resmi (Format PDF)
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Dokumen cetak A4 resmi berlogo daerah, statistik distrik, KTP-el, & akta kelahiran
                          </p>
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                        PDF RESMI
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl text-xs text-slate-600 border border-slate-100 space-y-1">
                      <div className="flex justify-between">
                        <span>Cakupan Wilayah:</span>
                        <span className="font-semibold text-slate-800">{aggregates.districts.length} Distrik se-Keerom</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Format Dokumen:</span>
                        <span className="font-semibold text-slate-800">Portable Document Format (.pdf)</span>
                      </div>
                    </div>

                    <button
                      onClick={handleDownloadPdf}
                      disabled={isGeneratingPdf}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isGeneratingPdf ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Menyusun Dokumen PDF...</span>
                        </>
                      ) : (
                        <>
                          <FileDown className="w-4 h-4 text-emerald-200" />
                          <span>Unduh Laporan Agregat PDF</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Card 2: Ekspor Database Kependudukan ke Excel / CSV */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-emerald-300 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold shrink-0">
                          <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                            Ekspor Database Penduduk (Excel / CSV)
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Unduh seluruh {residents.length} baris master data penduduk lengkap dengan NIK, KK, & status vital
                          </p>
                        </div>
                      </div>
                      <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                        CSV / EXCEL
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl text-xs text-slate-600 border border-slate-100 space-y-1">
                      <div className="flex justify-between">
                        <span>Total Baris Data:</span>
                        <span className="font-semibold text-slate-800">{residents.length} Record Penduduk</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kompatibilitas:</span>
                        <span className="font-semibold text-slate-800">Microsoft Excel, LibreOffice, Sheets</span>
                      </div>
                    </div>

                    <button
                      onClick={handleExportCsv}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      <span>Unduh Database (Format CSV)</span>
                    </button>
                  </div>

                  {/* Card 3: Unduh Dokumen Bagan Struktur Organisasi */}
                  {orgChartConfig.chartImageUrl && (
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-emerald-300 transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-800 flex items-center justify-center font-bold shrink-0">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                              Bagan Struktur Organisasi Disdukcapil
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Unduh salinan gambar resolusi tinggi bagan struktur organisasi resmi
                            </p>
                          </div>
                        </div>
                        <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                          GAMBAR HD
                        </span>
                      </div>

                      <a
                        href={orgChartConfig.chartImageUrl}
                        download={orgChartConfig.chartImageName || 'bagan-organisasi-disdukcapil-keerom.png'}
                        className="w-full py-2.5 px-4 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4 text-indigo-200" />
                        <span>Unduh Dokumen Gambar Bagan</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* KOLOM 2: FITUR UPLOAD & SINKRONISASI DATA */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                    <UploadCloud className="w-5 h-5 text-teal-700" />
                    <span>Fitur Unggah & Sinkronisasi Data</span>
                  </div>

                  {/* Card 1: Upload File Excel / CSV */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-teal-300 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold shrink-0">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                            Unggah Berkas Excel / CSV (.xlsx, .csv)
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Impor data penduduk baru atau perbarui database kependudukan secara massal
                          </p>
                        </div>
                      </div>
                      <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                        IMPOR MASSAL
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl text-xs text-slate-600 border border-slate-100 space-y-1">
                      <div className="flex justify-between">
                        <span>Format Didukung:</span>
                        <span className="font-semibold text-slate-800">.xlsx, .xls, .csv</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Validasi Otomatis:</span>
                        <span className="font-semibold text-emerald-700">Pengecekan NIK 16 Digit & KK</span>
                      </div>
                    </div>

                    {onOpenExcelUpload && (
                      <button
                        onClick={onOpenExcelUpload}
                        className="w-full py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <UploadCloud className="w-4 h-4 text-teal-200" />
                        <span>Buka Menu Unggah File Excel</span>
                      </button>
                    )}
                  </div>

                  {/* Card 2: Google Sheets Integrasi & Sinkronisasi */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-emerald-300 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                          <FolderSync className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                            Integrasi Google Sheets Disdukcapil
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Sinkronisasi dua arah real-time dengan Google Spreadsheet resmi
                          </p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        sheetConfig ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {sheetConfig ? 'TERHUBUNG' : 'BELUM TERHUBUNG'}
                      </span>
                    </div>

                    {sheetConfig ? (
                      <div className="bg-slate-50 p-3.5 rounded-2xl text-xs text-slate-600 border border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Spreadsheet Aktif:</span>
                          <span className="font-bold text-slate-900 truncate max-w-[180px]">
                            {sheetConfig.spreadsheetTitle}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Akses Tautan:</span>
                          <a
                            href={sheetConfig.spreadsheetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center gap-1"
                          >
                            <span>Buka di Tab Baru</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50 p-3.5 rounded-2xl text-xs text-amber-900 border border-amber-200">
                        Spreadsheet Google belum terhubung. Hubungkan spreadsheet untuk mengaktifkan sinkronisasi otomatis.
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                      {user && onSync && sheetConfig && (
                        <button
                          onClick={onSync}
                          disabled={isSyncing}
                          className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                          <span>{isSyncing ? 'Sedang Sinkron...' : 'Sinkronkan Sekarang'}</span>
                        </button>
                      )}

                      {onOpenSheetConfig && (
                        <button
                          onClick={onOpenSheetConfig}
                          className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          <span>{sheetConfig ? 'Pengaturan Sheet' : 'Hubungkan Spreadsheet'}</span>
                        </button>
                      )}

                      {!user && onLogin && (
                        <button
                          onClick={onLogin}
                          disabled={isLoggingIn}
                          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                          <span>{isLoggingIn ? 'Menghubungkan...' : 'Masuk Akun Google'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ) : (
            /* SECURITY & PASSWORD MANAGEMENT TAB */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Form Ganti Kata Sandi */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      Ubah Kata Sandi Administrator
                    </h3>
                    <p className="text-xs text-slate-500">
                      Perbarui kata sandi akses internal Dashboard Administrator Disdukcapil
                    </p>
                  </div>
                </div>

                {pwdMessage && (
                  <div className={`p-4 rounded-2xl text-xs flex items-start gap-2.5 ${
                    pwdMessage.type === 'success' 
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}>
                    {pwdMessage.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{pwdMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                  {/* Kata Sandi Lama */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Kata Sandi Saat Ini <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showOldPw ? 'text' : 'password'}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Masukkan kata sandi saat ini"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPw(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      >
                        {showOldPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Kata Sandi Baru */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Kata Sandi Baru (Min. 6 Karakter) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Masukkan kata sandi baru"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      >
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Konfirmasi Kata Sandi Baru */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Ulangi Kata Sandi Baru <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi kata sandi baru"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simpan Kata Sandi Baru</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetPasswordToDefault}
                      className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset ke Bawaan Sistem</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Security Policy & Info Box */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2 text-amber-400">
                    <ShieldAlert className="w-5 h-5" />
                    <h4 className="font-extrabold text-sm uppercase tracking-wide">
                      Protokol Keamanan Akses
                    </h4>
                  </div>

                  <ul className="space-y-3 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                      <span><strong>Proteksi Brute-Force:</strong> Sistem otomatis memblokir akses sementara selama 45 detik jika terjadi 5 kali kegagalan input sandi berturut-turut.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                      <span><strong>Sandi Bawaan Awal:</strong> <code className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400">{DEFAULT_ADMIN_PASSWORD}</code> (dianjurkan diganti saat deploy operasional).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                      <span><strong>Sesi Browser:</strong> Sesi admin otomatis berakhir ketika tab browser ditutup atau tombol "Kunci & Keluar Admin" ditekan.</span>
                    </li>
                  </ul>

                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={handleLogoutAdmin}
                      className="w-full py-2.5 px-4 bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Kunci Sesi Sekarang</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
