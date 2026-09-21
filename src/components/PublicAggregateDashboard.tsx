import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  CreditCard, 
  FileText, 
  Baby, 
  HeartCrack, 
  MapPin, 
  ShieldCheck, 
  Building2, 
  Layers, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  BarChart3, 
  Award, 
  Percent, 
  Home, 
  Sparkles,
  TrendingUp,
  Activity,
  Filter,
  Mail,
  Phone,
  Map as MapIcon,
  Network,
  FileDown,
  Loader2
} from 'lucide-react';
import { Resident, DukcapilAggregates, DistrictAggregate, VillageAggregate } from '../types/population';
import { OrgChartConfig } from '../types/organization';
import { computeDukcapilAggregates } from '../services/aggregateService';
import { VitalTrendChart } from './VitalTrendChart';
import { KeeromDistrictMap } from './KeeromDistrictMap';
import { PublicOrgChartView } from './PublicOrgChartView';

export type PublicTabType = 'overview' | 'map' | 'districts' | 'villages' | 'demographics' | 'organization';

interface PublicAggregateDashboardProps {
  residents: Resident[];
  activeTab?: PublicTabType;
  onTabChange?: (tab: PublicTabType) => void;
  orgChartConfig: OrgChartConfig;
  onOpenAdmin?: () => void;
}

