/**
 * Layanan Autentikasi Khusus Administrator SIAK Disdukcapil Keerom
 * Menyediakan verifikasi kata sandi, manajemen sesi admin terpisah,
 * serta proteksi brute-force lockout.
 */

const ADMIN_PASSWORD_KEY = 'dukcapil_admin_password';
const ADMIN_SESSION_KEY = 'dukcapil_admin_active_session';
const FAILED_ATTEMPTS_KEY = 'dukcapil_admin_failed_attempts';
const LOCKOUT_TIMESTAMP_KEY = 'dukcapil_admin_lockout_time';

// Kata sandi default resmi awal sistem
export const DEFAULT_ADMIN_PASSWORD = 'keerom2025';
export const DEFAULT_ADMIN_USERNAME = 'admin';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 45 * 1000; // 45 detik lockout

export interface PasswordVerificationResult {
  success: boolean;
  message: string;
  lockedOut?: boolean;
  remainingLockoutSeconds?: number;
}

/**
 * Mendapatkan kata sandi admin yang tersimpan (atau default jika belum diubah)
 */
export const getAdminPassword = (): string => {
  try {
    const saved = localStorage.getItem(ADMIN_PASSWORD_KEY);
    if (saved && saved.trim().length > 0) {
      return saved;
    }
  } catch {
    // fallback
  }
  return DEFAULT_ADMIN_PASSWORD;
};

/**
 * Mengecek apakah sesi admin sedang terkunci karena terlalu banyak percobaan salah
 */
export const getLockoutStatus = (): { isLocked: boolean; remainingSeconds: number } => {
  try {
    const lockTimeStr = localStorage.getItem(LOCKOUT_TIMESTAMP_KEY);
    if (!lockTimeStr) return { isLocked: false, remainingSeconds: 0 };

    const lockTime = parseInt(lockTimeStr, 10);
    const elapsed = Date.now() - lockTime;

    if (elapsed < LOCKOUT_DURATION_MS) {
      const remainingSeconds = Math.ceil((LOCKOUT_DURATION_MS - elapsed) / 1000);
      return { isLocked: true, remainingSeconds };
    } else {
      // Lockout expired, bersihkan
      localStorage.removeItem(LOCKOUT_TIMESTAMP_KEY);
      localStorage.removeItem(FAILED_ATTEMPTS_KEY);
      return { isLocked: false, remainingSeconds: 0 };
    }
  } catch {
    return { isLocked: false, remainingSeconds: 0 };
  }
};

/**
 * Verifikasi kata sandi untuk masuk ke Dashboard Admin
 */
export const verifyAdminPassword = (enteredPassword: string): PasswordVerificationResult => {
  const lockout = getLockoutStatus();
  if (lockout.isLocked) {
    return {
      success: false,
      lockedOut: true,
      remainingLockoutSeconds: lockout.remainingSeconds,
      message: `Terlalu banyak percobaan gagal. Akses terkunci sementara selama ${lockout.remainingSeconds} detik demi keamanan sistem.`,
    };
  }

  const currentPassword = getAdminPassword();

  if (enteredPassword === currentPassword) {
    // Reset counter kegagalan
    try {
      localStorage.removeItem(FAILED_ATTEMPTS_KEY);
      localStorage.removeItem(LOCKOUT_TIMESTAMP_KEY);
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    } catch {
      // ignore
    }

    return {
      success: true,
      message: 'Autentikasi Administrator Berhasil.',
    };
  }

  // Catat kegagalan
  let attempts = 0;
  try {
    const current = localStorage.getItem(FAILED_ATTEMPTS_KEY);
    attempts = current ? parseInt(current, 10) + 1 : 1;
    localStorage.setItem(FAILED_ATTEMPTS_KEY, attempts.toString());

    if (attempts >= MAX_FAILED_ATTEMPTS) {
      localStorage.setItem(LOCKOUT_TIMESTAMP_KEY, Date.now().toString());
      return {
        success: false,
        lockedOut: true,
        remainingLockoutSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
        message: `Kata sandi salah. Anda telah gagal ${MAX_FAILED_ATTEMPTS} kali. Akses dibekukan selama 45 detik.`,
      };
    }
  } catch {
    // ignore
  }

  const sisa = MAX_FAILED_ATTEMPTS - attempts;
  return {
    success: false,
    message: `Kata sandi salah. Sisa kesempatan sebelum dibekukan: ${sisa} kali.`,
  };
};

/**
 * Mengubah kata sandi administrator
 */
export const changeAdminPassword = (
  currentPasswordInput: string,
  newPasswordInput: string
): { success: boolean; message: string } => {
  const activePassword = getAdminPassword();

  if (currentPasswordInput !== activePassword) {
    return {
      success: false,
      message: 'Kata sandi saat ini tidak cocok. Perubahan dibatalkan.',
    };
  }

  if (!newPasswordInput || newPasswordInput.trim().length < 6) {
    return {
      success: false,
      message: 'Kata sandi baru minimal harus 6 karakter.',
    };
  }

  try {
    localStorage.setItem(ADMIN_PASSWORD_KEY, newPasswordInput.trim());
    return {
      success: true,
      message: 'Kata sandi Administrator berhasil diperbarui!',
    };
  } catch {
    return {
      success: false,
      message: 'Gagal menyimpan kata sandi baru pada peramban.',
    };
  }
};

/**
 * Reset kata sandi ke default bawaan sistem (keerom2025)
 */
export const resetToDefaultPassword = (): void => {
  try {
    localStorage.removeItem(ADMIN_PASSWORD_KEY);
    localStorage.removeItem(FAILED_ATTEMPTS_KEY);
    localStorage.removeItem(LOCKOUT_TIMESTAMP_KEY);
  } catch {
    // ignore
  }
};

/**
 * Cek apakah sesi admin aktif pada tab browser ini
 */
export const isAdminSessionActive = (): boolean => {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
};

/**
 * Logout admin dan kunci akses kembali
 */
export const logoutAdminSession = (): void => {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    // ignore
  }
};
