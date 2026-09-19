import React, { useState, useMemo } from 'react';
import { 
  OrgChartConfig, 
  OrgPosition 
} from '../types/organization';
import { 
  User, 
  Building2, 
  ShieldCheck, 
  FileText, 
  ChevronRight, 
  Phone, 
  Mail, 
  Search, 
  X, 
  Download, 
  Sparkles, 
  ZoomIn, 
  Printer
} from 'lucide-react';

interface PublicOrgChartViewProps {
  config: OrgChartConfig;
  onOpenAdmin?: () => void;
}

/**
 * Komponen Siluet Resmi Pejabat Pemerintah (Civil Servant Silhouette)
 * Memberikan representasi siluet elegan tanpa border, dengan gradien latar belakang lembut sesuai peran.
 */
const OfficialSilhouette: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  avatarUrl?: string;
  name: string;
  roleBg?: string;
}> = ({ size = 'md', avatarUrl, name, roleBg = 'from-slate-100 to-slate-200' }) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-13 h-13',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  if (avatarUrl) {
    return (
      <div className={`relative ${sizeMap[size]} rounded-full overflow-hidden shadow-xs shrink-0`}>
        <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`relative ${sizeMap[size]} rounded-full bg-gradient-to-b ${roleBg} shadow-xs overflow-hidden flex items-center justify-center shrink-0 select-none`}
      title={`Siluet Pejabat: ${name}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full text-slate-700"
        fill="currentColor"
        aria-hidden="true"
      >
        {/* Kepala Silhouette */}
        <circle cx="50" cy="33" r="17.5" fill="#334155" />
        {/* Bahu & Dada Resmi Silhouette */}
        <path d="M17 92 C17 63, 31 57, 50 57 C69 57, 83 63, 83 92 Z" fill="#334155" />
        {/* Aksen Dasi / Kerah Resmi */}
        <polygon points="46,57 54,57 52,73 50,76 48,73" fill="#64748b" />
      </svg>
    </div>
  );
};

export const PublicOrgChartView: React.FC<PublicOrgChartViewProps> = ({
  config,
  onOpenAdmin,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPositionModal, setSelectedPositionModal] = useState<OrgPosition | null>(null);
  const [isChartImageZoomOpen, setIsChartImageZoomOpen] = useState<boolean>(false);

  // Group positions by category
  const kadis = config.positions.find(p => p.category === 'pimpinan') || config.positions[0];
  const sekretaris = config.positions.find(p => p.category === 'sekretariat');
  const subbagList = config.positions.filter(p => p.category === 'subbag');
  const bidangList = config.positions.filter(p => p.category === 'bidang');
  const fungsionalList = config.positions.filter(p => p.category === 'fungsional');

  // Helper tema bidang teknis
  const getBidangTheme = (bidang: OrgPosition, idx: number) => {
    const t = (bidang.title + ' ' + (bidang.id || '')).toLowerCase();
    if (t.includes('dafduk') || t.includes('pendaftaran')) {
      return {
        badge: 'bg-emerald-100 text-emerald-900',
        tag: 'Dafduk',
        roleBg: 'from-emerald-100 via-teal-50 to-emerald-200',
        accentText: 'text-emerald-700',
      };
    }
    if (t.includes('capil') || t.includes('pencatatan')) {
      return {
        badge: 'bg-teal-100 text-teal-900',
        tag: 'Capil',
        roleBg: 'from-teal-100 via-cyan-50 to-teal-200',
        accentText: 'text-teal-700',
      };
    }
    if (t.includes('piak') || (t.includes('informasi') && !t.includes('pemanfaatan'))) {
      return {
        badge: 'bg-cyan-100 text-cyan-900',
        tag: 'PIAK',
        roleBg: 'from-sky-100 via-cyan-50 to-blue-200',
        accentText: 'text-cyan-800',
      };
    }
    if (t.includes('pemanfaatan') || t.includes('inovasi')) {
      return {
        badge: 'bg-indigo-100 text-indigo-900',
        tag: 'Pemanfaatan Data',
        roleBg: 'from-indigo-100 via-purple-50 to-purple-200',
        accentText: 'text-indigo-800',
      };
    }
    return {
      badge: 'bg-slate-100 text-slate-800',
      tag: `Bidang ${idx + 1}`,
      roleBg: 'from-slate-100 to-slate-200',
      accentText: 'text-slate-700',
    };
  };

  // Filter positions for search
  const filteredPositions = useMemo(() => {
    return config.positions.filter(p => {
      const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      const term = searchTerm.toLowerCase();
      const matchSearch = 
        p.name.toLowerCase().includes(term) ||
        p.title.toLowerCase().includes(term) ||
        (p.nip && p.nip.includes(term)) ||
        p.duties.some(d => d.toLowerCase().includes(term));
      return matchCat && matchSearch;
    });
  }, [config.positions, selectedCategory, searchTerm]);

  const showImage = Boolean(config.chartImageUrl && (config.mode === 'image' || config.mode === 'both'));
  const showInteractive = Boolean(config.mode === 'interactive' || config.mode === 'both' || !config.chartImageUrl);

  return (
    <div className="space-y-6">
      {/* Header Banner Bagan Organisasi */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-950/90 px-2.5 py-0.5 rounded-md">
                STRUKTUR ORGANISASI RESMI
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-emerald-400 font-mono">
                Pembaruan: {new Date(config.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
              {config.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300">
              {config.subtitle}
            </p>

            {config.legalBasis && (
              <div className="pt-1 text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{config.legalBasis}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Cetak Bagan Struktur"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                title="Masuk ke menu pengelolaan bagan (Admin)"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Kelola Bagan (Admin)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bagian 1: Bagan Gambar Resmi (Jika Diunggah oleh Admin) */}
      {showImage && config.chartImageUrl && (
        <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">
                    Bagan Gambar Dokumen Resmi Disdukcapil Keerom
                  </h3>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    RESMI SK
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Klik gambar untuk melihat dalam tampilan resolusi tinggi dan memperbesar rincian
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsChartImageZoomOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Perbesar Gambar</span>
              </button>
              <a
                href={config.chartImageUrl}
                download={config.chartImageName || 'bagan-organisasi-disdukcapil-keerom.png'}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh</span>
              </a>
            </div>
          </div>

          {/* Image Container with Hover Overlay */}
          <div 
            onClick={() => setIsChartImageZoomOpen(true)}
            className="relative rounded-2xl bg-slate-900 overflow-hidden group cursor-pointer max-h-[540px] flex items-center justify-center shadow-inner"
          >
            <img
              src={config.chartImageUrl}
              alt="Bagan Struktur Organisasi Disdukcapil Kabupaten Keerom"
              className="w-full max-h-[540px] object-contain transition-transform duration-300 group-hover:scale-[1.01]"
            />
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span className="px-4 py-2 bg-slate-900/90 text-white text-xs font-bold rounded-xl shadow-xl flex items-center gap-2">
                <ZoomIn className="w-4 h-4 text-emerald-400" />
                <span>Klik untuk Membuka Ukuran Penuh</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bagian 2: Pohon Hirarki Struktural & Kartu Interaktif (Tanpa Border, dengan Siluet) */}
      {showInteractive && (
        <div className="space-y-6">
          
          {/* Filter & Search Bar - Borderless & Clean */}
          <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-xs font-bold text-slate-500 shrink-0">Kategori:</span>
              {[
                { key: 'ALL', label: 'Semua Pejabat' },
                { key: 'pimpinan', label: 'Pimpinan' },
                { key: 'sekretariat', label: 'Sekretariat' },
                { key: 'bidang', label: 'Bidang Teknis' },
                { key: 'fungsional', label: 'Fungsional / ADB' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedCategory(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === tab.key
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari pejabat, NIP, jabatan, tupoksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-100/90 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Interactive Hierarchy View (When not searching) */}
          {searchTerm.trim() === '' && selectedCategory === 'ALL' ? (
            <div className="space-y-8 py-2">
              
              {/* LEVEL 1: PIMPINAN (Kepala Dinas) - Borderless dengan Siluet */}
              {kadis && (
                <div className="flex flex-col items-center">
                  <div className="relative group max-w-md w-full">
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 via-emerald-300 to-teal-300 rounded-3xl blur-md opacity-35 group-hover:opacity-60 transition duration-300" />
                    <div 
                      onClick={() => setSelectedPositionModal(kadis)}
                      className="relative bg-white rounded-3xl p-6 shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 text-center flex flex-col items-center"
                    >
                      {/* Siluet Pejabat Kadis */}
                      <div className="mb-3">
                        <OfficialSilhouette 
                          size="xl" 
                          avatarUrl={kadis.avatarUrl} 
                          name={kadis.name} 
                          roleBg="from-amber-100 via-amber-200 to-emerald-100" 
                        />
                      </div>

                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider mb-2">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>Pimpinan Tertinggi Dinas</span>
                      </div>

                      <h4 className="text-base sm:text-lg font-black text-slate-900">
                        {kadis.title}
                      </h4>

                      <p className="text-sm font-bold text-emerald-700 mt-1">
                        {kadis.name}
                      </p>

                      {kadis.nip && (
                        <p className="text-xs font-mono text-slate-500 mt-0.5">
                          NIP. {kadis.nip}
                        </p>
                      )}

                      {kadis.rank && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {kadis.rank}
                        </p>
                      )}

                      <div className="mt-3.5 pt-3 border-t border-slate-100 w-full flex items-center justify-center gap-3 text-xs text-emerald-600 font-semibold">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>Tupoksi Utama</span>
                        </span>
                        <span>•</span>
                        <span className="hover:underline flex items-center gap-0.5">
                          <span>Rincian</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Connection Line */}
                  <div className="w-0.5 h-8 bg-slate-300 my-0" />
                </div>
              )}

              {/* LEVEL 2: SEKRETARIAT DINAS - Borderless dengan Siluet */}
              {sekretaris && (
                <div className="flex flex-col items-center">
                  <div 
                    onClick={() => setSelectedPositionModal(sekretaris)}
                    className="max-w-md w-full bg-white rounded-3xl p-5 shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 text-center flex flex-col items-center"
                  >
                    {/* Siluet Pejabat Sekretaris */}
                    <div className="mb-2.5">
                      <OfficialSilhouette 
                        size="lg" 
                        avatarUrl={sekretaris.avatarUrl} 
                        name={sekretaris.name} 
                        roleBg="from-blue-100 via-sky-100 to-slate-200" 
                      />
                    </div>

                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-black uppercase tracking-wider mb-1.5">
                      Sekretariat Dinas
                    </span>
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                      {sekretaris.title}
                    </h4>
                    <p className="text-xs sm:text-sm font-bold text-blue-700 mt-0.5">
                      {sekretaris.name}
                    </p>
                    {sekretaris.nip && (
                      <p className="text-[11px] font-mono text-slate-500">
                        NIP. {sekretaris.nip}
                      </p>
                    )}
                  </div>

                  {/* Subbagian Under Sekretaris - Borderless dengan Siluet */}
                  {subbagList.length > 0 && (
                    <div className="w-full max-w-2xl mt-4">
                      <div className="flex items-center justify-center gap-2 mb-2.5">
                        <div className="h-px bg-slate-200 flex-1" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Subbagian Sekretariat
                        </span>
                        <div className="h-px bg-slate-200 flex-1" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {subbagList.map(sub => (
                          <div
                            key={sub.id}
                            onClick={() => setSelectedPositionModal(sub)}
                            className="bg-white hover:bg-slate-50/80 p-3.5 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all flex items-center gap-3"
                          >
                            <OfficialSilhouette 
                              size="sm" 
                              avatarUrl={sub.avatarUrl} 
                              name={sub.name} 
                              roleBg="from-purple-100 to-indigo-100" 
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                                Subbagian
                              </span>
                              <h5 className="font-bold text-slate-900 text-xs mt-1 truncate">
                                {sub.title}
                              </h5>
                              <p className="text-[11px] text-slate-700 font-semibold truncate">
                                {sub.name}
                              </p>
                              {sub.nip && (
                                <p className="text-[10px] font-mono text-slate-400 truncate">
                                  NIP. {sub.nip}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vertical Connection Line to Bidang-Bidang */}
                  <div className="w-0.5 h-10 bg-slate-300 mt-6" />
                </div>
              )}

              {/* LEVEL 3: BIDANG-BIDANG TEKNIS PELAYANAN (Dafduk, Capil, PIAK, Pemanfaatan Data Terpisah) */}
              <div>
                <div className="flex items-center justify-center gap-3 mb-5">
                  <div className="h-px bg-slate-200 flex-1 max-w-xs" />
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider bg-slate-100 px-3.5 py-1 rounded-full">
                    4 Bidang Pelayanan Teknis Disdukcapil
                  </span>
                  <div className="h-px bg-slate-200 flex-1 max-w-xs" />
                </div>

                {/* 4 Kolom Grid Responsif untuk 4 Bidang Terpisah */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
                  {bidangList.map((bidang, idx) => {
                    const theme = getBidangTheme(bidang, idx);

                    return (
                      <div
                        key={bidang.id}
                        onClick={() => setSelectedPositionModal(bidang)}
                        className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 flex flex-col justify-between"
                      >
                        <div>
                          {/* Top: Siluet + Tag */}
                          <div className="flex items-start justify-between mb-3">
                            <OfficialSilhouette 
                              size="md" 
                              avatarUrl={bidang.avatarUrl} 
                              name={bidang.name} 
                              roleBg={theme.roleBg} 
                            />
                            <div className="text-right">
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${theme.badge}`}>
                                {theme.tag}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                                Bidang {idx + 1}
                              </span>
                            </div>
                          </div>

                          <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                            {bidang.title}
                          </h4>

                          <p className={`text-xs font-bold ${theme.accentText} mt-1.5`}>
                            {bidang.name}
                          </p>

                          {bidang.nip && (
                            <p className="text-[11px] font-mono text-slate-500">
                              NIP. {bidang.nip}
                            </p>
                          )}

                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Fokus Layanan:
                            </span>
                            <ul className="text-xs text-slate-600 space-y-1">
                              {bidang.duties.slice(0, 2).map((duty, dIdx) => (
                                <li key={dIdx} className="flex items-start gap-1.5">
                                  <span className="text-emerald-500 mt-0.5 text-[10px]">•</span>
                                  <span className="line-clamp-2">{duty}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-bold">
                          <span>Lihat Tupoksi Lengkap</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* LEVEL 4: JABATAN FUNGSIONAL & ADB - Borderless dengan Siluet */}
              {fungsionalList.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="h-px bg-slate-200 flex-1 max-w-xs" />
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider bg-slate-100 px-3.5 py-1 rounded-full">
                      Kelompok Jabatan Fungsional & Tenaga Teknis
                    </span>
                    <div className="h-px bg-slate-200 flex-1 max-w-xs" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                    {fungsionalList.map(fung => (
                      <div
                        key={fung.id}
                        onClick={() => setSelectedPositionModal(fung)}
                        className="bg-white hover:bg-slate-50/80 p-4.5 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all flex items-start gap-3.5"
                      >
                        <OfficialSilhouette 
                          size="md" 
                          avatarUrl={fung.avatarUrl} 
                          name={fung.name} 
                          roleBg="from-slate-200 to-slate-300" 
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            Jabatan Fungsional
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm mt-1">
                            {fung.title}
                          </h4>
                          <p className="text-xs text-slate-700 font-semibold mt-0.5">
                            {fung.name}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
                            {fung.duties[0]}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* Search Results Card Grid - Borderless dengan Siluet */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPositions.length > 0 ? (
                filteredPositions.map(pos => (
                  <div
                    key={pos.id}
                    onClick={() => setSelectedPositionModal(pos)}
                    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {pos.category}
                        </span>
                        {pos.nip && (
                          <span className="text-[10px] font-mono text-slate-400">
                            NIP Ada
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 my-2">
                        <OfficialSilhouette 
                          size="sm" 
                          avatarUrl={pos.avatarUrl} 
                          name={pos.name} 
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-slate-900 text-sm truncate">
                            {pos.title}
                          </h4>
                          <p className="text-xs font-bold text-emerald-700 truncate">
                            {pos.name}
                          </p>
                        </div>
                      </div>

                      {pos.nip && (
                        <p className="text-[11px] font-mono text-slate-500">
                          NIP. {pos.nip}
                        </p>
                      )}

                      <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-600 line-clamp-2">
                        {pos.duties[0]}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-bold">
                      <span>Rincian Pejabat</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white p-8 rounded-3xl text-center shadow-sm text-slate-500">
                  <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">Tidak ada data posisi yang cocok dengan pencarian "{searchTerm}"</p>
                  <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci lain seperti nama pejabat, NIP, atau bidang layanan.</p>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* Modal: Rincian Lengkap Pejabat & Tupoksi (Dengan Siluet & Tanpa Border) */}
      {selectedPositionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base">
                    Rincian Profil & Tupoksi Pejabat
                  </h4>
                  <span className="text-[10px] text-slate-300">
                    Disdukcapil Kabupaten Keerom
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPositionModal(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Profil Header dengan Siluet Besar */}
              <div className="flex items-start gap-4">
                <OfficialSilhouette 
                  size="lg" 
                  avatarUrl={selectedPositionModal.avatarUrl} 
                  name={selectedPositionModal.name}
                  roleBg={
                    selectedPositionModal.category === 'pimpinan' ? 'from-amber-100 via-amber-200 to-emerald-100' :
                    selectedPositionModal.category === 'sekretariat' ? 'from-blue-100 to-slate-200' :
                    'from-emerald-100 to-teal-200'
                  }
                />
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {selectedPositionModal.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1 leading-snug">
                    {selectedPositionModal.title}
                  </h3>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">
                    {selectedPositionModal.name}
                  </p>
                  {selectedPositionModal.nip && (
                    <p className="text-xs font-mono text-slate-500">
                      NIP. {selectedPositionModal.nip}
                    </p>
                  )}
                  {selectedPositionModal.rank && (
                    <p className="text-xs text-slate-500">
                      Pangkat/Golongan: {selectedPositionModal.rank}
                    </p>
                  )}
                </div>
              </div>

              {/* Kontak */}
              {(selectedPositionModal.phone || selectedPositionModal.email) && (
                <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1.5 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block text-[11px]">Kontak Kedinasan:</span>
                  {selectedPositionModal.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{selectedPositionModal.phone}</span>
                    </div>
                  )}
                  {selectedPositionModal.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{selectedPositionModal.email}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Tupoksi */}
              <div>
                <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Tugas Pokok & Fungsi (Tupoksi):</span>
                </h5>
                <div className="space-y-2">
                  {selectedPositionModal.duties.map((duty, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                      <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{duty}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedPositionModal(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Zoom Bagan Gambar Resolusi Tinggi */}
      {isChartImageZoomOpen && config.chartImageUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-4">
          <div className="flex items-center justify-between text-white p-2">
            <div>
              <span className="font-bold text-sm sm:text-base block">
                Bagan Struktur Organisasi Resmi Disdukcapil Keerom
              </span>
              <span className="text-xs text-slate-400">
                Pemerintah Kabupaten Keerom - Provinsi Papua
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={config.chartImageUrl}
                download={config.chartImageName || 'bagan-struktur-keerom.png'}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Gambar</span>
              </a>
              <button
                onClick={() => setIsChartImageZoomOpen(false)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-auto p-4">
            <img
              src={config.chartImageUrl}
              alt="Bagan Struktur Organisasi Disdukcapil Keerom"
              className="max-h-[85vh] max-w-[95vw] object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
