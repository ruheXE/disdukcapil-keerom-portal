import React, { useState, useEffect } from 'react';
import { 
  X, 
  Maximize, 
  Minimize, 
  Volume2, 
  VolumeX, 
  Building2, 
  Clock, 
  UserCheck, 
  Sparkles,
  Users
} from 'lucide-react';
import { QueueTicket, ServiceCounter } from '../types';
import { announcer } from '../utils/audioAnnouncer';

interface TvMonitorModalProps {
  tickets: QueueTicket[];
  counters: ServiceCounter[];
  onClose: () => void;
  isAudioEnabled: boolean;
  setIsAudioEnabled: (enabled: boolean) => void;
}

export const TvMonitorModal: React.FC<TvMonitorModalProps> = ({
  tickets,
  counters,
  onClose,
  isAudioEnabled,
  setIsAudioEnabled,
}) => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Find currently calling ticket or last serving ticket
  const currentCalling = tickets.find((t) => t.status === 'CALLED');
  const activeServing = tickets.filter((t) => t.status === 'SERVING');
  const displayTicket = currentCalling || activeServing[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden animate-in fade-in">
      {/* Top TV Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-black tracking-widest text-emerald-400 uppercase font-mono">
              PEMERINTAH KOTA / KABUPATEN
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Layar Informasi Pemantauan Antrean Ruang Tunggu Pelayanan
            </p>
          </div>
        </div>

        {/* Live Date & Clock */}
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <span className="text-sm font-semibold text-slate-400 block">{date}</span>
            <span className="text-3xl sm:text-4xl font-black font-mono tracking-wider text-amber-400">
              {time} <span className="text-xs text-slate-400">WIB</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              title="Suara Panggilan"
              className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
                isAudioEnabled
                  ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {isAudioEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>

            <button
              onClick={toggleFullscreen}
              title="Toggle Fullscreen"
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            >
              {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
            </button>

            <button
              onClick={onClose}
              title="Tutup Mode TV"
              className="p-3 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Center TV Content: 2-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6 flex-1 items-stretch">
        {/* Left Column (7 cols): Giant Calling Ticket Display */}
        <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl border-2 border-emerald-500/40 p-8 sm:p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-sm font-black uppercase tracking-wider mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span>{currentCalling ? 'PANGGILAN ANTRIAN SEKARANG' : 'NOMOR ANTREAN AKTIF'}</span>
            </div>

            <span className="text-slate-400 font-bold uppercase tracking-widest text-sm block">
              NOMOR ANTREAN
            </span>

            <div className="text-7xl sm:text-8xl lg:text-9xl font-black font-mono tracking-tight text-white my-2 drop-shadow-md">
              {displayTicket?.ticketNumber || '— — —'}
            </div>

            <div className="space-y-1 mt-4">
              <p className="text-xl sm:text-2xl font-black text-emerald-400 truncate">
                {displayTicket?.fullName || 'Menunggu Panggilan Berikutnya'}
              </p>
              <p className="text-sm sm:text-base text-slate-300 font-medium">
                {displayTicket?.serviceName || 'Silakan persiapkan berkas fisik Anda'}
              </p>
            </div>
          </div>

          {/* Destination Loket Big Box */}
          <div className="mt-8 p-6 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-slate-900/80 block">
                SILAKAN MENUJU KE
              </span>
              <span className="text-3xl sm:text-4xl font-black uppercase tracking-tight block">
                {displayTicket?.counterName || 'LOKET PELAYANAN'}
              </span>
            </div>

            {displayTicket && (
              <button
                onClick={() => announcer.announceQueue(displayTicket.ticketNumber, displayTicket.counterName || 'Loket Pelayanan')}
                className="px-4 py-2 rounded-xl bg-slate-950 text-white text-xs font-bold flex items-center gap-2 hover:bg-slate-900 shadow-md cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>Panggil Ulang</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): 5 Counters live monitor stack */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              STATUS SELURUH LOKET PELAYANAN
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {counters.filter((c) => c.status !== 'CLOSED').length} Loket Buka
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-between gap-3">
            {counters.map((c) => {
              const isCalling = c.status === 'CALLING';
              const isServing = c.status === 'SERVING';
              const isBreak = c.status === 'BREAK';

              return (
                <div
                  key={c.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    isCalling
                      ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400'
                      : isServing
                      ? 'bg-emerald-950/40 border-emerald-500/30'
                      : isBreak
                      ? 'bg-rose-950/20 border-rose-800/30'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">Loket {c.id}</span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          isCalling
                            ? 'bg-amber-400 text-slate-950'
                            : isServing
                            ? 'bg-emerald-500 text-slate-950'
                            : isBreak
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isCalling && 'MEMANGGIL'}
                        {isServing && 'MELAYANI'}
                        {c.status === 'AVAILABLE' && 'TERSEDIA'}
                        {isBreak && 'ISTIRAHAT'}
                        {c.status === 'CLOSED' && 'TUTUP'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate max-w-[200px]">{c.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{c.officerName}</p>
                  </div>

                  <div className="text-right bg-slate-950/60 px-4 py-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      NOMOR DILAYANI
                    </span>
                    <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                      {c.currentTicketNumber || '— —'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Running Text Ticker */}
      <div className="bg-slate-900/90 border border-slate-800 py-3 px-6 rounded-2xl flex items-center gap-4 overflow-hidden">
        <span className="shrink-0 text-xs font-black uppercase tracking-widest bg-amber-500 text-slate-950 px-3 py-1 rounded-md">
          PENGUMUMAN DUKCAPIL
        </span>
        <div className="overflow-hidden whitespace-nowrap w-full">
          <p className="inline-block animate-marquee text-sm font-bold text-slate-200">
            PELAYANAN DUKCAPIL GRATIS TANPA BIAYA • PASTIKAN MEMBAWA BERKAS PERSYARATAN ASLI DAN SALINAN • MOHON MENJAGA KEBERSIHAN DAN KETERTIBAN DI RUANG TUNGGU • JIKA NOMOR ANTREAN TERLEWAT LEBIH DARI 3 KALI, HARAP LAPOR KE MEJA INFORMASI • TERIMA KASIH TELAH MENGGUNAKAN LAYANAN KEPENDUDUKAN DUKCAPIL.
          </p>
        </div>
      </div>
    </div>
  );
};
