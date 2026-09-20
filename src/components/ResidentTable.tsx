import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  UserCheck, 
  CreditCard, 
  FileText, 
  Check, 
  Copy, 
  Layers, 
  ChevronRight,
  Sparkles,
  AlertTriangle,
  UploadCloud,
  Lock
} from 'lucide-react';
import { Resident, UserRole } from '../types/population';
import { calculateAge, KELURAHAN_LIST } from '../data/mockResidents';
import { isUserAdmin } from '../services/rbac';

interface ResidentTableProps {
  residents: Resident[];
  userRole?: UserRole;
  onViewProfile: (resident: Resident) => void;
  onEditResident: (resident: Resident) => void;
  onDeleteResident: (resident: Resident) => void;
  onViewFamily: (noKk: string) => void;
  onOpenExcelUpload?: () => void;
  onAccessDenied?: (action: string) => void;
  initialKelurahanFilter?: string;
}

export const ResidentTable: React.FC<ResidentTableProps> = ({
  residents,
  userRole = 'ADMIN',
  onViewProfile,
  onEditResident,
  onDeleteResident,
  onViewFamily,
  onOpenExcelUpload,
  onAccessDenied,
  initialKelurahanFilter,
}) => {
  const isAdmin = isUserAdmin(userRole);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelurahan, setFilterKelurahan] = useState(initialKelurahanFilter || 'ALL');
  const [filterGender, setFilterGender] = useState<'ALL' | 'L' | 'P'>('ALL');
  const [filterKtp, setFilterKtp] = useState<'ALL' | 'Sudah Rekam' | 'Belum Rekam' | 'Belum Wajib'>('ALL');
  const [filterAge, setFilterAge] = useState<'ALL' | 'child' | 'productive' | 'elderly'>('ALL');
  const [copiedNik, setCopiedNik] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNik(text);
    setTimeout(() => setCopiedNik(null), 2000);
  };

  const filteredResidents = useMemo(() => {
    return residents.filter((r) => {
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const match =
          r.nik.toLowerCase().includes(query) ||
          r.noKk.toLowerCase().includes(query) ||
          r.fullName.toLowerCase().includes(query) ||
          r.kelurahan.toLowerCase().includes(query) ||
          r.address.toLowerCase().includes(query);
        if (!match) return false;
      }

      // Kelurahan
      if (filterKelurahan !== 'ALL' && r.kelurahan !== filterKelurahan) return false;

      // Gender
      if (filterGender !== 'ALL' && r.gender !== filterGender) return false;

      // KTP
      if (filterKtp !== 'ALL' && r.ktpStatus !== filterKtp) return false;

      // Age Group
      if (filterAge !== 'ALL') {
        const age = calculateAge(r.birthDate);
        if (filterAge === 'child' && age >= 18) return false;
        if (filterAge === 'productive' && (age < 18 || age >= 60)) return false;
        if (filterAge === 'elderly' && age < 60) return false;
      }

      return true;
    });
  }, [residents, searchTerm, filterKelurahan, filterGender, filterKtp, filterAge]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
      {/* Control Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Buku Induk Registrasi Penduduk
          </h3>
          <p className="text-xs text-slate-500">
            Daftar lengkap warga terdaftar beserta status identitas kependudukan dan keluarga
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-slate-500 font-mono">
            Menampilkan <b>{filteredResidents.length}</b> dari {residents.length} jiwa
          </span>

          {isAdmin && onOpenExcelUpload && (
            <button
              type="button"
              onClick={onOpenExcelUpload}
              title="Upload file Excel / CSV data kependudukan"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 shadow-xs"
            >
              <UploadCloud className="w-3.5 h-3.5 text-teal-600" />
              <span>Upload Excel</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari NIK (16 digit), No. KK, atau Nama..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Kelurahan Filter */}
        <div>
          <select
            value={filterKelurahan}
            onChange={(e) => setFilterKelurahan(e.target.value)}
            className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Kelurahan</option>
            {KELURAHAN_LIST.map((k) => (
              <option key={k} value={k}>
                Kel. {k}
              </option>
            ))}
          </select>
        </div>

        {/* Gender Filter */}
        <div>
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value as any)}
            className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Gender</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>

        {/* KTP Filter */}
        <div>
          <select
            value={filterKtp}
            onChange={(e) => setFilterKtp(e.target.value as any)}
            className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Status KTP</option>
            <option value="Sudah Rekam">Sudah Rekam KTP</option>
            <option value="Belum Rekam">Belum Rekam KTP</option>
            <option value="Belum Wajib">Belum Wajib KTP</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto border border-slate-100 rounded-2xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">NIK / No. KK</th>
              <th className="py-3 px-4">Nama Lengkap & Peran</th>
              <th className="py-3 px-3">JK / Usia</th>
              <th className="py-3 px-4">Alamat & Kelurahan</th>
              <th className="py-3 px-3 text-center">Dokumen Sipil</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredResidents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  Tidak ada data penduduk yang sesuai dengan kriteria pencarian
                </td>
              </tr>
            ) : (
              filteredResidents.map((r) => {
                const age = calculateAge(r.birthDate);
                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* NIK & No KK */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900">{r.nik}</span>
                        <button
                          onClick={() => copyToClipboard(r.nik)}
                          title="Salin NIK"
                          className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                        >
                          {copiedNik === r.nik ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] font-mono text-slate-400">KK: {r.noKk}</span>
                        <button
                          onClick={() => onViewFamily(r.noKk)}
                          title="Lihat Anggota KK ini"
                          className="text-[10px] text-blue-600 hover:underline cursor-pointer flex items-center"
                        >
                          (Lihat KK)
                        </button>
                      </div>
                    </td>

                    {/* Nama Lengkap & Peran */}
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-slate-900 block">{r.fullName}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            r.familyRole === 'Kepala Keluarga'
                              ? 'bg-blue-100 text-blue-800'
                              : r.familyRole === 'Istri'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {r.familyRole}
                        </span>
                        <span className="text-[10px] text-slate-400">• {r.job}</span>
                      </div>
                    </td>

                    {/* JK / Usia */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            r.gender === 'L'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {r.gender}
                        </span>
                        <span className="font-mono font-bold text-slate-800">{age} thn</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {r.birthDate}
                      </span>
                    </td>

                    {/* Alamat & Kelurahan */}
                    <td className="py-3 px-4">
                      <span className="text-slate-800 font-semibold block truncate max-w-[180px]">
                        {r.address}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        RT {r.rt} / RW {r.rw} • Kel. {r.kelurahan}
                      </span>
                    </td>

                    {/* Dokumen Sipil (KTP, Akta, KIA) */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        {/* KTP */}
                        <span
                          title={`KTP: ${r.ktpStatus}`}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            r.ktpStatus === 'Sudah Rekam'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.ktpStatus === 'Belum Rekam'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          KTP
                        </span>

                        {/* Akta */}
                        <span
                          title={`Akta Lahir: ${r.hasBirthCert ? 'Ada' : 'Belum Ada'}`}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            r.hasBirthCert
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          AKTA
                        </span>

                        {/* KIA */}
                        {age < 17 && (
                          <span
                            title={`KIA: ${r.hasKia ? 'Ada' : 'Belum Ada'}`}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              r.hasKia
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            KIA
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'Aktif'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : r.status === 'Pindah'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewProfile(r)}
                          title="Lihat Biodata Resmi"
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onEditResident(r)}
                          title="Edit Data"
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDeleteResident(r)}
                          title="Hapus Data"
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-700 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
