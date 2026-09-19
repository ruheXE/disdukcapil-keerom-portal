import React from 'react';
import { 
  X, 
  Printer, 
  CreditCard, 
  FileText, 
  ShieldCheck, 
  Building2, 
  User, 
  MapPin, 
  Calendar, 
  Award,
  Users
} from 'lucide-react';
import { Resident } from '../types/population';
import { calculateAge } from '../data/mockResidents';

interface ResidentProfileModalProps {
  resident: Resident;
  allResidents: Resident[];
  onClose: () => void;
  onEdit: (resident: Resident) => void;
  onSelectFamilyMember?: (resident: Resident) => void;
}

export const ResidentProfileModal: React.FC<ResidentProfileModalProps> = ({
  resident,
  allResidents,
  onClose,
  onEdit,
  onSelectFamilyMember,
}) => {
  const age = calculateAge(resident.birthDate);
  const birthYear = parseInt(resident.birthDate.split('-')[0] || '2000', 10);
  const photoBgClass = birthYear % 2 === 0 ? 'bg-blue-600' : 'bg-rose-600'; // Indonesian Dukcapil photo standard: Even year = Blue, Odd year = Red!

  // Other family members in the same No. KK
  const familyMembers = allResidents.filter(
    (r) => r.noKk === resident.noKk && r.id !== resident.id
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 my-8 space-y-6">
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              DOKUMEN RESMI SIAK
            </span>
            <span className="text-xs text-slate-400">Direktorat Jenderal Kependudukan dan Pencatatan Sipil</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Biodata</span>
            </button>
            <button
              onClick={() => onEdit(resident)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
            >
              Edit Data
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Indonesian Biodata WNI Sheet */}
        <div className="space-y-6 print:space-y-4">
          {/* Header Dukcapil */}
          <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
            <div className="flex justify-center items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-600">
                  REPUBLIK INDONESIA • KEMENTERIAN DALAM NEGERI
                </h3>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  BIODATA PENDUDUK WARGA NEGARA INDONESIA
                </h2>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Berdasarkan Undang-Undang No. 24 Tahun 2013 tentang Administrasi Kependudukan
            </p>
          </div>

          {/* Profile Identity Bar */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-200">
            {/* Dukcapil Photo Placeholder */}
            <div className={`w-28 h-36 rounded-xl ${photoBgClass} text-white flex flex-col items-center justify-center shrink-0 shadow-md border-2 border-white relative overflow-hidden`}>
              <User className="w-16 h-16 opacity-80" />
              <span className="text-[9px] font-bold uppercase tracking-wider mt-1 opacity-90">
                {resident.gender === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN'}
              </span>
              <span className="text-[8px] font-mono opacity-75">PAS FOTO RESMI</span>
            </div>

            {/* Core Identifiers */}
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  NOMOR INDUK KEPENDUDUKAN (NIK)
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-slate-900">
                  {resident.nik}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  NAMA LENGKAP
                </span>
                <div className="text-lg font-extrabold text-slate-900">{resident.fullName}</div>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs font-mono">
                  KK: {resident.noKk}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs">
                  {resident.familyRole}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 font-bold text-xs">
                  Gol. Darah: {resident.bloodType}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Demographic Attributes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Tempat & Tanggal Lahir */}
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 text-[10px] font-bold uppercase block">
                Tempat, Tanggal Lahir & Usia
              </span>
              <span className="text-slate-900 font-bold text-sm block mt-0.5">
                {resident.birthPlace}, {resident.birthDate}
              </span>
              <span className="text-slate-500 font-mono text-[11px]">{age} Tahun</span>
            </div>

            {/* Agama & Perkawinan */}
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 text-[10px] font-bold uppercase block">
                Agama & Status Perkawinan
              </span>
              <span className="text-slate-900 font-bold text-sm block mt-0.5">
                {resident.religion}
              </span>
              <span className="text-slate-500 text-[11px]">{resident.maritalStatus}</span>
            </div>

            {/* Pendidikan & Pekerjaan */}
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 text-[10px] font-bold uppercase block">
                Pendidikan Terakhir & Pekerjaan
              </span>
              <span className="text-slate-900 font-bold text-sm block mt-0.5">
                {resident.education}
              </span>
              <span className="text-slate-500 text-[11px]">{resident.job}</span>
            </div>

            {/* Dokumen Kependudukan */}
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 text-[10px] font-bold uppercase block">
                Status Kepemilikan Dokumen
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    resident.ktpStatus === 'Sudah Rekam'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  KTP: {resident.ktpStatus}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  Akta: {resident.hasBirthCert ? 'Ada' : 'Belum'}
                </span>
                {age < 17 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                    KIA: {resident.hasKia ? 'Ada' : 'Belum'}
                  </span>
                )}
              </div>
            </div>

            {/* Alamat Domisili */}
            <div className="sm:col-span-2 p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 text-[10px] font-bold uppercase block">
                Alamat Domisili Sesuai KTP
              </span>
              <span className="text-slate-900 font-bold text-sm block mt-0.5">
                {resident.address}, RT {resident.rt} / RW {resident.rw}
              </span>
              <span className="text-slate-500 text-[11px]">
                Kelurahan {resident.kelurahan}, Kecamatan {resident.kecamatan}
              </span>
            </div>
          </div>

          {/* Anggota Keluarga dalam 1 KK */}
          {familyMembers.length > 0 && (
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Anggota Keluarga Lain dalam Kartu Keluarga Ini ({familyMembers.length})</span>
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {familyMembers.map((fam) => (
                  <div
                    key={fam.id}
                    onClick={() => onSelectFamilyMember && onSelectFamilyMember(fam)}
                    className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{fam.fullName}</span>
                      <span className="text-slate-400 text-[10px] ml-2">({fam.familyRole})</span>
                      <p className="text-[10px] font-mono text-slate-400">NIK: {fam.nik}</p>
                    </div>
                    <span className="text-blue-600 font-semibold text-[11px]">Buka Profil →</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resident.notes && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              <b>Catatan Khusus:</b> {resident.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
