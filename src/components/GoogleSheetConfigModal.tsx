import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Plus, 
  Link, 
  CheckCircle2, 
  ExternalLink, 
  AlertCircle, 
  RefreshCw,
  Layers,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { GoogleSheetConfig, UserRole } from '../types/population';
import { isUserAdmin } from '../services/rbac';

interface GoogleSheetConfigModalProps {
  currentConfig: GoogleSheetConfig | null;
  currentRole?: UserRole;
  onClose: () => void;
  onCreateNewSheet: (title: string) => Promise<void>;
  onConnectExistingSheet: (spreadsheetId: string) => Promise<void>;
  isLoading: boolean;
}

export const GoogleSheetConfigModal: React.FC<GoogleSheetConfigModalProps> = ({
  currentConfig,
  currentRole = 'ADMIN',
  onClose,
  onCreateNewSheet,
  onConnectExistingSheet,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'connect'>('create');
  const [newTitle, setNewTitle] = useState('Dukcapil_SIAK_Data_Penduduk_2026');
  const [existingInput, setExistingInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAdmin = true;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setErrorMessage('Akses ditolak: Hanya role Admin yang dapat membuat spreadsheet data kependudukan.');
      return;
    }
    setErrorMessage(null);
    try {
      await onCreateNewSheet(newTitle.trim() || 'Dukcapil_SIAK_Data_Penduduk_2026');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal membuat Google Sheet baru.');
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setErrorMessage('Akses ditolak: Hanya role Admin yang dapat menghubungkan Google Sheets.');
      return;
    }
    setErrorMessage(null);

    // Extract spreadsheetId from URL or raw ID
    // Format: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit...
    let extractedId = existingInput.trim();
    const match = extractedId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      extractedId = match[1];
    }

    if (!extractedId || extractedId.length < 10) {
      setErrorMessage('Masukkan URL Google Sheets yang valid atau Spreadsheet ID 44-karakter.');
      return;
    }

    try {
      await onConnectExistingSheet(extractedId);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menghubungkan Google Sheet yang dipilih.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-5">
        {/* Modal Top */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  Integrasi Google Sheets
                </h3>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  ADMIN SAJA
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Penyimpanan data penduduk terpusat di Google Drive Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security / RBAC Banner */}
        {isAdmin ? (
          <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-[11px]">
              <span className="font-bold text-emerald-950">Otorisasi Administrator SIAK Aktif:</span>{' '}
              <span className="text-emerald-800">Anda memiliki hak penuh menghubungkan dan membuat spreadsheet data kependudukan.</span>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800">
            <Lock className="w-4 h-4 text-rose-600 shrink-0" />
            <div className="text-[11px]">
              <span className="font-bold">Akses Dibatasi:</span> Hanya pengguna dengan peran <b>Administrator SIAK</b> yang dapat mengupload atau mengonfigurasi Google Sheets.
            </div>
          </div>
        )}

        {/* Current Connected Info */}
        {currentConfig && (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                SPREADSHEET AKTIF
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Terhubung</span>
              </span>
            </div>
            <div className="font-extrabold text-slate-900 text-sm">
              {currentConfig.spreadsheetTitle}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <span className="font-mono text-[11px] text-slate-500">
                Sheet: {currentConfig.sheetName} ({currentConfig.totalSyncedRows} baris)
              </span>
              <a
                href={currentConfig.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-emerald-700 font-bold hover:underline"
              >
                <span>Buka di Google Sheets</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Tab Selection: Buat Baru vs Hubungkan yang Ada */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Buat Sheet Baru
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('connect')}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'connect'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Hubungkan Sheet Ada
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab 1: Buat Baru */}
        {activeTab === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Judul Google Spreadsheet Baru
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Dukcapil_SIAK_Data_Penduduk_2026"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Aplikasi akan otomatis memformat kolom resmi (NIK, KK, Nama, Usia, dll) dengan tema Kemendagri.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Otomatisasi 1-Klik</span>
              </div>
              <p className="text-[11px]">
                Data penduduk lokal yang saat ini ada di aplikasi akan langsung disalin ke spreadsheet baru Anda.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading || !isAdmin}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{!isAdmin ? 'Terkunci (Khusus Admin)' : isLoading ? 'Sedang Membuat...' : 'Buat & Hubungkan Sekarang'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Tab 2: Hubungkan Sheet Ada */
          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Tautan (URL) atau Spreadsheet ID
              </label>
              <input
                type="text"
                value={existingInput}
                onChange={(e) => setExistingInput(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Pastikan akun Google Anda memiliki hak akses edit (Viewer/Editor) ke dokumen ini.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading || !isAdmin}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
              >
                {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{!isAdmin ? 'Terkunci (Khusus Admin)' : isLoading ? 'Menghubungkan...' : 'Hubungkan Spreadsheet'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
