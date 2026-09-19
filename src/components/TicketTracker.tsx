import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Ticket, 
  CreditCard, 
  Clock, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  Send, 
  BellRing, 
  ExternalLink,
  Volume2,
  Calendar,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { QueueTicket, ServiceCounter } from '../types';
import { announcer } from '../utils/audioAnnouncer';

interface TicketTrackerProps {
  tickets: QueueTicket[];
  counters: ServiceCounter[];
  initialTicketNumber?: string;
  onOpenTicketModal: (ticket: QueueTicket) => void;
}

export const TicketTracker: React.FC<TicketTrackerProps> = ({
  tickets,
  counters,
  initialTicketNumber,
  onOpenTicketModal,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(initialTicketNumber || '');
  const [searchedTicket, setSearchedTicket] = useState<QueueTicket | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [simulatedWaSent, setSimulatedWaSent] = useState<boolean>(false);

  // Sync if initialTicketNumber changes or tickets list updates
  useEffect(() => {
    if (initialTicketNumber) {
      setSearchQuery(initialTicketNumber);
      const found = tickets.find(
        (t) => t.ticketNumber.toUpperCase() === initialTicketNumber.toUpperCase()
      );
      if (found) {
        setSearchedTicket(found);
        setHasSearched(true);
      }
    }
  }, [initialTicketNumber, tickets]);

  // Keep searched ticket updated with live state
  useEffect(() => {
    if (searchedTicket) {
      const updated = tickets.find((t) => t.id === searchedTicket.id);
      if (updated) {
        setSearchedTicket(updated);
      }
    }
  }, [tickets]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    if (!query) return;

    setHasSearched(true);
    setSimulatedWaSent(false);

    // Search by ticket number or NIK
    const found = tickets.find(
      (t) =>
        t.ticketNumber.toUpperCase() === query ||
        t.nik === query ||
        t.phoneNumber.includes(query)
    );

    setSearchedTicket(found || null);
  };

  // Calculate position in queue
  const calculateQueuePosition = (ticket: QueueTicket) => {
    if (ticket.status !== 'WAITING') return 0;
    const waitingSameService = tickets.filter(
      (t) => t.serviceId === ticket.serviceId && t.status === 'WAITING'
    );
    const index = waitingSameService.findIndex((t) => t.id === ticket.id);
    return index >= 0 ? index + 1 : 0;
  };

  const position = searchedTicket ? calculateQueuePosition(searchedTicket) : 0;
  const estimatedWait = position * 12;

  const handleSimulateWhatsApp = () => {
    if (!searchedTicket) return;
    setSimulatedWaSent(true);
    announcer.playAlertNotification();

    // Check if browser notification is available
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`Dukcapil Antrean: ${searchedTicket.ticketNumber}`, {
          body: `Halo ${searchedTicket.fullName}, status antrean Anda: ${searchedTicket.status}. Sisa antrean di depan Anda: ${position} orang.`,
          icon: '/favicon.ico',
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100/80 text-teal-800 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-teal-200">
          <Ticket className="w-3.5 h-3.5" />
          Pelacakan Real-Time
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Cek Status & Pantau Antrean Anda
        </h2>
        <p className="text-sm text-slate-600 mt-2 max-w-lg mx-auto">
          Masukkan Nomor Antrean Anda (contoh: <span className="font-mono font-bold text-emerald-700">A-004</span>) atau 16 digit NIK untuk memantau panggilan langsung dari HP.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              id="input-search-ticket"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik Nomor Antrean (misal: A-004) atau 16 digit NIK..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 uppercase"
            />
          </div>
          <button
            id="btn-search-ticket"
            type="submit"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Cari Antrean</span>
          </button>
        </form>

        {/* Quick select pills from active tickets */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">Contoh antrean aktif:</span>
          {tickets.slice(0, 5).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setSearchQuery(t.ticketNumber);
                setSearchedTicket(t);
                setHasSearched(true);
                setSimulatedWaSent(false);
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              {t.ticketNumber} ({t.status === 'WAITING' ? 'Menunggu' : t.status === 'SERVING' ? 'Dilayani' : t.status})
            </button>
          ))}
        </div>
      </div>

      {/* Search Result Display */}
      {hasSearched && !searchedTicket && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center animate-in fade-in">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Nomor Antrean Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Periksa kembali format nomor antrean atau NIK Anda. Pastikan Anda telah melakukan pendaftaran online terlebih dahulu.
          </p>
        </div>
      )}

      {searchedTicket && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
          {/* Status Header Banner */}
          <div
            className={`p-6 text-white transition-colors ${
              searchedTicket.status === 'CALLED'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 animate-pulse'
                : searchedTicket.status === 'SERVING'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700'
                : searchedTicket.status === 'COMPLETED'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
                : 'bg-gradient-to-r from-slate-800 to-slate-900'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-white/80 font-bold block mb-1">
                  STATUS ANTREAN ANDA
                </span>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl sm:text-3xl font-black font-mono tracking-tight">
                    {searchedTicket.ticketNumber}
                  </h3>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-xs">
                    {searchedTicket.status === 'WAITING' && 'MENUNGGU GILIRAN'}
                    {searchedTicket.status === 'CALLED' && 'SEDANG DIPANGGIL!'}
                    {searchedTicket.status === 'SERVING' && 'SEDANG DILAYANI'}
                    {searchedTicket.status === 'COMPLETED' && 'PELAYANAN SELESAI'}
                    {searchedTicket.status === 'SKIPPED' && 'TERLEWATI / TIDAK HADIR'}
                  </span>
                </div>
              </div>

              {searchedTicket.status === 'CALLED' && (
                <button
                  onClick={() => announcer.announceQueue(searchedTicket.ticketNumber, searchedTicket.counterName || 'Loket Petugas')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-orange-700 font-bold text-xs shadow-lg hover:bg-orange-50 transition-all cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Dengarkan Panggilan</span>
                </button>
              )}
            </div>
          </div>

          {/* Body Information */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Real-time Status Alert Box */}
            {searchedTicket.status === 'CALLED' && (
              <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-400 flex items-start gap-4 animate-bounce-subtle">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <BellRing className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-amber-950">
                    PANGGILAN KE {searchedTicket.counterName?.toUpperCase() || 'LOKET PETUGAS'}!
                  </h4>
                  <p className="text-xs text-amber-900 mt-1">
                    Silakan segera menuju meja {searchedTicket.counterName} dengan membawa berkas asli dan salinan. Petugas sedang menunggu Anda.
                  </p>
                </div>
              </div>
            )}

            {searchedTicket.status === 'WAITING' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 block">Posisi Antrean Anda:</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-slate-900 font-mono">
                      Urutan ke-{position}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({position <= 1 ? 'Segera dipanggil!' : `${position - 1} orang di depan Anda`})
                    </span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 block">Estimasi Waktu Tunggu:</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-emerald-700 font-mono">
                      ± {estimatedWait} Menit
                    </span>
                    <span className="text-xs text-slate-500">ke pemanggilan</span>
                  </div>
                </div>
              </div>
            )}

            {/* Ticket Information Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-1">Nama Pemohon:</span>
                <span className="font-bold text-slate-800 text-sm">{searchedTicket.fullName}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-1">Layanan:</span>
                <span className="font-bold text-slate-800 text-sm truncate block">{searchedTicket.serviceName}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-1">Jadwal Sesi:</span>
                <span className="font-bold text-slate-800 text-sm">{searchedTicket.timeSlot}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-1">Loket Pelayanan:</span>
                <span className="font-bold text-emerald-700 text-sm">
                  {searchedTicket.counterName || 'Akan Ditentukan'}
                </span>
              </div>
            </div>

            {/* Simulated WhatsApp Notification Box */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-emerald-950">
                    Notifikasi WhatsApp Otomatis
                  </h5>
                  <p className="text-[11px] text-emerald-800">
                    Pemberitahuan real-time otomatis dikirimkan ke nomor WhatsApp <span className="font-mono font-bold">{searchedTicket.phoneNumber}</span>
                  </p>
                </div>
              </div>

              <button
                id="btn-simulate-wa"
                onClick={handleSimulateWhatsApp}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Tes Notifikasi HP</span>
              </button>
            </div>

            {simulatedWaSent && (
              <div className="p-3 bg-emerald-100/80 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  Simulasi Notifikasi WA terkirim: &quot;Pemberitahuan Antrean Dukcapil: Tiket {searchedTicket.ticketNumber} ({searchedTicket.fullName}) posisi urutan ke-{position}.&quot;
                </span>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
              <button
                onClick={() => onOpenTicketModal(searchedTicket)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <Ticket className="w-4 h-4 text-emerald-600" />
                <span>Buka Tiket / Cetak Slip Digital</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] text-slate-500 font-medium">
                  Terhubung pemantau real-time. Status halaman ini diperbarui otomatis.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
