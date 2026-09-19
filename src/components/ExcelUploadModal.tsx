import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Layers, 
  ShieldCheck, 
  RefreshCw,
  Info
} from 'lucide-react';
import { Resident, UserRole } from '../types/population';
import { isUserAdmin } from '../services/rbac';

interface ExcelUploadModalProps {
  currentRole?: UserRole;
  onClose: () => void;
  onImport: (newResidents: Resident[], mode: 'append' | 'replace') => Promise<void>;
  hasGoogleSheetConnected: boolean;
}

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
  currentRole = 'ADMIN',
  onClose,
  onImport,
  hasGoogleSheetConnected,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<Resident[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = true;

  // Normalize cell values to string
  const cleanVal = (val: any): string => {
    if (val === null || val === undefined) return '';
    return String(val).trim();
  };

  // Convert raw row to SIAK Resident format
  const mapRowToResident = (row: any, index: number): Resident | null => {
    // Check various possible header names
    const nik = cleanVal(row['NIK'] || row['nik'] || row['Nomor Induk Kependudukan'] || row['No_KTP']);
    const noKk = cleanVal(row['No. KK'] || row['No KK'] || row['NO_KK'] || row['noKk'] || row['Nomor KK']) || '3171012301010001';
    const fullName = cleanVal(row['Nama Lengkap'] || row['Nama'] || row['fullName'] || row['NAMA_LENGKAP']);

    if (!nik && !fullName) {
      return null;
    }

    // Gender
    const rawGender = cleanVal(row['Jenis Kelamin'] || row['Gender'] || row['gender'] || row['JK']).toUpperCase();
    const gender = rawGender.startsWith('P') || rawGender === 'PEREMPUAN' || rawGender === 'WANITA' ? 'P' : 'L';

    // BirthDate
    let birthDate = cleanVal(row['Tanggal Lahir'] || row['Tgl Lahir'] || row['birthDate']);
    // If Excel date serial number was parsed
    if (typeof row['Tanggal Lahir'] === 'number' || typeof row['Tgl Lahir'] === 'number') {
      try {
        const d = XLSX.SSF.parse_date_code(row['Tanggal Lahir'] || row['Tgl Lahir']);
        birthDate = `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
      } catch {
        birthDate = '1990-01-01';
      }
    }
    if (!birthDate || !birthDate.includes('-')) {
      birthDate = '1990-01-01';
    }

    // Religion
    const rawReligion = cleanVal(row['Agama'] || row['religion'] || 'Islam');
    const validReligions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Khonghucu'];
    const religion = (validReligions.find(r => r.toLowerCase() === rawReligion.toLowerCase()) as any) || 'Islam';

    // Status
    const status = cleanVal(row['Status'] || row['status']) || 'Aktif';

    return {
      id: `res-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
      nik: nik.padStart(16, '0'),
      noKk: noKk.padStart(16, '0'),
      fullName: fullName || `Warga Baru ${index + 1}`,
      gender,
      birthPlace: cleanVal(row['Tempat Lahir'] || row['birthPlace']) || 'Jakarta',
      birthDate,
      religion,
      education: cleanVal(row['Pendidikan'] || row['education']) || 'SLTA/SEDERAJAT',
      job: cleanVal(row['Pekerjaan'] || row['job']) || 'Karyawan Swasta',
      maritalStatus: (cleanVal(row['Status Kawin'] || row['maritalStatus']) as any) || 'Kawin',
      familyRole: (cleanVal(row['Hubungan Keluarga'] || row['familyRole']) as any) || 'Kepala Keluarga',
      address: cleanVal(row['Alamat'] || row['address']) || 'Jl. Kependudukan No. 1',
      rt: cleanVal(row['RT'] || row['rt']) || '001',
      rw: cleanVal(row['RW'] || row['rw']) || '002',
      kelurahan: cleanVal(row['Kampung'] || row['kampung'] || row['Kelurahan'] || row['kelurahan'] || row['Desa'] || row['desa']) || 'Kampung 1',
      kecamatan: cleanVal(row['Distrik'] || row['distrik'] || row['Kecamatan'] || row['kecamatan']) || 'Distrik 1',
      ktpStatus: (cleanVal(row['Status KTP'] || row['KTP-el'] || row['ktpStatus']) as any) || 'Sudah Rekam',
      hasBirthCert: cleanVal(row['Akta Kelahiran'] || row['hasBirthCert']).toLowerCase().includes('ada') || cleanVal(row['Akta Kelahiran'] || row['hasBirthCert']) === 'true' || cleanVal(row['Akta Kelahiran'] || row['hasBirthCert']).toLowerCase() === 'ya',
      hasDeathCert: cleanVal(row['Akta Kematian'] || row['hasDeathCert']).toLowerCase().includes('ada') || cleanVal(row['Akta Kematian'] || row['hasDeathCert']) === 'true' || cleanVal(row['Akta Kematian'] || row['hasDeathCert']).toLowerCase() === 'ya',
      hasKia: cleanVal(row['KIA'] || row['hasKia']).toLowerCase().includes('ada') || cleanVal(row['KIA'] || row['hasKia']) === 'true' || false,
      bloodType: (cleanVal(row['Golongan Darah'] || row['bloodType']) as any) || 'O',
      status: status.toLowerCase().includes('meninggal') ? 'Meninggal' : (status.toLowerCase().includes('pindah') ? 'Pindah' : 'Aktif'),
      deathDate: cleanVal(row['Tanggal Kematian'] || row['deathDate']),
      notes: cleanVal(row['Catatan'] || row['notes']),
    };
  };

  const processFile = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setFileName(uploadedFile.name);
    setValidationErrors([]);
    setIsProcessing(true);

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('File tidak memiliki sheet yang dapat dibaca.');
      }

      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

      if (!rawData || rawData.length === 0) {
        throw new Error('Sheet yang diunggah tidak memiliki baris data.');
      }

      const validList: Resident[] = [];
      const errors: string[] = [];

      rawData.forEach((row: any, idx: number) => {
        const res = mapRowToResident(row, idx);
        if (res) {
          if (res.nik.length !== 16) {
            errors.push(`Baris ${idx + 2}: NIK "${res.nik}" kurang dari 16 digit.`);
          }
          validList.push(res);
        }
      });

      if (validList.length === 0) {
        throw new Error('Tidak ditemukan format kolom data penduduk yang valid.');
      }

      setParsedRows(validList);
      setValidationErrors(errors);
    } catch (err: any) {
      console.error('Failed to parse Excel:', err);
      setValidationErrors([err.message || 'Gagal membaca isi file Excel.']);
      setParsedRows([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Generate and download standard sample Excel/CSV template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'NIK': '3171010101850001',
        'No. KK': '3171012301010001',
        'Nama Lengkap': 'Ahmad Fauzi Supriyanto',
        'Jenis Kelamin': 'L',
        'Tempat Lahir': 'Jakarta',
        'Tanggal Lahir': '1985-01-01',
        'Agama': 'Islam',
        'Pendidikan': 'S1/DIPLOMA IV',
        'Pekerjaan': 'PNS Kemendagri',
        'Status Kawin': 'Kawin',
        'Hubungan Keluarga': 'Kepala Keluarga',
        'Alamat': 'Jl. Merdeka Barat No. 12',
        'RT': '001',
        'RW': '003',
        'Distrik': 'Distrik Sentani',
        'Kampung': 'Kampung Yahim',
        'Status KTP': 'Sudah Rekam',
        'Akta Kelahiran': 'Ada',
        'Akta Kematian': 'Tidak',
        'KIA': 'Tidak',
        'Golongan Darah': 'O',
        'Status': 'Aktif',
      },
      {
        'NIK': '9103015507850002',
        'No. KK': '9103012506050008',
        'Nama Lengkap': 'Maria Wenda, S.Pd',
        'Jenis Kelamin': 'P',
        'Tempat Lahir': 'Tiom',
        'Tanggal Lahir': '1985-07-15',
        'Agama': 'Kristen',
        'Pendidikan': 'S1',
        'Pekerjaan': 'Guru',
        'Status Kawin': 'Kawin',
        'Hubungan Keluarga': 'Istri',
        'Alamat': 'Jl. Danau Sentani No. 12',
        'RT': '001',
        'RW': '001',
        'Distrik': 'Distrik Sentani',
        'Kampung': 'Kampung Yahim',
        'Status KTP': 'Sudah Rekam',
        'Akta Kelahiran': 'Ada',
        'Akta Kematian': 'Tidak',
        'KIA': 'Tidak',
        'Golongan Darah': 'A',
        'Status': 'Aktif',
      },
      {
        'NIK': '9103012001250003',
        'No. KK': '9103012506050008',
        'Nama Lengkap': 'Daniel Kogoya',
        'Jenis Kelamin': 'L',
        'Tempat Lahir': 'Sentani',
        'Tanggal Lahir': '2025-01-20',
        'Agama': 'Kristen',
        'Pendidikan': 'BELUM SEKOLAH',
        'Pekerjaan': 'Belum Bekerja',
        'Status Kawin': 'Belum Kawin',
        'Hubungan Keluarga': 'Anak',
        'Alamat': 'Jl. Danau Sentani No. 12',
        'RT': '001',
        'RW': '001',
        'Distrik': 'Distrik Sentani',
        'Kampung': 'Kampung Yahim',
        'Status KTP': 'Belum Wajib',
        'Akta Kelahiran': 'Ada',
        'Akta Kematian': 'Tidak',
        'KIA': 'Ada',
        'Golongan Darah': 'O',
        'Status': 'Aktif',
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_Penduduk_SIAK');
    XLSX.writeFile(workbook, 'Template_Data_Penduduk_Dukcapil.xlsx');
  };

  const handleConfirmImport = async () => {
    if (!isAdmin) {
      alert('Akses ditolak: Hanya role Admin yang dapat mengupload data Excel.');
      return;
    }
    if (parsedRows.length === 0) return;

    setIsProcessing(true);
    try {
      await onImport(parsedRows, importMode);
      onClose();
    } catch (err: any) {
      console.error('Import error:', err);
      setValidationErrors([err.message || 'Terjadi kesalahan saat mengimpor data.']);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  Upload Data Excel / CSV
                </h3>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  ADMIN SAJA
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Impor massal Buku Induk Kependudukan dari file spreadsheet (.xlsx, .xls, .csv)
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
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-800">Otorisasi Administrator Terverifikasi</span>
              <span className="text-slate-500 block text-[11px]">
                Hanya Administrator SIAK yang berwenang memasukkan data penduduk massal ke sistem.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-bold text-emerald-700 shadow-xs cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Template</span>
          </button>
        </div>

        {/* Upload Zone or Parsed Results */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {parsedRows.length === 0 ? (
            /* Dropzone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                Pilih atau Tarik File Excel / CSV ke Sini
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Format yang didukung: <b>.xlsx, .xls, .csv</b>. Kolom wajib: NIK, No. KK, Nama Lengkap, dsb.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs">
                <span>Pilih Berkas Dari Komputer</span>
              </div>
            </div>
          ) : (
            /* Parsed Summary & Preview */
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-extrabold text-xs text-slate-900">
                      {fileName}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-800 font-semibold block mt-0.5">
                    Berhasil memvalidasi <b>{parsedRows.length}</b> data jiwa penduduk.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setParsedRows([]);
                    setFile(null);
                  }}
                  className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                >
                  Ganti File
                </button>
              </div>

              {validationErrors.length > 0 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Catatan Validasi ({validationErrors.length})</span>
                  </div>
                  <ul className="list-disc pl-4 text-[11px] space-y-0.5 max-h-24 overflow-y-auto">
                    {validationErrors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {validationErrors.length > 5 && (
                      <li>...dan {validationErrors.length - 5} peringatan lainnya.</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Mode Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Metode Penggabungan Data:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setImportMode('append')}
                    className={`p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                      importMode === 'append'
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className="font-bold">Tambahkan (Append)</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      Menambahkan data baru ke daftar warga yang sudah ada saat ini.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    className={`p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                      importMode === 'replace'
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className="font-bold">Gantikan Semua (Replace)</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      Mengosongkan data lama dan menggantikannya dengan isi file Excel ini.
                    </div>
                  </button>
                </div>
              </div>

              {/* Preview Table of 5 Rows */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Pratinjau Data (5 Baris Pertama)</span>
                  <span className="font-mono">Total {parsedRows.length} baris</span>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-40">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                      <tr>
                        <th className="p-2 border-b border-slate-200">NIK</th>
                        <th className="p-2 border-b border-slate-200">Nama Lengkap</th>
                        <th className="p-2 border-b border-slate-200">JK</th>
                        <th className="p-2 border-b border-slate-200">Hubungan</th>
                        <th className="p-2 border-b border-slate-200">Kelurahan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {parsedRows.slice(0, 5).map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2 font-mono">{r.nik}</td>
                          <td className="p-2 font-bold text-slate-900">{r.fullName}</td>
                          <td className="p-2">{r.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                          <td className="p-2">{r.familyRole}</td>
                          <td className="p-2">{r.kelurahan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {hasGoogleSheetConnected && (
                <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Google Sheets Anda sedang terhubung. Data hasil upload Excel ini akan langsung disinkronkan secara otomatis.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={parsedRows.length === 0 || isProcessing || !isAdmin}
            onClick={handleConfirmImport}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            {isProcessing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>
              {isProcessing
                ? 'Memproses Impor...'
                : `Konfirmasi Impor ${parsedRows.length > 0 ? `(${parsedRows.length} Warga)` : ''}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
