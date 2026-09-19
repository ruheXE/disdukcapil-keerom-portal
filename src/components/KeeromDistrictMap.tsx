import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  MapPin, 
  Users, 
  Award, 
  CreditCard, 
  Baby, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Info, 
  Layers, 
  ChevronRight,
  Sparkles,
  Building2,
  Filter,
  Crosshair,
  Target,
  Smartphone,
  CheckCircle2,
  ArrowDown
} from 'lucide-react';
import { Resident } from '../types/population';

// Metric Types
export type MapMetricKey = 'population' | 'ktpCoverage' | 'birthCertCoverage' | 'births' | 'sexRatio';

interface MetricOption {
  key: MapMetricKey;
  label: string;
  unit: string;
  icon: React.ReactNode;
  colorScheme: (t: number) => string;
  description: string;
}

// 11 Districts of Kabupaten Keerom with topological SVG Path definitions
interface DistrictGeoData {
  id: string;
  name: string;
  officialName: string;
  capital: string;
  path: string;
  labelPosition: [number, number]; // [x, y] in SVG coordinates
  areaKm2: number;
  totalVillages: number;
  borderPsp: boolean; // Bordering Papua New Guinea
}

// Coordinate space: 720 x 860 (Keerom stretches from North Arso down to South Kaisenar)
const KEEROM_DISTRICTS: DistrictGeoData[] = [
  {
    id: 'skanto',
    name: 'Skanto',
    officialName: 'Distrik Skanto',
    capital: 'Jaifuri (Arso III)',
    path: 'M 90,90 C 130,70 180,65 210,85 C 230,100 240,130 235,165 C 230,195 200,215 160,225 C 120,235 85,210 75,170 C 68,135 75,105 90,90 Z',
    labelPosition: [150, 145],
    areaKm2: 831,
    totalVillages: 12,
    borderPsp: false,
  },
  {
    id: 'arso_barat',
    name: 'Arso Barat',
    officialName: 'Distrik Arso Barat',
    capital: 'Yuwanain (Arso II)',
    path: 'M 210,85 C 255,75 305,75 330,95 C 345,115 350,145 340,175 C 330,205 300,220 260,225 C 235,215 230,195 235,165 C 240,130 230,100 210,85 Z',
    labelPosition: [280, 145],
    areaKm2: 549,
    totalVillages: 8,
    borderPsp: false,
  },
  {
    id: 'arso',
    name: 'Arso',
    officialName: 'Distrik Arso',
    capital: 'Arso Kota',
    path: 'M 330,95 C 380,80 435,80 465,100 C 485,120 485,155 470,185 C 450,220 410,235 365,240 C 335,225 330,205 340,175 C 350,145 345,115 330,95 Z',
    labelPosition: [405, 155],
    areaKm2: 1243,
    totalVillages: 12,
    borderPsp: false,
  },
  {
    id: 'arso_timur',
    name: 'Arso Timur',
    officialName: 'Distrik Arso Timur',
    capital: 'Yetfa',
    path: 'M 465,100 C 520,90 580,95 620,115 C 640,140 645,185 630,225 C 610,255 570,270 520,265 C 480,250 465,220 470,185 C 485,155 485,120 465,100 Z',
    labelPosition: [550, 175],
    areaKm2: 1478,
    totalVillages: 9,
    borderPsp: true,
  },
  {
    id: 'mannem',
    name: 'Mannem',
    officialName: 'Distrik Mannem',
    capital: 'Wonorejo (Arso VI)',
    path: 'M 260,225 C 300,220 365,240 410,235 C 430,255 440,290 425,325 C 405,360 360,375 315,370 C 270,360 240,325 245,285 C 250,255 255,235 260,225 Z',
    labelPosition: [335, 295],
    areaKm2: 546,
    totalVillages: 8,
    borderPsp: false,
  },
  {
    id: 'waris',
    name: 'Waris',
    officialName: 'Distrik Waris',
    capital: 'Pund (Ibu Kota Keerom)',
    path: 'M 410,235 C 465,220 520,265 570,270 C 625,275 640,310 635,355 C 620,400 575,420 515,415 C 460,405 435,375 425,325 C 440,290 430,255 410,235 Z',
    labelPosition: [520, 335],
    areaKm2: 911,
    totalVillages: 8,
    borderPsp: true,
  },
  {
    id: 'senggi',
    name: 'Senggi',
    officialName: 'Distrik Senggi',
    capital: 'Senggi',
    path: 'M 160,225 C 240,220 270,360 315,370 C 360,375 425,325 460,405 C 475,450 460,505 415,545 C 350,580 270,575 205,535 C 140,490 120,410 125,340 C 130,280 140,240 160,225 Z',
    labelPosition: [285, 450],
    areaKm2: 3080,
    totalVillages: 7,
    borderPsp: false,
  },
  {
    id: 'web',
    name: 'Web',
    officialName: 'Distrik Web',
    capital: 'Ubrub',
    path: 'M 460,405 C 515,415 575,420 635,355 C 650,420 645,490 610,545 C 570,585 505,600 455,580 C 430,555 415,545 460,405 Z',
    labelPosition: [535, 490],
    areaKm2: 714,
    totalVillages: 6,
    borderPsp: true,
  },
  {
    id: 'yaffi',
    name: 'Yaffi',
    officialName: 'Distrik Yaffi',
    capital: 'Yuruf',
    path: 'M 455,580 C 505,600 570,585 610,545 C 630,600 620,660 580,710 C 535,745 470,735 435,695 C 415,650 425,610 455,580 Z',
    labelPosition: [515, 650],
    areaKm2: 481,
    totalVillages: 7,
    borderPsp: true,
  },
  {
    id: 'towe',
    name: 'Towe',
    officialName: 'Distrik Towe',
    capital: 'Towe Hitam',
    path: 'M 205,535 C 270,575 350,580 415,545 C 425,610 415,650 435,695 C 390,730 330,735 275,710 C 220,670 190,615 205,535 Z',
    labelPosition: [315, 640],
    areaKm2: 580,
    totalVillages: 10,
    borderPsp: false,
  },
  {
    id: 'kaisenar',
    name: 'Kaisenar',
    officialName: 'Distrik Kaisenar',
    capital: 'Tefalma',
    path: 'M 275,710 C 330,735 390,730 435,695 C 470,735 535,745 520,785 C 480,830 380,845 320,830 C 270,810 255,755 275,710 Z',
    labelPosition: [390, 775],
    areaKm2: 405,
    totalVillages: 5,
    borderPsp: false,
  },
];

