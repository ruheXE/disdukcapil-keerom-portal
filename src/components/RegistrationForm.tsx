import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  UserPlus, 
  CreditCard, 
  Users, 
  FileText, 
  Sparkles, 
  HelpCircle, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck,
  Building2,
  FileCheck2
} from 'lucide-react';
import { ServiceCategory, QueueTicket } from '../types';
import { DUKCAPIL_SERVICES, TIME_SLOTS } from '../data/services';
import { announcer } from '../utils/audioAnnouncer';

interface RegistrationFormProps {
  onTicketCreated: (ticket: QueueTicket) => void;
  onOpenTicket: (ticket: QueueTicket) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onTicketCreated,
  onOpenTicket,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<ServiceCategory>('KTP');
  
  // Form fields
  const [nik, setNik] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState<string>(TIME_SLOTS[0]);
  const [notes, setNotes] = useState<string>('');
  const [confirmedRequirements, setConfirmedRequirements] = useState<boolean>(false);

  // States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeServiceObj = DUKCAPIL_SERVICES.find((s) => s.id === selectedService)!;

  // Validation
  const validateStep2 = (): boolean => {
    setErrorMessage(null);

    const cleanNik = nik.trim();
    if (!cleanNik) {
      setErrorMessage('Nomor Induk Kependudukan (NIK) wajib diisi.');
      return false;
    }
    if (cleanNik.length !== 16 || !/^\d+$/.test(cleanNik)) {
      setErrorMessage('NIK harus terdiri dari tepat 16 digit angka.');
      return false;
    }

    if (!fullName.trim()) {
      setErrorMessage('Nama Lengkap sesuai KTP wajib diisi.');
      return false;
    }

    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone) {
      setErrorMessage('Nomor WhatsApp wajib diisi untuk pengiriman notifikasi antrean.');
      return false;
    }
    if (cleanPhone.length < 10 || !/^[0-9+\-\s]+$/.test(cleanPhone)) {
      setErrorMessage('Nomor WhatsApp tidak valid. Masukkan nomor yang benar (contoh: 081234567890).');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedRequirements) {
      setErrorMessage('Harap centang konfirmasi kesiapan berkas persyaratan di bawah.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nik: nik.trim(),
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim(),
          email: email.trim() || undefined,
          serviceId: selectedService,
          bookingDate,
          timeSlot,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat tiket antrean.');
      }

      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#10B981', '#34D399', '#F59E0B'],
        });
      } catch {
        // ignore
      }

      announcer.playAlertNotification();
      onTicketCreated(data.ticket);
      onOpenTicket(data.ticket);

      // Reset form
      setNik('');
      setFullName('');
      setPhoneNumber('');
      setEmail('');
      setNotes('');
      setCurrentStep(1);
      setConfirmedRequirements(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan jaringan.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getServiceIcon = (id: ServiceCategory) => {
    switch (id) {
      case 'KTP': return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'KK': return <Users className="w-5 h-5 text-emerald-600" />;
      case 'AKTA': return <FileText className="w-5 h-5 text-amber-600" />;
      case 'KIA_IKD': return <Sparkles className="w-5 h-5 text-purple-600" />;
      case 'KONSULTASI': return <HelpCircle className="w-5 h-5 text-rose-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6">
      {/* Banner Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/80 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
          <Building2 className="w-3.5 h-3.5" />
          Pendaftaran Antrean Online Mandiri
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Ambil Nomor Antrean Kependudukan
        </h2>
        <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
          Daftar secara daring dari rumah atau ponsel. Dapatkan nomor antrean resmi, estimasi jam pelayanan, dan notifikasi real-time saat nomor Anda dipanggil.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center max-w-md w-full px-4">
          {/* Step 1 */}
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                currentStep >= 1
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              1
            </div>
            <span className="text-[11px] font-semibold mt-1 text-slate-700">Pilih Layanan</span>
          </div>

          <div className={`h-1 flex-1 transition-all ${currentStep >= 2 ? 'bg-emerald-600' : 'bg-slate-200'}`} />

          {/* Step 2 */}
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                currentStep >= 2
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              2
            </div>
            <span className="text-[11px] font-semibold mt-1 text-slate-700">Data Pemohon</span>
          </div>

          <div className={`h-1 flex-1 transition-all ${currentStep >= 3 ? 'bg-emerald-600' : 'bg-slate-200'}`} />

          {/* Step 3 */}
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                currentStep >= 3
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              3
            </div>
            <span className="text-[11px] font-semibold mt-1 text-slate-700">Konfirmasi</span>
          </div>
        </div>
      </div>

      {/* Error notification alert */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs sm:text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Form Steps Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8">
        {/* STEP 1: PILIH LAYANAN */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Langkah 1: Pilih Jenis Layanan Kependudukan</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih jenis dokumen atau keperluan yang akan diurus di kantor Dukcapil
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DUKCAPIL_SERVICES.map((service) => {
                const isSelected = selectedService === service.id;
                return (
                  <div
                    key={service.id}
                    id={`service-choice-${service.id}`}
                    onClick={() => setSelectedService(service.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                        {getServiceIcon(service.id)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md font-mono">
                            KODE {service.prefix}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            ±{service.estimatedMinutes} Menit
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 mt-1">{service.name}</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected service requirements overview box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-2">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>Dokumen Persyaratan Wajib untuk {activeServiceObj.name}:</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                {activeServiceObj.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <button
                id="next-step-1-btn"
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <span>Lanjut ke Data Pemohon</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DATA PEMOHON */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Langkah 2: Data Pemohon & Jadwal Kunjungan</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pastikan data yang dimasukkan sesuai dengan Kartu Keluarga dan KTP fisik
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* NIK Input */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Nomor Induk Kependudukan (NIK) *</span>
                  <span className="text-[11px] text-slate-400 font-normal">Wajib 16 digit angka</span>
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    id="input-nik"
                    type="text"
                    maxLength={16}
                    value={nik}
                    onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                    placeholder="Contoh: 3273250102940001"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  NIK pemohon akan diverifikasi secara otomatis pada database kependudukan.
                </p>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">
                  Nama Lengkap Sesuai KTP / Dokumen Resmi *
                </label>
                <input
                  id="input-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Muhammad Rizky Pratama"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* WhatsApp Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>No. WhatsApp Aktif *</span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-xs font-normal">
                    Notifikasi Real-time
                  </span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    id="input-phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Email (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Alamat Email <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    id="input-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Booking Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pilih Tanggal Kunjungan *</span>
                </label>
                <input
                  id="input-booking-date"
                  type="date"
                  value={bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Time Slot */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pilih Sesi Jam Pelayanan *</span>
                </label>
                <select
                  id="select-timeslot"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                >
                  {TIME_SLOTS.map((slot, i) => (
                    <option key={i} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">
                  Catatan atau Keterangan Khusus <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  id="input-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: KTP fisik patah dua bagian / permohonan akta anak kembar"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-slate-600 hover:text-slate-900 font-semibold text-xs rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>

              <button
                id="next-step-2-btn"
                type="button"
                onClick={() => {
                  if (validateStep2()) {
                    setCurrentStep(3);
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <span>Lanjut ke Verifikasi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: KONFIRMASI & SUBMIT */}
        {currentStep === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Langkah 3: Konfirmasi Berkas & Terbitkan Nomor Antrean</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Periksa ringkasan pendaftaran Anda sebelum nomor antrean resmi diterbitkan
              </p>
            </div>

            {/* Summary Review Card */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-xs text-slate-500">Layanan Yang Dipilih:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-mono">
                    KODE {activeServiceObj.prefix}
                  </span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">{activeServiceObj.name}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Nama Pemohon:</span>
                  <span className="font-bold text-slate-800">{fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">NIK:</span>
                  <span className="font-mono font-bold text-slate-800">{nik}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Nomor WhatsApp:</span>
                  <span className="font-bold text-slate-800">{phoneNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Jadwal Sesi:</span>
                  <span className="font-bold text-emerald-700">{bookingDate} • {timeSlot}</span>
                </div>
              </div>

              {notes && (
                <div className="text-xs border-t border-slate-200 pt-2 text-slate-600">
                  <span className="text-slate-400">Catatan:</span> {notes}
                </div>
              )}
            </div>

            {/* Berkas Checklist */}
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Pastikan Anda Membawa Dokumen Berikut Saat Datang:</span>
              </div>
              <ul className="text-xs text-emerald-800 space-y-1.5 pl-1">
                {activeServiceObj.requirements.map((req, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Checkbox agreement */}
            <label className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                id="checkbox-confirm-requirements"
                type="checkbox"
                checked={confirmedRequirements}
                onChange={(e) => setConfirmedRequirements(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                Saya menyatakan data yang dimasukkan adalah benar, dan saya bersedia membawa dokumen persyaratan asli serta fotokopi sesuai ketentuan resmi Dukcapil.
              </span>
            </label>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-slate-600 hover:text-slate-900 font-semibold text-xs rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>

              <button
                id="submit-registration-btn"
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menerbitkan Nomor Antrean...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi & Ambil Tiket Antrean</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
