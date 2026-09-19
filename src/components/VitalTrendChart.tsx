import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ComposedChart
} from 'recharts';
import {
  Baby,
  HeartCrack,
  TrendingUp,
  Activity,
  Calendar,
  Filter,
  BarChart2,
  LineChart as LineChartIcon,
  Table as TableIcon,
  Sparkles,
  ShieldCheck,
  Building2,
  FileCheck
} from 'lucide-react';
import { Resident, MonthlyVitalTrend } from '../types/population';
import { computeMonthlyVitalTrends } from '../services/aggregateService';

interface VitalTrendChartProps {
  residents: Resident[];
  districts: string[];
}

export const VitalTrendChart: React.FC<VitalTrendChartProps> = ({ residents, districts }) => {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [chartViewMode, setChartViewMode] = useState<'area' | 'bar' | 'table'>('area');
  const [showNaturalGrowth, setShowNaturalGrowth] = useState<boolean>(true);

  // Compute monthly data based on selected filters
  const trendData: MonthlyVitalTrend[] = useMemo(() => {
    return computeMonthlyVitalTrends(residents, selectedYear, selectedDistrict);
  }, [residents, selectedYear, selectedDistrict]);

  // Summary calculations
  const totals = useMemo(() => {
    const totalBirths = trendData.reduce((acc, curr) => acc + curr.births, 0);
    const totalDeaths = trendData.reduce((acc, curr) => acc + curr.deaths, 0);
    const totalBirthsMale = trendData.reduce((acc, curr) => acc + curr.birthsMale, 0);
    const totalBirthsFemale = trendData.reduce((acc, curr) => acc + curr.birthsFemale, 0);
    const totalBirthCerts = trendData.reduce((acc, curr) => acc + curr.birthCertsIssued, 0);
    const totalDeathCerts = trendData.reduce((acc, curr) => acc + curr.deathCertsIssued, 0);
    const netGrowth = totalBirths - totalDeaths;
    const avgBirthsPerMonth = (totalBirths / trendData.length).toFixed(1);
    const avgDeathsPerMonth = (totalDeaths / trendData.length).toFixed(1);
    const vitalIndex = totalDeaths > 0 ? Math.round((totalBirths / totalDeaths) * 100) : 100;

    // Find peak months
    let peakBirth = trendData[0];
    let peakDeath = trendData[0];
    trendData.forEach(m => {
      if (m.births > (peakBirth?.births || 0)) peakBirth = m;
      if (m.deaths > (peakDeath?.deaths || 0)) peakDeath = m;
    });

    return {
      totalBirths,
      totalDeaths,
      totalBirthsMale,
      totalBirthsFemale,
      totalBirthCerts,
      totalDeathCerts,
      netGrowth,
      avgBirthsPerMonth,
      avgDeathsPerMonth,
      vitalIndex,
      peakBirthMonth: peakBirth?.monthName || '-',
      peakBirthValue: peakBirth?.births || 0,
      peakDeathMonth: peakDeath?.monthName || '-',
      peakDeathValue: peakDeath?.deaths || 0,
    };
  }, [trendData]);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
      {/* Chart Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-800 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              DINAMIKA VITAL KEPENDUDUKAN
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Recharts Visualizer</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Grafik Tren Pertumbuhan Penduduk: Kelahiran vs Kematian</span>
          </h3>
          <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
            Visualisasi bulanan angka kelahiran dan kematian warga terdaftar untuk memonitor laju pertumbuhan penduduk alami (Natural Increase) 
            serta evaluasi penerbitan akta catatan sipil.
          </p>
        </div>

        {/* Filter Controls: Year & District & View Mode */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Year Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600 border border-slate-200">
            <button
              id="btn-year-2025"
              onClick={() => setSelectedYear(2025)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedYear === 2025
                  ? 'bg-white text-emerald-700 font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              2025
            </button>
            <button
              id="btn-year-2026"
              onClick={() => setSelectedYear(2026)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedYear === 2026
                  ? 'bg-white text-emerald-700 font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              2026
            </button>
          </div>

          {/* District Dropdown Filter */}
          <div className="relative">
            <select
              id="select-district-trend"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">Seluruh Distrik (Semua Wilayah)</option>
              {districts.map((d, i) => (
                <option key={i} value={d}>Distrik: {d}</option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* View Mode Toggle: Area vs Bar vs Table */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600 border border-slate-200">
            <button
              id="btn-view-area"
              onClick={() => setChartViewMode('area')}
              title="Tampilan Grafik Area / Garis"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartViewMode === 'area'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <LineChartIcon className="w-4 h-4" />
            </button>
            <button
              id="btn-view-bar"
              onClick={() => setChartViewMode('bar')}
              title="Tampilan Diagram Batang Komparasi"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartViewMode === 'bar'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
            </button>
            <button
              id="btn-view-table"
              onClick={() => setChartViewMode('table')}
              title="Tampilan Rincian Tabel Angka"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartViewMode === 'table'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Key Vital Growth Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Total Kelahiran */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border border-emerald-100/90 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <Baby className="w-4 h-4 text-emerald-600" />
              Total Kelahiran ({selectedYear})
            </span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md font-mono">
              +{totals.avgBirthsPerMonth}/bln
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono">
              +{totals.totalBirths.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-emerald-700 font-medium">jiwa baru</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-800 flex items-center justify-between border-t border-emerald-200/50 pt-2">
            <span>{totals.totalBirthsMale} L • {totals.totalBirthsFemale} P</span>
            <span className="font-semibold text-emerald-900">Akta: {totals.totalBirthCerts}</span>
          </div>
        </div>

        {/* Metric 2: Total Kematian */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/80 to-red-50/50 border border-rose-100/90 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
              <HeartCrack className="w-4 h-4 text-rose-600" />
              Total Kematian ({selectedYear})
            </span>
            <span className="text-[10px] font-bold text-rose-800 bg-rose-100/80 px-2 py-0.5 rounded-md font-mono">
              -{totals.avgDeathsPerMonth}/bln
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-950 font-mono">
              -{totals.totalDeaths.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-rose-700 font-medium">jiwa wafat</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-800 flex items-center justify-between border-t border-rose-200/50 pt-2">
            <span>Puncak: {totals.peakDeathMonth} ({totals.peakDeathValue})</span>
            <span className="font-semibold text-rose-900">Akta: {totals.totalDeathCerts}</span>
          </div>
        </div>

        {/* Metric 3: Pertumbuhan Alami (Net Growth) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-blue-50/50 border border-indigo-100/90 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-600" />
              Pertumbuhan Alami
            </span>
            <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100/80 px-2 py-0.5 rounded-md">
              {totals.netGrowth >= 0 ? 'Surplus Alami' : 'Defisit Alami'}
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-indigo-950 font-mono">
              {totals.netGrowth >= 0 ? `+${totals.netGrowth}` : totals.netGrowth}
            </span>
            <span className="text-xs text-indigo-700 font-medium">jiwa bersih</span>
          </div>
          <div className="mt-2 text-[11px] text-indigo-800 flex items-center justify-between border-t border-indigo-200/50 pt-2">
            <span>Kelahiran dikurangi kematian</span>
            <span className="font-semibold text-indigo-900 font-mono">
              {totals.netGrowth > 0 ? `+${((totals.netGrowth / (totals.totalBirths || 1)) * 100).toFixed(0)}%` : '0%'}
            </span>
          </div>
        </div>

        {/* Metric 4: Rasio Indeks Vitalitas */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-slate-600" />
              Indeks Vitalitas (Vital Index)
            </span>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-md">
              L/M x 100
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {totals.vitalIndex}
            </span>
            <span className="text-xs text-slate-500 font-medium">poin</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between border-t border-slate-200/80 pt-2">
            <span>Standar demografi &gt; 100</span>
            <span className="font-bold text-emerald-600">Populasi Berkembang</span>
          </div>
        </div>
      </div>

      {/* Main Chart Body */}
      {chartViewMode !== 'table' ? (
        <div className="space-y-3">
          {/* Chart Subtitle & Toggle for Growth Line */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 font-bold text-slate-700">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span>Angka Kelahiran</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-bold text-slate-700">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span>Angka Kematian</span>
              </span>
              {showNaturalGrowth && (
                <span className="inline-flex items-center gap-1.5 font-bold text-indigo-700">
                  <span className="w-3 h-1 bg-indigo-600 inline-block rounded-full" />
                  <span>Garis Pertumbuhan Alami</span>
                </span>
              )}
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-900 font-medium">
              <input
                type="checkbox"
                checked={showNaturalGrowth}
                onChange={(e) => setShowNaturalGrowth(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
              />
              <span>Tampilkan Garis Selisih (Pertumbuhan Bersih)</span>
            </label>
          </div>

          {/* Recharts Container */}
          <div className="h-80 sm:h-96 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartViewMode === 'area' ? (
                <ComposedChart
                  data={trendData}
                  margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorBirths" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="colorDeaths" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="monthName" 
                    tickLine={false} 
                    axisLine={{ stroke: '#cbd5e1' }}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={{ stroke: '#cbd5e1' }}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    allowDecimals={false}
                  />
                  
                  <Tooltip content={<CustomVitalTooltip />} />
                  <ReferenceLine y={0} stroke="#94a3b8" />

                  <Area
                    type="monotone"
                    dataKey="births"
                    name="Kelahiran"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorBirths)"
                  />
                  <Area
                    type="monotone"
                    dataKey="deaths"
                    name="Kematian"
                    stroke="#e11d48"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorDeaths)"
                  />

                  {showNaturalGrowth && (
                    <Line
                      type="monotone"
                      dataKey="naturalGrowth"
                      name="Pertumbuhan Alami"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 4, fill: '#4f46e5' }}
                      activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                    />
                  )}
                </ComposedChart>
              ) : (
                <BarChart
                  data={trendData}
                  margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="monthName" 
                    tickLine={false} 
                    axisLine={{ stroke: '#cbd5e1' }}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={{ stroke: '#cbd5e1' }}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    allowDecimals={false}
                  />
                  
                  <Tooltip content={<CustomVitalTooltip />} />
                  <ReferenceLine y={0} stroke="#94a3b8" />

                  <Bar 
                    dataKey="births" 
                    name="Kelahiran" 
                    fill="#10b981" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={36}
                  />
                  <Bar 
                    dataKey="deaths" 
                    name="Kematian" 
                    fill="#f43f5e" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={36}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        /* Tabular View */
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Bulan</th>
                <th className="py-3 px-3 text-right">Kelahiran (Total)</th>
                <th className="py-3 px-3 text-center">L / P</th>
                <th className="py-3 px-3 text-right">Akta Lahir</th>
                <th className="py-3 px-3 text-right">Kematian</th>
                <th className="py-3 px-3 text-right">Akta Wafat</th>
                <th className="py-3 px-4 text-right font-black">Pertumbuhan Alami</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {trendData.map((row) => (
                <tr key={row.monthIndex} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {row.monthFull}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                    +{row.births}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-500">
                    {row.birthsMale} / {row.birthsFemale}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600">
                    {row.birthCertsIssued}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-rose-700">
                    -{row.deaths}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600">
                    {row.deathCertsIssued}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-black text-sm">
                    <span className={row.naturalGrowth >= 0 ? 'text-indigo-700' : 'text-amber-700'}>
                      {row.naturalGrowth >= 0 ? `+${row.naturalGrowth}` : row.naturalGrowth}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      row.naturalGrowth > 0
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : row.naturalGrowth === 0
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {row.naturalGrowth > 0 ? 'Surplus' : row.naturalGrowth === 0 ? 'Seimbang' : 'Defisit'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100/70 border-t border-slate-200 font-bold text-slate-900">
              <tr>
                <td className="py-3 px-4">TOTAL TAHUNAN ({selectedYear})</td>
                <td className="py-3 px-3 text-right font-mono text-emerald-800 text-sm">+{totals.totalBirths}</td>
                <td className="py-3 px-3 text-center font-mono text-slate-600">{totals.totalBirthsMale} / {totals.totalBirthsFemale}</td>
                <td className="py-3 px-3 text-right font-mono text-slate-700">{totals.totalBirthCerts}</td>
                <td className="py-3 px-3 text-right font-mono text-rose-800 text-sm">-{totals.totalDeaths}</td>
                <td className="py-3 px-3 text-right font-mono text-slate-700">{totals.totalDeathCerts}</td>
                <td className="py-3 px-4 text-right font-mono text-indigo-900 text-sm font-black">
                  {totals.netGrowth >= 0 ? `+${totals.netGrowth}` : totals.netGrowth}
                </td>
                <td className="py-3 px-3 text-center font-mono text-xs">Net Jiwa</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Informative Civic Insight Footer */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <b>Analisis Demografi:</b> Angka kelahiran tertinggi terjadi pada bulan <b>{totals.peakBirthMonth}</b> ({totals.peakBirthValue} jiwa). 
            Total penerbitan akta kelahiran mencapai <b>{totals.totalBirthCerts}</b> dokumen ({Math.round((totals.totalBirthCerts / (totals.totalBirths || 1)) * 100)}% dari kelahiran tercatat).
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-500">Standar Pelaporan: Permendagri No. 109/2019</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Custom High-Contrast Tooltip Component for Recharts
 */
const CustomVitalTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data: MonthlyVitalTrend = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-700 text-xs min-w-[200px] space-y-2">
        <div className="border-b border-slate-800 pb-2">
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">BULAN PELAPORAN</span>
          <p className="font-extrabold text-sm text-white">{data.monthFull}</p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Kelahiran:
            </span>
            <span className="font-mono font-bold text-emerald-300">+{data.births} jiwa</span>
          </div>
          <div className="text-[11px] text-slate-400 pl-3">
            Pria: {data.birthsMale} • Wanita: {data.birthsFemale}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-rose-400 flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Kematian:
            </span>
            <span className="font-mono font-bold text-rose-300">-{data.deaths} jiwa</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800">
            <span className="text-indigo-400 font-bold">Pertumbuhan Bersih:</span>
            <span className="font-mono font-black text-indigo-300">
              {data.naturalGrowth >= 0 ? `+${data.naturalGrowth}` : data.naturalGrowth} jiwa
            </span>
          </div>

          <div className="text-[10px] text-slate-400 pt-1 flex justify-between">
            <span>Akta Lahir: {data.birthCertsIssued}</span>
            <span>Akta Wafat: {data.deathCertsIssued}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};
