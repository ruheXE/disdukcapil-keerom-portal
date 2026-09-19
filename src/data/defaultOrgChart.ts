import { OrgChartConfig } from '../types/organization';

export const DEFAULT_ORG_CHART: OrgChartConfig = {
  title: 'Bagan Struktur Organisasi Dinas Kependudukan dan Pencatatan Sipil',
  subtitle: 'Pemerintah Kabupaten Keerom - Provinsi Papua',
  legalBasis: 'Berdasarkan Peraturan Bupati Keerom tentang Kedudukan, Susunan Organisasi, Tugas dan Fungsi Serta Tata Kerja Dinas Kependudukan dan Pencatatan Sipil',
  updatedAt: new Date().toISOString(),
  mode: 'both',
  chartImageUrl: '',
  chartImageName: '',
  notes: 'Struktur organisasi resmi Disdukcapil Kabupaten Keerom mengacu pada Permendagri tentang Pembinaan Administrasi Kependudukan dan regulasi Pemerintah Daerah Kabupaten Keerom.',
  positions: [
    {
      id: 'pos-kadis',
      title: 'Kepala Dinas',
      name: 'Drs. Wilhelmus Tabuni, M.Si',
      nip: '19740515 199803 1 004',
      rank: 'Pembina Utama Muda (IV/c)',
      category: 'pimpinan',
      duties: [
        'Memimpin dan merumuskan kebijakan teknis urusan pemerintahan bidang administrasi kependudukan dan pencatatan sipil.',
        'Mengkoordinasikan penyelenggaraan pelayanan prima kependudukan di seluruh 11 Distrik se-Kabupaten Keerom.',
        'Membina dan mengawasi pelaksanaan tata kelola SIAK dan pemanfaatan data kependudukan daerah perbatasan.'
      ],
      phone: '(0967) 591-234 ext 101',
      email: 'kadis.dukcapil@keeromkab.go.id',
      order: 1,
    },
    {
      id: 'pos-sekretaris',
      title: 'Sekretaris Dinas',
      name: 'Martha Ireeuw, S.Sos., M.AP',
      nip: '19790822 200312 2 006',
      rank: 'Pembina (IV/a)',
      category: 'sekretariat',
      parentId: 'pos-kadis',
      duties: [
        'Mengoordinasikan penyusunan perencanaan, program kerja, dan anggaran dinas.',
        'Mengelola urusan administrasi kepegawaian, keuangan, perlengkapan, dan aset sarana prasarana dinas.',
        'Menyelenggarakan ketatausahaan, kehumasan, dan pelaporan akuntabilitas kinerja dinas.'
      ],
      phone: '(0967) 591-234 ext 102',
      email: 'sekretariat.dukcapil@keeromkab.go.id',
      order: 2,
    },
    {
      id: 'pos-subbag-umum',
      title: 'Kasubag Umum & Kepegawaian',
      name: 'Petrus Waromi, S.AP',
      nip: '19841109 200902 1 003',
      rank: 'Penata (III/c)',
      category: 'subbag',
      parentId: 'pos-sekretaris',
      duties: [
        'Melaksanakan urusan persuratan, kearsipan, dan keprotokolan dinas.',
        'Mengelola formasi, kenaikan pangkat, dan pengembangan kompetensi aparatur Disdukcapil.',
        'Memelihara keamanan, kebersihan, dan logistik kantor pelayanan.'
      ],
      order: 3,
    },
    {
      id: 'pos-subbag-keuangan',
      title: 'Kasubag Perencanaan & Keuangan',
      name: 'Elisabeth Borotian, SE',
      nip: '19860327 201101 2 012',
      rank: 'Penata (III/c)',
      category: 'subbag',
      parentId: 'pos-sekretaris',
      duties: [
        'Menyusun Rencana Kerja dan Anggaran (RKA) serta DPA Disdukcapil Kabupaten Keerom.',
        'Melaksanakan verifikasi pembukuan, perbendaharaan, dan pelaporan keuangan berkala.',
        'Menyusun laporan evaluasi kinerja dan LAKIP dinas.'
      ],
      order: 4,
    },
    {
      id: 'pos-bidang-dafduk',
      title: 'Kepala Bidang Pelayanan Pendaftaran Penduduk',
      name: 'Yohanes S. Bate, S.STP',
      nip: '19810714 200112 1 002',
      rank: 'Pembina (IV/a)',
      category: 'bidang',
      parentId: 'pos-kadis',
      duties: [
        'Penyelenggaraan pelayanan penerbitan Kartu Keluarga (KK) dan Kartu Identitas Anak (KIA).',
        'Pelayanan perekaman dan pencetakan KTP-el reguler serta program jemput bola (Mobile Jebol) ke distrik perbatasan.',
        'Pengelolaan pendaftaran perpindahan penduduk antardistrik, antarkabupaten, dan antarprovinsi.'
      ],
      phone: '(0967) 591-234 ext 103',
      email: 'dafduk@keeromkab.go.id',
      order: 5,
    },
    {
      id: 'pos-bidang-capil',
      title: 'Kepala Bidang Pelayanan Pencatatan Sipil',
      name: 'Agustina Sway, SH',
      nip: '19800418 200604 2 015',
      rank: 'Pembina (IV/a)',
      category: 'bidang',
      parentId: 'pos-kadis',
      duties: [
        'Penerbitan Kutipan Akta Kelahiran dan percepatan kepemilikan akta bagi anak di seluruh kampung.',
        'Penerbitan Kutipan Akta Kematian dan pemutakhiran data status vital kependudukan.',
        'Pelayanan pencatatan perkawinan, perceraian, pengakuan anak, dan pengesahan anak.'
      ],
      phone: '(0967) 591-234 ext 104',
      email: 'capil@keeromkab.go.id',
      order: 6,
    },
    {
      id: 'pos-bidang-piak',
      title: 'Kepala Bidang Pengelolaan Informasi Administrasi Kependudukan (PIAK)',
      name: 'Frederik A. Weya, S.Kom., M.Cs',
      nip: '19830925 200801 1 009',
      rank: 'Penata Tingkat I (III/d)',
      category: 'bidang',
      parentId: 'pos-kadis',
      duties: [
        'Pengelolaan infrastruktur server SIAK Terpusat, keamanan siber, dan Jaringan Komunikasi Data (Jarkomdat).',
        'Pemeliharaan perangkat biometrik dan mobile enrollment adminduk jemput bola di wilayah perbatasan.',
        'Pengawasan integritas basis data kependudukan dan penanganan anomali data NIK/SIAK.'
      ],
      phone: '(0967) 591-234 ext 105',
      email: 'piak@keeromkab.go.id',
      order: 7,
    },
    {
      id: 'pos-bidang-pemanfaatan',
      title: 'Kepala Bidang Pemanfaatan Data & Inovasi Pelayanan',
      name: 'Samuel K. Tafor, S.STP., M.AP',
      nip: '19850612 200701 1 004',
      rank: 'Penata Tingkat I (III/d)',
      category: 'bidang',
      parentId: 'pos-kadis',
      duties: [
        'Pelaksanaan fasilitasi kerja sama perjanjian pemanfaatan data kependudukan (PKS) dengan OPD dan lembaga pengguna.',
        'Penyajian data kependudukan bersih (DKB) semesteran, profil agregat daerah, dan diseminasi data statistik.',
        'Penyelenggaraan inovasi pelayanan terpadu kependudukan dan pemanfaatan hak akses web service adminduk.'
      ],
      phone: '(0967) 591-234 ext 106',
      email: 'pemanfaatandata@keeromkab.go.id',
      order: 8,
    },
    {
      id: 'pos-fungsional',
      title: 'Kelompok Jabatan Fungsional & ADB',
      name: 'Tim Administrator Database (ADB) SIAK',
      nip: 'Tim Fungsional Teknis',
      rank: 'Pranata Komputer & ADB',
      category: 'fungsional',
      parentId: 'pos-kadis',
      duties: [
        'Pemeliharaan database, integrasi query API SIAK, dan backup data kependudukan secara berkala.',
        'Dukungan teknis operasional perangkat mobile enrollment di wilayah perbatasan (Skanto, Waris, Senggi, Web, Towe).',
        'Validasi anomali data NIK ganda dan duplikasi iris mata / sidik jari biometrik.'
      ],
      order: 9,
    },
  ],
};
