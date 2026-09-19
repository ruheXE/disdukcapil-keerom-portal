import React from 'react';
import { 
  Tv, 
  Volume2, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  CreditCard, 
  FileText, 
  Sparkles, 
  HelpCircle, 
  UserCheck, 
  TrendingUp, 
  Maximize2,
  ChevronRight
} from 'lucide-react';
import { QueueTicket, ServiceCounter, QueueStats, ServiceCategory } from '../types';
import { DUKCAPIL_SERVICES } from '../data/services';
import { announcer } from '../utils/audioAnnouncer';

interface MonitorDashboardProps {
  tickets: QueueTicket[];
  counters: ServiceCounter[];
  stats: QueueStats;
  openTvMode: () => void;
  onOpenTicketModal: (ticket: QueueTicket) => void;
  isAudioEnabled: boolean;
}

export const MonitorDashboard: React.FC<MonitorDashboardProps> = ({
  tickets,
  counters,
  stats,
  openTvMode,
  onOpenTicketModal,
  isAudioEnabled,
}) => {
  // Find current active calling or recently called ticket
  const currentlyCalledTicket = tickets.find((t) => t.status === 'CALLED');
  const activeServingTickets = tickets.filter((t) => t.status === 'SERVING');
  const waitingTickets = tickets.filter((t) => t.status === 'WAITING');

  const handleReplayAudio = (ticketNumber: string, counterName: string) => {
    announcer.announceQueue(ticketNumber, counterName);
  };

  const getServiceBadge = (serviceId: ServiceCategory) => {
    const s = DUKCAPIL_SERVICES.find((srv) => srv.id === serviceId);
    return s ? `Kode ${s.prefix}` : serviceId;
  };

  return (
    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner with TV Mode Launch & Quick Summary */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white p-5 sm:p-6 rounded-3xl shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase font-mono">
              LAYAR PEMANTAUAN ANTREAN UTAMA
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Monitor Pelayanan Terpadu Dukcapil
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Sistem pemantauan antrean ruang tunggu waktu nyata (real-time). Informasi loket, panggilan suara otomatis, dan estimasi waktu terbarui seketika.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            id="btn-open-tv-fullscreen"
            onClick={openTvMode}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Mode Layar TV Ruang Tunggu</span>
          </button>
        </div>
      </div>

      {/* Hero: Nomor Antrean Sedang Dipanggil */}
      {currentlyCalledTicket ? (
        <div className="p-6 sm:p-8 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl text-slate-950 shadow-xl border-4 border-white/30 animate-pulse-slow">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-slate-950/20 text-slate-950 rounded-full text-xs font-black uppercase tracking-wider">
                <Volume2 className="w-4 h-4 animate-bounce" />
                <span>PANGGILAN AKTIF SEKARANG</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-900/80 uppercase tracking-widest">
                NOMOR ANTREAN:
              </p>
              <div className="text-6xl sm:text-7xl lg:text-8xl font-black font-mono tracking-tight text-slate-950 drop-shadow-xs">
                {currentlyCalledTicket.ticketNumber}
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-900">
                Atas Nama: <span className="underline decoration-slate-950/40">{currentlyCalledTicket.fullName}</span> • {currentlyCalledTicket.serviceName}
              </p>
            </div>

            <div className="bg-slate-950/15 backdrop-blur-xs p-6 rounded-2xl border border-white/20 text-center lg:text-right space-y-3 min-w-[260px]">
              <span className="text-xs uppercase font-bold tracking-widest text-slate-900/80 block">
                SILAKAN MENUJU KE:
              </span>
              <div className="text-3xl sm:text-4xl font-black text-slate-950 uppercase">
                {currentlyCalledTicket.counterName || 'Loket Pelayanan'}
              </div>
              <button
                onClick={() => handleReplayAudio(currentlyCalledTicket.ticketNumber, currentlyCalledTicket.counterName || 'Loket Pelayanan')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-slate-900 shadow-md transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>Ulangi Panggilan Suara</span>
              </button>
            </div>
          </div>
        </div>
      ) : activeServingTickets.length > 0 ? (
        <div className="p-6 bg-emerald-700 rounded-3xl text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <UserCheck className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-200 font-bold block">
                SEDANG DILAYANI DI LOKET UTAMA
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight mt-0.5">
                {activeServingTickets[0].ticketNumber} — {activeServingTickets[0].fullName}
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                {activeServingTickets[0].counterName} • {activeServingTickets[0].serviceName}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-emerald-200 block">Sisa Menunggu:</span>
            <span className="text-2xl font-black font-mono text-emerald-100">{waitingTickets.length} Warga</span>
          </div>
        </div>
      ) : null}

      {/* Grid Loket Pelayanan Real-time */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              Status Loket Pelayanan Terpadu
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {counters.filter((c) => c.status !== 'CLOSED').length} Loket Buka
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {counters.map((counter) => {
            const isServing = counter.status === 'SERVING';
            const isCalling = counter.status === 'CALLING';
            const isBreak = counter.status === 'BREAK';
            const isAvailable = counter.status === 'AVAILABLE';

            return (
              <div
                key={counter.id}
                id={`counter-card-${counter.id}`}
                className={`bg-white rounded-2xl border p-4 flex flex-col justify-between transition-all shadow-xs ${
                  isCalling
                    ? 'border-amber-400 ring-2 ring-amber-400 bg-amber-50/40'
                    : isServing
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900">
                      Loket {counter.id}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        isCalling
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : isServing
                          ? 'bg-emerald-100 text-emerald-800'
                          : isBreak
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isCalling && 'Memanggil'}
                      {isServing && 'Melayani'}
                      {isAvailable && 'Tersedia'}
                      {isBreak && 'Istirahat'}
                      {counter.status === 'CLOSED' && 'Tutup'}
                    </span>
                  </div>

                  {/* Big Number Card */}
                  <div className="my-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Nomor Dilayani
                    </span>
                    <span className="text-2xl font-black font-mono text-slate-900 block mt-0.5">
                      {counter.currentTicketNumber || '— — —'}
                    </span>
                  </div>

                  {/* Officer Info */}
                  <div className="mt-2 text-xs space-y-0.5">
                    <p className="font-semibold text-slate-800 truncate">{counter.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">Petugas: {counter.officerName}</p>
                  </div>
                </div>

                {/* Counter Footer */}
                <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Hari ini:</span>
                  <span className="font-bold text-slate-800">{counter.totalServedToday} selesai</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Waiting Queues Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Antrean Menunggu per Kategori (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Daftar Antrean Menunggu per Kategori Layanan
              </h3>
              <p className="text-xs text-slate-500">
                Warga diharapkan bersiap di ruang tunggu saat nomor Anda mendekati 3 urutan teratas
              </p>
            </div>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold font-mono">
              Total {waitingTickets.length} Menunggu
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DUKCAPIL_SERVICES.map((srv) => {
              const serviceWaiting = waitingTickets.filter((t) => t.serviceId === srv.id);
              const nextNumber = serviceWaiting[0]?.ticketNumber;

              return (
                <div
                  key={srv.id}
                  className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md font-mono">
                        KODE {srv.prefix}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {serviceWaiting.length} antrean
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{srv.name}</h4>

                    {/* Next in line */}
                    <div className="mt-3 flex items-baseline justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-400">Panggilan Berikutnya:</span>
                      <span className="font-mono font-bold text-sm text-emerald-700">
                        {nextNumber || 'Kosong (0)'}
                      </span>
                    </div>
                  </div>

                  {/* Waiting list badges */}
                  <div className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                    {serviceWaiting.slice(0, 4).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => onOpenTicketModal(t)}
                        title={`Lihat tiket ${t.fullName}`}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[11px] font-semibold text-slate-700 hover:border-emerald-500 transition-colors cursor-pointer"
                      >
                        {t.ticketNumber}
                      </button>
                    ))}
                    {serviceWaiting.length > 4 && (
                      <span className="text-[10px] text-slate-400 font-bold px-1">
                        +{serviceWaiting.length - 4} lagi
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Statistics Panel (1 Col) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-extrabold text-slate-900">
                Statistik Pelayanan Hari Ini
              </h3>
            </div>

            <div className="space-y-3 mt-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Total Pendaftar:</span>
                <span className="text-lg font-black font-mono text-slate-900">{stats.totalRegistered} Warga</span>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-2xl flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-800">Telah Selesai Dilayani:</span>
                <span className="text-lg font-black font-mono text-emerald-700">{stats.totalCompleted} Berkas</span>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-2xl flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-800">Sedang Berlangsung:</span>
                <span className="text-lg font-black font-mono text-amber-700">{stats.totalServing} Orang</span>
              </div>

              <div className="p-3.5 bg-blue-50 rounded-2xl flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-800">Menunggu di Ruang Tunggu:</span>
                <span className="text-lg font-black font-mono text-blue-700">{stats.totalWaiting} Orang</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Rata-rata Waktu Pelayanan:</span>
                <span className="text-sm font-bold text-slate-800">±{stats.averageServiceMinutes} Menit / Berkas</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs space-y-1">
            <span className="font-bold block">Komitmen Layanan Dukcapil:</span>
            <p className="text-[11px] leading-relaxed">
              &quot;Pelayanan Cepat, Tepat, Akurat, Tanpa Dipungut Biaya Sepeserpun.&quot;
            </p>
          </div>
        </div>
      </div>

      {/* Running Text Ticker */}
      <div className="bg-slate-900 text-amber-300 py-2.5 px-4 rounded-2xl overflow-hidden shadow-inner flex items-center gap-3">
        <span className="shrink-0 text-xs font-bold uppercase tracking-wider bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-md">
          PENGUMUMAN
        </span>
        <div className="overflow-hidden whitespace-nowrap w-full">
          <p className="inline-block animate-marquee text-xs font-medium text-slate-200">
            SELAMAT DATANG DI DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL • SELURUH PENGURUSAN DOKUMEN KEPENDUDUKAN (KTP, KK, AKTA, KIA, PINDAH) ADALAH GRATIS • PASTIKAN MEMBAWA DOKUMEN ASLI DAN SALINAN • TERSEDIA PELAYANAN PRIORITAS BAGI LANSIA, IBU HAMIL, DAN PENYANDANG DISABILITAS DI LOKET KHUSUS • DUKCAPIL GOES DIGITAL: AKTIFKAN IDENTITAS KEPENDUDUKAN DIGITAL (IKD) DI HP ANDA.
          </p>
        </div>
      </div>
    </div>
  );
};
