import { OrgChartConfig } from '../types/organization';
import { DEFAULT_ORG_CHART } from '../data/defaultOrgChart';

const ORG_CHART_STORAGE_KEY = 'disdukcapil_keerom_org_chart_v1';

export const getSavedOrgChart = (): OrgChartConfig => {
  try {
    const saved = localStorage.getItem(ORG_CHART_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.positions)) {
        // Migration: Check if PIAK & Pemanfaatan Data need to be separated
        const hasPemanfaatan = parsed.positions.some(
          (p: { id: string; title: string }) => 
            p.id === 'pos-bidang-pemanfaatan' || 
            (p.title.toLowerCase().includes('pemanfaatan data') && !p.title.toLowerCase().includes('piak'))
        );

        if (!hasPemanfaatan) {
          // Update existing PIAK title if it was merged
          const updatedPositions = parsed.positions.map((p: any) => {
            if (p.id === 'pos-bidang-piak' || p.title.toLowerCase().includes('piak')) {
              return {
                ...p,
                id: 'pos-bidang-piak',
                title: 'Kepala Bidang Pengelolaan Informasi Administrasi Kependudukan (PIAK)',
                duties: [
                  'Pengelolaan infrastruktur server SIAK Terpusat, keamanan siber, dan Jaringan Komunikasi Data (Jarkomdat).',
                  'Pemeliharaan perangkat biometrik dan mobile enrollment adminduk jemput bola di wilayah perbatasan.',
                  'Pengawasan integritas basis data kependudukan dan penanganan anomali data NIK/SIAK.'
                ],
              };
            }
            return p;
          });

          // Append separate Pemanfaatan Data position
          const pemanfaatanPos = DEFAULT_ORG_CHART.positions.find(p => p.id === 'pos-bidang-pemanfaatan');
          if (pemanfaatanPos) {
            updatedPositions.push(pemanfaatanPos);
            // Re-order
            updatedPositions.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          }

          const upgraded = {
            ...parsed,
            positions: updatedPositions,
          };
          saveOrgChart(upgraded);
          return upgraded;
        }

        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading saved org chart:', err);
  }
  return DEFAULT_ORG_CHART;
};

export const loadOrgChartConfig = getSavedOrgChart;

export const saveOrgChart = (config: OrgChartConfig): void => {
  try {
    const dataToSave = {
      ...config,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(ORG_CHART_STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (err) {
    console.error('Error saving org chart:', err);
  }
};

export const saveOrgChartConfig = saveOrgChart;

export const resetToDefaultOrgChart = (): OrgChartConfig => {
  try {
    localStorage.removeItem(ORG_CHART_STORAGE_KEY);
  } catch {
    // ignore
  }
  return DEFAULT_ORG_CHART;
};
