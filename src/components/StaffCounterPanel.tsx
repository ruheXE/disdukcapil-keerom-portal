import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  Volume2, 
  Play, 
  CheckCircle2, 
  SkipForward, 
  RotateCw, 
  Coffee, 
  UserPlus, 
  Clock, 
  Building2, 
  AlertCircle, 
  User, 
  CreditCard,
  Phone,
  Search,
  Check
} from 'lucide-react';
import { ServiceCounter, QueueTicket, ServiceCategory } from '../types';
import { DUKCAPIL_SERVICES } from '../data/services';
import { announcer } from '../utils/audioAnnouncer';

interface StaffCounterPanelProps {
  counters: ServiceCounter[];
  tickets: QueueTicket[];
  onCallNext: (counterId: number, ticketId?: string) => void;
  onRecall: (counterId: number) => void;
  onServe: (counterId: number) => void;
  onComplete: (counterId: number) => void;
  onSkip: (counterId: number) => void;
  onToggleStatus: (counterId: number, status: ServiceCounter['status']) => void;
  onAddWalkInTicket: (ticketData: {
    fullName: string;
    nik: string;
    phoneNumber: string;
    serviceId: ServiceCategory;
  }) => void;
}

export const StaffCounterPanel: React.FC<StaffCounterPanelProps> = ({
  counters,
  tickets,
  onCallNext,
  onRecall,
  onServe,
  onComplete,
  onSkip,
  onToggleStatus,
  onAddWalkInTicket,
}) => {
  const [selectedCounterId, setSelectedCounterId] = useState<number>(1);
  const [showWalkInModal, setShowWalkInModal] = useState<boolean>(false);
  const [walkInName, setWalkInName] = useState<string>('');
  const [walkInNik, setWalkInNik] = useState<string>('');
  const [walkInPhone, setWalkInPhone] = useState<string>('');
  const [walkInService, setWalkInService] = useState<ServiceCategory>('KTP');
  const [walkInError, setWalkInError] = useState<string | null>(null);

  const activeCounter = counters.find((c) => c.id === selectedCounterId) || counters[0];

  // Current ticket at this counter
  const currentTicket = tickets.find((t) => t.id === activeCounter.currentTicketId);

  // Waiting tickets matching this counter's assigned services
  const waitingTicketsForCounter = tickets.filter(
    (t) => t.status === 'WAITING' && activeCounter.assignedServices.includes(t.serviceId)
  );

  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim() || !walkInNik.trim()) {
      setWalkInError('Nama dan NIK wajib diisi.');
      return;
    }
    if (walkInNik.trim().length !== 16) {
      setWalkInError('NIK harus 16 digit angka.');
      return;
    }

    onAddWalkInTicket({
      fullName: walkInName.trim(),
      nik: walkInNik.trim(),
      phoneNumber: walkInPhone.trim() || '080000000000',
      serviceId: walkInService,
    });

    setWalkInName('');
    setWalkInNik('');
    setWalkInPhone('');
    setWalkInError(null);
    setShowWalkInModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-bold uppercase tracking-wider mb-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
            Panel Operasional Petugas
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Meja Kerja Loket Pelayanan
          </h2>
          <p className="text-xs text-slate-500">
            Kelola panggilan nomor antrean, proses verifikasi berkas pemohon, dan perbarui status loket secara langsung.
          </p>
        </div>

        {/* Walk-in Priority Button */}
        <button
          id="btn-open-walkin-modal"
          onClick={() => setShowWalkInModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-emerald-400" />
          <span>Tambah Antrean Walk-in / Lansia</span>
        </button>
      </div>

      {/* Select Counter Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2.5 no-scrollbar">
        {counters.map((c) => {
          const isSelected = c.id === selectedCounterId;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCounterId(c.id)}
              className={`px-4 py-3 rounded-2xl border-2 text-left transition-all shrink-0 min-w-[200px] cursor-pointer ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-600/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Loket {c.id}</span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    c.status === 'SERVING' || c.status === 'CALLING'
                      ? 'bg-emerald-500 animate-pulse'
                      : c.status === 'BREAK'
                      ? 'bg-amber-500'
                      : 'bg-slate-300'
                  }`}
                />
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-1 truncate">{c.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{c.officerName}</p>
              <div className="mt-2 text-[10px] font-mono font-bold text-slate-400">
                Antrean: <span className="text-slate-900">{c.currentTicketNumber || 'Kosong'}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Counter Main Console & Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Call & Service Operations (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Calling Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  {activeCounter.name}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Petugas: {activeCounter.officerName}
                </h3>
              </div>

              {/* Status Switcher */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Status Loket:</span>
                <select
                  value={activeCounter.status}
                  onChange={(e) => onToggleStatus(activeCounter.id, e.target.value as ServiceCounter['status'])}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="AVAILABLE">Tersedia (Buka)</option>
                  <option value="BREAK">Istirahat / Sholat</option>
                  <option value="CLOSED">Tutup</option>
                </select>
              </div>
            </div>

            {/* Current Active Ticket Big Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                    NOMOR ANTREAN AKTIF DI LOKET INI
                  </span>
                  <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white mt-1">
                    {activeCounter.currentTicketNumber || 'BELUM ADA'}
                  </div>
                  {currentTicket ? (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-bold text-slate-100">
                        {currentTicket.fullName} <span className="text-slate-400 font-normal">({currentTicket.serviceName})</span>
                      </p>
                      <p className="text-xs font-mono text-slate-300">
                        NIK: {currentTicket.nik} • WA: {currentTicket.phoneNumber}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 mt-2">
                      Silakan tekan tombol &quot;Panggil Antrean Berikutnya&quot; di bawah untuk memanggil warga.
                    </p>
                  )}
                </div>

                <div className="text-right sm:text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      activeCounter.status === 'CALLING'
                        ? 'bg-amber-400 text-slate-950 animate-pulse'
                        : activeCounter.status === 'SERVING'
                        ? 'bg-emerald-400 text-slate-950'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {activeCounter.status === 'CALLING' && 'SEDANG MEMANGGIL'}
                    {activeCounter.status === 'SERVING' && 'SEDANG MELAYANI'}
                    {activeCounter.status === 'AVAILABLE' && 'SIAP MEMANGGIL'}
                    {activeCounter.status === 'BREAK' && 'ISTIRAHAT'}
                    {activeCounter.status === 'CLOSED' && 'TUTUP'}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Total hari ini: <span className="text-white font-bold">{activeCounter.totalServedToday} berkas</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Call Next */}
              <button
                id="btn-call-next"
                onClick={() => onCallNext(activeCounter.id)}
                disabled={waitingTicketsForCounter.length === 0 && !activeCounter.currentTicketId}
                className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Panggil Berikutnya</span>
              </button>

              {/* Recall */}
              <button
                id="btn-recall"
                onClick={() => onRecall(activeCounter.id)}
                disabled={!activeCounter.currentTicketId}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold text-xs gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Volume2 className="w-5 h-5" />
                <span>Panggil Ulang (TTS)</span>
              </button>

              {/* Start Serving */}
              <button
                id="btn-serve"
                onClick={() => onServe(activeCounter.id)}
                disabled={!activeCounter.currentTicketId || activeCounter.status === 'SERVING'}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Clock className="w-5 h-5" />
                <span>Mulai Layani</span>
              </button>

              {/* Complete */}
              <button
                id="btn-complete"
                onClick={() => onComplete(activeCounter.id)}
                disabled={!activeCounter.currentTicketId}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white font-bold text-xs gap-2 shadow-xs transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Selesai Layani</span>
              </button>
            </div>

            {/* Secondary Skip button */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Jika warga tidak hadir setelah 3 kali panggilan:
              </span>
              <button
                id="btn-skip-ticket"
                onClick={() => onSkip(activeCounter.id)}
                disabled={!activeCounter.currentTicketId}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-40 font-semibold text-xs transition-colors cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
                <span>Lewati / Tidak Hadir</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Waiting Queue for this Counter (1 col) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  Antrean Menunggu Loket {activeCounter.id}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Layanan: {activeCounter.assignedServices.join(', ')}
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-mono font-bold">
                {waitingTicketsForCounter.length} Orang
              </span>
            </div>

            <div className="mt-3 divide-y divide-slate-100 max-h-[380px] overflow-y-auto pr-1">
              {waitingTicketsForCounter.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Tidak ada antrean menunggu untuk loket ini
                </div>
              ) : (
                waitingTicketsForCounter.map((t, idx) => (
                  <div key={t.id} className="py-3 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900 text-sm">
                          {t.ticketNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">#{idx + 1}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 truncate max-w-[140px]">
                        {t.fullName}
                      </p>
                      <p className="text-[10px] text-slate-500">{t.timeSlot.split(':')[0]}</p>
                    </div>

                    <button
                      onClick={() => onCallNext(activeCounter.id, t.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Panggil
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
            💡 Tips: Anda dapat memanggil langsung warga tertentu di daftar antrean atau memakai tombol Panggil Berikutnya.
          </div>
        </div>
      </div>

      {/* Walk-in Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Tambah Antrean Walk-in / Prioritas
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pendaftaran darurat / langsung di tempat bagi lansia, ibu hamil, atau warga disabilitas
            </p>

            {walkInError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl mb-3 border border-rose-200">
                {walkInError}
              </div>
            )}

            <form onSubmit={handleWalkInSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nama Lengkap Warga *</label>
                <input
                  type="text"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="Nama sesuai KTP"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">NIK (16 Digit) *</label>
                <input
                  type="text"
                  maxLength={16}
                  value={walkInNik}
                  onChange={(e) => setWalkInNik(e.target.value.replace(/\D/g, ''))}
                  placeholder="3273xxxxxxxxxxxx"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">No. WhatsApp / HP</label>
                <input
                  type="tel"
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Jenis Layanan</label>
                <select
                  value={walkInService}
                  onChange={(e) => setWalkInService(e.target.value as ServiceCategory)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {DUKCAPIL_SERVICES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.prefix} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  Terbitkan Tiket Walk-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
