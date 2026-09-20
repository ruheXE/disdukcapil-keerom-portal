import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import { Header, HeaderTabType } from './components/Header';
import { PublicAggregateDashboard } from './components/PublicAggregateDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { GoogleSheetConfigModal } from './components/GoogleSheetConfigModal';
import { ExcelUploadModal } from './components/ExcelUploadModal';
import { Resident, GoogleSheetConfig } from './types/population';
import { OrgChartConfig } from './types/organization';
import { INITIAL_MOCK_RESIDENTS } from './data/mockResidents';
import { loadOrgChartConfig, saveOrgChartConfig } from './services/orgChartStorage';
import { isAdminSessionActive } from './services/adminAuth';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  getAccessToken 
} from './services/firebaseAuth';
import { 
  createDukcapilSpreadsheet, 
  fetchResidentsFromSheet, 
  appendResidentToSheet 
} from './services/googleSheets';
import { 
  CheckCircle2, 
  ExternalLink,
  Phone
} from 'lucide-react';

const SAVED_SHEET_KEY = 'dukcapil_siak_sheet_config';

export default function App() {
  // Authentication & Google Sheets integration state
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);

  const [isExcelUploadOpen, setIsExcelUploadOpen] = useState<boolean>(false);

  // Population Data State
  const [residents, setResidents] = useState<Resident[]>(() => {
    return INITIAL_MOCK_RESIDENTS;
  });

  // Organization Chart State (Stored in localStorage and managed by Admin)
  const [orgChartConfig, setOrgChartConfig] = useState<OrgChartConfig>(() => {
    return loadOrgChartConfig();
  });

  // Admin View State & Password Login Modal State
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<HeaderTabType>('overview');
  const [isSheetConfigOpen, setIsSheetConfigOpen] = useState<boolean>(false);

  // Trigger Admin Access with Password Check
  const handleRequestAdminView = () => {
    if (isAdminView) {
      setIsAdminView(false);
    } else if (isAdminSessionActive()) {
      setIsAdminView(true);
    } else {
      setIsAdminLoginModalOpen(true);
    }
  };

  // Handle saving updated organization chart
  const handleSaveOrgChart = (updated: OrgChartConfig) => {
    setOrgChartConfig(updated);
    saveOrgChartConfig(updated);
  };

  // Restore saved spreadsheet reference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_SHEET_KEY);
      if (saved) {
        setSheetConfig(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save spreadsheet config updates
  const updateSheetConfig = useCallback((config: GoogleSheetConfig | null) => {
    setSheetConfig(config);
    if (config) {
      localStorage.setItem(SAVED_SHEET_KEY, JSON.stringify(config));
    } else {
      localStorage.removeItem(SAVED_SHEET_KEY);
    }
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Synchronize data from Google Sheet
  const syncWithSheet = useCallback(async (spreadsheetId: string, accessToken: string) => {
    setIsSyncing(true);
    setSyncStatusMessage('Sedang menyinkronkan data dari Google Sheet...');
    try {
      const { residents: sheetResidents, title } = await fetchResidentsFromSheet(
        spreadsheetId,
        accessToken,
        sheetConfig?.sheetName || 'Data_Penduduk'
      );

      if (sheetResidents.length > 0) {
        setResidents(sheetResidents);
        const updatedConfig: GoogleSheetConfig = {
          spreadsheetId,
          spreadsheetTitle: title,
          sheetName: sheetConfig?.sheetName || 'Data_Penduduk',
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
          lastSyncedAt: new Date().toISOString(),
          totalSyncedRows: sheetResidents.length,
        };
        updateSheetConfig(updatedConfig);
        setSyncStatusMessage(`Berhasil memuat ${sheetResidents.length} data penduduk dari Google Sheets.`);
      } else {
        setSyncStatusMessage('Spreadsheet terhubung (masih kosong). Silakan tambah data kependudukan.');
      }
    } catch (err: any) {
      console.error('Sync error:', err);
      setSyncStatusMessage(`Sinkronisasi gagal: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  }, [sheetConfig, updateSheetConfig]);

  // Handle Google Login
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setSyncStatusMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setSyncStatusMessage('Berhasil terhubung dengan Akun Google!');

        // If user already has a saved sheet config, attempt auto-sync
        if (sheetConfig?.spreadsheetId) {
          syncWithSheet(sheetConfig.spreadsheetId, result.accessToken);
        } else {
          // Open Sheet Config modal so user can create or pick a spreadsheet
          setIsSheetConfigOpen(true);
        }
      }
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      setSyncStatusMessage(err.message || 'Gagal masuk dengan Google.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Google Logout
  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setSyncStatusMessage('Telah keluar dari Akun Google. Mode data lokal aktif.');
  };

  // Manual Refresh Sync Button
  const handleManualSync = () => {
    if (sheetConfig && token) {
      syncWithSheet(sheetConfig.spreadsheetId, token);
    } else if (!token) {
      handleLogin();
    }
  };

  // Create brand new Google Sheet in user's Drive
  const handleCreateNewSheet = async (title: string) => {
    const accessToken = token || (await getAccessToken());
    if (!accessToken) {
      throw new Error('Silakan masuk ke Akun Google terlebih dahulu.');
    }

    setIsSyncing(true);
    try {
      const newConfig = await createDukcapilSpreadsheet(title, accessToken, residents);
      updateSheetConfig(newConfig);
      setSyncStatusMessage(`Spreadsheet "${newConfig.spreadsheetTitle}" berhasil dibuat dan terintegrasi!`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Connect existing Google Sheet by ID
  const handleConnectExistingSheet = async (spreadsheetId: string) => {
    const accessToken = token || (await getAccessToken());
    if (!accessToken) {
      throw new Error('Silakan masuk ke Akun Google terlebih dahulu.');
    }
    await syncWithSheet(spreadsheetId, accessToken);
  };

  // Import from Excel file
  const handleExcelImport = async (newResidents: Resident[], mode: 'append' | 'replace') => {
    if (mode === 'replace') {
      setResidents(newResidents);
      setSyncStatusMessage(`Berhasil mengimpor ${newResidents.length} data penduduk (mode ganti semua).`);
    } else {
      setResidents((prev) => [...newResidents, ...prev]);
      setSyncStatusMessage(`Berhasil menambahkan ${newResidents.length} data penduduk dari file Excel.`);
    }

    // If Google Sheet is actively connected, sync the imported rows to Google Sheets
    const accessToken = token || (await getAccessToken());
    if (sheetConfig && accessToken) {
      try {
        setIsSyncing(true);
        for (const r of newResidents) {
          await appendResidentToSheet(sheetConfig.spreadsheetId, r, accessToken, sheetConfig.sheetName);
        }
        setSyncStatusMessage(`Berhasil mengimpor ${newResidents.length} warga dan menyinkronkan langsung ke Google Sheets!`);
      } catch (sheetErr: any) {
        console.error('Error syncing imported excel rows to sheet:', sheetErr);
        setSyncStatusMessage(`Data Excel tersimpan lokal (Google Sheet sinkronisasi gagal: ${sheetErr.message})`);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Official Government Header with Left/Right Transparent Logos */}
      <Header
        user={user}
        token={token}
        sheetConfig={sheetConfig}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onSync={handleManualSync}
        isSyncing={isSyncing}
        onOpenSheetConfig={() => setIsSheetConfigOpen(true)}
        onOpenExcelUpload={() => setIsExcelUploadOpen(true)}
        isLoggingIn={isLoggingIn}
        isAdminView={isAdminView}
        onToggleAdmin={handleRequestAdminView}
      />

      {/* Sync Status Banner */}
      {syncStatusMessage && (
        <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{syncStatusMessage}</span>
            </div>
            <button
              onClick={() => setSyncStatusMessage(null)}
              className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area: Public Dashboard or Admin Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6">
        <AnimatePresence mode="wait">
          {isAdminView ? (
            <motion.div
              key="admin-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <AdminDashboard
                residents={residents}
                orgChartConfig={orgChartConfig}
                onSaveOrgChart={handleSaveOrgChart}
                onExitAdmin={() => setIsAdminView(false)}
                onOpenExcelUpload={() => setIsExcelUploadOpen(true)}
                onDeleteResident={(r) => setResidents(prev => prev.filter(res => res.id !== r.id))}
                sheetConfig={sheetConfig}
                user={user}
                token={token}
                isSyncing={isSyncing}
                onOpenSheetConfig={() => setIsSheetConfigOpen(true)}
                onSync={handleManualSync}
                onLogin={handleLogin}
                onLogout={handleLogout}
                isLoggingIn={isLoggingIn}
              />
            </motion.div>
          ) : (
            <motion.div
              key="public-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <PublicAggregateDashboard
                residents={residents}
                activeTab={activeTab}
                onTabChange={(tab) => setActiveTab(tab)}
                orgChartConfig={orgChartConfig}
                onOpenAdmin={handleRequestAdminView}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Official Government Footer: Logo 1 & Logo 2 Side-by-Side (Berdampingan) & Developer Credit */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-600 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Logo 1 dan Logo 2 Berdampingan (Side-by-Side) */}
            <div className="flex items-center gap-4">
              <div 
                className="bg-transparent p-0 flex items-center justify-center shrink-0 transition-transform hover:scale-105"
                title="Logo 1: Lambang Daerah Kabupaten Keerom"
              >
                <img
                  src="/assets/logo_keerom.png"
                  alt="Lambang Kabupaten Keerom"
                  className="h-12 sm:h-14 w-auto object-contain bg-transparent drop-shadow-sm"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div 
                className="bg-transparent p-0 flex items-center justify-center shrink-0 transition-transform hover:scale-105"
                title="Logo 2: Logo Kementerian Dalam Negeri Republik Indonesia"
              >
                <img
                  src="/assets/logo_kemendagri.svg"
                  alt="Logo Kementerian Dalam Negeri"
                  className="h-12 sm:h-14 w-auto object-contain bg-transparent drop-shadow-sm"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Credit Pembuat: heraX (082189585776) & Copyright */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-right">
              <div className="text-[11px] text-slate-700 flex items-center gap-2">
                <span className="font-bold text-slate-900">Pembuat: heraX</span>
                <span className="text-slate-400">•</span>
                <a 
                  href="tel:082189585776" 
                  className="inline-flex items-center gap-1 font-mono font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 transition-colors"
                  title="Hubungi pembuat: heraX (082189585776)"
                >
                  <Phone className="w-2.5 h-2.5" />
                  <span>082189585776</span>
                </a>
              </div>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-[11px] text-slate-500">© 2026 Pemerintah Kabupaten Keerom</span>
            </div>

          </div>
        </div>
      </footer>

      {/* Google Sheets Configuration Modal */}
      {isSheetConfigOpen && (
        <GoogleSheetConfigModal
          currentConfig={sheetConfig}
          onClose={() => setIsSheetConfigOpen(false)}
          onCreateNewSheet={handleCreateNewSheet}
          onConnectExistingSheet={handleConnectExistingSheet}
          isLoading={isSyncing}
        />
      )}

      {/* Excel / CSV Upload Modal */}
      {isExcelUploadOpen && (
        <ExcelUploadModal
          onClose={() => setIsExcelUploadOpen(false)}
          onImport={handleExcelImport}
          hasGoogleSheetConnected={Boolean(sheetConfig && token)}
        />
      )}

      {/* Admin Login Modal (Password Protected) */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onSuccess={() => {
          setIsAdminLoginModalOpen(false);
          setIsAdminView(true);
        }}
      />
    </div>
  );
}
