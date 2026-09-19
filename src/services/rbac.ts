import { UserRole } from '../types/population';

export interface RolePermissions {
  role: UserRole;
  roleTitle: string;
  badgeLabel: string;
  description: string;
  canUploadExcel: boolean;
  canConfigGoogleSheets: boolean;
  canSyncGoogleSheets: boolean;
  canCreateNewResident: boolean;
  canEditResident: boolean;
  canDeleteResident: boolean;
}

export const ROLE_DEFINITIONS: Record<UserRole, RolePermissions> = {
  ADMIN: {
    role: 'ADMIN',
    roleTitle: 'Administrator SIAK',
    badgeLabel: 'ADMIN',
    description: 'Hak akses tertinggi. Berwenang mengunggah file Excel, menghubungkan Google Sheets, sinkronisasi data massal, dan manajemen penuh database.',
    canUploadExcel: true,
    canConfigGoogleSheets: true,
    canSyncGoogleSheets: true,
    canCreateNewResident: true,
    canEditResident: true,
    canDeleteResident: true,
  },
  OPERATOR: {
    role: 'OPERATOR',
    roleTitle: 'Operator Pelayanan',
    badgeLabel: 'OPERATOR',
    description: 'Hak akses operasional loket. Berwenang melakukan pencarian, melihat biodata, dan entri data perorangan. Dilarang mengunggah file Excel atau mengonfigurasi Google Sheets.',
    canUploadExcel: false,
    canConfigGoogleSheets: false,
    canSyncGoogleSheets: false,
    canCreateNewResident: true,
    canEditResident: true,
    canDeleteResident: false,
  },
};

const ROLE_STORAGE_KEY = 'dukcapil_siak_user_role';

export const getStoredUserRole = (): UserRole => {
  try {
    const saved = localStorage.getItem(ROLE_STORAGE_KEY);
    if (saved === 'ADMIN' || saved === 'OPERATOR') {
      return saved;
    }
  } catch {
    // fallback
  }
  return 'ADMIN';
};

export const saveStoredUserRole = (role: UserRole): void => {
  try {
    localStorage.setItem(ROLE_STORAGE_KEY, role);
  } catch {
    // ignore
  }
};

export const isUserAdmin = (role: UserRole): boolean => {
  return role === 'ADMIN';
};
