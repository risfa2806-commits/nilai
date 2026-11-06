import React, { useState } from 'react';
import { Course, Student, AttendanceStatus, GradeRecord } from '../data/academicData';
import { Printer, Download, X, CheckCircle, FileSpreadsheet, Loader2 } from 'lucide-react';
import {
  exportPresensiToExcel,
  exportUTSToExcel,
  exportUASToExcel,
  exportMasterToExcel,
} from '../utils/excelExport';
import { downloadElementAsPdf } from '../utils/pdfExport';

interface PrintDocumentProps {
  course: Course;
  students: Student[];
  attendanceMap: Record<string, AttendanceStatus[]>;
  gradesMap: Record<string, GradeRecord>;
  docType: 'PRESENSI_16' | 'UTS' | 'UAS' | 'MASTER';
  onClose: () => void;
}

export const PrintDocument: React.FC<PrintDocumentProps> = ({
  course,
  students,
  attendanceMap,
  gradesMap,
  docType,
  onClose,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const getDocTitle = () => {
    switch (docType) {
      case 'UTS':
        return 'REKAPITULASI PENILAIAN UJIAN TENGAH SEMESTER (UTS) — LENGKAP NILAI ABSEN, SIKAP, AKTIF, TUGAS & UTS';
      case 'UAS':
        return 'REKAPITULASI PENILAIAN UJIAN AKHIR SEMESTER (UAS) — LENGKAP NILAI ABSEN, SIKAP, AKTIF, TUGAS, UTS & UAS';
      case 'MASTER':
        return 'LEMBAR REKAPITULASI NILAI KESELURUHAN MASTER P1-P16 (EVALUASI AKADEMIK 100%)';
      default:
        return 'REKAPITULASI PRESENSI KEHADIRAN MAHASISWA PERTEMUAN 1 S/D 16';
    }
  };

  const getPdfFileName = () => {
    const cleanCourse = course.code.replace(/\s+/g, '_');
    switch (docType) {
      case 'UTS':
        return `Rekapan_Nilai_UTS_${cleanCourse}.pdf`;
      case 'UAS':
        return `Rekapan_Nilai_UAS_${cleanCourse}.pdf`;
      case 'MASTER':
        return `Rekapan_Keseluruhan_Master_${cleanCourse}.pdf`;
      default:
        return `Rekap_Presensi_P1_P16_${cleanCourse}.pdf`;
    }
  };

  const handleDownloadDirectPdf = async () => {
    const success = await downloadElementAsPdf('printable-content', getPdfFileName(), setIsGeneratingPdf);
    if (success) {
      alert(`Berkas ${getPdfFileName()} berhasil diunduh ke perangkat Anda!`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    if (docType === 'PRESENSI_16') {
      exportPresensiToExcel(course, students, attendanceMap);
    } else if (docType === 'UTS') {
      exportUTSToExcel(course, students, gradesMap, attendanceMap);
    } else if (docType === 'UAS') {
      exportUASToExcel(course, students, gradesMap, attendanceMap);
    } else {
      exportMasterToExcel(course, students, gradesMap, attendanceMap);
    }
  };

  const sessionHadirCount = Array(16)
    .fill(0)
    .map((_, sIdx) => {
      let count = 0;
      students.forEach((st) => {
        const sess = attendanceMap[st.id] || [];
        if (sess[sIdx] === 'H') count++;
      });
      return count;
    });

  const sessionHadirPct = sessionHadirCount.map((cnt) => {
    if (students.length === 0) return 0;
    return Math.round((cnt / students.length) * 100);
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-start overflow-y-auto p-4 md:p-6 print:p-0 print:bg-white print:static print:inset-auto">
      {/* Top action bar - Hidden during browser print */}
      <div className="w-full max-w-[1240px] mb-4 bg-slate-900 text-white rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xl print:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
          <h2 className="font-bold text-xs md:text-sm">
            Pratinjau Resmi: {course.name} ({docType})
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Direct 1-Click PDF Download Button */}
          <button
            onClick={handleDownloadDirectPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-md transition disabled:opacity-50 cursor-pointer"
            title="Unduh file .PDF langsung ke perangkat Anda"
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isGeneratingPdf ? 'Membuat PDF...' : 'Unduh Berkas .PDF'}</span>
          </button>

          {/* Browser Print / Save as PDF */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-md transition cursor-pointer"
            title="Buka dialog cetak browser (Simpan sebagai PDF / Cetak ke Printer)"
          >
            <Printer className="w-4 h-4" />
            Cetak (Dialog Browser)
          </button>

          {/* Excel Download */}
          <button
            onClick={handleDownloadExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
            title="Unduh berkas Excel resmi ber-rumus"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Unduh Excel (.XLSX)
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
            title="Tutup Pratinjau"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Printable Sheet (Simulates Standard A4 Landscape Paper) */}
      <div
        id="printable-content"
        className="w-full max-w-[1240px] bg-white text-slate-900 p-8 shadow-2xl rounded-sm print:p-0 print:shadow-none print:w-full print:max-w-none text-[11px] leading-tight"
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
      >
        {/* Official Kop Surat Header with STAI Jarinabi Logo */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-3">
          <div className="w-20 h-20 shrink-0 flex items-center justify-center">
            <img
              src="/assets/aistudio/download_fd70491a.jpg"
              alt="Logo STAI Jarinabi"
              crossOrigin="anonymous"
              className="w-18 h-18 object-contain rounded-full border border-slate-300"
            />
          </div>
          <div className="text-center flex-1 px-4">
            <h1 className="text-xl md:text-2xl font-bold tracking-wider text-slate-950 font-serif">
              SEKOLAH TINGGI AGAMA ISLAM (STAI) JARINABI
            </h1>
            <p className="text-xs md:text-sm font-semibold tracking-wide text-slate-800 uppercase mt-0.5">
              SISTEM INFORMASI AKADEMIK (SIAKAD) — PROGRAM STUDI MANAJEMEN PENDIDIKAN ISLAM (MPI)
            </p>
            <p className="text-[11px] text-slate-600 italic">
              Jl. Lintas Timur, Muara Sabak, Kab. Tanjung Jabung Timur, Jambi • Website: www.stai-jarinabi.ac.id
            </p>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5">
              Daftar Rekapitulasi Presensi & Evaluasi Penilaian Akademik Terpadu
            </p>
          </div>
          <div className="w-20 text-right text-[10px] text-slate-600 shrink-0">
            <span className="inline-block px-2 py-1 bg-slate-100 rounded border border-slate-300 font-sans font-semibold">
              KODE RESMI:
              <br />
              SIAKAD-MPI
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center my-3">
          <h2 className="text-base md:text-lg font-bold tracking-wide uppercase underline decoration-2 underline-offset-4 text-slate-900">
            {getDocTitle()}
          </h2>
          <p className="text-xs text-slate-700 mt-1">
            Semester: {course.semester} • Tahun Akademik: {course.academicYear}
          </p>
        </div>

        {/* Course Info Grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 my-3 text-[11px] bg-slate-50/70 p-2.5 rounded border border-slate-200">
          <div className="space-y-1">
            <div className="flex">
              <span className="w-32 font-semibold">Mata Kuliah</span>
              <span className="mr-2">:</span>
              <span className="font-bold text-slate-900">
                {course.name} ({course.code})
              </span>
            </div>
            <div className="flex">
              <span className="w-32 font-semibold">Bobot SKS</span>
              <span className="mr-2">:</span>
              <span>{course.sks} SKS</span>
            </div>
            <div className="flex">
              <span className="w-32 font-semibold">Total Pertemuan</span>
              <span className="mr-2">:</span>
              <span>16 Pertemuan (P1-P7: Kuliah, P8: UTS, P9-P15: Kuliah, P16: UAS)</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex">
              <span className="w-36 font-semibold">Dosen Pengampu</span>
              <span className="mr-2">:</span>
              <span className="font-bold text-slate-900">{course.dosen}</span>
            </div>
            <div className="flex">
              <span className="w-36 font-semibold">Program Studi / Kelas</span>
              <span className="mr-2">:</span>
              <span>{course.prodi}</span>
            </div>
            <div className="flex">
              <span className="w-36 font-semibold">Bobot Nilai</span>
              <span className="mr-2">:</span>
              <span className="font-semibold text-emerald-800">
                Absen 15%, Sikap 15%, Aktif 10%, Tugas 20%, UTS 20%, UAS 20%
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            VIEW 1: REKAP PRESENSI 16 PERTEMUAN (TANPA NIM)
           ========================================================================= */}
        {docType === 'PRESENSI_16' && (
          <div className="overflow-x-auto my-2">
            <table className="w-full border-collapse border border-slate-800 text-center text-[10px]">
              <thead>
                <tr className="bg-[#0b3834] text-white">
                  <th rowSpan={2} className="border border-slate-700 px-1 py-1 w-8 text-center">
                    No
                  </th>
                  <th rowSpan={2} className="border border-slate-700 px-3 py-1 text-left min-w-[200px]">
                    Nama Mahasiswa
                  </th>
                  <th colSpan={16} className="border border-slate-700 py-1 text-center font-bold tracking-wider">
                    Pertemuan Perkuliahan (P1 s/d P16)
                  </th>
                  <th colSpan={4} className="border border-slate-700 py-1 text-center font-bold bg-[#082a27]">
                    Rekapitulasi
                  </th>
                  <th rowSpan={2} className="border border-slate-700 px-1 py-1 w-12 text-center bg-[#09302c]">
                    % Hdr
                  </th>
                  <th rowSpan={2} className="border border-slate-700 px-1 py-1 w-14 text-center bg-[#09302c]">
                    Nilai (15%)
                  </th>
                  <th rowSpan={2} className="border border-slate-700 px-2 py-1 w-20 text-center bg-[#09302c]">
                    Status
                  </th>
                </tr>
                <tr className="bg-[#0f443f] text-white text-[9px]">
                  {Array(16)
                    .fill(0)
                    .map((_, i) => (
                      <th
                        key={i}
                        className={`border border-slate-700 px-0.5 py-1 w-6 text-center ${
                          i === 7 ? 'bg-amber-800 font-extrabold text-amber-100' : ''
                        } ${i === 15 ? 'bg-indigo-900 font-extrabold text-indigo-100' : ''}`}
                      >
                        {i === 7 ? 'P8 UTS' : i === 15 ? 'P16 UAS' : `P${i + 1}`}
                      </th>
                    ))}
                  <th className="border border-slate-700 w-6 py-1 bg-emerald-900 text-emerald-100 font-bold">H</th>
                  <th className="border border-slate-700 w-6 py-1 bg-amber-900 text-amber-100 font-bold">I</th>
                  <th className="border border-slate-700 w-6 py-1 bg-yellow-900 text-yellow-100 font-bold">S</th>
                  <th className="border border-slate-700 w-6 py-1 bg-rose-900 text-rose-100 font-bold">A</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => {
                  const sess = attendanceMap[student.id] || Array(16).fill('-');
                  const hCount = sess.filter((x) => x === 'H').length;
                  const iCount = sess.filter((x) => x === 'I').length;
                  const sCount = sess.filter((x) => x === 'S').length;
                  const aCount = sess.filter((x) => x === 'A').length;
                  const pct = Math.round((hCount / 16) * 100);
                  const nilai15 = Math.round(((hCount / 16) * 100) * 0.15 * 10) / 10;
                  const isMemenuhi = pct >= 75;

                  // Dynamic color indicators: Red strictly for chronic Alfa / permanent Alfa with low presence
                  const isAlfaHighlight = (student.isPermanentAlfa && hCount < 4) || (aCount >= 10 && hCount <= 3);
                  const isIzinTesHighlight = !isAlfaHighlight && (student.isTestIzin || iCount >= 4 || (student.notes && student.notes.toLowerCase().includes('tes')));

                  return (
                    <tr
                      key={student.id}
                      className={`${
                        idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
                      } ${isAlfaHighlight ? 'bg-rose-100/70 font-semibold' : ''} ${
                        isIzinTesHighlight ? 'bg-amber-100/70 font-semibold' : ''
                      }`}
                    >
                      <td className="border border-slate-300 py-1 text-center font-sans text-slate-700">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-300 px-2 py-1 text-left font-medium text-slate-900">
                        {student.name}
                        {isAlfaHighlight && (
                          <span className="block text-[8px] text-rose-700 font-sans font-bold">
                            *ALFA TERUS (TIDAK LULUS)
                          </span>
                        )}
                        {isIzinTesHighlight && (
                          <span className="block text-[8px] text-amber-900 font-sans font-bold">
                            *IZIN DOSEN (UJIAN SUSULAN)
                          </span>
                        )}
                      </td>

                      {/* Boxes for P1-P16: H, I, S, A completely visible and unclipped */}
                      {sess.map((status, sI) => {
                        let cellClass = 'text-slate-400 font-sans';
                        let bgClass = '';
                        if (status === 'H') {
                          cellClass = 'text-emerald-800 font-bold';
                          bgClass = 'bg-emerald-50/70';
                        } else if (status === 'I') {
                          cellClass = 'text-amber-800 font-bold';
                          bgClass = 'bg-amber-100/70';
                        } else if (status === 'S') {
                          cellClass = 'text-yellow-800 font-bold';
                          bgClass = 'bg-yellow-100/60';
                        } else if (status === 'A') {
                          cellClass = 'text-rose-800 font-extrabold';
                          bgClass = 'bg-rose-200/80';
                        }

                        return (
                          <td
                            key={sI}
                            className={`border border-slate-300 p-0 text-center w-6 h-6 text-[10px] ${bgClass} ${
                              sI === 7 ? 'border-r-2 border-r-slate-400' : ''
                            }`}
                          >
                            <span className={`inline-block w-full text-center ${cellClass}`}>
                              {status === '-' ? '-' : status}
                            </span>
                          </td>
                        );
                      })}

                      <td className="border border-slate-300 py-1 text-center font-bold text-emerald-800 bg-emerald-50/50">
                        {hCount}
                      </td>
                      <td className="border border-slate-300 py-1 text-center text-amber-800 bg-amber-50/30">
                        {iCount}
                      </td>
                      <td className="border border-slate-300 py-1 text-center text-yellow-800 bg-yellow-50/30">
                        {sCount}
                      </td>
                      <td className="border border-slate-300 py-1 text-center font-bold text-rose-800 bg-rose-50/40">
                        {aCount}
                      </td>
                      <td className="border border-slate-300 py-1 text-center font-bold font-sans text-slate-800">
                        {pct}%
                      </td>
                      <td className="border border-slate-300 py-1 text-center font-bold font-sans text-slate-900">
                        {nilai15}
                      </td>
                      <td
                        className={`border border-slate-300 py-1 text-center text-[9px] font-bold font-sans ${
                          isAlfaHighlight
                            ? 'text-rose-800 bg-rose-50 font-black'
                            : isIzinTesHighlight
                            ? 'text-amber-900 bg-amber-50 font-black'
                            : isMemenuhi
                            ? 'text-emerald-700'
                            : 'text-amber-800'
                        }`}
                      >
                        {isAlfaHighlight
                          ? 'TIDAK LULUS (ALFA TERUS)'
                          : isIzinTesHighlight
                          ? 'UJIAN SUSULAN (IZIN DOSEN)'
                          : isMemenuhi
                          ? 'MEMENUHI'
                          : 'TIDAK MEMENUHI'}
                      </td>
                    </tr>
                  );
                })}

                {/* Summary Row */}
                <tr className="bg-slate-100 font-bold text-[9px] border-t-2 border-slate-700">
                  <td colSpan={2} className="border border-slate-300 py-1 px-2 text-right">
                    TOTAL HADIR KELAS:
                  </td>
                  {sessionHadirCount.map((cnt, i) => (
                    <td key={i} className="border border-slate-300 py-1 text-center font-sans text-emerald-900">
                      {cnt}
                    </td>
                  ))}
                  <td colSpan={7} className="border border-slate-300 py-1 text-center text-slate-600 font-sans">
                    Roster {students.length} Mahasiswa Lengkap
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* =========================================================================
            VIEW 2: REKAPAN PENILAIAN UTS (TANPA NIM)
           ========================================================================= */}
        {docType === 'UTS' && (
          <div className="overflow-x-auto my-2">
            <table className="w-full border-collapse border border-slate-800 text-center text-[10px]">
              <thead>
                <tr className="bg-[#0b3834] text-white">
                  <th className="border border-slate-700 px-1 py-1.5 w-8">No</th>
                  <th className="border border-slate-700 px-3 py-1.5 text-left min-w-[190px]">
                    Nama Mahasiswa
                  </th>
                  <th className="border border-slate-700 px-1 py-1.5 w-16">Hadir P1-P7</th>
                  <th className="border border-slate-700 px-1 py-1.5 w-14">% Presensi</th>
                  <th className="border border-slate-700 px-1 py-1.5 w-16 bg-[#16504a]">
                    Nilai Absen (15%)
                  </th>
                  <th className="border border-slate-700 px-1 py-1.5 w-16 bg-[#16504a]">
                    Nilai Sikap (15%)
                  </th>
                  <th className="border border-slate-700 px-1 py-1.5 w-16 bg-[#16504a]">
                    Nilai Aktif (10%)
                  </th>
                  <th className="border border-slate-700 px-1 py-1.5 w-20 bg-[#16504a]">
                    Tugas & Pres (20%)
                  </th>
                  <th className="border border-slate-700 px-1 py-1.5 w-18 bg-amber-900 text-amber-100 font-bold">
                    Nilai Murni UTS (40%)
                  </th>
                  <th className="border border-slate-700 px-2 py-1.5 w-20 bg-[#092b28] font-bold">
                    Rekapitulasi UTS
                  </th>
                  <th className="border border-slate-700 px-1 py-1.5 w-12 bg-[#092b28] font-bold">
                    Mutu
                  </th>
                  <th className="border border-slate-700 px-2 py-1.5 w-24">Status Ujian</th>
                  <th className="border border-slate-700 px-2 py-1.5 text-left">Catatan Dosen</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => {
                  const sess = attendanceMap[student.id] || Array(16).fill('-');
                  const p1p7Hadir = sess.slice(0, 7).filter((x) => x === 'H').length;
                  const presensiMidPct = Math.round((p1p7Hadir / 7) * 100);
                  const nilaiAbsen15 = Math.round(presensiMidPct * 0.15 * 10) / 10;
                  const g = gradesMap[student.id] || { sikap: 80, aktif: 80, tugas: 80, uts: 80, uas: 80 };

                  const totalMid = Math.round(
                    nilaiAbsen15 +
                      g.sikap * 0.15 +
                      g.aktif * 0.10 +
                      g.tugas * 0.20 +
                      g.uts * 0.40
                  );

                  let letter = 'E';
                  if (totalMid >= 85) letter = 'A';
                  else if (totalMid >= 80) letter = 'B+';
                  else if (totalMid >= 70) letter = 'B';
                  else if (totalMid >= 65) letter = 'C+';
                  else if (totalMid >= 55) letter = 'C';
                  else if (totalMid >= 40) letter = 'D';

                  const isAlfaHighlight = student.isPermanentAlfa;
                  const isIzinTesHighlight = student.isTestIzin;

                  return (
                    <tr
                      key={student.id}
                      className={`${
                        idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
                      } ${isAlfaHighlight ? 'bg-rose-100/70 font-semibold' : ''} ${
                        isIzinTesHighlight ? 'bg-amber-100/70 font-semibold' : ''
                      }`}
                    >
                      <td className="border border-slate-300 py-1 font-sans">{idx + 1}</td>
                      <td className="border border-slate-300 px-2 py-1 text-left font-medium">
                        {student.name}
                        {isAlfaHighlight && (
                          <span className="block text-[8px] text-rose-700 font-sans font-bold">
                            *ALFA TERUS (TIDAK LULUS)
                          </span>
                        )}
                        {isIzinTesHighlight && (
                          <span className="block text-[8px] text-amber-900 font-sans font-bold">
                            *IZIN DOSEN (UJIAN SUSULAN)
                          </span>
                        )}
                      </td>
                      <td className="border border-slate-300 py-1 font-sans">{p1p7Hadir}</td>
                      <td className="border border-slate-300 py-1 font-sans">{presensiMidPct}%</td>
                      <td className="border border-slate-300 py-1 font-sans font-bold text-teal-900 bg-teal-50/40">
                        {nilaiAbsen15}
                      </td>
                      <td className="border border-slate-300 py-1 font-sans">{g.sikap}</td>
                      <td className="border border-slate-300 py-1 font-sans">{g.aktif}</td>
                      <td className="border border-slate-300 py-1 font-sans">{g.tugas}</td>
                      <td className="border border-slate-300 py-1 font-sans font-bold text-amber-900 bg-amber-50">
                        {g.uts}
                      </td>
                      <td className="border border-slate-300 py-1 font-sans font-bold text-emerald-900 bg-emerald-50 text-[11px]">
                        {totalMid}
                      </td>
                      <td className="border border-slate-300 py-1 font-sans font-bold">{letter}</td>
                      <td
                        className={`border border-slate-300 py-1 font-sans font-bold text-[9px] ${
                          isAlfaHighlight
                            ? 'text-rose-800 bg-rose-50 font-black'
                            : isIzinTesHighlight
                            ? 'text-amber-900 bg-amber-50 font-black'
                            : totalMid < 75
                            ? 'text-amber-900 bg-amber-50 font-bold'
                            : 'text-emerald-700'
                        }`}
                      >
                        {isAlfaHighlight
                          ? 'TIDAK LULUS (ALFA TANPA KETERANGAN)'
                          : isIzinTesHighlight
                          ? 'UJIAN SUSULAN (IZIN DOSEN)'
                          : totalMid < 75
                          ? 'PERLU REMEDIAL (< 75)'
                          : 'SELESAI'}
                      </td>
                      <td className="border border-slate-300 px-2 py-1 text-left text-[9px] text-slate-700 truncate max-w-[150px]">
                        {student.isPermanentAlfa
                          ? 'Alfa terus tanpa keterangan'
                          : student.isTestIzin
                          ? 'Izin resmi dosen (UTS Susulan)'
                          : student.notes || g.catatan || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* =========================================================================
            VIEW 3: REKAPAN PENILAIAN UAS (TANPA NIM)
           ========================================================================= */}
        {docType === 'UAS' && (
          <div className="overflow-x-auto my-2">
            <table className="w-full border-collapse border border-slate-800 text-center text-[10px]">
              <thead>
                <tr className="bg-[#0b3834] text-white">
                  <th className="border border-slate-700 px-1 py-1.5 w-8">No</th>
                  <th className="border border-slate-700 px-3 py-1.5 text-left min-w-[190px]">
                    Nama Mahasiswa
                  </th>
                  <th className="border border-slate-700 px-1 py-1.5 w-14">Kehadiran</th>
                  <th className="border border-slate-700 px-1 py-1.5 w-14">% Presensi</th>
                  <th className="border border-slate-700 px-1 py-1.5 w-16 bg-[#16504a]">
                    Nilai Absen (15%)
                  </th>
                  <th className="border border-slate-700 px-1 py-1.5 w-14 bg-[#16504a]">
                    Sikap (15%)
                  </th>
                  <th className="border border-slate-700 px-1 py-1.5 w-14 bg-[#16504a]">
                    Aktif (10%)
                  </th>
                  <th className="border border-slate-700 px-1 py-1.5 w-18 bg-[#16504a]">
                    Tugas (20%)
                  </th>
                  <th className="border border-slate-700 px-1 py-1.5 w-14 bg-amber-900 text-amber-100 font-bold">
                    UTS (20%)
                  </th>
                  <th className="border border-slate-700 px-1 py-1.5 w-14 bg-indigo-900 text-indigo-100 font-bold">
                    UAS (20%)
                  </th>
                  <th className="border border-slate-700 px-2 py-1.5 w-20 bg-[#092b28] font-bold">
                    Rekapan UAS/Akhir
                  </th>
                  <th className="border border-slate-700 px-1 py-1.5 w-12 bg-[#092b28] font-bold">
                    Mutu
                  </th>
                  <th className="border border-slate-700 px-2 py-1.5 w-22">Status</th>
                  <th className="border border-slate-700 px-2 py-1.5 text-left">Catatan Evaluasi</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => {
                  const sess = attendanceMap[student.id] || Array(16).fill('-');
                  const totalHadir = sess.filter((x) => x === 'H').length;
                  const presensiPct = Math.round((totalHadir / 16) * 100);
                  const nilaiAbsen15 = Math.round(presensiPct * 0.15 * 10) / 10;
                  const g = gradesMap[student.id] || { sikap: 80, aktif: 80, tugas: 80, uts: 80, uas: 80 };

                  const nilaiAkhir = Math.round(
                    nilaiAbsen15 +
                      g.sikap * 0.15 +
                      g.aktif * 0.10 +
                      g.tugas * 0.20 +
                      g.uts * 0.20 +
                      g.uas * 0.20
                  );

                  let letter = 'E';
                  if (nilaiAkhir >= 85) letter = 'A';
                  else if (nilaiAkhir >= 80) letter = 'B+';
                  else if (nilaiAkhir >= 70) letter = 'B';
                  else if (nilaiAkhir >= 65) letter = 'C+';
                  else if (nilaiAkhir >= 55) letter = 'C';
                  else if (nilaiAkhir >= 40) letter = 'D';

                  const isAlfaHighlight = student.isPermanentAlfa;
                  const isIzinTesHighlight = student.isTestIzin;

                  return (
                    <tr
                      key={student.id}
                      className={`${
                        idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
                      } ${isAlfaHighlight ? 'bg-rose-100/70 font-semibold' : ''} ${
                        isIzinTesHighlight ? 'bg-amber-100/70 font-semibold' : ''
                      }`}
                    >
                      <td className="border border-slate-300 py-1 font-sans">{idx + 1}</td>
                      <td className="border border-slate-300 px-2 py-1 text-left font-medium">
                        {student.name}
                        {isAlfaHighlight && (
                          <span className="block text-[8px] text-rose-700 font-sans font-bold">
                            *ALFA TERUS (TIDAK LULUS)
                          </span>
                        )}
                        {isIzinTesHighlight && (
                          <span className="block text-[8px] text-amber-900 font-sans font-bold">
                            *IZIN DOSEN (UJIAN SUSULAN)
                          </span>
                        )}
                      </td>
                      <td className="border border-slate-300 py-1 font-sans">{totalHadir}</td>
                      <td className="border border-slate-300 py-1 font-sans">{presensiPct}%</td>
                      <td className="border border-slate-300 py-1 font-sans font-bold text-teal-900 bg-teal-50/40">
                        {nilaiAbsen15}
                      </td>
                      <td className="border border-slate-300 py-1 font-sans">{g.sikap}</td>
                      <td className="border border-slate-300 py-1 font-sans">{g.aktif}</td>
                      <td className="border border-slate-300 py-1 font-sans">{g.tugas}</td>
                      <td className="border border-slate-300 py-1 font-sans font-bold text-amber-900 bg-amber-50/30">
                        {g.uts}
                      </td>
                      <td className="border border-slate-300 py-1 font-sans font-bold text-indigo-900 bg-indigo-50/30">
                        {g.uas}
                      </td>
                      <td className="border border-slate-300 py-1 font-sans font-bold text-emerald-900 bg-emerald-50 text-[11px]">
                        {nilaiAkhir}
                      </td>
                      <td className="border border-slate-300 py-1 font-sans font-bold">{letter}</td>
                      <td
                        className={`border border-slate-300 py-1 font-sans font-bold text-[9px] ${
                          isAlfaHighlight
                            ? 'text-rose-800 bg-rose-50 font-black'
                            : isIzinTesHighlight
                            ? 'text-amber-900 bg-amber-50 font-black'
                            : nilaiAkhir < 75
                            ? 'text-amber-900 bg-amber-50 font-bold'
                            : nilaiAkhir >= 60
                            ? 'text-emerald-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {isAlfaHighlight
                          ? 'TIDAK LULUS (ALFA TANPA KETERANGAN)'
                          : isIzinTesHighlight
                          ? 'UJIAN SUSULAN (IZIN DOSEN)'
                          : nilaiAkhir < 75
                          ? 'PERLU REMEDIAL (< 75)'
                          : nilaiAkhir >= 60
                          ? 'LULUS MEMUASKAN'
                          : 'TIDAK LULUS'}
                      </td>
                      <td className="border border-slate-300 px-2 py-1 text-left text-[9px] text-slate-700 truncate max-w-[150px]">
                        {student.isPermanentAlfa
                          ? 'Alfa terus tanpa keterangan'
                          : student.isTestIzin
                          ? 'Izin resmi dosen (Ujian Susulan)'
                          : student.notes || g.catatan || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* =========================================================================
            VIEW 4: LEMBAR REKAPITULASI NILAI KESELURUHAN MASTER P1-P16 (TANPA NIM)
           ========================================================================= */}
        {docType === 'MASTER' && (
          <div className="overflow-x-auto my-2">
            <table className="w-full border-collapse border border-slate-800 text-center text-[10px]">
              <thead>
                <tr className="bg-[#0b3834] text-white">
                  <th className="border border-slate-700 px-1 py-1.5 w-8">No</th>
                  <th className="border border-slate-700 px-3 py-1.5 text-left min-w-[190px]">
                    Nama Mahasiswa
                  </th>
                  <th className="border border-slate-700 px-1 py-1.5 w-14">% Presensi</th>
                  <th className="border border-slate-700 px-1 py-1.5 w-16 bg-[#16504a]">
                    Nilai Absen (15%)
                  </th>
                  <th className="border border-slate-700 px-1 py-1.5 w-14 bg-[#16504a]">
                    Sikap (15%)
                  </th>
                  <th className="border border-slate-700 px-1 py-1.5 w-14 bg-[#16504a]">
                    Aktif (10%)
                  </th>
                  <th className="border border-slate-700 px-1 py-1.5 w-18 bg-[#16504a]">
                    Tugas (20%)
                  </th>
                  <th className="border border-slate-700 px-1 py-1.5 w-14 bg-amber-900 text-amber-100 font-bold">
                    UTS (20%)
                  </th>
                  <th className="border border-slate-700 px-1 py-1.5 w-14 bg-indigo-900 text-indigo-100 font-bold">
                    UAS (20%)
                  </th>
                  <th className="border border-slate-700 px-2 py-1.5 w-24 bg-[#092b28] font-bold">
                    REKAPAN KESELURUHAN (100%)
                  </th>
                  <th className="border border-slate-700 px-1 py-1.5 w-12 bg-[#092b28] font-bold">
                    Mutu
                  </th>
                  <th className="border border-slate-700 px-1 py-1.5 w-14 bg-[#092b28] font-bold">
                    Bobot GPA
                  </th>
                  <th className="border border-slate-700 px-2 py-1.5 w-24">Status Kelulusan</th>
                  <th className="border border-slate-700 px-2 py-1.5 text-left">Catatan Akademik</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => {
                  const sess = attendanceMap[student.id] || Array(16).fill('-');
                  const totalHadir = sess.filter((x) => x === 'H').length;
                  const presensiPct = Math.round((totalHadir / 16) * 100);
                  const nilaiAbsen15 = Math.round(presensiPct * 0.15 * 10) / 10;
                  const g = gradesMap[student.id] || { sikap: 80, aktif: 80, tugas: 80, uts: 80, uas: 80 };

                  const nilaiAkhir = Math.round(
                    nilaiAbsen15 +
                      g.sikap * 0.15 +
                      g.aktif * 0.10 +
                      g.tugas * 0.20 +
                      g.uts * 0.20 +
                      g.uas * 0.20
                  );

                  let letter = 'E';
                  let gpa = 0.0;
                  if (nilaiAkhir >= 85) {
                    letter = 'A';
                    gpa = 4.0;
                  } else if (nilaiAkhir >= 80) {
                    letter = 'B+';
                    gpa = 3.5;
                  } else if (nilaiAkhir >= 70) {
                    letter = 'B';
                    gpa = 3.0;
                  } else if (nilaiAkhir >= 65) {
                    letter = 'C+';
                    gpa = 2.5;
                  } else if (nilaiAkhir >= 55) {
                    letter = 'C';
                    gpa = 2.0;
                  } else if (nilaiAkhir >= 40) {
                    letter = 'D';
                    gpa = 1.0;
                  }

                  const isAlfaHighlight = student.isPermanentAlfa;
                  const isIzinTesHighlight = student.isTestIzin;

                  return (
                    <tr
                      key={student.id}
                      className={`${
                        idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
                      } ${isAlfaHighlight ? 'bg-rose-100/70 font-semibold' : ''} ${
                        isIzinTesHighlight ? 'bg-amber-100/70 font-semibold' : ''
                      }`}
                    >
                      <td className="border border-slate-300 py-1 font-sans">{idx + 1}</td>
                      <td className="border border-slate-300 px-2 py-1 text-left font-medium">
                        {student.name}
                        {isAlfaHighlight && (
                          <span className="block text-[8px] text-rose-700 font-sans font-bold">
                            *ALFA TERUS (TIDAK LULUS)
                          </span>
                        )}
                        {isIzinTesHighlight && (
                          <span className="block text-[8px] text-amber-900 font-sans font-bold">
                            *IZIN DOSEN (UJIAN SUSULAN)
                          </span>
                        )}
                      </td>
                      <td className="border border-slate-300 py-1 font-sans">{presensiPct}%</td>
                      <td className="border border-slate-300 py-1 font-sans font-bold text-teal-900 bg-teal-50/40">
                        {nilaiAbsen15}
                      </td>
                      <td className="border border-slate-300 py-1 font-sans">{g.sikap}</td>
                      <td className="border border-slate-300 py-1 font-sans">{g.aktif}</td>
                      <td className="border border-slate-300 py-1 font-sans">{g.tugas}</td>
                      <td className="border border-slate-300 py-1 font-sans font-bold text-amber-900 bg-amber-50/30">
                        {g.uts}
                      </td>
                      <td className="border border-slate-300 py-1 font-sans font-bold text-indigo-900 bg-indigo-50/30">
                        {g.uas}
                      </td>
                      <td className="border border-slate-300 py-1 font-sans font-bold text-emerald-900 bg-emerald-50 text-[11px]">
                        {nilaiAkhir}
                      </td>
                      <td className="border border-slate-300 py-1 font-sans font-bold">{letter}</td>
                      <td className="border border-slate-300 py-1 font-sans font-bold">{gpa.toFixed(1)}</td>
                      <td
                        className={`border border-slate-300 py-1 font-sans font-bold text-[9px] ${
                          isAlfaHighlight
                            ? 'text-rose-800 bg-rose-50 font-black'
                            : isIzinTesHighlight
                            ? 'text-amber-900 bg-amber-50 font-black'
                            : nilaiAkhir < 75
                            ? 'text-amber-900 bg-amber-50 font-bold'
                            : nilaiAkhir >= 60
                            ? 'text-emerald-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {isAlfaHighlight
                          ? 'TIDAK LULUS (ALFA TANPA KETERANGAN)'
                          : isIzinTesHighlight
                          ? 'UJIAN SUSULAN (IZIN DOSEN)'
                          : nilaiAkhir < 75
                          ? 'PERLU REMEDIAL (< 75)'
                          : nilaiAkhir >= 60
                          ? 'LULUS MEMUASKAN'
                          : 'TIDAK LULUS'}
                      </td>
                      <td className="border border-slate-300 px-2 py-1 text-left text-[9px] text-slate-700 truncate max-w-[150px]">
                        {student.isPermanentAlfa
                          ? 'Alfa terus tanpa keterangan'
                          : student.isTestIzin
                          ? 'Izin resmi dosen (Ujian Susulan)'
                          : student.notes || g.catatan || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend Notes */}
        <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-600 mt-2 px-1 font-sans">
          <div>
            <span className="font-bold text-slate-800">Keterangan:</span> H = Hadir | I = Izin | S = Sakit | A = Alfa |
            Tanda Merah = Alfa Permanen | Tanda Kuning = Izin Ikut Tes Resmi.
          </div>
          <div className="italic text-slate-500">
            *Ketentuan Akademik: Mahasiswa berhak mengikuti UAS jika persentase kehadiran sekurang-kurangnya 75%.
          </div>
        </div>

        {/* Signatures Section with Real STAI Jarinabi Digital Stamp & TTD Dosen */}
        <div className="mt-8 pt-4 grid grid-cols-2 gap-8 text-[11px] font-serif break-inside-avoid">
          {/* Left: Kaprodi */}
          <div className="text-center flex flex-col justify-between h-36">
            <div>
              <p className="text-slate-700">Mengetahui,</p>
              <p className="font-bold text-slate-900">
                Ketua Program Studi Manajemen Pendidikan Islam (MPI)
              </p>
            </div>
            <div className="mt-auto">
              <p className="font-bold underline text-slate-900 text-xs">{course.kaprodi}</p>
              <p className="text-[10px] text-slate-700 font-sans">NIDN: {course.kaprodiNidn}</p>
            </div>
          </div>

          {/* Right: Dosen Pengampu with Digital Signature PNG */}
          <div className="text-center flex flex-col justify-between items-center h-36 relative">
            <div>
              <p className="text-slate-700">
                Ditetapkan di: Pasuruan / Tanjung Jabung Timur, 3 November 2026
              </p>
              <p className="font-bold text-slate-900">Dosen Pengampu Mata Kuliah,</p>
            </div>

            {/* Official Signature PNG - Displayed clearly without clipping */}
            <div className="my-1 relative flex flex-col items-center">
              <img
                src="/assets/aistudio/ttd_ulfa-removebg-preview_f8b5de9f.png"
                alt="Tanda Tangan Dosen Risfa Tri Ulfa"
                crossOrigin="anonymous"
                className="h-16 object-contain -my-2.5 z-10"
              />
              {/* Digital Verified Pill Badge */}
              <div className="mt-1 flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-emerald-600 bg-emerald-50/90 text-emerald-800 text-[8px] font-sans font-bold tracking-tight">
                <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                <span>DITANDATANGANI SECARA ELEKTRONIK • SIAKAD DIGITAL</span>
              </div>
            </div>

            <div className="mt-auto">
              <p className="font-bold underline text-slate-900 text-xs">{course.dosen}</p>
              <p className="text-[10px] text-slate-700 font-sans">NIP: {course.dosenNip}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