interface DistrictAggregatedStats {
  id: string;
  name: string;
  officialName: string;
  capital: string;
  areaKm2: number;
  totalVillages: number;
  borderPsp: boolean;
  totalPopulation: number;
  maleCount: number;
  femaleCount: number;
  sexRatio: number;
  kkCount: number;
  ktpRequiredCount: number;
  ktpDoneCount: number;
  ktpCoverage: number; // percentage
  birthCertCount: number;
  birthCertCoverage: number; // percentage
  birthCount: number; // age <= 4
  deathCount: number;
  villagesList: string[];
}

interface KeeromDistrictMapProps {
  residents: Resident[];
  onSelectDistrict?: (districtName: string) => void;
}

export const KeeromDistrictMap: React.FC<KeeromDistrictMapProps> = ({
  residents,
  onSelectDistrict,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<MapMetricKey>('population');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('arso');
  const [hoveredDistrictId, setHoveredDistrictId] = useState<string | null>(null);
  const [tapToZoomEnabled, setTapToZoomEnabled] = useState<boolean>(true);
  const [isZoomedDistrict, setIsZoomedDistrict] = useState<boolean>(false);
  const [currentZoomScale, setCurrentZoomScale] = useState<number>(1);
  const [tooltipData, setTooltipData] = useState<{
    x: number;
    y: number;
    stats: DistrictAggregatedStats;
  } | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Compute District Stats from live residents data
  const districtStatsMap = useMemo(() => {
    const stats: Record<string, DistrictAggregatedStats> = {};

    KEEROM_DISTRICTS.forEach((d) => {
      // Find matching residents (loose match by district name)
      const distResidents = residents.filter((r) => {
        const kec = (r.kecamatan || '').toLowerCase();
        const dName = d.name.toLowerCase();
        return kec.includes(dName);
      });

      const totalPopulation = distResidents.length;
      const maleCount = distResidents.filter((r) => r.gender === 'L').length;
      const femaleCount = distResidents.filter((r) => r.gender === 'P').length;
      const sexRatio = femaleCount > 0 ? Math.round((maleCount / femaleCount) * 100) : 100;

      const uniqueKKs = new Set(distResidents.map((r) => r.noKk).filter(Boolean));
      const kkCount = uniqueKKs.size;

      // KTP-el Eligibility (age >= 17 or married)
      const nowYear = new Date().getFullYear();
      const ktpEligible = distResidents.filter((r) => {
        const birthYear = r.birthDate ? parseInt(r.birthDate.split('-')[0], 10) : 2000;
        const age = nowYear - birthYear;
        return age >= 17 || r.maritalStatus === 'Kawin';
      });
      const ktpRequiredCount = ktpEligible.length;
      const ktpDoneCount = ktpEligible.filter((r) => r.ktpStatus === 'Sudah Rekam').length;
      const ktpCoverage = ktpRequiredCount > 0 ? Math.round((ktpDoneCount / ktpRequiredCount) * 100) : 0;

      // Akta Kelahiran
      const birthCertCount = distResidents.filter((r) => r.hasBirthCert).length;
      const birthCertCoverage = totalPopulation > 0 ? Math.round((birthCertCount / totalPopulation) * 100) : 0;

      // Toddler births (age 0-4)
      const birthCount = distResidents.filter((r) => {
        const birthYear = r.birthDate ? parseInt(r.birthDate.split('-')[0], 10) : 2000;
        return nowYear - birthYear <= 4;
      }).length;

      // Deceased
      const deathCount = distResidents.filter((r) => r.status === 'Meninggal').length;

      // Villages in this district
      const villagesSet = new Set(distResidents.map((r) => r.kelurahan).filter(Boolean));
      const villagesList = Array.from(villagesSet);

      stats[d.id] = {
        id: d.id,
        name: d.name,
        officialName: d.officialName,
        capital: d.capital,
        areaKm2: d.areaKm2,
        totalVillages: d.totalVillages,
        borderPsp: d.borderPsp,
        totalPopulation,
        maleCount,
        femaleCount,
        sexRatio,
        kkCount,
        ktpRequiredCount,
        ktpDoneCount,
        ktpCoverage,
        birthCertCount,
        birthCertCoverage,
        birthCount,
        deathCount,
        villagesList,
      };
    });

    return stats;
  }, [residents]);

  // Active metrics definitions
  const metrics: MetricOption[] = [
    {
      key: 'population',
      label: 'Jumlah Penduduk',
      unit: 'Jiwa',
      icon: <Users className="w-4 h-4" />,
      colorScheme: d3.interpolateBlues,
      description: 'Sebaran total jumlah penduduk terdata di tiap distrik',
    },
    {
      key: 'ktpCoverage',
      label: 'Cakupan KTP-el',
      unit: '%',
      icon: <CreditCard className="w-4 h-4" />,
      colorScheme: d3.interpolateGreens,
      description: 'Persentase wajib KTP yang telah melakukan perekaman',
    },
    {
      key: 'birthCertCoverage',
      label: 'Akta Kelahiran',
      unit: '%',
      icon: <Award className="w-4 h-4" />,
      colorScheme: d3.interpolatePurples,
      description: 'Persentase penduduk yang telah memiliki Akta Kelahiran resmi',
    },
    {
      key: 'births',
      label: 'Kelahiran Balita',
      unit: 'Anak',
      icon: <Baby className="w-4 h-4" />,
      colorScheme: d3.interpolateOranges,
      description: 'Distribusi kelahiran balita (usia 0-4 tahun) di tiap distrik',
    },
    {
      key: 'sexRatio',
      label: 'Rasio Gender',
      unit: 'L/100P',
      icon: <Layers className="w-4 h-4" />,
      colorScheme: d3.interpolateBuGn,
      description: 'Rasio jumlah penduduk laki-laki per 100 penduduk perempuan',
    },
  ];

  const currentMetric = metrics.find((m) => m.key === selectedMetric) || metrics[0];

  // Helper to extract numeric value based on metric
  const getMetricValue = (stats: DistrictAggregatedStats): number => {
    switch (selectedMetric) {
      case 'population':
        return stats.totalPopulation;
      case 'ktpCoverage':
        return stats.ktpCoverage;
      case 'birthCertCoverage':
        return stats.birthCertCoverage;
      case 'births':
        return stats.birthCount;
      case 'sexRatio':
        return stats.sexRatio;
      default:
        return stats.totalPopulation;
    }
  };

  // D3 Color Scale computation
  const colorScale = useMemo(() => {
    const values = Object.values(districtStatsMap).map((s) => getMetricValue(s));
    const minVal = Math.min(...values, 0);
    const maxVal = Math.max(...values, 10);

    return d3.scaleSequential(currentMetric.colorScheme).domain([minVal, maxVal]);
  }, [districtStatsMap, selectedMetric, currentMetric]);

  // Setup D3 Zoom on the SVG
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.8, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setCurrentZoomScale(event.transform.k);
        if (event.transform.k <= 1.05 && Math.abs(event.transform.x) < 10 && Math.abs(event.transform.y) < 10) {
          setIsZoomedDistrict(false);
        } else if (event.transform.k >= 1.35) {
          setIsZoomedDistrict(true);
        }
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    return () => {
      svg.on('.zoom', null);
    };
  }, []);

  // Smooth Tap-to-Zoom centering on specific district
  const zoomToDistrict = (districtId: string, customScale?: number) => {
    const dist = KEEROM_DISTRICTS.find((d) => d.id === districtId);
    if (!dist || !svgRef.current || !zoomBehaviorRef.current) return;

    const [cx, cy] = dist.labelPosition;
    // Zoom scale 2.35x provides clear focal isolation on both mobile & desktop
    const scale = customScale ?? 2.35;

    const transform = d3.zoomIdentity
      .translate(360, 440)
      .scale(scale)
      .translate(-cx, -cy);

    d3.select(svgRef.current)
      .transition()
      .duration(650)
      .ease(d3.easeCubicOut)
      .call(zoomBehaviorRef.current.transform, transform);

    setIsZoomedDistrict(true);
    setCurrentZoomScale(scale);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(500)
      .ease(d3.easeCubicOut)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    setIsZoomedDistrict(false);
    setCurrentZoomScale(1);
  };

  const handleSelectDistrict = (district: DistrictGeoData, triggerZoom: boolean = true) => {
    const isAlreadySelected = selectedDistrictId === district.id;
    setSelectedDistrictId(district.id);

    if (onSelectDistrict) {
      onSelectDistrict(district.officialName);
    }

    if (tapToZoomEnabled && triggerZoom) {
      // If tapping the already focused & zoomed district, toggle back out to full map
      if (isAlreadySelected && isZoomedDistrict) {
        handleResetZoom();
      } else {
        zoomToDistrict(district.id);
      }
    }
  };

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.77);
  };

  // Selected district stats
  const activeSelectedStats = districtStatsMap[selectedDistrictId] || districtStatsMap['arso'];

  // Min & max for legend
  const metricValues = Object.values(districtStatsMap).map((s) => getMetricValue(s));
  const minVal = Math.min(...metricValues, 0);
  const maxVal = Math.max(...metricValues, 10);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header & Controls Bar */}
      <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-700 uppercase bg-emerald-100/80 px-2 py-0.5 rounded">
                PETA TEMATIK INTERAKTIF D3
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">11 Wilayah Distrik</span>
            </div>
            <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
              Peta Sebaran Demografi Kependudukan Kabupaten Keerom
            </h3>
            <p className="text-xs text-slate-500 max-w-2xl">
              Visualisasi spasial interaktif sebaran penduduk, cakupan dokumen administrasi kependudukan (KTP-el & Akta), serta dinamika kelahiran di perbatasan timur Indonesia.
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {metrics.map((m) => (
              <button
                key={m.key}
                onClick={() => setSelectedMetric(m.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedMetric === m.key
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={m.description}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Metric Description & Quick Instructions */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-[11px] font-medium text-slate-700">{currentMetric.description}</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Garis Batas PNG (Papua New Guinea)
            </span>
            <span>•</span>
            <span className="italic">Gunakan scroll mouse atau tombol zoom untuk navigasi</span>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel of Districts (Optimized for Mobile Touch & Quick Tap-to-Zoom) */}
      <div className="bg-slate-950 px-3 sm:px-5 py-2.5 border-y border-slate-800/90 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 shrink-0 pr-2 border-r border-slate-800">
          <Target className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          <span className="hidden sm:inline">Pilih Distrik:</span>
          <span className="sm:hidden text-[10px] font-mono tracking-wider">DISTRIK:</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {KEEROM_DISTRICTS.map((d) => {
            const isSelected = selectedDistrictId === d.id;
            const stats = districtStatsMap[d.id];
            const count = stats ? getMetricValue(stats) : 0;
            return (
              <button
                key={d.id}
                onClick={() => handleSelectDistrict(d, true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 min-h-[36px] ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30 ring-2 ring-emerald-300'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
                title={`Tap untuk perbesar fokus ke ${d.officialName}`}
              >
                <span>{d.name}</span>
                <span className={`text-[10px] font-mono px-1 rounded font-bold ${isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {count.toLocaleString('id-ID')}{selectedMetric === 'ktpCoverage' || selectedMetric === 'birthCertCoverage' ? '%' : ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map & Detail Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 relative min-h-[580px]">
        
        {/* Left/Center: Interactive SVG Map Container (7 cols on lg, 8 on xl) */}
        <div className="lg:col-span-7 xl:col-span-8 relative bg-slate-900 p-2 sm:p-4 flex flex-col items-center justify-center overflow-hidden min-h-[420px] sm:min-h-[520px] lg:min-h-[620px]">
          
          {/* Subtle Grid Background Pattern */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* Top Left: Compass Rose & Tap-to-Zoom Toggle Button */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-2">
            {/* Compass Rose */}
            <div className="bg-slate-850/90 backdrop-blur-md p-2 rounded-xl border border-slate-700/80 shadow-md text-slate-300 pointer-events-none flex flex-col items-center">
              <span className="text-[10px] font-black font-mono text-emerald-400">U</span>
              <div className="w-0.5 h-3.5 bg-emerald-400/80 my-0.5" />
              <span className="text-[9px] font-mono text-slate-500">S</span>
            </div>

            {/* Tap to Zoom Mode Toggle Button */}
            <button
              onClick={() => setTapToZoomEnabled(!tapToZoomEnabled)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[11px] font-bold transition-all border cursor-pointer backdrop-blur-md shadow-md min-h-[36px] ${
                tapToZoomEnabled
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-600/80 shadow-emerald-950/50'
                  : 'bg-slate-850/90 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Aktifkan/nonaktifkan zoom otomatis saat distrik di-tap"
            >
              <Crosshair className={`w-3.5 h-3.5 shrink-0 ${tapToZoomEnabled ? 'text-emerald-400 animate-pulse' : ''}`} />
              <span className="hidden xs:inline">Tap-to-Zoom:</span>
              <span className={`text-[10px] font-mono font-black ${tapToZoomEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                {tapToZoomEnabled ? 'AKTIF' : 'NONAKTIF'}
              </span>
            </button>
          </div>

          {/* Active Zoom Focus Badge (Shown when zoomed into a district) */}
          {isZoomedDistrict && (
            <div className="absolute top-14 left-3 sm:top-4 sm:left-52 z-10 flex items-center gap-1.5 sm:gap-2 bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/70 shadow-xl text-xs animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="text-slate-200 font-medium text-[11px] sm:text-xs truncate max-w-[140px] sm:max-w-none">
                Fokus: <strong className="text-emerald-300 font-bold">{activeSelectedStats.name}</strong> ({currentZoomScale.toFixed(1)}x)
              </span>
              <button
                onClick={handleResetZoom}
                className="ml-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-0.5 rounded-lg border border-slate-600 flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                title="Kembalikan tampilan peta penuh"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset</span>
              </button>
            </div>
          )}

          {/* Zoom Controls (Touch-friendly 40px+ targets) */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex flex-col gap-1.5 bg-slate-850/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-md">
            <button
              onClick={handleZoomIn}
              className="p-2 sm:p-2 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
              title="Perbesar Peta (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 sm:p-2 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
              title="Perkecil Peta (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2 sm:p-2 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
              title="Reset Tampilan Peta Utuh"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Choropleth Dynamic Legend */}
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 bg-slate-850/95 backdrop-blur-md px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl border border-slate-700/80 shadow-lg max-w-[190px] sm:max-w-[240px] text-xs">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-300 mb-1">
              <span>{currentMetric.label}</span>
              <span className="text-emerald-400">{currentMetric.unit}</span>
            </div>
            {/* Color Gradient Bar */}
            <div 
              className="h-2 rounded-full w-full border border-slate-600"
              style={{
                background: `linear-gradient(to right, ${colorScale(minVal)}, ${colorScale((minVal + maxVal) / 2)}, ${colorScale(maxVal)})`
              }}
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
              <span>{minVal.toLocaleString('id-ID')}</span>
              <span>{Math.round((minVal + maxVal) / 2).toLocaleString('id-ID')}</span>
              <span>{maxVal.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Mobile Tap Hint Badge */}
          <div className="absolute bottom-3 right-3 sm:hidden z-10 bg-slate-900/85 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-700/80 text-[10px] text-slate-300 flex items-center gap-1 pointer-events-none">
            <Smartphone className="w-3 h-3 text-emerald-400" />
            <span>Tap distrik untuk zoom</span>
          </div>

          {/* D3 Zoomable SVG Canvas */}
          <svg
            ref={svgRef}
            viewBox="0 0 720 880"
            className="w-full h-full max-h-[640px] cursor-grab active:cursor-grabbing select-none"
          >
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <g ref={gRef}>
              {/* International Border Line (Papua New Guinea) on East Side */}
              <path
                d="M 620,115 L 640,140 L 645,185 L 630,225 L 635,355 L 650,420 L 645,490 L 610,545 L 630,600 L 620,660 L 580,710 L 535,745 L 520,785"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                strokeDasharray="6 4"
                className="opacity-80"
              />
              <text
                x="650"
                y="310"
                fill="#f87171"
                fontSize="11"
                fontWeight="700"
                transform="rotate(90, 650, 310)"
                letterSpacing="3"
                className="opacity-75 font-mono"
              >
                BATAS NEGARA PAPUA NEW GUINEA (PNG)
              </text>

              {/* District Polygons */}
              {KEEROM_DISTRICTS.map((district) => {
                const stats = districtStatsMap[district.id] || {
                  totalPopulation: 0,
                  ktpCoverage: 0,
                  birthCertCoverage: 0,
                  birthCount: 0,
                  sexRatio: 100,
                };
                const val = getMetricValue(stats as DistrictAggregatedStats);
                const fillColor = colorScale(val);
                const isSelected = selectedDistrictId === district.id;
                const isHovered = hoveredDistrictId === district.id;

                return (
                  <g
                    key={district.id}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={(e) => {
                      setHoveredDistrictId(district.id);
                      setTooltipData({
                        x: e.clientX,
                        y: e.clientY,
                        stats: districtStatsMap[district.id],
                      });
                    }}
                    onMouseMove={(e) => {
                      if (tooltipData) {
                        setTooltipData((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredDistrictId(null);
                      setTooltipData(null);
                    }}
                    onClick={() => {
                      handleSelectDistrict(district, true);
                    }}
                  >
                    {/* Main District Path */}
                    <path
                      d={district.path}
                      fill={fillColor}
                      stroke={isSelected ? '#34d399' : isHovered ? '#ffffff' : '#334155'}
                      strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.5}
                      className="transition-all duration-200 hover:brightness-115"
                      filter={isSelected ? 'url(#glow)' : undefined}
                    />

                    {/* District Focus Radar Ping when Selected */}
                    {isSelected && (
                      <g className="pointer-events-none">
                        <circle
                          cx={district.labelPosition[0]}
                          cy={district.labelPosition[1]}
                          r="32"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2.5"
                          className="animate-ping opacity-60"
                        />
                        <circle
                          cx={district.labelPosition[0]}
                          cy={district.labelPosition[1]}
                          r="42"
                          fill="rgba(16, 185, 129, 0.12)"
                          stroke="#34d399"
                          strokeWidth="1.5"
                          strokeDasharray="4 3"
                        />
                        <circle
                          cx={district.labelPosition[0]}
                          cy={district.labelPosition[1]}
                          r="4"
                          fill="#34d399"
                        />
                      </g>
                    )}

                    {/* District Name Label */}
                    <text
                      x={district.labelPosition[0]}
                      y={district.labelPosition[1] - 4}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="800"
                      className="pointer-events-none drop-shadow-md font-sans tracking-tight"
                    >
                      {district.name}
                    </text>

                    {/* Metric Value Badge inside District */}
                    <rect
                      x={district.labelPosition[0] - 28}
                      y={district.labelPosition[1] + 4}
                      width="56"
                      height="16"
                      rx="8"
                      fill="rgba(15, 23, 42, 0.85)"
                      stroke={isSelected ? '#10b981' : 'rgba(255,255,255,0.2)'}
                      strokeWidth="1"
                      className="pointer-events-none"
                    />
                    <text
                      x={district.labelPosition[0]}
                      y={district.labelPosition[1] + 15}
                      textAnchor="middle"
                      fill={isSelected ? '#34d399' : '#e2e8f0'}
                      fontSize="9.5"
                      fontWeight="700"
                      fontFamily="monospace"
                      className="pointer-events-none"
                    >
                      {val.toLocaleString('id-ID')} {selectedMetric === 'ktpCoverage' || selectedMetric === 'birthCertCoverage' ? '%' : ''}
                    </text>

                    {/* Border Indicator Tag if Bordering PNG */}
                    {district.borderPsp && (
                      <circle
                        cx={district.labelPosition[0] + 32}
                        cy={district.labelPosition[1] - 4}
                        r="3"
                        fill="#ef4444"
                        className="animate-pulse"
                      />
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Realtime Floating HTML Tooltip */}
          {tooltipData && (
            <div 
              className="fixed z-50 pointer-events-none bg-slate-900/95 text-white p-3 rounded-2xl shadow-2xl border border-slate-700 text-xs backdrop-blur-md transform -translate-x-1/2 -translate-y-full mb-3 min-w-[210px]"
              style={{
                left: `${tooltipData.x}px`,
                top: `${tooltipData.y - 12}px`,
              }}
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1.5 mb-2">
                <div>
                  <span className="font-extrabold text-emerald-400 text-xs block">
                    {tooltipData.stats.officialName}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Ibu Kota: {tooltipData.stats.capital}
                  </span>
                </div>
                {tooltipData.stats.borderPsp && (
                  <span className="text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.5 rounded font-mono">
                    Perbatasan PNG
                  </span>
                )}
              </div>

              <div className="space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Penduduk Terdata:</span>
                  <span className="font-bold text-white">{tooltipData.stats.totalPopulation.toLocaleString('id-ID')} Jiwa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cakupan KTP-el:</span>
                  <span className="font-bold text-emerald-400">{tooltipData.stats.ktpCoverage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Akta Kelahiran:</span>
                  <span className="font-bold text-purple-400">{tooltipData.stats.birthCertCoverage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kelahiran Balita:</span>
                  <span className="font-bold text-amber-400">{tooltipData.stats.birthCount} Anak</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rasio Gender (L/P):</span>
                  <span className="font-bold text-cyan-400">{tooltipData.stats.sexRatio}</span>
                </div>
              </div>

              <div className="mt-2 pt-1 border-t border-slate-800 text-[9px] text-slate-400 italic text-center">
                Tap distrik untuk perbesar fokus & rincian
              </div>
            </div>
          )}

          {/* Mobile Instant Quick Summary (Displayed directly below map on small screens) */}
          <div className="block lg:hidden w-full bg-slate-850/95 border-t border-slate-800 p-3.5 text-white z-10 mt-auto rounded-b-2xl">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-black text-white text-sm">
                  {activeSelectedStats.officialName}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {activeSelectedStats.borderPsp && (
                  <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full">
                    PNG Border
                  </span>
                )}
                {isZoomedDistrict && (
                  <button
                    onClick={handleResetZoom}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 cursor-pointer"
                  >
                    Reset Zoom
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-mono">
              <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-400 font-sans block">Penduduk</span>
                <span className="font-bold text-white text-xs sm:text-sm">
                  {activeSelectedStats.totalPopulation.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-400 font-sans block">KTP-el</span>
                <span className="font-bold text-emerald-400 text-xs sm:text-sm">
                  {activeSelectedStats.ktpCoverage}%
                </span>
              </div>
              <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-400 font-sans block">Akta</span>
                <span className="font-bold text-purple-400 text-xs sm:text-sm">
                  {activeSelectedStats.birthCertCoverage}%
                </span>
              </div>
              <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-400 font-sans block">Balita</span>
                <span className="font-bold text-amber-400 text-xs sm:text-sm">
                  {activeSelectedStats.birthCount}
                </span>
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
              <span>Ibu Kota: <strong className="text-slate-200">{activeSelectedStats.capital}</strong> ({activeSelectedStats.totalVillages} Kampung)</span>
              <a
                href="#district-detail-panel"
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Lihat Lengkap</span>
                <ArrowDown className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Right: Detailed District Information Panel (5 cols on lg, 4 on xl) */}
        <div 
          id="district-detail-panel"
          className="lg:col-span-5 xl:col-span-4 p-5 sm:p-6 bg-white flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200 scroll-mt-6"
        >
          <div className="space-y-5">
            {/* Active District Header */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-800 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    WILAYAH ADMINISTRATIF TERPILIH
                  </span>
                </div>
                {activeSelectedStats.borderPsp && (
                  <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                    Kawasan Perbatasan PNG
                  </span>
                )}
              </div>

              <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
                {activeSelectedStats.officialName}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Pusat Distrik / Ibu Kota: <span className="font-semibold text-slate-700">{activeSelectedStats.capital}</span>
              </p>
            </div>

            {/* Quick District Select Dropdown with Tap-to-Zoom */}
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-500 shrink-0">Pilih Distrik:</span>
              <select
                value={selectedDistrictId}
                onChange={(e) => {
                  const selected = KEEROM_DISTRICTS.find((d) => d.id === e.target.value);
                  if (selected) {
                    handleSelectDistrict(selected, true);
                  }
                }}
                className="bg-transparent font-bold text-slate-800 outline-none w-full cursor-pointer"
              >
                {KEEROM_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.officialName}
                  </option>
                ))}
              </select>
            </div>

            {/* Key Metric Highlight Cards for Active District */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Total Penduduk */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">
                  Total Penduduk
                </span>
                <span className="text-lg font-black text-slate-900 block mt-0.5 font-mono">
                  {activeSelectedStats.totalPopulation.toLocaleString('id-ID')}
                  <span className="text-xs font-normal text-slate-500 ml-1">Jiwa</span>
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  L: {activeSelectedStats.maleCount} • P: {activeSelectedStats.femaleCount}
                </span>
              </div>

              {/* Jumlah KK */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">
                  Kepala Keluarga (KK)
                </span>
                <span className="text-lg font-black text-slate-900 block mt-0.5 font-mono">
                  {activeSelectedStats.kkCount.toLocaleString('id-ID')}
                  <span className="text-xs font-normal text-slate-500 ml-1">KK</span>
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Rata-rata {activeSelectedStats.kkCount > 0 ? (activeSelectedStats.totalPopulation / activeSelectedStats.kkCount).toFixed(1) : 0} jiwa/KK
                </span>
              </div>

              {/* KTP-el Coverage */}
              <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-emerald-800">
                    Cakupan KTP-el
                  </span>
                  <span className="text-xs font-bold text-emerald-700 font-mono">
                    {activeSelectedStats.ktpCoverage}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden mt-1.5">
                  <div 
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${activeSelectedStats.ktpCoverage}%` }}
                  />
                </div>
                <span className="text-[10px] text-emerald-700 block mt-1.5 font-mono">
                  {activeSelectedStats.ktpDoneCount} dari {activeSelectedStats.ktpRequiredCount} wajib KTP
                </span>
              </div>

              {/* Akta Kelahiran Coverage */}
              <div className="bg-purple-50/60 p-3 rounded-2xl border border-purple-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-purple-800">
                    Akta Kelahiran
                  </span>
                  <span className="text-xs font-bold text-purple-700 font-mono">
                    {activeSelectedStats.birthCertCoverage}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-purple-200/60 h-2 rounded-full overflow-hidden mt-1.5">
                  <div 
                    className="bg-purple-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${activeSelectedStats.birthCertCoverage}%` }}
                  />
                </div>
                <span className="text-[10px] text-purple-700 block mt-1.5 font-mono">
                  {activeSelectedStats.birthCertCount} dari {activeSelectedStats.totalPopulation} warga
                </span>
              </div>
            </div>

            {/* Geographical & Administrative Details */}
            <div className="space-y-2 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-800 block text-xs tracking-tight">
                Informasi Geografis & Kewilayahan
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div>
                  <span className="text-slate-400 block">Luas Wilayah:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    ±{activeSelectedStats.areaKm2.toLocaleString('id-ID')} km²
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Kepadatan Penduduk:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {(activeSelectedStats.totalPopulation / (activeSelectedStats.areaKm2 || 1)).toFixed(2)} jiwa/km²
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Total Kampung:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {activeSelectedStats.totalVillages} Kampung Resmi
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Kelahiran Baru:</span>
                  <span className="font-mono font-semibold text-emerald-700">
                    {activeSelectedStats.birthCount} Balita (0-4 thn)
                  </span>
                </div>
              </div>
            </div>

            {/* List of Villages in this District */}
            <div>
              <span className="text-xs font-bold text-slate-700 flex items-center justify-between mb-2">
                <span>Daftar Kampung Terdata ({activeSelectedStats.villagesList.length})</span>
                <span className="text-[10px] text-slate-400 font-normal">SIAK Dukcapil</span>
              </span>

              {activeSelectedStats.villagesList.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {activeSelectedStats.villagesList.map((village, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/80 flex items-center gap-1"
                    >
                      <MapPin className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                      <span>{village}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl text-center text-slate-400 text-xs italic border border-dashed border-slate-200">
                  Data kampung untuk distrik ini belum diinput via Excel / Google Sheets
                </div>
              )}
            </div>
          </div>

          {/* Footer Action */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Kabupaten Keerom, Papua</span>
            {onSelectDistrict && (
              <button
                onClick={() => onSelectDistrict(activeSelectedStats.officialName)}
                className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold transition-colors cursor-pointer"
              >
                <span>Lihat Data Rinci Distrik</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
