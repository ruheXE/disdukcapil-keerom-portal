import React from 'react';
import { 
  Users, 
  Home, 
  CreditCard, 
  FileText, 
  Award, 
  TrendingUp, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Heart,
  Baby,
  UserCheck,
  Percent
} from 'lucide-react';
import { Resident } from '../types/population';
import { calculateAge } from '../data/mockResidents';

interface DemographicsOverviewProps {
  residents: Resident[];
  onFilterByKelurahan?: (kelurahan: string) => void;
}

export const DemographicsOverview: React.FC<DemographicsOverviewProps> = ({
  residents,
  onFilterByKelurahan,
}) => {
  const total = residents.length;
  const males = residents.filter((r) => r.gender === 'L').length;
  const females = residents.filter((r) => r.gender === 'P').length;

  // Unique KK count
  const uniqueKk = new Set(residents.map((r) => r.noKk)).size;
  const avgFamilySize = uniqueKk > 0 ? (total / uniqueKk).toFixed(1) : '0';

  // Age calculation
  const ages = residents.map((r) => calculateAge(r.birthDate));
  const under5 = ages.filter((a) => a < 5).length;
  const schoolAge = ages.filter((a) => a >= 5 && a < 18).length;
  const productive = ages.filter((a) => a >= 18 && a < 60).length;
  const elderly = ages.filter((a) => a >= 60).length;

  // KTP Eligibility (>= 17 years old)
  const ktpEligible = ages.filter((a) => a >= 17).length;
  const ktpRecorded = residents.filter(
    (r) => calculateAge(r.birthDate) >= 17 && r.ktpStatus === 'Sudah Rekam'
  ).length;
  const ktpPercentage = ktpEligible > 0 ? Math.round((ktpRecorded / ktpEligible) * 100) : 100;

  // KIA Eligibility (< 17 years old)
  const kiaEligible = ages.filter((a) => a < 17).length;
  const kiaCount = residents.filter((r) => calculateAge(r.birthDate) < 17 && r.hasKia).length;
  const kiaPercentage = kiaEligible > 0 ? Math.round((kiaCount / kiaEligible) * 100) : 100;

  // Birth Certificate coverage
  const birthCertCount = residents.filter((r) => r.hasBirthCert).length;
  const birthCertPercentage = total > 0 ? Math.round((birthCertCount / total) * 100) : 100;

  // Kelurahan Distribution
  const kelurahanMap: { [name: string]: number } = {};
  residents.forEach((r) => {
    kelurahanMap[r.kelurahan] = (kelurahanMap[r.kelurahan] || 0) + 1;
  });
  const kelurahanList = Object.entries(kelurahanMap).sort((a, b) => b[1] - a[1]);

  // Education Distribution
  const eduMap: { [name: string]: number } = {};
  residents.forEach((r) => {
    eduMap[r.education] = (eduMap[r.education] || 0) + 1;
  });
  const eduList = Object.entries(eduMap).sort((a, b) => b[1] - a[1]);

  // Job Distribution
  const jobMap: { [name: string]: number } = {};
  residents.forEach((r) => {
    jobMap[r.job] = (jobMap[r.job] || 0) + 1;
  });
  const jobList = Object.entries(jobMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Sex Ratio
  const sexRatio = females > 0 ? Math.round((males / females) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Penduduk */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Penduduk
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2 font-mono tracking-tight">
            {total.toLocaleString('id-ID')} <span className="text-xs text-slate-400 font-sans font-normal">jiwa</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Laki-laki: <b className="text-slate-800 font-mono">{males}</b>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Perempuan: <b className="text-slate-800 font-mono">{females}</b>
            </span>
          </div>
        </div>

        {/* Metric 2: Kartu Keluarga */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Kepala Keluarga (KK)
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Home className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2 font-mono tracking-tight">
            {uniqueKk.toLocaleString('id-ID')} <span className="text-xs text-slate-400 font-sans font-normal">KK</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Rata-rata jiwa/KK:</span>
            <span className="font-mono font-bold text-slate-800">{avgFamilySize} Anggota</span>
          </div>
        </div>

        {/* Metric 3: Perekaman KTP-el */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Perekaman KTP-el
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2 font-mono tracking-tight flex items-baseline gap-2">
            <span>{ktpPercentage}%</span>
            <span className="text-xs text-slate-400 font-sans font-normal">
              ({ktpRecorded}/{ktpEligible} Wajib KTP)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${ktpPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 4: Kepemilikan Akta & KIA */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Cakupan Akta Lahir
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2 font-mono tracking-tight flex items-baseline gap-2">
            <span>{birthCertPercentage}%</span>
            <span className="text-xs text-slate-400 font-sans font-normal">
              ({birthCertCount} ber-Akta)
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Cakupan KIA Anak:</span>
            <span className="font-mono font-bold text-amber-700">{kiaPercentage}% ({kiaCount}/{kiaEligible})</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Distribusi Usia & Distribusi Wilayah Kelurahan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Piramida / Distribusi Kelompok Usia (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Struktur Demografi Berdasarkan Kelompok Usia
              </h3>
              <p className="text-xs text-slate-500">
                Distribusi kelompok umur penduduk untuk perencanaan fasilitas sosial & kesehatan
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Sex Ratio
              </span>
              <span className="text-sm font-mono font-black text-slate-800">
                {sexRatio} <span className="text-[10px] font-sans font-normal text-slate-400">L / 100 P</span>
              </span>
            </div>
          </div>

          {/* Age Group Breakdown Bars */}
          <div className="space-y-4">
            {/* Balita */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Baby className="w-4 h-4 text-pink-500" />
                  <span>Balita (0 - 4 Tahun)</span>
                </span>
                <span className="font-mono font-bold">
                  {under5} Jiwa ({total > 0 ? Math.round((under5 / total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-pink-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${total > 0 ? (under5 / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Anak & Remaja Sekolah */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-amber-500" />
                  <span>Anak & Pelajar (5 - 17 Tahun)</span>
                </span>
                <span className="font-mono font-bold">
                  {schoolAge} Jiwa ({total > 0 ? Math.round((schoolAge / total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${total > 0 ? (schoolAge / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Usia Produktif */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>Usia Produktif Kerja (18 - 59 Tahun)</span>
                </span>
                <span className="font-mono font-bold text-emerald-800">
                  {productive} Jiwa ({total > 0 ? Math.round((productive / total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${total > 0 ? (productive / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Lansia */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-purple-600" />
                  <span>Lanjut Usia (60+ Tahun)</span>
                </span>
                <span className="font-mono font-bold">
                  {elderly} Jiwa ({total > 0 ? Math.round((elderly / total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${total > 0 ? (elderly / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>
              💡 Bonus Demografi: <b>{total > 0 ? Math.round((productive / total) * 100) : 0}%</b> penduduk berada dalam usia produktif aktif.
            </span>
          </div>
        </div>

        {/* Right: Distribusi Wilayah per Kelurahan (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Sebaran per Kelurahan
                </h3>
                <p className="text-xs text-slate-500">
                  Kepadatan data penduduk menurut wilayah domisili
                </p>
              </div>
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="mt-4 space-y-3 max-h-[250px] overflow-y-auto pr-1">
              {kelurahanList.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">Belum ada data wilayah</div>
              ) : (
                kelurahanList.map(([kel, count]) => {
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div
                      key={kel}
                      onClick={() => onFilterByKelurahan && onFilterByKelurahan(kel)}
                      className="group p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                        <span className="group-hover:text-emerald-700 transition-colors">
                          Kel. {kel}
                        </span>
                        <span className="font-mono text-slate-600">
                          {count} jiwa ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-slate-800 group-hover:bg-emerald-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center border-t border-slate-100 pt-2">
            Klik nama kelurahan untuk menyaring data warga di Buku Induk Penduduk
          </div>
        </div>
      </div>

      {/* Bottom Row: Pendidikan Terakhir & Pekerjaan Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pendidikan */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Tingkat Pendidikan Terakhir</span>
            </h4>
            <span className="text-xs text-slate-400">{eduList.length} Jenjang</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {eduList.slice(0, 6).map(([edu, count]) => (
              <div key={edu} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-500 block truncate">{edu}</span>
                <span className="text-lg font-black font-mono text-slate-900 mt-0.5 block">
                  {count} <span className="text-[10px] font-sans font-normal text-slate-400">jiwa</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pekerjaan */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>Komposisi Lapangan Kerja Utama</span>
            </h4>
            <span className="text-xs text-slate-400">Top 5 Profesi</span>
          </div>

          <div className="space-y-2.5">
            {jobList.map(([job, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={job} className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-semibold truncate max-w-[220px]">{job}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-slate-900">{count} orang</span>
                    <span className="text-[11px] font-mono text-slate-400 w-10 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