export const PublicAggregateDashboard: React.FC<PublicAggregateDashboardProps> = ({ 
  residents,
  activeTab: externalActiveTab,
  onTabChange,
  orgChartConfig,
  onOpenAdmin,
}) => {
  const [internalSubTab, setInternalSubTab] = useState<PublicTabType>('overview');
  const activeSubTab = externalActiveTab || internalSubTab;
  const setActiveSubTab = (tab: PublicTabType) => {
    setInternalSubTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>('ALL');
  const [villageSearchTerm, setVillageSearchTerm] = useState<string>('');

  // Compute all aggregates using service
  const aggregates: DukcapilAggregates = useMemo(() => {
    return computeDukcapilAggregates(residents);
  }, [residents]);

  // Filtered villages for Tab C
  const filteredVillages = useMemo(() => {
    return aggregates.villages.filter(v => {
      const matchDistrict = selectedDistrictFilter === 'ALL' || v.districtName.toLowerCase() === selectedDistrictFilter.toLowerCase();
      const matchSearch = v.villageName.toLowerCase().includes(villageSearchTerm.toLowerCase()) || 
                          v.districtName.toLowerCase().includes(villageSearchTerm.toLowerCase());
      return matchDistrict && matchSearch;
    });
  }, [aggregates.villages, selectedDistrictFilter, villageSearchTerm]);

  // District list for dropdown
  const districtList = useMemo(() => {
    return aggregates.districts.map(d => d.districtName);
  }, [aggregates.districts]);

  return (
    <div className="space-y-6">
      {/* Public Civic Info Banner with Papuan Family & Keerom Landscape Illustration */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-700/80 shadow-2xl p-6 sm:p-7 sm:pb-6 text-white min-h-[220px]">
        {/* Background Illustration with Elegant Multi-Stage Transparent Gradient Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
          <img
            src="/assets/Ilustrasi_Keluarga_Papua_4K_HighRes.svg"
            alt="Ilustrasi Keharmonisan Keluarga Papua Keerom"
            className="w-full h-full object-cover object-[center_35%] scale-100 sm:scale-105 transition-transform duration-1000 brightness-95 saturate-110"
            referrerPolicy="no-referrer"
          />
          {/* Lapisan 1: Gradasi horizontal gelap ke transparan untuk keterbacaan teks judul & informasi dinas */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 sm:via-slate-950/75 via-60% to-slate-950/35" />
          
          {/* Lapisan 2: Gradasi vertikal untuk dasar tab navigasi bawah dan atas */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/35 to-slate-950/50" />
          
          {/* Lapisan 3: Aksen hijau zamrud khas Keerom */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-transparent to-emerald-900/25 mix-blend-multiply" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-300 uppercase bg-emerald-950/90 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-emerald-600/50 shadow-xs">
                DISDUKCAPIL KABUPATEN KEEROM
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">•</span>
              <span className="text-xs text-emerald-200 font-medium hidden sm:inline">Provinsi Papua</span>
              <span className="text-xs text-slate-400 hidden sm:inline">•</span>
              <span className="text-xs text-slate-300 font-medium hidden sm:inline">Kemendagri RI</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              Dinas Kependudukan dan Pencatatan Sipil Kabupaten Keerom
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl drop-shadow-sm font-medium">
              Portal resmi keterbukaan data agregat kependudukan Pemerintah Kabupaten Keerom. 
              Menyajikan statistik penduduk, kepemilikan Akta Catatan Sipil, cakupan KTP-el, serta tren dinamika kependudukan di seluruh distrik dan kampung.
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 text-xs text-emerald-200 font-medium">
              <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 shadow-xs">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Jl. Trans Irian - Arso Kota</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 shadow-xs">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Email: disdukcapil@keeromkab.go.id</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 shadow-xs">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Phone: (0967) 591-234</span>
              </div>
            </div>
          </div>

          {/* SISI KANAN: Aggregated Realtime Glassmorphism Badge */}
          <div className="flex flex-col sm:items-end gap-1 shrink-0 bg-slate-900/85 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-700/90 text-left sm:text-right w-full sm:w-auto shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
              <span>Agregat Terkini</span>
            </div>
            <span className="text-base sm:text-xl text-white font-mono font-black tracking-tight drop-shadow-sm">
              Total {aggregates.totalResidents.toLocaleString('id-ID')} Jiwa Terdata
            </span>
            <span className="text-[11px] text-slate-300 font-medium">
              {aggregates.districts.length} Distrik • {aggregates.villages.length} Kampung
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-300 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Portal Terbuka Kependudukan Warga</span>
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="mt-6 pt-5 border-t border-slate-700/60 flex flex-wrap items-center gap-2 relative z-10">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeSubTab === 'overview'
                ? 'text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            {activeSubTab === 'overview' && (
              <motion.div
                layoutId="publicSubTabIndicator"
                className="absolute inset-0 bg-emerald-600 rounded-xl shadow-md shadow-emerald-900/30"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>Ikhtisar Agregat Utama</span>
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('map')}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeSubTab === 'map'
                ? 'text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            {activeSubTab === 'map' && (
              <motion.div
                layoutId="publicSubTabIndicator"
                className="absolute inset-0 bg-emerald-600 rounded-xl shadow-md shadow-emerald-900/30"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <MapIcon className="w-4 h-4" />
              <span>Peta Interaktif Distrik</span>
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('districts')}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeSubTab === 'districts'
                ? 'text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            {activeSubTab === 'districts' && (
              <motion.div
                layoutId="publicSubTabIndicator"
                className="absolute inset-0 bg-emerald-600 rounded-xl shadow-md shadow-emerald-900/30"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>Agregat Per Distrik ({aggregates.districts.length})</span>
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('villages')}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeSubTab === 'villages'
                ? 'text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            {activeSubTab === 'villages' && (
              <motion.div
                layoutId="publicSubTabIndicator"
                className="absolute inset-0 bg-emerald-600 rounded-xl shadow-md shadow-emerald-900/30"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Agregat Per Kampung ({aggregates.villages.length})</span>
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('demographics')}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeSubTab === 'demographics'
                ? 'text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            {activeSubTab === 'demographics' && (
              <motion.div
                layoutId="publicSubTabIndicator"
                className="absolute inset-0 bg-emerald-600 rounded-xl shadow-md shadow-emerald-900/30"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Demografi & Karakteristik</span>
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('organization')}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeSubTab === 'organization'
                ? 'text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            {activeSubTab === 'organization' && (
              <motion.div
                layoutId="publicSubTabIndicator"
                className="absolute inset-0 bg-emerald-600 rounded-xl shadow-md shadow-emerald-900/30"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Network className="w-4 h-4" />
              <span>Struktur Organisasi</span>
            </span>
          </button>
        </div>
      </div>

      {/* Primary 4 Agregat Highlight Cards (Always visible as civic benchmarks) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Agregat Penduduk */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Agregat Penduduk
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2 font-mono tracking-tight">
            {aggregates.totalResidents.toLocaleString('id-ID')}{' '}
            <span className="text-xs text-slate-400 font-sans font-normal">jiwa</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>
              <b>{aggregates.totalKk}</b> Kepala Keluarga (KK)
            </span>
            <span className="font-mono text-slate-500">
              {aggregates.maleCount} L / {aggregates.femaleCount} P
            </span>
          </div>
        </div>

        {/* 2. Agregat KTP-el */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Agregat KTP-el
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2 font-mono tracking-tight">
            {aggregates.ktpPercentage}%{' '}
            <span className="text-xs text-slate-400 font-sans font-normal">terekam</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>
              Wajib: <b>{aggregates.ktpEligible}</b> jiwa
            </span>
            <span className="font-mono text-emerald-600 font-bold">
              {aggregates.ktpRecorded} Rekam
            </span>
          </div>
        </div>

        {/* 3. Agregat Akte (Kelahiran & Kematian) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Agregat Akte
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2 font-mono tracking-tight">
            {aggregates.birthCertPercentage}%{' '}
            <span className="text-xs text-slate-400 font-sans font-normal">punya akta</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>
              Akta Lahir: <b>{aggregates.birthCertTotal}</b>
            </span>
            <span className="text-slate-500">
              Akta Wafat: <b>{aggregates.deathCertCount}</b>
            </span>
          </div>
        </div>

        {/* 4. Agregat Kelahiran & Kematian */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Kelahiran & Kematian
            </span>
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono tracking-tight flex items-center gap-2">
            <span className="text-emerald-600">+{aggregates.birthsRecorded}</span>
            <span className="text-slate-300">/</span>
            <span className="text-rose-600">-{aggregates.deathsRecorded}</span>
            <span className="text-xs text-slate-400 font-sans font-normal">peristiwa</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="text-emerald-700 font-medium">
              Lahir: <b>{aggregates.birthsRecorded}</b> jiwa
            </span>
            <span className="text-rose-700 font-medium">
              Wafat: <b>{aggregates.deathsRecorded}</b> jiwa
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Animated Sub-Tab Views */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          {/* VIEW SUB-TAB 1: OVERVIEW & STRUKTUR AGREGAT */}
          {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Detailed Pillars: Agregat KTP-el, Agregat Akte, Kelahiran & Kematian */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pillar 1: Agregat KTP-el Detail */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Agregat KTP Elektronik</h3>
                    <p className="text-[11px] text-slate-500">Capaian perekaman identitas kependudukan</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  {aggregates.ktpPercentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-600">Realisasi Perekaman KTP-el</span>
                  <span className="font-mono text-slate-900">{aggregates.ktpRecorded} / {aggregates.ktpEligible}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                    style={{ width: `${aggregates.ktpPercentage}%` }} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Wajib KTP</span>
                  <span className="text-lg font-black text-slate-900 font-mono">{aggregates.ktpEligible}</span>
                  <span className="text-[10px] text-slate-400 block">Usia ≥ 17 thn/kawin</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Sudah Rekam</span>
                  <span className="text-lg font-black text-emerald-600 font-mono">{aggregates.ktpRecorded}</span>
                  <span className="text-[10px] text-emerald-700 block">Identitas aktif</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Belum Rekam</span>
                  <span className="text-lg font-black text-amber-600 font-mono">{aggregates.ktpUnrecorded}</span>
                  <span className="text-[10px] text-amber-700 block">Perlu perekaman</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Belum Wajib</span>
                  <span className="text-lg font-black text-slate-600 font-mono">{aggregates.ktpUnderage}</span>
                  <span className="text-[10px] text-slate-400 block">Usia anak (&lt; 17)</span>
                </div>
              </div>
            </div>

            {/* Pillar 2: Agregat Akte Pencatatan Sipil */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Agregat Akte Pencatatan Sipil</h3>
                    <p className="text-[11px] text-slate-500">Cakupan Akta Lahir, Kematian, & KIA</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  {aggregates.birthCertChildPercentage}% Anak
                </span>
              </div>

              {/* Akta Lahir Progress */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-600">Cakupan Akta Kelahiran (Total)</span>
                  <span className="font-mono text-slate-900">{aggregates.birthCertPercentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                    style={{ width: `${aggregates.birthCertPercentage}%` }} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Akta Kelahiran</span>
                  <span className="text-lg font-black text-slate-900 font-mono">{aggregates.birthCertTotal}</span>
                  <span className="text-[10px] text-emerald-600 block">Telah diterbitkan</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Akta Lahir Anak</span>
                  <span className="text-lg font-black text-amber-600 font-mono">{aggregates.birthCertChildCount}</span>
                  <span className="text-[10px] text-slate-500 block">Usia 0 - 17 tahun</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Cakupan KIA</span>
                  <span className="text-lg font-black text-indigo-600 font-mono">{aggregates.kiaCount}</span>
                  <span className="text-[10px] text-indigo-700 block">{aggregates.kiaPercentage}% dari anak</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Akta Kematian</span>
                  <span className="text-lg font-black text-slate-700 font-mono">{aggregates.deathCertCount}</span>
                  <span className="text-[10px] text-slate-500 block">{aggregates.deathCertPercentage}% kematian</span>
                </div>
              </div>
            </div>

            {/* Pillar 3: Agregat Kelahiran & Kematian */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Peristiwa Kelahiran & Kematian</h3>
                    <p className="text-[11px] text-slate-500">Dinamika vital kependudukan tercatat</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                  VITAL
                </span>
              </div>

              {/* Comparison boxes */}
              <div className="space-y-3">
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <Baby className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">Angka Kelahiran Tercatat</span>
                      <span className="text-[11px] text-emerald-700">Bayi & Balita usia 0-2 tahun</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-emerald-900 font-mono">+{aggregates.birthsRecorded}</span>
                    <span className="text-[10px] text-emerald-700 block">{aggregates.birthsMale} L • {aggregates.birthsFemale} P</span>
                  </div>
                </div>

                <div className="p-3.5 bg-rose-50/70 border border-rose-100 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                      <HeartCrack className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-rose-950 block">Angka Kematian Tercatat</span>
                      <span className="text-[11px] text-rose-700">Warga wafat terlapor</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-rose-900 font-mono">-{aggregates.deathsRecorded}</span>
                    <span className="text-[10px] text-rose-700 block">Akta Terbit: {aggregates.deathCertCount}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs text-slate-600">
                  <span>Tingkat Kematian Kasar (CDR)</span>
                  <span className="font-mono font-bold text-slate-900">{aggregates.deathRate} per 1.000 jiwa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visualisasi Peta Spasial Interaktif D3 Sebaran Distrik Keerom */}
          <KeeromDistrictMap 
            residents={residents}
            onSelectDistrict={(distName) => {
              setSelectedDistrictFilter(distName);
              setActiveSubTab('districts');
            }}
          />

          {/* Tren Pertumbuhan Penduduk: Kelahiran vs Kematian Bulanan (Recharts) */}
          <VitalTrendChart 
            residents={residents}
            districts={districtList}
          />

          {/* Piramida & Komposisi Kelompok Usia */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Agregat Kelompok Usia Penduduk</h3>
                <p className="text-xs text-slate-500">Struktur demografi penduduk berdasarkan kelompok usia produktif dan non-produktif</p>
              </div>
              <span className="text-xs font-mono text-slate-500 font-medium">
                Sex Ratio: <b>{aggregates.sexRatio}</b> (Pria per 100 Wanita)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Balita (0 - 4 tahun) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Balita (0 - 4 Thn)</span>
                  <span className="font-mono text-slate-500">
                    {aggregates.totalResidents > 0 ? Math.round((aggregates.ageGroups.toddler / aggregates.totalResidents) * 100) : 0}%
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {aggregates.ageGroups.toddler} <span className="text-xs text-slate-400 font-sans font-normal">jiwa</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${aggregates.totalResidents > 0 ? (aggregates.ageGroups.toddler / aggregates.totalResidents) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">Sasaran Akta Lahir & KIA</span>
              </div>

              {/* Anak & Remaja (5 - 17 tahun) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Anak & Sekolah (5 - 17 Thn)</span>
                  <span className="font-mono text-slate-500">
                    {aggregates.totalResidents > 0 ? Math.round((aggregates.ageGroups.child / aggregates.totalResidents) * 100) : 0}%
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {aggregates.ageGroups.child} <span className="text-xs text-slate-400 font-sans font-normal">jiwa</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${aggregates.totalResidents > 0 ? (aggregates.ageGroups.child / aggregates.totalResidents) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">Usia wajib belajar & KIA</span>
              </div>

              {/* Usia Produktif (18 - 59 tahun) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Usia Produktif (18 - 59 Thn)</span>
                  <span className="font-mono text-slate-500">
                    {aggregates.totalResidents > 0 ? Math.round((aggregates.ageGroups.productive / aggregates.totalResidents) * 100) : 0}%
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {aggregates.ageGroups.productive} <span className="text-xs text-slate-400 font-sans font-normal">jiwa</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-500 rounded-full" 
                    style={{ width: `${aggregates.totalResidents > 0 ? (aggregates.ageGroups.productive / aggregates.totalResidents) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">Angkatan kerja & wajib KTP-el</span>
              </div>

              {/* Lanjut Usia (60+ tahun) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Lanjut Usia (60+ Thn)</span>
                  <span className="font-mono text-slate-500">
                    {aggregates.totalResidents > 0 ? Math.round((aggregates.ageGroups.elderly / aggregates.totalResidents) * 100) : 0}%
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {aggregates.ageGroups.elderly} <span className="text-xs text-slate-400 font-sans font-normal">jiwa</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full" 
                    style={{ width: `${aggregates.totalResidents > 0 ? (aggregates.ageGroups.elderly / aggregates.totalResidents) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">Lansia terlayani</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW SUB-TAB: PETA SEBARAN DISTRIK INTERAKTIF */}
      {activeSubTab === 'map' && (
        <div className="space-y-6">
          <KeeromDistrictMap 
            residents={residents}
            onSelectDistrict={(distName) => {
              setSelectedDistrictFilter(distName);
              setActiveSubTab('districts');
            }}
          />
        </div>
      )}

      {/* VIEW SUB-TAB 2: AGREGAT PER DISTRIK (KECAMATAN) */}
      {activeSubTab === 'districts' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Tabel Agregat Kependudukan Per Distrik (Kecamatan)
              </h3>
              <p className="text-xs text-slate-500">
                Ringkasan komparasi resmi data penduduk, akta pencatatan sipil, KTP-el, kelahiran, dan kematian menurut Distrik.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl">
                {aggregates.districts.length} Distrik Terdata
              </span>
            </div>
          </div>

          {/* District Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-3">Nama Distrik</th>
                  <th className="py-3 px-3 text-center">Kampung</th>
                  <th className="py-3 px-3 text-right">Total Penduduk</th>
                  <th className="py-3 px-3 text-center">L / P</th>
                  <th className="py-3 px-3 text-right">Total KK</th>
                  <th className="py-3 px-3 text-center">Cakupan KTP-el</th>
                  <th className="py-3 px-3 text-center">Akta Lahir</th>
                  <th className="py-3 px-3 text-center">Kelahiran</th>
                  <th className="py-3 px-3 text-center">Kematian</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {aggregates.districts.map((dist, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{dist.districtName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-slate-600">
                      {dist.villageCount} Kampung
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                      {dist.totalResidents.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-slate-500">
                      {dist.maleCount} / {dist.femaleCount}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-800">
                      {dist.totalKk} KK
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`font-mono font-bold text-xs ${
                          dist.ktpPercentage >= 85 ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {dist.ktpPercentage}%
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({dist.ktpRecorded}/{dist.ktpEligible})
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-mono font-bold text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        {dist.birthCertPercentage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        +{dist.birthsCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                        -{dist.deathsCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedDistrictFilter(dist.districtName);
                          setActiveSubTab('villages');
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:text-white hover:bg-emerald-600 bg-emerald-50 rounded-lg border border-emerald-200 transition-all cursor-pointer"
                      >
                        Lihat Kampung
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW SUB-TAB 3: AGREGAT PER KAMPUNG (KELURAHAN / DESA) */}
      {activeSubTab === 'villages' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Tabel Agregat Kependudukan Per Kampung (Kelurahan / Desa)
              </h3>
              <p className="text-xs text-slate-500">
                Rincian agregat statistik penduduk, kepemilikan akte, KTP-el, kelahiran, dan kematian di setiap kampung
              </p>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Distrik */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium">Distrik:</span>
                <select
                  value={selectedDistrictFilter}
                  onChange={(e) => setSelectedDistrictFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ALL">Semua Distrik ({aggregates.districts.length})</option>
                  {districtList.map((d, i) => (
                    <option key={i} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Search Kampung */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={villageSearchTerm}
                  onChange={(e) => setVillageSearchTerm(e.target.value)}
                  placeholder="Cari nama kampung..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-56"
                />
              </div>

              {selectedDistrictFilter !== 'ALL' && (
                <button
                  onClick={() => setSelectedDistrictFilter('ALL')}
                  className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* Village Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-3">Nama Kampung</th>
                  <th className="py-3 px-3">Distrik Induk</th>
                  <th className="py-3 px-3 text-right">Total Jiwa</th>
                  <th className="py-3 px-3 text-center">L / P</th>
                  <th className="py-3 px-3 text-right">Kepala Keluarga</th>
                  <th className="py-3 px-3 text-center">Cakupan KTP-el</th>
                  <th className="py-3 px-3 text-center">Cakupan Akta Lahir</th>
                  <th className="py-3 px-3 text-center">Kelahiran</th>
                  <th className="py-3 px-3 text-center">Kematian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredVillages.length > 0 ? (
                  filteredVillages.map((village, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{village.villageName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-medium">
                        {village.districtName}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {village.totalResidents.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-500">
                        {village.maleCount} L / {village.femaleCount} P
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-800">
                        {village.totalKk} KK
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                          village.ktpPercentage >= 80 ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {village.ktpPercentage}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                          {village.birthCertPercentage}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold text-xs text-emerald-700">
                          +{village.birthsCount}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold text-xs text-rose-700">
                          -{village.deathsCount}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Tidak ada data kampung yang cocok dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW SUB-TAB 4: DEMOGRAFI & KARAKTERISTIK AGREGAT */}
      {activeSubTab === 'demographics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Agregat Tingkat Pendidikan */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Agregat Tingkat Pendidikan
            </h3>
            <div className="space-y-2.5">
              {['Sarjana (S1)', 'SMA / SMK', 'SMP', 'SD', 'Tidak/Belum Sekolah'].map((lvl) => {
                const count = residents.filter(r => r.education?.includes(lvl)).length;
                const pct = aggregates.totalResidents > 0 ? Math.round((count / aggregates.totalResidents) * 100) : 0;
                return (
                  <div key={lvl} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">{lvl}</span>
                      <span className="font-mono font-bold text-slate-800">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agregat Agama & Kepercayaan */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Agregat Agama & Kepercayaan
            </h3>
            <div className="space-y-2.5">
              {['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Khonghucu'].map((rel) => {
                const count = residents.filter(r => r.religion === rel).length;
                const pct = aggregates.totalResidents > 0 ? Math.round((count / aggregates.totalResidents) * 100) : 0;
                if (count === 0) return null;
                return (
                  <div key={rel} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">{rel}</span>
                      <span className="font-mono font-bold text-slate-800">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW SUB-TAB 5: STRUKTUR ORGANISASI DISDUKCAPIL KEEROM */}
      {activeSubTab === 'organization' && (
        <PublicOrgChartView
          config={orgChartConfig}
          onOpenAdmin={onOpenAdmin}
        />
      )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
