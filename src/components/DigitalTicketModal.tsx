import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  QrCode, 
  Building2, 
  Calendar, 
  Clock, 
  User, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Share2
} from 'lucide-react';
import { QueueTicket } from '../types';
import { DUKCAPIL_SERVICES } from '../data/services';

interface DigitalTicketModalProps {
  ticket: QueueTicket | null;
  onClose: () => void;
  onTrackTicket?: (ticketNumber: string) => void;
}

export const DigitalTicketModal: React.FC<DigitalTicketModalProps> = ({
  ticket,
  onClose,
  onTrackTicket,
}) => {
  if (!ticket) return null;

  const service = DUKCAPIL_SERVICES.find((s) => s.id === ticket.serviceId);

  const handlePrint = () => {
    window.print();
  };

  const maskedNik = ticket.nik.length === 16 
    ? `${ticket.nik.substring(0, 6)}******${ticket.nik.substring(12)}`
    : ticket.nik;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">TIKET ANTREAN RESMI</h3>
              <p className="text-[11px] text-emerald-100">Dinas Kependudukan dan Pencatatan Sipil</p>
            </div>
          </div>
          <button
            id="close-ticket-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ticket Content (Printable area) */}
        <div className="p-6 sm:p-8 space-y-6 print:p-0">
          {/* Top badge */}
          <div className="text-center pb-4 border-b border-dashed border-slate-200">
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold tracking-wider uppercase mb-2">
              Pendaftaran Online Berhasil
            </span>
            <p className="text-xs text-slate-500">
              Tunjukkan nomor antrean ini kepada petugas loket saat tiba di kantor Dukcapil
            </p>
            
            {/* Big Ticket Number */}
            <div className="mt-4 py-3 px-6 bg-slate-50 rounded-2xl border-2 border-emerald-500/30 inline-block shadow-inner">
              <span className="text-xs uppercase font-bold text-slate-400 block tracking-widest">
                Nomor Antrean Anda
              </span>
              <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-emerald-700 block">
                {ticket.ticketNumber}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-medium flex items-center gap-1 mb-1">
                <User className="w-3.5 h-3.5 text-emerald-600" /> Nama Pemohon
              </span>
              <p className="font-bold text-slate-800 text-sm truncate">{ticket.fullName}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">NIK: {maskedNik}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-medium flex items-center gap-1 mb-1">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Jenis Layanan
              </span>
              <p className="font-bold text-slate-800 text-sm truncate">{ticket.serviceName}</p>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                Estimasi: ±{service?.estimatedMinutes || 10} menit
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-medium flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Tanggal Kunjungan
              </span>
              <p className="font-bold text-slate-800 text-sm">
                {new Date(ticket.bookingDate).toLocaleDateString('id-ID', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-medium flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" /> Sesi Kedatangan
              </span>
              <p className="font-bold text-slate-800 text-sm">{ticket.timeSlot}</p>
            </div>
          </div>

          {/* Barcode & Security Marker */}
          <div className="p-4 bg-slate-900 rounded-2xl text-white flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-emerald-400 uppercase font-mono tracking-wider font-semibold">
                KODE VERIFIKASI RESMI
              </span>
              <p className="font-mono text-xs text-slate-300 font-bold">{ticket.id.toUpperCase()}</p>
              <div className="flex gap-1 pt-1">
                {[4, 8, 2, 6, 10, 5, 8, 3, 7, 9, 4, 7, 2, 8, 6, 4, 8, 3, 5, 9, 6].map((w, i) => (
                  <div key={i} className="bg-slate-400 rounded-xs h-6" style={{ width: `${w}px` }} />
                ))}
              </div>
            </div>

            {/* QR Mock graphic */}
            <div className="w-16 h-16 bg-white p-1.5 rounded-xl shrink-0 flex items-center justify-center">
              <div className="w-full h-full border-2 border-slate-900 flex flex-col justify-between p-0.5">
                <div className="flex justify-between">
                  <div className="w-3 h-3 bg-slate-900" />
                  <div className="w-3 h-3 bg-slate-900" />
                </div>
                <div className="w-2 h-2 bg-emerald-600 mx-auto" />
                <div className="flex justify-between">
                  <div className="w-3 h-3 bg-slate-900" />
                  <div className="w-2 h-2 bg-slate-900" />
                </div>
              </div>
            </div>
          </div>

          {/* Mandatory Documents reminder */}
          {service && (
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Dokumen Yang Wajib Dibawa:</span>
              </div>
              <ul className="space-y-1 text-amber-800 list-disc list-inside">
                {service.requirements.slice(0, 3).map((req, idx) => (
                  <li key={idx} className="truncate">{req}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5 justify-between">
          <button
            id="print-ticket-btn"
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak / Cetak PDF</span>
          </button>

          <div className="flex gap-2">
            <button
              id="track-this-ticket-btn"
              onClick={() => {
                onClose();
                if (onTrackTicket) {
                  onTrackTicket(ticket.ticketNumber);
                }
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Pantau Tiket Ini Langsung</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
