import React, { useState, useRef } from 'react';
import { 
  OrgChartConfig, 
  OrgPosition, 
  OrgCategory 
} from '../types/organization';
import { 
  UploadCloud, 
  Trash2, 
  Edit3, 
  Plus, 
  Save, 
  RotateCcw, 
  Eye, 
  CheckCircle2, 
  Image as ImageIcon, 
  Layers, 
  User, 
  Building2, 
  ShieldCheck, 
  FileText, 
  ArrowUp, 
  ArrowDown, 
  X,
  ExternalLink,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { resetToDefaultOrgChart, saveOrgChart } from '../services/orgChartStorage';

interface AdminOrgChartManagerProps {
  currentConfig: OrgChartConfig;
  onSaveConfig: (updated: OrgChartConfig) => void;
  onViewPublicDashboard?: () => void;
}

export const AdminOrgChartManager: React.FC<AdminOrgChartManagerProps> = ({
  currentConfig,
  onSaveConfig,
  onViewPublicDashboard,
}) => {
  const [config, setConfig] = useState<OrgChartConfig>(currentConfig);
  const [editingPosition, setEditingPosition] = useState<OrgPosition | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form temporary state for adding/editing position
  const [formTitle, setFormTitle] = useState('');
  const [formName, setFormName] = useState('');
  const [formNip, setFormNip] = useState('');
  const [formRank, setFormRank] = useState('');
  const [formCategory, setFormCategory] = useState<OrgCategory>('bidang');
  const [formParentId, setFormParentId] = useState<string>('pos-kadis');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDutiesText, setFormDutiesText] = useState('');
  const [formAvatarUrl, setFormAvatarUrl] = useState('');

  // Handle image upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Format file tidak didukung. Harap pilih file gambar (PNG, JPG, JPEG, SVG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimum 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      const updated: OrgChartConfig = {
        ...config,
        chartImageUrl: result,
        chartImageName: file.name,
        updatedAt: new Date().toISOString(),
      };
      setConfig(updated);
      onSaveConfig(updated);
      saveOrgChart(updated);
      showTemporarySuccess('Bagan gambar struktural organisasi berhasil diunggah!');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveChartImage = () => {
    if (window.confirm('Hapus bagan gambar yang sudah diunggah?')) {
      const updated: OrgChartConfig = {
        ...config,
        chartImageUrl: '',
        chartImageName: '',
        updatedAt: new Date().toISOString(),
      };
      setConfig(updated);
      onSaveConfig(updated);
      saveOrgChart(updated);
      showTemporarySuccess('Bagan gambar berhasil dihapus.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const showTemporarySuccess = (msg: string) => {
    setSaveSuccessMessage(msg);
    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 4000);
  };

  const handleSaveGeneralInfo = () => {
    const updated = {
      ...config,
      updatedAt: new Date().toISOString(),
    };
    setConfig(updated);
    onSaveConfig(updated);
    saveOrgChart(updated);
    showTemporarySuccess('Informasi umum & mode tampilan bagan berhasil disimpan!');
  };

  const handleResetToDefault = () => {
    if (window.confirm('Kembalikan ke susunan bagan struktur organisasi standar Disdukcapil Keerom? Data kustom akan diatur ulang.')) {
      const def = resetToDefaultOrgChart();
      setConfig(def);
      onSaveConfig(def);
      showTemporarySuccess('Bagan struktur berhasil diatur ulang ke konfigurasi standar Keerom.');
    }
  };

  // Open Edit modal
  const handleOpenEdit = (pos: OrgPosition) => {
    setEditingPosition(pos);
    setIsAddingNew(false);
    setFormTitle(pos.title);
    setFormName(pos.name);
    setFormNip(pos.nip || '');
    setFormRank(pos.rank || '');
    setFormCategory(pos.category);
    setFormParentId(pos.parentId || 'pos-kadis');
    setFormPhone(pos.phone || '');
    setFormEmail(pos.email || '');
    setFormDutiesText(pos.duties.join('\n'));
    setFormAvatarUrl(pos.avatarUrl || '');
  };

  // Open Add modal
  const handleOpenAddNew = () => {
    setEditingPosition(null);
    setIsAddingNew(true);
    setFormTitle('');
    setFormName('');
    setFormNip('');
    setFormRank('');
    setFormCategory('bidang');
    setFormParentId('pos-kadis');
    setFormPhone('');
    setFormEmail('');
    setFormDutiesText('Melaksanakan tugas teknis pelayanan administrasi kependudukan.\nMenyusun laporan kinerja pelayanan berkala.');
    setFormAvatarUrl('');
  };

  // Save Position (Create or Update)
  const handleSavePosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formName.trim()) {
      alert('Nama Jabatan dan Nama Pejabat wajib diisi.');
      return;
    }

    const dutiesArray = formDutiesText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    let updatedPositions: OrgPosition[] = [...config.positions];

    if (isAddingNew) {
      const newPos: OrgPosition = {
        id: `pos-${Date.now()}`,
        title: formTitle.trim(),
        name: formName.trim(),
        nip: formNip.trim() || undefined,
        rank: formRank.trim() || undefined,
        category: formCategory,
        parentId: formParentId || undefined,
        duties: dutiesArray.length > 0 ? dutiesArray : ['Melaksanakan tugas kedinasan sesuai tupoksi.'],
        phone: formPhone.trim() || undefined,
        email: formEmail.trim() || undefined,
        avatarUrl: formAvatarUrl.trim() || undefined,
        order: config.positions.length + 1,
      };
      updatedPositions.push(newPos);
    } else if (editingPosition) {
      updatedPositions = updatedPositions.map(p => {
        if (p.id === editingPosition.id) {
          return {
            ...p,
            title: formTitle.trim(),
            name: formName.trim(),
            nip: formNip.trim() || undefined,
            rank: formRank.trim() || undefined,
            category: formCategory,
            parentId: formParentId || undefined,
            duties: dutiesArray.length > 0 ? dutiesArray : p.duties,
            phone: formPhone.trim() || undefined,
            email: formEmail.trim() || undefined,
            avatarUrl: formAvatarUrl.trim() || undefined,
          };
        }
        return p;
      });
    }

    const updatedConfig: OrgChartConfig = {
      ...config,
      positions: updatedPositions,
      updatedAt: new Date().toISOString(),
    };

    setConfig(updatedConfig);
    onSaveConfig(updatedConfig);
    saveOrgChart(updatedConfig);

    setEditingPosition(null);
    setIsAddingNew(false);
    showTemporarySuccess(isAddingNew ? 'Pejabat/posisi baru berhasil ditambahkan!' : 'Data posisi berhasil diperbarui!');
  };

  const handleDeletePosition = (id: string, title: string) => {
    if (window.confirm(`Yakin ingin menghapus posisi "${title}" dari bagan struktur?`)) {
      const updatedPositions = config.positions.filter(p => p.id !== id);
      const updatedConfig = {
        ...config,
        positions: updatedPositions,
        updatedAt: new Date().toISOString(),
      };
      setConfig(updatedConfig);
      onSaveConfig(updatedConfig);
      saveOrgChart(updatedConfig);
      showTemporarySuccess(`Posisi "${title}" berhasil dihapus.`);
    }
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= config.positions.length) return;

    const list = [...config.positions];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // reassign order numbers
    const updated = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    const updatedConfig = {
      ...config,
      positions: updated,
      updatedAt: new Date().toISOString(),
    };
    setConfig(updatedConfig);
    onSaveConfig(updatedConfig);
    saveOrgChart(updatedConfig);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold px-2.5 py-0.5 rounded-md">
              PANEL ADMIN DISDUKCAPIL
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-400">Pengelolaan Bagan Struktur Organisasi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Pengaturan & Penyuntingan Bagan Organisasi
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Unggah bagan visual resmi (hasil scan/desain) atau sunting daftar pejabat, NIP, serta tugas pokok dan fungsi (Tupoksi) yang otomatis ditayangkan pada dashboard publik warga.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onViewPublicDashboard && (
            <button
              onClick={onViewPublicDashboard}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Lihat di Dashboard Publik</span>
            </button>
          )}
          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-slate-700 cursor-pointer"
            title="Kembalikan ke susunan standar Keerom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Standar</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccessMessage && (
        <div className="bg-emerald-900/90 border border-emerald-500/60 text-emerald-100 px-4 py-3 rounded-2xl flex items-center justify-between text-xs sm:text-sm shadow-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{saveSuccessMessage}</span>
          </div>
          <button
            onClick={() => setSaveSuccessMessage(null)}
            className="text-emerald-300 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Section 1: Upload Bagan Gambar / Bagan Resmi SK */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                1. Pengunggahan Bagan Gambar Resmi (SK / Infografis)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Unggah file gambar bagan organisasi (PNG, JPG, SVG, WebP) resolusi tinggi untuk ditampilkan kepada warga
              </p>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Upload Box or Image Preview */}
        {config.chartImageUrl ? (
          <div className="space-y-4">
            <div className="relative rounded-2xl border-2 border-emerald-500/40 bg-slate-900 overflow-hidden group max-h-[380px] flex items-center justify-center">
              <img
                src={config.chartImageUrl}
                alt="Bagan Struktur Organisasi Keerom"
                className="max-h-[380px] w-auto object-contain transition-transform group-hover:scale-[1.02] cursor-pointer"
                onClick={() => setIsImagePreviewOpen(true)}
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 pointer-events-none">
                <span className="px-3 py-1.5 bg-slate-900/90 text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Klik untuk Perbesar
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800">
                  Bagan Terpasang: <strong className="text-emerald-700">{config.chartImageName || 'bagan-struktur-keerom.png'}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsImagePreviewOpen(true)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Fullsize</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Ganti Gambar</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemoveChartImage}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 rounded-3xl p-8 text-center cursor-pointer transition-all group"
          >
            <div className="w-14 h-14 rounded-3xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-base">
              Klik atau Seret File Gambar Bagan ke Sini
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Mendukung file PNG, JPG, JPEG, SVG atau WebP resolusi tinggi (maksimal 10MB).
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 group-hover:border-emerald-500 group-hover:text-emerald-700 shadow-xs">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              <span>Pilih Gambar dari Komputer</span>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Mode Penayangan & Konfigurasi Umum */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              2. Mode Penayangan di Dashboard Publik
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tentukan bagaimana warga melihat bagan struktur organisasi di portal publik
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between ${
            config.mode === 'both' ? 'border-emerald-600 bg-emerald-50/50 shadow-xs' : 'border-slate-200 hover:border-slate-300'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 text-sm">Tampilkan Keduanya</span>
              <input
                type="radio"
                name="chartMode"
                checked={config.mode === 'both'}
                onChange={() => setConfig({ ...config, mode: 'both' })}
                className="text-emerald-600 focus:ring-emerald-500"
              />
            </div>
            <p className="text-xs text-slate-600">
              Menampilkan bagan gambar resmi di atas, diikuti daftar pejabat dan kartu hirarki interaktif dengan tupoksi lengkap.
            </p>
          </label>

          <label className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between ${
            config.mode === 'image' ? 'border-emerald-600 bg-emerald-50/50 shadow-xs' : 'border-slate-200 hover:border-slate-300'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 text-sm">Hanya Bagan Gambar</span>
              <input
                type="radio"
                name="chartMode"
                checked={config.mode === 'image'}
                onChange={() => setConfig({ ...config, mode: 'image' })}
                className="text-emerald-600 focus:ring-emerald-500"
              />
            </div>
            <p className="text-xs text-slate-600">
              Fokus pada dokumen bagan visual / infografis hasil unggahan dengan pembesar resolusi penuh.
            </p>
          </label>

          <label className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between ${
            config.mode === 'interactive' ? 'border-emerald-600 bg-emerald-50/50 shadow-xs' : 'border-slate-200 hover:border-slate-300'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 text-sm">Hanya Hirarki Interaktif</span>
              <input
                type="radio"
                name="chartMode"
                checked={config.mode === 'interactive'}
                onChange={() => setConfig({ ...config, mode: 'interactive' })}
                className="text-emerald-600 focus:ring-emerald-500"
              />
            </div>
            <p className="text-xs text-slate-600">
              Menampilkan kartu struktur organisasi digital responsif, pencarian pejabat, dan rincian tupoksi tanpa gambar.
            </p>
          </label>
        </div>

        {/* Text Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Judul Bagan Organisasi:
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sub-Judul Instansi:
            </label>
            <input
              type="text"
              value={config.subtitle}
              onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Dasar Hukum / Peraturan Daerah:
            </label>
            <input
              type="text"
              value={config.legalBasis}
              onChange={(e) => setConfig({ ...config, legalBasis: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Contoh: Berdasarkan Peraturan Bupati Keerom Nomor 18 Tahun 2021..."
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSaveGeneralInfo}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Informasi Umum</span>
          </button>
        </div>
      </div>

      {/* Section 3: Penyuntingan Posisi, Pejabat & Tupoksi */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                3. Daftar Pejabat & Susunan Struktural ({config.positions.length} Posisi)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sunting nama pejabat, NIP, pangkat golongan, dan rincian tugas pokok & fungsi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenAddNew}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Posisi Baru</span>
          </button>
        </div>

        {/* Table / List of Positions */}
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
          {config.positions.map((pos, index) => {
            const categoryBadge = {
              pimpinan: 'bg-amber-100 text-amber-800 border-amber-300',
              sekretariat: 'bg-blue-100 text-blue-800 border-blue-300',
              bidang: 'bg-emerald-100 text-emerald-800 border-emerald-300',
              subbag: 'bg-purple-100 text-purple-800 border-purple-300',
              fungsional: 'bg-slate-100 text-slate-700 border-slate-300',
            }[pos.category];

            return (
              <div 
                key={pos.id}
                className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                    {index + 1}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {pos.title}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${categoryBadge}`}>
                        {pos.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                      <span className="font-semibold text-slate-800">
                        {pos.name}
                      </span>
                      {pos.nip && (
                        <span className="font-mono text-slate-500 text-[11px]">
                          NIP. {pos.nip}
                        </span>
                      )}
                      {pos.rank && (
                        <span className="text-slate-500 text-[11px]">
                          • {pos.rank}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      <strong>Tupoksi:</strong> {pos.duties[0] || 'Tidak ada uraian'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                  {/* Move Up/Down Order */}
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(index, 'up')}
                    disabled={index === 0}
                    title="Geser Naik"
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(index, 'down')}
                    disabled={index === config.positions.length - 1}
                    title="Geser Turun"
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(pos)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sunting</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeletePosition(pos.id, pos.title)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Hapus Posisi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Edit / Add Position */}
      {(isAddingNew || editingPosition) && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in zoom-in-95">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  {isAddingNew ? 'Tambah Posisi Struktural Baru' : `Sunting: ${editingPosition?.title}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingPosition(null);
                  setIsAddingNew(false);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePosition} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Jabatan Resmi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Kepala Bidang Pelayanan Pendaftaran Penduduk"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Pejabat & Gelar <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Yohanes S. Bate, S.STP"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIP Pejabat (Bila Ada)
                  </label>
                  <input
                    type="text"
                    value={formNip}
                    onChange={(e) => setFormNip(e.target.value)}
                    placeholder="Contoh: 19810714 200112 1 002"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pangkat / Golongan Ruang
                  </label>
                  <input
                    type="text"
                    value={formRank}
                    onChange={(e) => setFormRank(e.target.value)}
                    placeholder="Contoh: Pembina (IV/a)"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori Hirarki <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as OrgCategory)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="pimpinan">Pimpinan Utama (Kepala Dinas)</option>
                    <option value="sekretariat">Sekretariat Dinas</option>
                    <option value="subbag">Subbagian (Umum / Keuangan)</option>
                    <option value="bidang">Bidang Teknis (Dafduk / Capil / PIAK)</option>
                    <option value="fungsional">Kelompok Jabatan Fungsional / ADB</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Atasan Langsung (Garis Lapor)
                </label>
                <select
                  value={formParentId}
                  onChange={(e) => setFormParentId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="">-- Pimpinan Teratas (Tidak Ada Atasan Langsung) --</option>
                  {config.positions.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Telepon / Ext
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="Contoh: (0967) 591-234 ext 103"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Kedinasan
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="Contoh: dafduk@keeromkab.go.id"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tugas Pokok & Fungsi (Tupoksi)
                  <span className="font-normal text-slate-500 ml-1">(Pisahkan setiap butir tugas dengan baris baru / Enter)</span>
                </label>
                <textarea
                  rows={4}
                  value={formDutiesText}
                  onChange={(e) => setFormDutiesText(e.target.value)}
                  placeholder="Butir 1 tugas pokok...&#10;Butir 2 tugas pokok...&#10;Butir 3 fungsi koordinasi..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPosition(null);
                    setIsAddingNew(false);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Posisi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Fullscreen Preview of Uploaded Chart Image */}
      {isImagePreviewOpen && config.chartImageUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-4">
          <div className="flex items-center justify-between text-white p-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base">Pratinjau Resolusi Penuh Bagan Organisasi</span>
              <span className="text-xs text-slate-400">({config.chartImageName || 'Bagan Resmi'})</span>
            </div>
            <button
              onClick={() => setIsImagePreviewOpen(false)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-auto p-4">
            <img
              src={config.chartImageUrl}
              alt="Bagan Struktur Organisasi Disdukcapil Keerom"
              className="max-h-[85vh] max-w-[95vw] object-contain rounded-xl shadow-2xl border border-slate-700"
            />
          </div>
        </div>
      )}
    </div>
  );
};
