import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Resident, DukcapilAggregates } from '../types/population';

export const generateAggregatePdfReport = (
  aggregates: DukcapilAggregates,
  _residents: Resident[]
): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeFormatted = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // --- 1. KOP SURAT RESMI PEMERINTAH KABUPATEN KEEROM ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('PEMERINTAH KABUPATEN KEEROM', pageWidth / 2, 18, { align: 'center' });

  doc.setFontSize(15);
  doc.setTextColor(6, 95, 70); // emerald-800
  doc.text('DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL', pageWidth / 2, 24, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('Jalan Trans Papua No. 01, Arso Kota, Kabupaten Keerom, Provinsi Papua — Kode Pos 99368', pageWidth / 2, 29, { align: 'center' });
  doc.text('Telepon: (0967) 591-234 | Email: disdukcapil@keeromkab.go.id | Portal: sia-keerom.dukcapil.id', pageWidth / 2, 33, { align: 'center' });

  // Double Divider Line (Official Government Standard)
  doc.setDrawColor(6, 95, 70); // emerald-800
  doc.setLineWidth(1.2);
  doc.line(margin, 36, pageWidth - margin, 36);
  doc.setLineWidth(0.4);
  doc.line(margin, 37.2, pageWidth - margin, 37.2);

  // --- 2. JUDUL DOKUMEN LAPORAN ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('LAPORAN RESMI AGREGAT KEPENDUDUKAN & PENCATATAN SIPIL', pageWidth / 2, 44, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(13, 148, 136); // teal-600
  doc.text('SEMESTER BERJALAN TAHUN ' + now.getFullYear() + ' • KABUPATEN KEEROM', pageWidth / 2, 49, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Waktu Cetak: ${dateFormatted}, Pukul ${timeFormatted} WIT | Sumber Data: SIAK Terpusat & DKB Keerom`, pageWidth / 2, 54, { align: 'center' });

  // --- 3. KOTAK RINGKASAN INDIKATOR POKOK (EXECUTIVE SUMMARY) ---
  const boxY = 58;
  const boxHeight = 32;

  // Background Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, boxY, contentWidth, boxHeight, 3, 3, 'FD');

  // Green accent bar on left
  doc.setFillColor(5, 150, 105); // emerald-600
  doc.roundedRect(margin, boxY, 3, boxHeight, 1.5, 1.5, 'F');

  // Title inside box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(6, 95, 70);
  doc.text('RINGKASAN INDIKATOR UTAMA AGREGAT DAERAH', margin + 6, boxY + 6);

  // 4 Kolom Indikator
  const colWidth = (contentWidth - 8) / 4;
  const row1Y = boxY + 13;
  const row2Y = boxY + 23;

  // Kolom 1: Total Penduduk & KK
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Total Penduduk:', margin + 6, row1Y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`${aggregates.totalResidents.toLocaleString('id-ID')} Jiwa`, margin + 6, row1Y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Kepala Keluarga (KK): ${aggregates.totalKk.toLocaleString('id-ID')} KK`, margin + 6, row2Y + 4);

  // Kolom 2: Gender
  const c2X = margin + 6 + colWidth;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Komposisi Gender:', c2X, row1Y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const malePct = aggregates.totalResidents > 0 ? ((aggregates.maleCount / aggregates.totalResidents) * 100).toFixed(1) : '0';
  const femPct = aggregates.totalResidents > 0 ? ((aggregates.femaleCount / aggregates.totalResidents) * 100).toFixed(1) : '0';
  doc.text(`L: ${aggregates.maleCount} (${malePct}%)`, c2X, row1Y + 4.5);
  doc.text(`P: ${aggregates.femaleCount} (${femPct}%)`, c2X, row1Y + 9);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Sex Ratio: ${aggregates.sexRatio || (aggregates.femaleCount > 0 ? Math.round((aggregates.maleCount / aggregates.femaleCount) * 100) : 100)}`, c2X, row2Y + 4);

  // Kolom 3: KTP-el
  const c3X = margin + 6 + colWidth * 2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Perekaman KTP-el:', c3X, row1Y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(5, 150, 105);
  doc.text(`${aggregates.ktpPercentage}% Cakupan`, c3X, row1Y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`${aggregates.ktpRecorded} dari ${aggregates.ktpEligible} wajib KTP`, c3X, row2Y + 4);

  // Kolom 4: Akta & Vital
  const c4X = margin + 6 + colWidth * 3;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Akta & Dinamika Vital:', c4X, row1Y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Akta Lahir: ${aggregates.birthCertPercentage}%`, c4X, row1Y + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Lahir: +${aggregates.birthsRecorded} | Wafat: -${aggregates.deathsRecorded}`, c4X, row2Y + 4);

  // --- 4. DATA PER DISTRIK (11 DISTRIK SE-KABUPATEN KEEROM) ---
  const sortedDistricts = [...aggregates.districts].sort((a, b) => b.totalResidents - a.totalResidents);

  const tableRows = sortedDistricts.map((d, index) => {
    return [
      (index + 1).toString(),
      d.districtName,
      d.totalResidents.toLocaleString('id-ID'),
      d.maleCount.toLocaleString('id-ID'),
      d.femaleCount.toLocaleString('id-ID'),
      d.ktpEligible.toLocaleString('id-ID'),
      d.ktpRecorded.toLocaleString('id-ID'),
      `${d.ktpPercentage}%`,
      `${d.birthCertCount} (${d.birthCertPercentage}%)`,
      d.totalKk.toLocaleString('id-ID'),
    ];
  });

  // Footer / Total Row
  const totalRow = [
    '',
    'TOTAL KABUPATEN',
    aggregates.totalResidents.toLocaleString('id-ID'),
    aggregates.maleCount.toLocaleString('id-ID'),
    aggregates.femaleCount.toLocaleString('id-ID'),
    aggregates.ktpEligible.toLocaleString('id-ID'),
    aggregates.ktpRecorded.toLocaleString('id-ID'),
    `${aggregates.ktpPercentage}%`,
    `${aggregates.birthCertTotal} (${aggregates.birthCertPercentage}%)`,
    aggregates.totalKk.toLocaleString('id-ID'),
  ];

  autoTable(doc, {
    startY: boxY + boxHeight + 5,
    margin: { left: margin, right: margin },
    head: [[
      'No',
      'Distrik Wilayah',
      'Penduduk',
      'L',
      'P',
      'Wajib KTP',
      'KTP Rekam',
      '% KTP',
      'Cakupan Akta',
      'Jml KK',
    ]],
    body: tableRows,
    foot: [totalRow],
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 1.8,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [6, 95, 70], // emerald-800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
    },
    footStyles: {
      fillColor: [236, 253, 245], // emerald-50
      textColor: [6, 78, 59], // emerald-900
      fontStyle: 'bold',
      lineColor: [167, 243, 208],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { fontStyle: 'bold', cellWidth: 32 },
      2: { halign: 'right', fontStyle: 'bold' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'center', fontStyle: 'bold', textColor: [5, 150, 105] },
      8: { halign: 'center' },
      9: { halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // Get final Y after district table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let currentY = (doc as any).lastAutoTable.finalY + 6;

  // Jika posisi mendekati batas bawah halaman, tambah halaman baru
  if (currentY > 225) {
    doc.addPage();
    currentY = 20;
  }

  // --- 5. TABEL RINCIAN STRUKTUR USIA & DEMOGRAFI ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('STRUKTUR KELOMPOK UMUR PENDUDUK KABUPATEN KEEROM', margin, currentY);

  const ageData = [
    { label: 'Balita & Anak Dini (0 - 4 Tahun)', count: aggregates.ageGroups.toddler, note: 'Sasaran Penerbitan Akta Kelahiran & KIA Baru' },
    { label: 'Anak & Pelajar (5 - 17 Tahun)', count: aggregates.ageGroups.child, note: 'Cakupan Kartu Identitas Anak (KIA) Sekolah' },
    { label: 'Usia Produktif & Kerja (18 - 59 Tahun)', count: aggregates.ageGroups.productive, note: 'Perekaman KTP-el & Pemutakhiran Status KK' },
    { label: 'Lansia & Senior (60 Tahun ke Atas)', count: aggregates.ageGroups.elderly, note: 'Layanan Jemput Bola Adminduk Lansia Perbatasan' },
  ];

  const ageTableRows = ageData.map((grp, i) => {
    const pct = aggregates.totalResidents > 0 ? ((grp.count / aggregates.totalResidents) * 100).toFixed(1) : '0';
    return [
      (i + 1).toString(),
      grp.label,
      `${grp.count.toLocaleString('id-ID')} Jiwa`,
      `${pct}%`,
      grp.note
    ];
  });

  autoTable(doc, {
    startY: currentY + 2,
    margin: { left: margin, right: margin },
    head: [['No', 'Kategori Kelompok Usia', 'Jumlah Jiwa', 'Proporsi (%)', 'Fokus Kebijakan Pelayanan SIAK']],
    body: ageTableRows,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.2,
      cellPadding: 1.6,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
    },
    headStyles: {
      fillColor: [15, 118, 110], // teal-700
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { fontStyle: 'bold', cellWidth: 55 },
      2: { halign: 'right', fontStyle: 'bold', cellWidth: 28 },
      3: { halign: 'center', cellWidth: 24 },
      4: { cellWidth: 'auto', textColor: [71, 85, 105] },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Jika tidak cukup ruang untuk pengesahan tanda tangan (butuh minimal 40mm)
  if (currentY > 240) {
    doc.addPage();
    currentY = 22;
  }

  // --- 6. PENGESAHAN & CATATAN KEABSAHAN ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Catatan Keabsahan: Laporan agregat kependudukan ini dihasilkan secara sistemik oleh Portal Agregat Publik Disdukcapil Keerom.',
    margin,
    currentY
  );
  doc.text(
    'Digunakan sebagai bahan perumusan kebijakan pembangunan, pemenuhan hak sipil, serta transparansi pelayanan publik masyarakat.',
    margin,
    currentY + 3.5
  );

  // Kolom Tanda Tangan Resmi
  const sigX = pageWidth - margin - 65;
  const sigY = currentY + 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`Arso Kota, ${dateFormatted}`, sigX, sigY);
  doc.text('Kepala Dinas Kependudukan dan Pencatatan Sipil', sigX, sigY + 4);
  doc.text('Kabupaten Keerom,', sigX, sigY + 8);

  // Ruang Tanda Tangan & Cap Elektronik
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(6, 95, 70);
  doc.text('Drs. WILHELMUS TABUNI, M.Si', sigX, sigY + 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Pembina Utama Muda (IV/c)', sigX, sigY + 29);
  doc.text('NIP. 19740515 199803 1 004', sigX, sigY + 33);

  // Cap / Badge Resmi
  doc.setDrawColor(5, 150, 105);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, sigY + 6, 75, 22, 2, 2, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(5, 150, 105);
  doc.text('DOKUMEN RESMI SIAK TERPUSAT', margin + 4, sigY + 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Terverifikasi Elektronik Disdukcapil Keerom', margin + 4, sigY + 15);
  doc.text('Sesuai UU No. 24 Tahun 2013 tentang Adminduk', margin + 4, sigY + 19);
  doc.text(`ID Dokumen: DKB-KRM-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`, margin + 4, sigY + 23);

  // --- 7. FOOTER HALAMAN ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, 287, pageWidth - margin, 287);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Portal Data Kependudukan & Pencatatan Sipil Kabupaten Keerom — Provinsi Papua',
      margin,
      291
    );
    doc.text(
      `Halaman ${i} dari ${totalPages}`,
      pageWidth - margin,
      291,
      { align: 'right' }
    );
  }

  // Unduh PDF
  const filename = `Laporan_Agregat_Dukcapil_Keerom_${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}.pdf`;
  doc.save(filename);
};
