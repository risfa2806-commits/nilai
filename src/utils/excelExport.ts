import * as XLSX from 'xlsx';
import { Course, Student, AttendanceStatus, GradeRecord } from '../data/academicData';

// 1. EXPORT REKAP PRESENSI 16 PERTEMUAN (P1-P16)
export function exportPresensiToExcel(
  course: Course,
  students: Student[],
  attendanceMap: Record<string, AttendanceStatus[]>
) {
  const wb = XLSX.utils.book_new();

  const rows: any[][] = [
    ['SEKOLAH TINGGI AGAMA ISLAM (STAI) JARINABI TANJUNG JABUNG TIMUR JAMBI'],
    ['SISTEM INFORMASI AKADEMIK (SIAKAD) — PROGRAM STUDI MANAJEMEN PENDIDIKAN ISLAM (MPI)'],
    [`REKAPITULASI PRESENSI KEHADIRAN MAHASISWA PERTEMUAN 1 S/D 16`],
    [
      `Mata Kuliah: ${course.name} (${course.code})`,
      '',
      '',
      '',
      `Dosen Pengampu: ${course.dosen}`,
    ],
    [
      `Semester: ${course.semester} | TA: ${course.academicYear}`,
      '',
      '',
      '',
      `Ketua Program Studi: ${course.kaprodi}`,
    ],
    [],
    [
      'No',
      'Nama Mahasiswa',
      'P1',
      'P2',
      'P3',
      'P4',
      'P5',
      'P6',
      'P7',
      'P8 (UTS)',
      'P9',
      'P10',
      'P11',
      'P12',
      'P13',
      'P14',
      'P15',
      'P16 (UAS)',
      'H',
      'I',
      'S',
      'A',
      '% Kehadiran',
      'Nilai Presensi (15%)',
      'Status Kelulusan',
      'Keterangan Akademik',
    ],
  ];

  const startRow = 8;

  students.forEach((student, idx) => {
    const rIdx = startRow + idx;
    const sessions = attendanceMap[student.id] || Array(16).fill('-');
    const rowData: any[] = [
      idx + 1,
      student.name,
      ...sessions,
      { f: `COUNTIF(C${rIdx}:R${rIdx},"H")` }, // S: H
      { f: `COUNTIF(C${rIdx}:R${rIdx},"I")` }, // T: I
      { f: `COUNTIF(C${rIdx}:R${rIdx},"S")` }, // U: S
      { f: `COUNTIF(C${rIdx}:R${rIdx},"A")` }, // V: A
      { f: `ROUND((S${rIdx}/16)*100, 1)` }, // W: % Hdr
      { f: `ROUND(((S${rIdx}/16)*100)*0.15, 2)` }, // X: Nilai 15%
      // Status Kelulusan Presensi
      student.isPermanentAlfa
        ? 'TIDAK LULUS (ALFA TERUS)'
        : student.isTestIzin
        ? 'UJIAN SUSULAN (IZIN DOSEN)'
        : { f: `IF(W${rIdx}>=75,"MEMENUHI","TIDAK LULUS (ABSEN KURANG)")` },
      student.isPermanentAlfa
        ? 'TIDAK LULUS (ALFA TERUS TANPA KETERANGAN)'
        : student.isTestIzin
        ? 'BERHAK UJIAN SUSULAN (IZIN RESMI DOSEN)'
        : student.notes || '',
    ];
    rows.push(rowData);
  });

  const endStudentRow = startRow + students.length - 1;
  const summaryRowHadir: any[] = [
    '',
    'TOTAL MAHASISWA HADIR (H)',
    ...Array(16)
      .fill(0)
      .map((_, colI) => {
        const colLetter = String.fromCharCode(67 + colI);
        return { f: `COUNTIF(${colLetter}${startRow}:${colLetter}${endStudentRow},"H")` };
      }),
  ];
  rows.push([]);
  rows.push(summaryRowHadir);

  // Signatures
  rows.push([]);
  rows.push(['', 'Mengetahui,', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ditetapkan di: Pasuruan / Tanjab Timur']);
  rows.push(['', 'Ketua Program Studi MPI', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Dosen Pengampu Mata Kuliah,']);
  rows.push([]);
  rows.push([]);
  rows.push(['', course.kaprodi, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', course.dosen]);
  rows.push(['', `NIDN: ${course.kaprodiNidn}`, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', `NIP: ${course.dosenNip}`]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 5 },
    { wch: 30 },
    ...Array(16).fill({ wch: 6 }),
    { wch: 6 },
    { wch: 6 },
    { wch: 6 },
    { wch: 6 },
    { wch: 13 },
    { wch: 18 },
    { wch: 28 }, // Status
    { wch: 42 }, // Keterangan
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Presensi P1-P16');
  const filename = `Rekap_Presensi_P1_P16_${course.code.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// 2. EXPORT REKAPAN NILAI UTS
export function exportUTSToExcel(
  course: Course,
  students: Student[],
  gradesMap: Record<string, GradeRecord>,
  attendanceMap: Record<string, AttendanceStatus[]>
) {
  const wb = XLSX.utils.book_new();

  const rows: any[][] = [
    ['SEKOLAH TINGGI AGAMA ISLAM (STAI) JARINABI TANJUNG JABUNG TIMUR JAMBI'],
    ['SISTEM INFORMASI AKADEMIK (SIAKAD) — PROGRAM STUDI MANAJEMEN PENDIDIKAN ISLAM (MPI)'],
    [`REKAPAN PENILAIAN UJIAN TENGAH SEMESTER (UTS) — LENGKAP KETERANGAN UJIAN SUSULAN & KELULUSAN`],
    [
      `Mata Kuliah: ${course.name} (${course.code})`,
      '',
      `Dosen Pengampu: ${course.dosen}`,
    ],
    [
      `Semester: ${course.semester} | TA: ${course.academicYear}`,
      '',
      `Komponen Mid: Absen (15%) + Sikap (15%) + Aktif (10%) + Tugas P1-P7 (20%) + UTS (40%) = 100%`,
    ],
    [],
    [
      'No',
      'Nama Mahasiswa',
      'Hadir P1-P7 (H)',
      '% Presensi Mid',
      'Nilai Absen (15%)',
      'Nilai Sikap (15%)',
      'Nilai Keaktifan (10%)',
      'Tugas & Presentasi (20%)',
      'Nilai Murni UTS (40%)',
      'Nilai Rekapitulasi UTS',
      'Huruf Mutu UTS',
      'Status Ujian',
      'Keterangan Akademik',
    ],
  ];

  const startRow = 8;
  students.forEach((s, idx) => {
    const rIdx = startRow + idx;
    const g = gradesMap[s.id] || { sikap: 80, aktif: 80, tugas: 80, uts: 80, uas: 80 };
    const sess = attendanceMap[s.id] || Array(16).fill('-');
    const p1p7Hadir = sess.slice(0, 7).filter((x) => x === 'H').length;

    const rowData: any[] = [
      idx + 1,
      s.name,
      p1p7Hadir, // C
      { f: `ROUND((C${rIdx}/7)*100, 1)` }, // D
      { f: `ROUND(((C${rIdx}/7)*100)*0.15, 2)` }, // E
      g.sikap, // F
      g.aktif, // G
      g.tugas, // H
      g.uts, // I
      { f: `ROUND(E${rIdx} + (F${rIdx}*0.15) + (G${rIdx}*0.10) + (H${rIdx}*0.20) + (I${rIdx}*0.40), 2)` }, // J
      { f: `IF(J${rIdx}>=85,"A",IF(J${rIdx}>=80,"B+",IF(J${rIdx}>=70,"B",IF(J${rIdx}>=65,"C+",IF(J${rIdx}>=55,"C",IF(J${rIdx}>=40,"D","E"))))))` }, // K
      // Status Ujian:
      s.isPermanentAlfa
        ? 'TIDAK LULUS (ALFA TANPA KETERANGAN)'
        : s.isTestIzin
        ? 'UJIAN SUSULAN (IZIN DOSEN)'
        : 'SELESAI DIEVALUASI',
      s.isPermanentAlfa
        ? 'Tidak pernah masuk kuliah (Gugur)'
        : s.isTestIzin
        ? 'Dispensasi Izin Tes Pendidikan Resmi Dosen (UTS Susulan)'
        : s.notes || g.catatan || '',
    ];
    rows.push(rowData);
  });

  const endRow = startRow + students.length - 1;
  rows.push([]);
  rows.push([
    '',
    'RATA-RATA KELAS',
    { f: `ROUND(AVERAGE(C${startRow}:C${endRow}), 1)` },
    { f: `ROUND(AVERAGE(D${startRow}:D${endRow}), 1)` },
    { f: `ROUND(AVERAGE(E${startRow}:E${endRow}), 1)` },
    { f: `ROUND(AVERAGE(F${startRow}:F${endRow}), 1)` },
    { f: `ROUND(AVERAGE(G${startRow}:G${endRow}), 1)` },
    { f: `ROUND(AVERAGE(H${startRow}:H${endRow}), 1)` },
    { f: `ROUND(AVERAGE(I${startRow}:I${endRow}), 1)` },
    { f: `ROUND(AVERAGE(J${startRow}:J${endRow}), 1)` },
    '',
    '',
    '',
  ]);

  // Signatures
  rows.push([]);
  rows.push(['', 'Mengetahui,', '', '', '', '', '', 'Ditetapkan di: Pasuruan / Tanjab Timur']);
  rows.push(['', 'Ketua Program Studi MPI', '', '', '', '', '', 'Dosen Pengampu Mata Kuliah,']);
  rows.push([]);
  rows.push([]);
  rows.push(['', course.kaprodi, '', '', '', '', '', course.dosen]);
  rows.push(['', `NIDN: ${course.kaprodiNidn}`, '', '', '', '', '', `NIP: ${course.dosenNip}`]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 5 },
    { wch: 30 },
    { wch: 16 },
    { wch: 15 },
    { wch: 16 },
    { wch: 15 },
    { wch: 18 },
    { wch: 22 },
    { wch: 18 },
    { wch: 22 },
    { wch: 14 },
    { wch: 35 }, // Status Ujian
    { wch: 45 }, // Keterangan
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Nilai UTS');
  const filename = `Rekapan_Nilai_UTS_${course.code.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// 3. EXPORT REKAPAN NILAI UAS
export function exportUASToExcel(
  course: Course,
  students: Student[],
  gradesMap: Record<string, GradeRecord>,
  attendanceMap: Record<string, AttendanceStatus[]>
) {
  const wb = XLSX.utils.book_new();

  const rows: any[][] = [
    ['SEKOLAH TINGGI AGAMA ISLAM (STAI) JARINABI TANJUNG JABUNG TIMUR JAMBI'],
    ['SISTEM INFORMASI AKADEMIK (SIAKAD) — PROGRAM STUDI MANAJEMEN PENDIDIKAN ISLAM (MPI)'],
    [`REKAPAN PENILAIAN UJIAN AKHIR SEMESTER (UAS) — EVALUASI AKHIR & KETENTUAN KELULUSAN`],
    [
      `Mata Kuliah: ${course.name} (${course.code})`,
      '',
      `Dosen Pengampu: ${course.dosen}`,
    ],
    [
      `Semester: ${course.semester} | TA: ${course.academicYear}`,
      '',
      `Formula Akhir: Absen (15%) + Sikap (15%) + Aktif (10%) + Tugas (20%) + UTS (20%) + UAS (20%) = 100%`,
    ],
    [],
    [
      'No',
      'Nama Mahasiswa',
      'Total Hadir (H)',
      '% Total Presensi',
      'Nilai Absen (15%)',
      'Nilai Sikap (15%)',
      'Nilai Keaktifan (10%)',
      'Tugas & Presentasi (20%)',
      'Nilai UTS (20%)',
      'Nilai Murni UAS (20%)',
      'Nilai Rekapitulasi UAS/Akhir',
      'Huruf Mutu',
      'Status Kelulusan',
      'Catatan Evaluasi',
    ],
  ];

  const startRow = 8;
  students.forEach((s, idx) => {
    const rIdx = startRow + idx;
    const g = gradesMap[s.id] || { sikap: 80, aktif: 80, tugas: 80, uts: 80, uas: 80 };
    const sess = attendanceMap[s.id] || Array(16).fill('-');
    const totalHadir = sess.filter((x) => x === 'H').length;

    const rowData: any[] = [
      idx + 1,
      s.name,
      totalHadir, // C
      { f: `ROUND((C${rIdx}/16)*100, 1)` }, // D
      { f: `ROUND(((C${rIdx}/16)*100)*0.15, 2)` }, // E
      g.sikap, // F
      g.aktif, // G
      g.tugas, // H
      g.uts, // I
      g.uas, // J
      { f: `ROUND(E${rIdx} + (F${rIdx}*0.15) + (G${rIdx}*0.10) + (H${rIdx}*0.20) + (I${rIdx}*0.20) + (J${rIdx}*0.20), 2)` }, // K
      { f: `IF(K${rIdx}>=85,"A",IF(K${rIdx}>=80,"B+",IF(K${rIdx}>=70,"B",IF(K${rIdx}>=65,"C+",IF(K${rIdx}>=55,"C",IF(K${rIdx}>=40,"D","E"))))))` }, // L
      // Status Kelulusan:
      s.isPermanentAlfa
        ? 'TIDAK LULUS (ALFA TANPA KETERANGAN)'
        : s.isTestIzin
        ? 'UJIAN SUSULAN (IZIN DOSEN)'
        : { f: `IF(K${rIdx}>=60,"LULUS MEMUASKAN","TIDAK LULUS")` },
      s.isPermanentAlfa
        ? 'ALFA TERUS TANPA KETERANGAN (TIDAK LULUS)'
        : s.isTestIzin
        ? 'UJIAN SUSULAN (IZIN DOSEN IKUT TES)'
        : g.catatan || '',
    ];
    rows.push(rowData);
  });

  const endRow = startRow + students.length - 1;
  rows.push([]);
  rows.push([
    '',
    'RATA-RATA KELAS',
    { f: `ROUND(AVERAGE(C${startRow}:C${endRow}), 1)` },
    { f: `ROUND(AVERAGE(D${startRow}:D${endRow}), 1)` },
    { f: `ROUND(AVERAGE(E${startRow}:E${endRow}), 1)` },
    { f: `ROUND(AVERAGE(F${startRow}:F${endRow}), 1)` },
    { f: `ROUND(AVERAGE(G${startRow}:G${endRow}), 1)` },
    { f: `ROUND(AVERAGE(H${startRow}:H${endRow}), 1)` },
    { f: `ROUND(AVERAGE(I${startRow}:I${endRow}), 1)` },
    { f: `ROUND(AVERAGE(J${startRow}:J${endRow}), 1)` },
    { f: `ROUND(AVERAGE(K${startRow}:K${endRow}), 1)` },
    '',
    '',
    '',
  ]);

  // Signatures
  rows.push([]);
  rows.push(['', 'Mengetahui,', '', '', '', '', '', '', 'Ditetapkan di: Pasuruan / Tanjab Timur']);
  rows.push(['', 'Ketua Program Studi MPI', '', '', '', '', '', '', 'Dosen Pengampu Mata Kuliah,']);
  rows.push([]);
  rows.push([]);
  rows.push(['', course.kaprodi, '', '', '', '', '', '', course.dosen]);
  rows.push(['', `NIDN: ${course.kaprodiNidn}`, '', '', '', '', '', '', `NIP: ${course.dosenNip}`]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 5 },
    { wch: 30 },
    { wch: 16 },
    { wch: 15 },
    { wch: 16 },
    { wch: 15 },
    { wch: 18 },
    { wch: 22 },
    { wch: 15 },
    { wch: 18 },
    { wch: 24 },
    { wch: 12 },
    { wch: 35 }, // Status
    { wch: 45 }, // Catatan
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Nilai UAS');
  const filename = `Rekapan_Nilai_UAS_${course.code.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// 4. EXPORT REKAPAN KESELURUHAN MASTER
export function exportMasterToExcel(
  course: Course,
  students: Student[],
  gradesMap: Record<string, GradeRecord>,
  attendanceMap: Record<string, AttendanceStatus[]>
) {
  const wb = XLSX.utils.book_new();

  const masterRows: any[][] = [
    ['SEKOLAH TINGGI AGAMA ISLAM (STAI) JARINABI TANJUNG JABUNG TIMUR JAMBI'],
    ['SISTEM INFORMASI AKADEMIK (SIAKAD) — PROGRAM STUDI MANAJEMEN PENDIDIKAN ISLAM (MPI)'],
    [`LEMBAR REKAPITULASI NILAI KESELURUHAN MASTER P1-P16 (EVALUASI AKADEMIK 100%)`],
    [
      `Mata Kuliah: ${course.name} (${course.code})`,
      '',
      `Dosen Pengampu: ${course.dosen}`,
    ],
    [
      `Semester: ${course.semester} | TA: ${course.academicYear}`,
      '',
      `Ketua Program Studi: ${course.kaprodi}`,
    ],
    [
      `Aturan Akademik: Izin Dosen = Ujian Susulan | Alfa Terus Tanpa Keterangan = TIDAK LULUS`,
    ],
    [],
    [
      'No',
      'Nama Mahasiswa',
      'Kehadiran (H)',
      '% Presensi',
      'Nilai Absen (15%)',
      'Nilai Sikap (15%)',
      'Nilai Keaktifan (10%)',
      'Nilai Tugas/Presentasi (20%)',
      'Nilai UTS (20%)',
      'Nilai UAS (20%)',
      'NILAI REKAPAN KESELURUHAN (100%)',
      'Huruf Mutu',
      'Bobot Indeks (GPA)',
      'Status Kelulusan',
      'Catatan Akademik',
    ],
  ];

  const startRow = 9;
  students.forEach((s, idx) => {
    const rIdx = startRow + idx;
    const g = gradesMap[s.id] || { sikap: 80, aktif: 80, tugas: 80, uts: 80, uas: 80 };
    const sess = attendanceMap[s.id] || Array(16).fill('-');
    const totalHadir = sess.filter((x) => x === 'H').length;

    const rowData: any[] = [
      idx + 1,
      s.name,
      totalHadir, // C
      { f: `ROUND((C${rIdx}/16)*100, 1)` }, // D
      { f: `ROUND(((C${rIdx}/16)*100)*0.15, 2)` }, // E
      g.sikap, // F
      g.aktif, // G
      g.tugas, // H
      g.uts, // I
      g.uas, // J
      { f: `ROUND(E${rIdx} + (F${rIdx}*0.15) + (G${rIdx}*0.10) + (H${rIdx}*0.20) + (I${rIdx}*0.20) + (J${rIdx}*0.20), 2)` }, // K
      { f: `IF(K${rIdx}>=85,"A",IF(K${rIdx}>=80,"B+",IF(K${rIdx}>=70,"B",IF(K${rIdx}>=65,"C+",IF(K${rIdx}>=55,"C",IF(K${rIdx}>=40,"D","E"))))))` }, // L
      { f: `IF(L${rIdx}="A",4.0,IF(L${rIdx}="B+",3.5,IF(L${rIdx}="B",3.0,IF(L${rIdx}="C+",2.5,IF(L${rIdx}="C",2.0,IF(L${rIdx}="D",1.0,0.0))))))` }, // M
      // Explicit Status:
      s.isPermanentAlfa
        ? 'TIDAK LULUS (ALFA TANPA KETERANGAN)'
        : s.isTestIzin
        ? 'UJIAN SUSULAN (IZIN DOSEN)'
        : { f: `IF(K${rIdx}>=60,"LULUS MEMUASKAN","TIDAK LULUS")` },
      s.isPermanentAlfa
        ? 'Alfa Terus Tanpa Keterangan (Status: Tidak Lulus)'
        : s.isTestIzin
        ? 'Izin Resmi Dosen (Berhak Ujian Susulan)'
        : g.catatan || '',
    ];
    masterRows.push(rowData);
  });

  const endRow = startRow + students.length - 1;
  masterRows.push([]);
  masterRows.push([
    '',
    'RATA-RATA KELAS',
    { f: `ROUND(AVERAGE(C${startRow}:C${endRow}), 1)` },
    { f: `ROUND(AVERAGE(D${startRow}:D${endRow}), 1)` },
    { f: `ROUND(AVERAGE(E${startRow}:E${endRow}), 1)` },
    { f: `ROUND(AVERAGE(F${startRow}:F${endRow}), 1)` },
    { f: `ROUND(AVERAGE(G${startRow}:G${endRow}), 1)` },
    { f: `ROUND(AVERAGE(H${startRow}:H${endRow}), 1)` },
    { f: `ROUND(AVERAGE(I${startRow}:I${endRow}), 1)` },
    { f: `ROUND(AVERAGE(J${startRow}:J${endRow}), 1)` },
    { f: `ROUND(AVERAGE(K${startRow}:K${endRow}), 2)` },
    '',
    { f: `ROUND(AVERAGE(M${startRow}:M${endRow}), 2)` },
    '',
    '',
  ]);

  // Signatures
  masterRows.push([]);
  masterRows.push(['', 'Mengetahui,', '', '', '', '', '', '', '', 'Ditetapkan di: Pasuruan / Tanjab Timur']);
  masterRows.push(['', 'Ketua Program Studi MPI', '', '', '', '', '', '', '', 'Dosen Pengampu Mata Kuliah,']);
  masterRows.push([]);
  masterRows.push([]);
  masterRows.push(['', course.kaprodi, '', '', '', '', '', '', '', course.dosen]);
  masterRows.push(['', `NIDN: ${course.kaprodiNidn}`, '', '', '', '', '', '', '', `NIP: ${course.dosenNip}`]);

  const wsMaster = XLSX.utils.aoa_to_sheet(masterRows);
  wsMaster['!cols'] = [
    { wch: 5 },
    { wch: 30 },
    { wch: 15 },
    { wch: 12 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 22 },
    { wch: 15 },
    { wch: 15 },
    { wch: 28 },
    { wch: 12 },
    { wch: 18 },
    { wch: 35 }, // Status
    { wch: 45 }, // Catatan
  ];

  XLSX.utils.book_append_sheet(wb, wsMaster, 'Rekap Keseluruhan Master');

  const filename = `Rekapan_Keseluruhan_Master_${course.code.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, filename);
}
