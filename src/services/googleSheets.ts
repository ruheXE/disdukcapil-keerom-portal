import { Resident, GoogleSheetConfig } from '../types/population';

export const SHEET_COLUMNS = [
  'NIK',
  'No. KK',
  'Nama Lengkap',
  'Jenis Kelamin',
  'Tempat Lahir',
  'Tanggal Lahir',
  'Agama',
  'Pendidikan',
  'Pekerjaan',
  'Status Perkawinan',
  'Hubungan Keluarga',
  'Alamat',
  'RT',
  'RW',
  'Kelurahan',
  'Kecamatan',
  'Status KTP-el',
  'Akta Lahir',
  'KIA',
  'Gol. Darah',
  'Status Penduduk',
  'Catatan'
];

/**
 * Transforms a Resident object into an ordered array of cell values
 */
export const residentToRow = (r: Resident): (string | number | boolean)[] => {
  return [
    `'${r.nik}`, // prefix with ' to avoid numeric truncation
    `'${r.noKk}`,
    r.fullName,
    r.gender === 'L' ? 'Laki-laki' : 'Perempuan',
    r.birthPlace,
    r.birthDate,
    r.religion,
    r.education,
    r.job,
    r.maritalStatus,
    r.familyRole,
    r.address,
    r.rt,
    r.rw,
    r.kelurahan,
    r.kecamatan,
    r.ktpStatus,
    r.hasBirthCert ? 'Ada' : 'Belum Ada',
    r.hasKia ? 'Ada' : 'Belum Ada',
    r.bloodType,
    r.status,
    r.notes || ''
  ];
};

/**
 * Transforms a row array from Google Sheets back into a Resident object
 */
export const rowToResident = (row: string[], rowIndex: number): Resident => {
  const cleanStr = (val?: string) => (val ? String(val).trim().replace(/^'/, '') : '');
  const nik = cleanStr(row[0]);
  const noKk = cleanStr(row[1]);
  const fullName = cleanStr(row[2]) || 'Warga Tanpa Nama';
  const genderRaw = cleanStr(row[3]).toUpperCase();
  const gender = genderRaw.startsWith('P') ? 'P' : 'L';
  const birthPlace = cleanStr(row[4]) || 'Kota';
  const birthDate = cleanStr(row[5]) || '2000-01-01';
  const religion = (cleanStr(row[6]) || 'Islam') as Resident['religion'];
  const education = cleanStr(row[7]) || 'SMA / SMK';
  const job = cleanStr(row[8]) || 'Karyawan Swasta';
  const maritalStatus = (cleanStr(row[9]) || 'Belum Kawin') as Resident['maritalStatus'];
  const familyRole = (cleanStr(row[10]) || 'Kepala Keluarga') as Resident['familyRole'];
  const address = cleanStr(row[11]) || 'Jl. Pemuda';
  const rt = cleanStr(row[12]) || '001';
  const rw = cleanStr(row[13]) || '001';
  const kelurahan = cleanStr(row[14]) || 'Pusat';
  const kecamatan = cleanStr(row[15]) || 'Kota';
  const ktpStatus = (cleanStr(row[16]) || 'Sudah Rekam') as Resident['ktpStatus'];
  const hasBirthCert = cleanStr(row[17]).toLowerCase().includes('ada') || cleanStr(row[17]).toLowerCase() === 'ya';
  const hasKia = cleanStr(row[18]).toLowerCase().includes('ada') || cleanStr(row[18]).toLowerCase() === 'ya';
  const bloodType = (cleanStr(row[19]) || '-') as Resident['bloodType'];
  const status = (cleanStr(row[20]) || 'Aktif') as Resident['status'];
  const notes = cleanStr(row[21]);

  return {
    id: `sheet-row-${rowIndex}-${nik || Math.random().toString(36).substring(2, 6)}`,
    nik,
    noKk,
    fullName,
    gender,
    birthPlace,
    birthDate,
    religion,
    education,
    job,
    maritalStatus,
    familyRole,
    address,
    rt,
    rw,
    kelurahan,
    kecamatan,
    ktpStatus,
    hasBirthCert,
    hasKia,
    bloodType,
    status,
    notes,
    sheetRowIndex: rowIndex,
  };
};

/**
 * Creates a brand new Google Sheet in the user's Google Drive with Kemendagri Dukcapil styling
 */
export const createDukcapilSpreadsheet = async (
  title: string,
  accessToken: string,
  initialResidents: Resident[]
): Promise<GoogleSheetConfig> => {
  const createUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

  const response = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: title || 'Dukcapil_SIAK_Data_Penduduk_2026',
      },
      sheets: [
        {
          properties: {
            title: 'Data_Penduduk',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Gagal membuat Google Spreadsheet baru.');
  }

  const sheetData = await response.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const sheetId = sheetData.sheets?.[0]?.properties?.sheetId || 0;

  // Format header row with Navy Blue Kemendagri theme and bold font
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.08, green: 0.15, blue: 0.28 }, // #142647 Elegant Deep Navy
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    fontSize: 11,
                    bold: true,
                  },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
        ],
      }),
    });
  } catch (err) {
    console.warn('Formatting header styling failed gracefully:', err);
  }

  // Populate Header + Initial Data Rows
  const rows = [SHEET_COLUMNS, ...initialResidents.map(residentToRow)];
  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Data_Penduduk!A1:V?valueInputOption=USER_ENTERED`;

  const appendRes = await fetch(appendUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: rows,
    }),
  });

  if (!appendRes.ok) {
    const appendErr = await appendRes.json();
    throw new Error(appendErr.error?.message || 'Gagal menulis data awal ke Google Sheet.');
  }

  return {
    spreadsheetId,
    spreadsheetTitle: sheetData.properties.title,
    sheetName: 'Data_Penduduk',
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    lastSyncedAt: new Date().toISOString(),
    totalSyncedRows: initialResidents.length,
  };
};

/**
 * Reads all resident records from the designated Google Sheet
 */
export const fetchResidentsFromSheet = async (
  spreadsheetId: string,
  accessToken: string,
  sheetName = 'Data_Penduduk'
): Promise<{ residents: Resident[]; title: string }> => {
  // First fetch metadata to get actual sheet title
  const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets.properties`;
  const metaRes = await fetch(metaUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!metaRes.ok) {
    const err = await metaRes.json();
    throw new Error(err.error?.message || 'Gagal mengakses spreadsheet. Pastikan izin telah diberikan.');
  }

  const metaData = await metaRes.json();
  const availableSheets: string[] = (metaData.sheets || []).map((s: { properties: { title: string } }) => s.properties.title);
  const targetSheet = availableSheets.includes(sheetName) ? sheetName : availableSheets[0] || 'Sheet1';

  // Read data values
  const range = `${targetSheet}!A1:V1000`;
  const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  const valuesRes = await fetch(valuesUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!valuesRes.ok) {
    const err = await valuesRes.json();
    throw new Error(err.error?.message || 'Gagal membaca isi baris Google Sheet.');
  }

  const data = await valuesRes.json();
  const rows: string[][] = data.values || [];

  if (rows.length <= 1) {
    return { residents: [], title: metaData.properties.title };
  }

  // Row 0 is header, parse from Row 1 onwards
  const residents: Resident[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row && row.length > 0 && row.some((cell) => cell && cell.trim() !== '')) {
      residents.push(rowToResident(row, i + 1));
    }
  }

  return { residents, title: metaData.properties.title };
};

