import { DukcapilService } from '../types';

export const DUKCAPIL_SERVICES: DukcapilService[] = [
  {
    id: 'KTP',
    name: 'Perekaman & Cetak KTP Elektronik (e-KTP)',
    prefix: 'A',
    description: 'Perekaman biometrik pemula usia 17 tahun, penggantian KTP rusak/hilang, dan pembaruan elemen data kependudukan.',
    estimatedMinutes: 10,
    requirements: [
      'Fotokopi Kartu Keluarga (KK) terbaru',
      'Surat Keterangan Kehilangan dari Polsek (khusus jika KTP hilang)',
      'Fisik KTP lama (jika rusak atau ganti elemen data)',
      'Surat Keterangan Pindah (jika pindah domisili)',
    ],
    icon: 'CreditCard',
    badgeColor: 'blue',
  },
  {
    id: 'KK',
    name: 'Penerbitan Kartu Keluarga (KK)',
    prefix: 'B',
    description: 'Penerbitan KK baru akibat pernikahan, penambahan anak lahir, pisah KK, perubahan elemen data, dan KK hilang/rusak.',
    estimatedMinutes: 12,
    requirements: [
      'Buku Nikah / Akta Perkawinan (asli & fotokopi)',
      'KK asli yang lama dari kedua pihak (jika pecah KK)',
      'Surat Keterangan Kematian (jika pengurangan anggota)',
      'Dokumen pendukung perubahan pendidikan / pekerjaan / golongan darah',
    ],
    icon: 'Users',
    badgeColor: 'emerald',
  },
  {
    id: 'AKTA',
    name: 'Akta Kelahiran & Kematian / Catatan Sipil',
    prefix: 'C',
    description: 'Penerbitan kutipan Akta Kelahiran baru, Akta Kematian, Akta Pengangkatan Anak, serta pembetulan akta catatan sipil.',
    estimatedMinutes: 15,
    requirements: [
      'Surat Keterangan Kelahiran dari Dokter/Bidan/Puskesmas/RS',
      'Buku Nikah / Akta Perkawinan orang tua',
      'Fotokopi Kartu Keluarga (KK) & KTP kedua orang tua',
      'Fotokopi KTP 2 (dua) orang saksi',
    ],
    icon: 'FileText',
    badgeColor: 'amber',
  },
  {
    id: 'KIA_IKD',
    name: 'Kartu Identitas Anak (KIA) & Aktivasi IKD',
    prefix: 'D',
    description: 'Pencetakan KIA untuk anak usia 0-17 tahun kurang satu hari dan aktivasi Identitas Kependudukan Digital (IKD) di ponsel pintar.',
    estimatedMinutes: 8,
    requirements: [
      'Fotokopi Akta Kelahiran anak',
      'Fotokopi Kartu Keluarga (KK)',
      'Pas foto anak berwarna 2 lembar (ukuran 4x6 untuk usia >5 tahun)',
      'Ponsel Android/iOS terpasang aplikasi IKD Kemendagri (untuk aktivasi IKD)',
    ],
    icon: 'Sparkles',
    badgeColor: 'purple',
  },
  {
    id: 'KONSULTASI',
    name: 'Konsultasi & Pengaduan NIK / Data Ganda',
    prefix: 'E',
    description: 'Sinkronisasi NIK yang tidak terbaca di BPJS/Perbankan/Imigrasi, pemutakhiran data ganda, dan legalisir dokumen kependudukan.',
    estimatedMinutes: 10,
    requirements: [
      'Fisik e-KTP dan Kartu Keluarga asli',
      'Tangkapan layar kendala atau bukti penolakan sistem (BPJS/Bank/dll)',
      'Dokumen pelengkap terkait sengketa data kependudukan',
    ],
    icon: 'HelpCircle',
    badgeColor: 'rose',
  },
];

export const TIME_SLOTS = [
  'Sesi 1: 08:00 - 10:00 WIB',
  'Sesi 2: 10:00 - 12:00 WIB',
  'Sesi 3: 13:00 - 14:30 WIB',
  'Sesi 4: 14:30 - 16:00 WIB',
];
