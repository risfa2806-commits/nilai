import JSZip from 'jszip';
import { Course, Student, AttendanceStatus, GradeRecord, TaskSubmission } from '../data/academicData';

export async function exportSemesterBackupZip(
  course: Course,
  students: Student[],
  attendanceMap: Record<string, AttendanceStatus[]>,
  gradesMap: Record<string, GradeRecord>,
  submissions: TaskSubmission[]
): Promise<void> {
  const zip = new JSZip();

  const safeCourseName = course.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeSemester = course.semester.replace(/[^a-zA-Z0-9_-]/g, '_');

  // 1. Generate Master CSV
  let masterCsv = 'No,Nama Mahasiswa,Jenis Kelamin,Absen 15%,Sikap 15%,Aktif 10%,Tugas 20%,UTS 20%,UAS 20%,Nilai Akhir,Mutu,Bobot,Status,Catatan Dosen\n';
  students.forEach((s, idx) => {
    const sess = attendanceMap[s.id] || Array(16).fill('-');
    const hCount = sess.filter((x) => x === 'H').length;
    const aCount = sess.filter((x) => x === 'A').length;
    const presensiPct = Math.round((hCount / 16) * 100);

    const g = gradesMap[s.id] || {
      studentId: s.id,
      sikap: s.isPermanentAlfa ? 0 : 80,
      aktif: s.isPermanentAlfa ? 0 : 80,
      tugas: s.isPermanentAlfa ? 0 : 80,
      uts: s.isPermanentAlfa ? 0 : 80,
      uas: s.isPermanentAlfa ? 0 : 80,
      catatan: '',
    };

    const totalScore = Math.round(
      presensiPct * 0.15 +
        g.sikap * 0.15 +
        g.aktif * 0.10 +
        g.tugas * 0.20 +
        g.uts * 0.20 +
        g.uas * 0.20
    );

    let letter = 'E';
    let gpa = 0.0;
    if (totalScore >= 85) {
      letter = 'A';
      gpa = 4.0;
    } else if (totalScore >= 80) {
      letter = 'B+';
      gpa = 3.5;
    } else if (totalScore >= 70) {
      letter = 'B';
      gpa = 3.0;
    } else if (totalScore >= 65) {
      letter = 'C+';
      gpa = 2.5;
    } else if (totalScore >= 55) {
      letter = 'C';
      gpa = 2.0;
    } else if (totalScore >= 40) {
      letter = 'D';
      gpa = 1.0;
    }

    const isAlfa = (s.isPermanentAlfa && hCount < 4) || (aCount >= 10 && hCount <= 3);
    const isTest = !isAlfa && (s.isTestIzin || (s.notes && s.notes.toLowerCase().includes('tes')));
    const isBelowKkm = totalScore < 75;

    let statusText = 'LULUS MEMUASKAN';
    if (isAlfa) statusText = 'TIDAK LULUS (ALFA TANPA KETERANGAN)';
    else if (isTest) statusText = 'UJIAN SUSULAN (IZIN DOSEN)';
    else if (isBelowKkm) statusText = 'PERLU REMEDIAL (< 75)';
    else if (totalScore < 60) statusText = 'TIDAK LULUS';

    masterCsv += `${idx + 1},"${s.name}",${s.gender || '-'},${presensiPct},${g.sikap},${g.aktif},${g.tugas},${g.uts},${g.uas},${totalScore},${letter},${gpa.toFixed(1)},"${statusText}","${g.catatan || s.notes || '-'}"\n`;
  });
  zip.file(`Rekapan_Master_Nilai_${safeCourseName}.csv`, masterCsv);

  // 2. Generate Presensi CSV (P1 - P16)
  let presensiCsv = 'No,Nama Mahasiswa,' + Array(16).fill(0).map((_, i) => `P${i + 1}`).join(',') + ',H,I,S,A,% Hadir,Nilai 15%,Status\n';
  students.forEach((s, idx) => {
    const sess = attendanceMap[s.id] || Array(16).fill('-');
    const h = sess.filter((x) => x === 'H').length;
    const i = sess.filter((x) => x === 'I').length;
    const sc = sess.filter((x) => x === 'S').length;
    const a = sess.filter((x) => x === 'A').length;
    const pct = Math.round((h / 16) * 100);
    const score15 = Math.round(pct * 0.15 * 10) / 10;
    const isMemenuhi = pct >= 75;
    const isAlfa = (s.isPermanentAlfa && h < 4) || (a >= 10 && h <= 3);
    const isTest = !isAlfa && (s.isTestIzin || (s.notes && s.notes.toLowerCase().includes('tes')));

    let stat = isMemenuhi ? 'MEMENUHI (>=75%)' : 'TIDAK MEMENUHI (<75%)';
    if (isAlfa) stat = 'TIDAK LULUS (ALFA TERUS)';
    else if (isTest) stat = 'UJIAN SUSULAN (IZIN DOSEN)';

    presensiCsv += `${idx + 1},"${s.name}",` + sess.join(',') + `,${h},${i},${sc},${a},${pct}%,${score15},"${stat}"\n`;
  });
  zip.file(`Rekapan_Presensi_P1_P16_${safeCourseName}.csv`, presensiCsv);

  // 3. Generate UTS CSV
  let utsCsv = 'No,Nama Mahasiswa,Absen P1-P8,Sikap 20%,Aktif 20%,UTS 40%,Total Mid,Huruf,Status,Catatan Dosen\n';
  students.forEach((s, idx) => {
    const sess = attendanceMap[s.id] || Array(16).fill('-');
    const p1ToP8 = sess.slice(0, 8);
    const hMid = p1ToP8.filter((x) => x === 'H').length;
    const pctMid = Math.round((hMid / 8) * 100);
    const g = gradesMap[s.id] || { sikap: 80, aktif: 80, uts: 80, studentId: s.id, tugas: 80, uas: 80 };
    const totalMid = Math.round(pctMid * 0.20 + g.sikap * 0.20 + g.aktif * 0.20 + g.uts * 0.40);

    const isAlfa = s.isPermanentAlfa;
    const isTest = s.isTestIzin;
    let stat = 'SELESAI';
    if (isAlfa) stat = 'TIDAK LULUS (ALFA)';
    else if (isTest) stat = 'UJIAN SUSULAN (IZIN DOSEN)';

    utsCsv += `${idx + 1},"${s.name}",${pctMid}%,${g.sikap},${g.aktif},${g.uts},${totalMid},"${stat}","${g.catatan || s.notes || '-'}"\n`;
  });
  zip.file(`Rekapan_UTS_${safeCourseName}.csv`, utsCsv);

  // 4. Generate UAS CSV
  let uasCsv = 'No,Nama Mahasiswa,Absen P9-P16,Tugas 30%,UAS 40%,Total Akhir,Huruf,Status,Catatan Dosen\n';
  students.forEach((s, idx) => {
    const sess = attendanceMap[s.id] || Array(16).fill('-');
    const p9ToP16 = sess.slice(8, 16);
    const hUas = p9ToP16.filter((x) => x === 'H').length;
    const pctUas = Math.round((hUas / 8) * 100);
    const g = gradesMap[s.id] || { sikap: 80, aktif: 80, uts: 80, studentId: s.id, tugas: 80, uas: 80 };
    const totalUas = Math.round(pctUas * 0.30 + g.tugas * 0.30 + g.uas * 0.40);

    const isAlfa = s.isPermanentAlfa;
    const isTest = s.isTestIzin;
    let stat = totalUas >= 60 ? 'LULUS MEMUASKAN' : 'TIDAK LULUS';
    if (isAlfa) stat = 'TIDAK LULUS (ALFA)';
    else if (isTest) stat = 'UJIAN SUSULAN (IZIN DOSEN)';

    uasCsv += `${idx + 1},"${s.name}",${pctUas}%,${g.tugas},${g.uas},${totalUas},"${stat}","${g.catatan || s.notes || '-'}"\n`;
  });
  zip.file(`Rekapan_UAS_${safeCourseName}.csv`, uasCsv);

  // 5. Folders for Submissions (Presentasi, UTS, UAS)
  const presFolder = zip.folder('Berkas_Tugas_Presentasi_Mahasiswa');
  const utsFolder = zip.folder('Berkas_Jawaban_UTS_Mahasiswa');
  const uasFolder = zip.folder('Berkas_Jawaban_UAS_Mahasiswa');

  submissions.forEach((sub) => {
    const metaText = `DOKUMEN PENGUMPULAN TUGAS AKADEMIK STAI JARINABI
===================================================
Mata Kuliah     : ${course.name} (${course.code})
Semester        : ${course.semester}
Tahun Akademik  : ${course.academicYear}
Dosen Pengampu  : ${course.dosen}
Nama Mahasiswa  : ${sub.studentName}
Kategori        : ${sub.type}
Judul Berkas    : ${sub.title}
Nama File Asli  : ${sub.fileName}
Waktu Kirim     : ${sub.submittedAt}
Status Validasi : ${sub.status}
Nilai Dosen     : ${sub.score !== undefined ? sub.score : 'Belum dinilai'}
Catatan/Kritik  : ${sub.feedback || '-'}
---------------------------------------------------
Ringkasan Isi Tugas:
${sub.contentSnippet || 'Berkas tugas terlampir dalam repositori digital sistem siakad.'}
`;

    const safeFileName = sub.fileName.replace(/\.[^/.]+$/, '') + '.txt';

    if (sub.type === 'PRESENTASI' && presFolder) {
      presFolder.file(`${sub.studentName.replace(/\s+/g, '_')}_${safeFileName}`, metaText);
    } else if (sub.type === 'UTS' && utsFolder) {
      utsFolder.file(`${sub.studentName.replace(/\s+/g, '_')}_UTS_${safeFileName}`, metaText);
    } else if (sub.type === 'UAS' && uasFolder) {
      uasFolder.file(`${sub.studentName.replace(/\s+/g, '_')}_UAS_${safeFileName}`, metaText);
    }
  });

  // 6. Summary and Signature Documentation
  const summaryDoc = `ARSIP RESMI BACKUP AKADEMIK SEMESTER
SEKOLAH TINGGI AGAMA ISLAM (STAI) JARINABI TANJUNG JABUNG TIMUR JAMBI
PROGRAM STUDI MANAJEMEN PENDIDIKAN ISLAM (MPI)
======================================================================
Mata Kuliah      : ${course.name}
Kode MK          : ${course.code}
Bobot SKS        : ${course.sks} SKS
Semester         : ${course.semester}
Tahun Ajaran     : ${course.academicYear}
Dosen Pengampu   : ${course.dosen} (NIP: ${course.dosenNip})
Ketua Prodi      : ${course.kaprodi} (NIDN: ${course.kaprodiNidn})
Waktu Backup     : ${new Date().toLocaleString('id-ID')}
Total Mahasiswa  : ${students.length} Orang

RINGKASAN REKAPITULASI:
- Mahasiswa Lulus               : ${students.filter((s) => !s.isPermanentAlfa && !s.isTestIzin).length}
- Mahasiswa Ujian Susulan (Izin): ${students.filter((s) => s.isTestIzin).length} (Contoh: M. Milhan Aufa Zahran)
- Mahasiswa Tidak Lulus (Alfa)  : ${students.filter((s) => s.isPermanentAlfa).length} (Contoh: Muhammad Irfan)
- Total Berkas Tugas Presentasi : ${submissions.filter((s) => s.type === 'PRESENTASI').length} berkas
- Total Berkas Ujian UTS/UAS    : ${submissions.filter((s) => s.type !== 'PRESENTASI').length} berkas

Catatan Pengesahan:
Seluruh data dalam arsip ZIP ini bersumber dari sistem presensi dan penilaian resmi
STAI Jarinabi Tanjung Jabung Timur Jambi dan telah diverifikasi keabsahannya.

Tanjung Jabung Timur, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
Dosen Pengampu,

( ${course.dosen} )
NIP. ${course.dosenNip}
`;
  zip.file('Pengesahan_dan_Statistik_Semester.txt', summaryDoc);

  // Generate and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Backup_Semester_${safeCourseName}_${safeSemester}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
