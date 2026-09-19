export type OrgCategory = 'pimpinan' | 'sekretariat' | 'bidang' | 'subbag' | 'fungsional';

export interface OrgPosition {
  id: string;
  title: string;          // e.g. "Kepala Dinas", "Sekretaris Dinas", "Kepala Bidang PIAK"
  name: string;           // e.g. "Drs. Wilhelmus Tabuni, M.Si"
  nip?: string;           // e.g. "19750812 200003 1 004"
  rank?: string;          // e.g. "Pembina Utama Muda (IV/c)"
  category: OrgCategory;
  parentId?: string;      // ID of reporting line
  duties: string[];       // Key responsibilities (Tupoksi)
  phone?: string;
  email?: string;
  avatarUrl?: string;     // optional custom photo
  order: number;
}

export interface OrgChartConfig {
  title: string;
  subtitle: string;
  legalBasis: string;     // Dasar hukum, e.g. Perbup Keerom
  updatedAt: string;
  chartImageUrl?: string; // Custom uploaded image (DataURL or URL)
  chartImageName?: string;
  mode: 'interactive' | 'image' | 'both';
  positions: OrgPosition[];
  notes?: string;
}
