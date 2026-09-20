import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  X, 
  AlertCircle, 
  KeyRound, 
  CheckCircle2, 
  ShieldAlert, 
  Info,
  RotateCcw
} from 'lucide-react';
import { 
  verifyAdminPassword, 
  getLockoutStatus, 
  DEFAULT_ADMIN_USERNAME, 
  DEFAULT_ADMIN_PASSWORD,
  resetToDefaultPassword
} from '../services/adminAuth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [username, setUsername] = useState(DEFAULT_ADMIN_USERNAME);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  // Monitor lockout timer
  useEffect(() => {
    if (!isOpen) return;

    const checkLockout = () => {
      const status = getLockoutStatus();
      setIsLockedOut(status.isLocked);
      setLockoutSeconds(status.remainingSeconds);
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setResetNotice(null);

    if (isLockedOut) {
      setErrorMessage(`Akses sedang dibekukan sementara. Tunggu ${lockoutSeconds} detik.`);
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Harap masukkan kata sandi Administrator.');
      return;
    }

    const result = verifyAdminPassword(password);
    if (result.success) {
      setPassword('');
      setErrorMessage(null);
      onSuccess();
    } else {
      setErrorMessage(result.message);
      if (result.lockedOut) {
        setIsLockedOut(true);
        setLockoutSeconds(result.remainingLockoutSeconds || 45);
      }
    }
  };

  const handleResetPassword = () => {
    if (window.confirm('Reset kata sandi Administrator ke pengaturan bawaan awal (keerom2025)?')) {
      resetToDefaultPassword();
      setPassword(DEFAULT_ADMIN_PASSWORD);
      setErrorMessage(null);
      setResetNotice(`Kata sandi telah direset ke default: "${DEFAULT_ADMIN_PASSWORD}". Silakan tekan Masuk.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95">
        
        {/* Header Resmi Keamanan Administrator */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 text-white p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-xs">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-black tracking-widest text-emerald-400 uppercase bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    PORTAL TERBATAS
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mt-1 leading-tight">
                  Autentikasi Administrator
                </h3>
                <p className="text-xs text-slate-300">
                  Disdukcapil Kabupaten Keerom
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup & Kembali ke Mode Publik"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Security Notice */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Halaman internal ini khusus untuk pejabat & operator pengelola data SIAK Disdukcapil Keerom. Akses publik tidak diperkenankan.
            </p>
          </div>

          {/* Alert Error / Lockout */}
          {isLockedOut ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-rose-800 animate-pulse">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Akses Dibekukan Sementara</span>
                <span>Terlalu banyak percobaan sandi salah. Tunggu <strong className="font-mono">{lockoutSeconds} detik</strong> sebelum mencoba kembali.</span>
              </div>
            </div>
          ) : errorMessage ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          ) : resetNotice ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-start gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-snug">{resetNotice}</span>
            </div>
          ) : null}

          {/* Username Input (Read-only default / informative) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Username Administrator
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="admin"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Kata Sandi (Password) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowHint(prev => !prev)}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Info className="w-3 h-3" />
                <span>{showHint ? 'Tutup Bantuan' : 'Info Sandi Bawaan'}</span>
              </button>
            </div>

            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLockedOut}
                placeholder="Masukkan kata sandi admin..."
                autoFocus
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:cursor-not-allowed font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                title={showPassword ? 'Sembunyikan' : 'Tampilkan sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Bantuan Sandi Awal / Petunjuk */}
          {showHint && (
            <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-950 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Kredensial Default Sistem:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-700">
                Kata sandi bawaan awal adalah: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-300 text-emerald-800">{DEFAULT_ADMIN_PASSWORD}</strong>.
              </p>
              <p className="text-[11px] text-slate-500">
                Setelah masuk, Anda dapat mengubah kata sandi ini kapan saja di menu pengaturan Dashboard Admin.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-800 hover:text-emerald-950 font-bold underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset sandi ke default ({DEFAULT_ADMIN_PASSWORD})</span>
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer text-center"
            >
              Kembali ke Publik
            </button>
            <button
              type="submit"
              disabled={isLockedOut}
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Masuk Admin</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
