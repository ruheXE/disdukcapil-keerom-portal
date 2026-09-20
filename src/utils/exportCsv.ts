import { Resident } from '../types/population';

export function exportResidentsToCsv(residents: Resident[], filename = 'data-penduduk-disdukcapil-keerom.csv') {
  const headers = [
    'No',
    'NIK',
    'No KK',
    'Nama Lengkap',
    'Jenis Kelamin',
    'Tempat Lahir',
    'Tanggal Lahir',
    'Agama',
    'Status Kawin',
    'Pekerjaan',
    'Golongan Darah',
    'Pendidikan',
    'Hubungan Keluarga',
    'Alamat',
    'RT',
    'RW',
    'Kelurahan/Kampung',
    'Distrik/Kecamatan',
    'Status KTP-el',
    'Akta Kelahiran',
    'Kartu Identitas Anak (KIA)',
    'Status Kependudukan',
    'Akta Kematian',
    'Tanggal Kematian',
    'Catatan'
  ];

  const rows = residents.map((r, index) => [
    index + 1,
    `'${r.nik}`,
    `'${r.noKk}`,
    `"${(r.fullName || '').replace(/"/g, '""')}"`,
    r.gender === 'L' ? 'Laki-laki' : 'Perempuan',
    `"${(r.birthPlace || '').replace(/"/g, '""')}"`,
    r.birthDate || '',
    r.religion || '',
    r.maritalStatus || '',
    `"${(r.job || '').replace(/"/g, '""')}"`,
    r.bloodType || '',
    `"${(r.education || '').replace(/"/g, '""')}"`,
    r.familyRole || '',
    `"${(r.address || '').replace(/"/g, '""')}"`,
    r.rt || '',
    r.rw || '',
    `"${(r.kelurahan || '').replace(/"/g, '""')}"`,
    `"${(r.kecamatan || '').replace(/"/g, '""')}"`,
    r.ktpStatus || '',
    r.hasBirthCert ? 'Memiliki Akta' : 'Belum Memiliki',
    r.hasKia ? 'Sudah Ada KIA' : 'Belum Ada KIA',
    r.status || 'Aktif',
    r.hasDeathCert ? 'Ada Akta Kematian' : '-',
    r.deathDate || '-',
    `"${(r.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