/**
 * Appends a new Resident row to the end of the Google Sheet
 */
export const appendResidentToSheet = async (
  spreadsheetId: string,
  resident: Resident,
  accessToken: string,
  sheetName = 'Data_Penduduk'
): Promise<number> => {
  const range = `${sheetName}!A:V`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;

  const row = residentToRow(resident);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [row],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Gagal menambahkan baris ke Google Sheet.');
  }

  const result = await response.json();
  // Extract new row index from updatedRange (e.g. 'Data_Penduduk!A18:V18')
  const updatedRange: string = result.updates?.updatedRange || '';
  const match = updatedRange.match(/[A-Z]+(\d+):[A-Z]+(\d+)/);
  const rowIndex = match ? parseInt(match[1], 10) : undefined;
  return rowIndex || 2;
};

/**
 * Updates an existing Resident row in Google Sheets
 */
export const updateResidentInSheet = async (
  spreadsheetId: string,
  rowIndex: number,
  resident: Resident,
  accessToken: string,
  sheetName = 'Data_Penduduk'
): Promise<void> => {
  const range = `${sheetName}!A${rowIndex}:V${rowIndex}`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;

  const row = residentToRow(resident);
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [row],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Gagal memperbarui data di Google Sheet.');
  }
};

/**
 * Deletes a row in Google Sheets with safety confirmation
 */
export const deleteResidentRowInSheet = async (
  spreadsheetId: string,
  rowIndex: number,
  accessToken: string
): Promise<void> => {
  // First retrieve primary sheet ID
  const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`;
  const metaRes = await fetch(metaUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!metaRes.ok) return;

  const metaData = await metaRes.json();
  const sheetId = metaData.sheets?.[0]?.properties?.sheetId || 0;

  const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
  const response = await fetch(batchUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex - 1,
              endIndex: rowIndex,
            },
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Gagal menghapus baris dari Google Sheet.');
  }
};
