import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  User, 
  CreditCard, 
  MapPin, 
  FileText, 
  AlertCircle,
  Building2,
  Check
} from 'lucide-react';
import { Resident, Gender, Religion, MaritalStatus, FamilyRole, KtpStatus, BloodType, ResidentStatus } from '../types/population';
import { KELURAHAN_LIST, KECAMATAN_LIST, EDUCATION_LEVELS, JOB_CATEGORIES } from '../data/mockResidents';

interface ResidentFormModalProps {
  initialResident?: Resident | null;
  initialNoKk?: string;
  initialAddress?: string;
  initialKelurahan?: string;
  initialKecamatan?: string;
  onClose: () => void;
  onSave: (resident: Resident) => void;
}

export const ResidentFormModal: React.FC<ResidentFormModalProps> = ({
  initialResident,
  initialNoKk,
  initialAddress,
  initialKelurahan,
  initialKecamatan,
  onClose,
  onSave,
}) => {
  const isEditing = Boolean(initialResident);

  const [nik, setNik] = useState(initialResident?.nik || '');
  const [noKk, setNoKk] = useState(initialResident?.noKk || initialNoKk || '');
  const [fullName, setFullName] = useState(initialResident?.fullName || '');
  const [gender, setGender] = useState<Gender>(initialResident?.gender || 'L');
  const [birthPlace, setBirthPlace] = useState(initialResident?.birthPlace || '');
  const [birthDate, setBirthDate] = useState(initialResident?.birthDate || '1995-01-01');
  const [religion, setReligion] = useState<Religion>(initialResident?.religion || 'Islam');
  const [education, setEducation] = useState(initialResident?.education || 'SMA / SMK');
  const [job, setJob] = useState(initialResident?.job || 'Karyawan Swasta');
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>(
    initialResident?.maritalStatus || 'Belum Kawin'
  );
  const [familyRole, setFamilyRole] = useState<FamilyRole>(
    initialResident?.familyRole || 'Kepala Keluarga'
  );
  const [address, setAddress] = useState(initialResident?.address || initialAddress || '');
  const [rt, setRt] = useState(initialResident?.rt || '001');
  const [rw, setRw] = useState(initialResident?.rw || '001');
  const [kelurahan, setKelurahan] = useState(initialResident?.kelurahan || initialKelurahan || KELURAHAN_LIST[0]);
  const [kecamatan, setKecamatan] = useState(initialResident?.kecamatan || initialKecamatan || KECAMATAN_LIST[0]);
  const [ktpStatus, setKtpStatus] = useState<KtpStatus>(initialResident?.ktpStatus || 'Sudah Rekam');
  const [hasBirthCert, setHasBirthCert] = useState<boolean>(initialResident?.hasBirthCert ?? true);
  const [hasKia, setHasKia] = useState<boolean>(initialResident?.hasKia ?? false);
  const [bloodType, setBloodType] = useState<BloodType>(initialResident?.bloodType || 'O');
  const [status, setStatus] = useState<ResidentStatus>(initialResident?.status || 'Aktif');
  const [notes, setNotes] = useState(initialResident?.notes || '');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const cleanNik = nik.trim().replace(/\D/g, '');
    const cleanKk = noKk.trim().replace(/\D/g, '');

    if (cleanNik.length !== 16) {
      setErrorMessage('Nomor Induk Kependudukan (NIK) harus tepat 16 digit angka.');
      return;
    }

    if (cleanKk.length !== 16) {
      setErrorMessage('Nomor Kartu Keluarga (KK) harus tepat 16 digit angka.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('Nama lengkap wajib diisi sesuai identitas resmi.');
      return;
    }

    if (!birthPlace.trim()) {
      setErrorMessage('Tempat lahir wajib diisi.');
      return;
    }

    if (!address.trim()) {
      setErrorMessage('Alamat domisili wajib diisi.');
      return;
    }

    const updatedResident: Resident = {
      id: initialResident?.id || `res-${Date.now()}`,
      nik: cleanNik,
      noKk: cleanKk,
      fullName: fullName.trim(),
      gender,
      birthPlace: birthPlace.trim(),
      birthDate,
      religion,
      education,
      job,
      maritalStatus,
      familyRole,
      address: address.trim(),
      rt: rt.trim() || '001',
      rw: rw.trim() || '001',
      kelurahan,
      kecamatan,
      ktpStatus,
      hasBirthCert,
      hasKia,
      bloodType,
      status,
      notes: notes.trim(),
      sheetRowIndex: initialResident?.sheetRowIndex,
    };

    onSave(updatedResident);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase">
              FORMULIR PENDAFTARAN RESMI
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              {isEditing ? 'Edit Data Penduduk' : 'Perekaman Penduduk Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 mt-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
          {/* Section 1: Data Identitas Pokok */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>1. Identitas Pokok & Keluarga</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  NIK (16 Digit) *
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                  placeholder="3273xxxxxxxxxxxx"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nomor KK (16 Digit) *
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={noKk}
                  onChange={(e) => setNoKk(e.target.value.replace(/\D/g, ''))}
                  placeholder="3273xxxxxxxxxxxx"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Lengkap Sesuai Dokumen Resmi *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Siti Rahmawati, S.Pd."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Hubungan dalam Keluarga
                </label>
                <select
                  value={familyRole}
                  onChange={(e) => setFamilyRole(e.target.value as FamilyRole)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Kepala Keluarga">Kepala Keluarga</option>
                  <option value="Istri">Istri</option>
                  <option value="Anak">Anak</option>
                  <option value="Orang Tua">Orang Tua</option>
                  <option value="Mertua">Mertua</option>
                  <option value="Famili Lain">Famili Lain</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Jenis Kelamin
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('L')}
                    className={`py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                      gender === 'L'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Laki-laki
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('P')}
                    className={`py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                      gender === 'P'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Perempuan
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Kelahiran & Sosial */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>2. Tempat Lahir & Status Sosial</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tempat Lahir *</label>
                <input
                  type="text"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="Kota / Kab Lahir"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tanggal Lahir *</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Golongan Darah</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value as BloodType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="O">O</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="-">- (Tidak Tahu)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Agama</label>
                <select
                  value={religion}
                  onChange={(e) => setReligion(e.target.value as Religion)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Islam">Islam</option>
                  <option value="Kristen">Kristen</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Khonghucu">Khonghucu</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Status Perkawinan</label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value as MaritalStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Belum Kawin">Belum Kawin</option>
                  <option value="Kawin">Kawin Tercatat</option>
                  <option value="Cerai Hidup">Cerai Hidup</option>
                  <option value="Cerai Mati">Cerai Mati</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Pendidikan</label>
                <select
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {EDUCATION_LEVELS.map((edu) => (
                    <option key={edu} value={edu}>
                      {edu}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="text-xs font-bold text-slate-700 block mb-1">Pekerjaan</label>
                <select
                  value={job}
                  onChange={(e) => setJob(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {JOB_CATEGORIES.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Alamat & Wilayah */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>3. Alamat Domisili</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Jalan / Gang / No. Rumah *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Sukajadi No. 42"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">RT</label>
                <input
                  type="text"
                  maxLength={3}
                  value={rt}
                  onChange={(e) => setRt(e.target.value)}
                  placeholder="003"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-center font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">RW</label>
                <input
                  type="text"
                  maxLength={3}
                  value={rw}
                  onChange={(e) => setRw(e.target.value)}
                  placeholder="007"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-center font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Kelurahan</label>
                <select
                  value={kelurahan}
                  onChange={(e) => setKelurahan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {KELURAHAN_LIST.map((k) => (
                    <option key={k} value={k}>
                      Kel. {k}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Kecamatan</label>
                <select
                  value={kecamatan}
                  onChange={(e) => setKecamatan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {KECAMATAN_LIST.map((kec) => (
                    <option key={kec} value={kec}>
                      Kec. {kec}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Dokumen & Status Kependudukan */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>4. Kepemilikan Dokumen & Status Warga</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Status KTP-el
                </label>
                <select
                  value={ktpStatus}
                  onChange={(e) => setKtpStatus(e.target.value as KtpStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Sudah Rekam">Sudah Rekam</option>
                  <option value="Belum Rekam">Belum Rekam</option>
                  <option value="Belum Wajib">Belum Wajib (&lt; 17 Thn)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Status Keberadaan
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ResidentStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Pindah">Pindah Domisili</option>
                  <option value="Meninggal">Meninggal Dunia</option>
                </select>
              </div>

              <div className="flex flex-col justify-end space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={hasBirthCert}
                    onChange={(e) => setHasBirthCert(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Memiliki Akta Lahir</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={hasKia}
                    onChange={(e) => setHasKia(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Memiliki KIA (Anak)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Simpan Perubahan' : 'Rekam Data Penduduk'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
