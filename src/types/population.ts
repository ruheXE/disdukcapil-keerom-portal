export type Gender = 'L' | 'P';

export type Religion = 
  | 'Islam' 
  | 'Kristen' 
  | 'Katolik' 
  | 'Hindu' 
  | 'Buddha' 
  | 'Khonghucu';

export type MaritalStatus = 
  | 'Belum Kawin' 
  | 'Kawin' 
  | 'Cerai Hidup' 
  | 'Cerai Mati';

export type FamilyRole = 
  | 'Kepala Keluarga' 
  | 'Istri' 
  | 'Anak' 
  | 'Orang Tua' 
  | 'Mertua' 
  | 'Famili Lain';

export type KtpStatus = 
  | 'Sudah Rekam' 
  | 'Belum Rekam' 
  | 'Belum Wajib';

export type BloodType = 'A' | 'B' | 'AB' | 'O' | '-';

export type ResidentStatus = 'Aktif' | 'Pindah' | 'Meninggal';

export type UserRole = 'ADMIN' | 'OPERATOR';

export interface UserProfileInfo {
  role: UserRole;
  roleName: string;
  department: string;
  nip?: string;
}

export interface Resident {
  id: string;
  nik: string;              // 16 digit NIK
  noKk: string;             // 16 digit No. KK
  fullName: string;
  gender: Gender;
  birthPlace: string;
  birthDate: string;        // YYYY-MM-DD
  religion: Religion;
  education: string;
  job: string;
  maritalStatus: MaritalStatus;
  familyRole: FamilyRole;
  address: string;
  rt: string;
  rw: string;
  kelurahan: string;        // Kampung / Desa / Kelurahan
  kecamatan: string;        // Distrik / Kecamatan
  ktpStatus: KtpStatus;
  hasBirthCert: boolean;
  hasDeathCert?: boolean;
  hasKia: boolean;
  bloodType: BloodType;
  status: ResidentStatus;
  deathDate?: string;
  notes?: string;
  sheetRowIndex?: number;   // 1-based index in Google Sheets
}

export interface GoogleSheetConfig {
  spreadsheetId: string;
  spreadsheetTitle: string;
  sheetName: string;
  spreadsheetUrl: string;
  lastSyncedAt: string | null;
  totalSyncedRows: number;
}

export interface DistrictAggregate {
  districtName: string;
  villageCount: number;
  totalResidents: number;
  maleCount: number;
  femaleCount: number;
  totalKk: number;
  ktpEligible: number;
  ktpRecorded: number;
  ktpPercentage: number;
  birthCertCount: number;
  birthCertPercentage: number;
  birthsCount: number;
  deathsCount: number;
  deathCertCount: number;
}

export interface VillageAggregate {
  villageName: string;
  districtName: string;
  totalResidents: number;
  maleCount: number;
  femaleCount: number;
  totalKk: number;
  ktpEligible: number;
  ktpRecorded: number;
  ktpPercentage: number;
  birthCertCount: number;
  birthCertPercentage: number;
  birthsCount: number;
  deathsCount: number;
  deathCertCount: number;
}

export interface DukcapilAggregates {
  totalResidents: number;
  activeResidents: number;
  totalKk: number;
  maleCount: number;
  femaleCount: number;
  sexRatio: number;
  
  // Agregat Akte
  birthCertTotal: number;
  birthCertPercentage: number;
  birthCertChildCount: number;
  birthCertChildPercentage: number;
  withoutBirthCertCount: number;
  kiaCount: number;
  kiaEligible: number;
  kiaPercentage: number;
  deathCertCount: number;
  deathCertPercentage: number;

  // Agregat KTP-el
  ktpEligible: number;
  ktpRecorded: number;
  ktpUnrecorded: number;
  ktpPercentage: number;
  ktpUnderage: number;

  // Agregat Kelahiran & Kematian
  birthsRecorded: number;
  birthsMale: number;
  birthsFemale: number;
  deathsRecorded: number;
  deathRate: number;

  // Kelompok Usia
  ageGroups: {
    toddler: number;    // 0-4 thn (balita)
    child: number;      // 5-17 thn (usia sekolah)
    productive: number; // 18-59 thn (usia kerja)
    elderly: number;    // 60+ thn (lansia)
  };

  // Agregat Wilayah
  districts: DistrictAggregate[];
  villages: VillageAggregate[];

  // Tren Vital Bulanan
  vitalTrends: MonthlyVitalTrend[];
}

export interface MonthlyVitalTrend {
  monthKey: string;      // "2025-01"
  monthName: string;     // "Jan" or "Januari"
  monthFull: string;     // "Januari 2025"
  year: number;
  monthIndex: number;    // 1 - 12
  births: number;        // Jumlah Kelahiran
  birthsMale: number;
  birthsFemale: number;
  deaths: number;        // Jumlah Kematian
  naturalGrowth: number; // Pertumbuhan Alami (Kelahiran - Kematian)
  birthCertsIssued: number; // Akta Kelahiran Diterbitkan
  deathCertsIssued: number; // Akta Kematian Diterbitkan
}
