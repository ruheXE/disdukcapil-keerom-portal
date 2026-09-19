import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OrgChartConfig } from '../types/organization';
import { Resident, UserRole } from '../types/population';
import { AdminOrgChartManager } from './AdminOrgChartManager';
import { ResidentTable } from './ResidentTable';
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
  Globe
} from 'lucide-react';

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
}) => {
  const [adminTab, setAdminTab] = useState<'orgChart' | 'residents'>('orgChart');

  return (
    <div className="space-y-6">
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

        {/* Action: Return to Public Dashboard */}
        <button
          onClick={onExitAdmin}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer self-start md:self-auto shadow-sm"
        >
          <Globe className="w-4 h-4 text-emerald-400" />
          <span>Kembali ke Dashboard Publik</span>
        </button>
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
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Manajemen Data Agregat & Induk Penduduk
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pencarian, pemutakhiran NIK, verifikasi status rekam KTP-el, serta kepemilikan Akta Kelahiran
                  </p>
                </div>
                {onOpenExcelUpload && (
                  <button
                    onClick={onOpenExcelUpload}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition-all cursor-pointer shadow-xs shrink-0"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Data Excel</span>
                  </button>
                )}
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
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
