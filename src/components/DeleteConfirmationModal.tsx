import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Resident } from '../types/population';

interface DeleteConfirmationModalProps {
  resident: Resident;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
  isDeleting: boolean;
  hasGoogleSheetConnected: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  resident,
  onClose,
  onConfirmDelete,
  isDeleting,
  hasGoogleSheetConnected,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
        {/* Warning Icon & Title */}
        <div className="flex items-center gap-3 text-rose-600">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              Konfirmasi Penghapusan Data
            </h3>
            <p className="text-xs text-rose-600 font-medium">Tindakan ini tidak dapat dibatalkan</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
          <p className="text-slate-700">
            Apakah Anda yakin ingin menghapus data kependudukan berikut?
          </p>
          <div className="bg-white p-3 rounded-xl border border-slate-200 font-medium space-y-1">
            <div className="text-slate-900 font-extrabold text-sm">{resident.fullName}</div>
            <div className="text-slate-500 font-mono text-[11px]">
              NIK: {resident.nik} • No. KK: {resident.noKk}
            </div>
            <div className="text-slate-500 text-[11px]">
              Alamat: {resident.address}, Kel. {resident.kelurahan}
            </div>
          </div>
          {hasGoogleSheetConnected && (
            <p className="text-[11px] text-slate-500 italic">
              * Baris terkait di Google Spreadsheet Anda juga akan diperbarui/dihapus secara langsung.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirmDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
