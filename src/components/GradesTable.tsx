import React, { useState } from 'react';
import { Course, Student, AttendanceStatus, GradeRecord } from '../data/academicData';
import {
  FileSpreadsheet,
  Printer,
  Award,
  TrendingUp,
  Search,
  CheckCircle,
  AlertTriangle,
  Download,
  Users,
  Settings,
  AlertCircle,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { exportMasterToExcel, exportUTSToExcel, exportUASToExcel } from '../utils/excelExport';

interface GradesTableProps {
  courses: Course[];
  course: Course;
  students: Student[];
  gradesMap: Record<string, GradeRecord>;
  attendanceMap: Record<string, AttendanceStatus[]>;
  onSelectCourse: (id: string) => void;
  onUpdateGrade: (studentId: string, updated: Partial<GradeRecord>) => void;
  onResetCourseData?: (courseId: string) => void;
  onOpenPrint: (type: 'PRESENSI_16' | 'UTS' | 'UAS' | 'MASTER') => void;
  onOpenExportModal: () => void;
  onOpenStudentManager: () => void;
  onOpenCourseSettings: () => void;
}

export const GradesTable: React.FC<GradesTableProps> = ({
  courses,
  course,
  students,
  gradesMap,
  attendanceMap,
  onSelectCourse,
  onUpdateGrade,
  onResetCourseData,
  onOpenPrint,
  onOpenExportModal,
  onOpenStudentManager,
  onOpenCourseSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'MASTER' | 'UTS_ONLY' | 'UAS_ONLY'>('MASTER');
  const [kkmThreshold, setKkmThreshold] = useState<number>(75); // Standar KKM default 75

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to determine styling for scores below KKM
  const getScoreCellClass = (score: number, isPermanentZero?: boolean) => {
    if (isPermanentZero || score === 0) {
      return 'bg-rose-100 text-rose-900 border-rose-300 font-bold';
    }
    if (score < kkmThreshold) {
      // Di bawah KKM: Berubah warna oranye/kuning sebagai peringatan nilai kurang
      return 'bg-amber-100 text-amber-950 border-amber-400 font-extrabold ring-1 ring-amber-300';
    }
    return 'bg-white text-slate-800 border-slate-300 font-medium';
  };

  const studentEvaluations = filteredStudents.map((student) => {
    const sess = attendanceMap[student.id] || Array(16).fill('-');
    const hCount = sess.filter((x) => x === 'H').length;
    const aCount = sess.filter((x) => x === 'A').length;
    const iCount = sess.filter((x) => x === 'I').length;
    const presensiPct = Math.round((hCount / 16) * 100);
    const presensiWeighted = Math.round(presensiPct * 0.15 * 10) / 10;

    // Presensi Mid (Pertemuan 1 - 7 / 8)
    const p1p7Hadir = sess.slice(0, 7).filter((x) => x === 'H').length;
    const presensiMidPct = Math.round((p1p7Hadir / 7) * 100);
    const presensiMidWeighted = Math.round(presensiMidPct * 0.15 * 10) / 10;

    const g = gradesMap[student.id] || { sikap: 80, aktif: 80, tugas: 80, uts: 80, uas: 80 };

    // 1. Rekapan UTS (Mid - TIDAK ADA UAS SAMA SEKALI):
    // Komponen: Absen Mid (15%) + Sikap (15%) + Aktif (10%) + Tugas & Pres (20%) + Nilai Murni UTS (40%) = 100%
    const totalMidScore = student.isPermanentAlfa
      ? 0
      : Math.round(
          presensiMidWeighted +
            g.sikap * 0.15 +
            g.aktif * 0.10 +
            g.tugas * 0.20 +
            g.uts * 0.40
        );

    let midLetter = 'E';
    if (totalMidScore >= 85) midLetter = 'A';
    else if (totalMidScore >= 80) midLetter = 'B+';
    else if (totalMidScore >= 70) midLetter = 'B';
    else if (totalMidScore >= 65) midLetter = 'C+';
    else if (totalMidScore >= 55) midLetter = 'C';
    else if (totalMidScore >= 40) midLetter = 'D';

    // 2. Rekapan UAS & Keseluruhan (Master - ADA UTS & UAS):
    // Komponen: Absen (15%) + Sikap (15%) + Aktif (10%) + Tugas & Pres (20%) + UTS (20%) + UAS (20%) = 100%
    const totalScore = student.isPermanentAlfa
      ? 0
      : Math.round(
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
    } else {
      letter = 'E';
      gpa = 0.0;
    }

    const currentTotal = activeTab === 'UTS_ONLY' ? totalMidScore : totalScore;
    const currentLetter = activeTab === 'UTS_ONLY' ? midLetter : letter;
    const isPassed = currentTotal >= 60;
    const isBelowKkm = currentTotal < kkmThreshold;
    // Dynamic Red: Only if true permanent alfa with low attendance OR chronic unexcused alfas (>=10 Alfas and <=3 Hadir)
    // If student attendance was changed to Hadir/Izin (like Rafi), isAlfaRow is strictly false
    const isAlfaRow = (student.isPermanentAlfa && hCount < 4) || (aCount >= 10 && hCount <= 3);
    // Dynamic Yellow: Official excuse / exam retake note / high izin
    const isTestRow = !isAlfaRow && (student.isTestIzin || iCount >= 4 || (student.notes && student.notes.toLowerCase().includes('tes')) || (g.catatan && g.catatan.toLowerCase().includes('susulan')));

    return {
      student,
      presensiPct,
      presensiWeighted,
      presensiMidPct,
      presensiMidWeighted,
      grade: g,
      totalScore,
      totalMidScore,
      currentTotal,
      currentLetter,
      letter,
      midLetter,
      gpa,
      isPassed,
      isBelowKkm,
      isAlfaRow,
      isTestRow,
    };
  });

  const scores = studentEvaluations.map((e) => e.currentTotal);
  const avgScore = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;
  const maxScore = scores.length ? Math.max(...scores) : 0;
  const belowKkmCount = studentEvaluations.filter((e) => e.isBelowKkm).length;

  return (
    <div className="space-y-4">
      {/* Course Indicator & Quick Switcher Banner */}
      <div className="bg-gradient-to-r from-[#0b3834] via-[#0f443f] to-[#134e4a] text-white p-4 rounded-xl shadow-md flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border border-emerald-900">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase shadow-2xs">
              {course.prodiGroup === 'MPI_3' ? 'KELAS MPI 3' : 'KELAS MPI 1'}
            </span>
            <span className="text-teal-200 text-xs font-mono font-bold tracking-wider">
              {course.code}
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-emerald-300 text-xs font-semibold">{course.sks} SKS</span>
          </div>
          <h2 className="text-lg md:text-xl font-extrabold tracking-wide text-white mt-0.5">
            {course.name}
          </h2>
          <p className="text-xs text-teal-100/90 mt-1">
            {course.semester} • Dosen: <span className="font-semibold text-white">{course.dosen}</span> • Kaprodi:{' '}
            <span className="font-semibold text-white">{course.kaprodi}</span>
          </p>
        </div>

        {/* Quick Switcher Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/30 p-1.5 rounded-xl border border-teal-500/20">
          <span className="text-[11px] font-bold text-teal-200 px-1">Pilih MK:</span>
          {courses.map((c) => {
            const isSelected = c.id === course.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectCourse(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                title={`Buka rekapan nilai ${c.name}`}
              >
                <span className="text-[9px] px-1 py-0.2 rounded bg-black/20">
                  {c.id === 'kmp' ? 'MPI 3' : c.id === 'akpi' ? 'MPI 3' : 'MPI 1'}
                </span>
                <span>
                  {c.id === 'kmp'
                    ? 'Konsep Dasar MP'
                    : c.id === 'akpi'
                    ? 'Analisis Kebijakan PI'
                    : 'Filsafat Ilmu'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Rata-rata Nilai Kelas</p>
            <h3 className="text-xl font-bold text-slate-800">{avgScore} / 100</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Nilai Tertinggi</p>
            <h3 className="text-xl font-bold text-emerald-700">{maxScore}</h3>
          </div>
        </div>

        {/* Card for Nilai di bawah KKM */}
        <div className="bg-white p-4 rounded-xl border border-amber-300 shadow-xs flex items-center gap-3 bg-amber-50/30">
          <div className="w-10 h-10 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center font-bold">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-900">Di Bawah KKM (&lt; {kkmThreshold})</p>
            <h3 className="text-xl font-black text-amber-900">
              {belowKkmCount} Mahasiswa
            </h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Perhatian Khusus</p>
            <p className="text-xs font-bold text-slate-800">
              {course.prodiGroup === 'MPI_3' ? '2 Mhs (Irfan & Milhan)' : 'Roster Aktif'}
            </p>
          </div>
        </div>
      </div>

      {/* Control Bar with Adjustable KKM and Direct PDF Download Buttons */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium w-full lg:w-auto">
            <button
              onClick={() => setActiveTab('MASTER')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                activeTab === 'MASTER'
                  ? 'bg-white text-teal-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rekapan Nilai Keseluruhan (Master 100%)
            </button>
            <button
              onClick={() => setActiveTab('UTS_ONLY')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                activeTab === 'UTS_ONLY'
                  ? 'bg-white text-amber-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rekapan Nilai UTS (Mid — Tanpa UAS)
            </button>
            <button
              onClick={() => setActiveTab('UAS_ONLY')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                activeTab === 'UAS_ONLY'
                  ? 'bg-white text-indigo-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rekapan Nilai UAS (Akhir — Lengkap UTS & UAS)
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari Nama Mahasiswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-44"
              />
            </div>

            {/* Adjustable KKM threshold input */}
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 rounded-lg px-2.5 py-1 text-xs">
              <span className="font-bold text-amber-900">Batas KKM:</span>
              <input
                type="number"
                min="50"
                max="100"
                value={kkmThreshold}
                onChange={(e) => setKkmThreshold(Number(e.target.value) || 75)}
                className="w-12 text-center font-bold bg-white border border-amber-300 rounded py-0.5 text-xs focus:ring-1 focus:ring-amber-500"
                title="Atur nilai KKM. Nilai di bawah KKM otomatis berwarna oranye/kuning"
              />
            </div>

            {/* Direct PDF Download / Preview Button - Highly prominent */}
            <button
              onClick={() => {
                if (activeTab === 'UTS_ONLY') onOpenPrint('UTS');
                else if (activeTab === 'UAS_ONLY') onOpenPrint('UAS');
                else onOpenPrint('MASTER');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-lg text-xs shadow-md transition cursor-pointer"
              title="Pratinjau & Unduh File .PDF Resmi Ber-TTD"
            >
              <Printer className="w-4 h-4" />
              <span>Unduh / Cetak PDF</span>
            </button>

            {/* Direct Excel download for active view */}
            <button
              onClick={() => {
                if (activeTab === 'UTS_ONLY') exportUTSToExcel(course, students, gradesMap, attendanceMap);
                else if (activeTab === 'UAS_ONLY') exportUASToExcel(course, students, gradesMap, attendanceMap);
                else exportMasterToExcel(course, students, gradesMap, attendanceMap);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-xs transition cursor-pointer"
              title="Unduh berkas Excel resmi ber-rumus"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel (.XLSX)</span>
            </button>

            {/* Open Full Export Modal Button */}
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs shadow-md transition cursor-pointer"
              title="Pusat Pilihan Unduh Semua Dokumen Nilai"
            >
              <Download className="w-4 h-4" />
              <span>Pusat Unduh</span>
            </button>

            {/* Reset / Sinkronkan Data Standar MK Ini */}
            {onResetCourseData && (
              <button
                onClick={() => {
                  if (
                    confirm(
                      `Apakah Anda ingin mereset/sinkronkan nilai dan presensi khusus Mata Kuliah ${course.name} kembali ke data standar kurikulumnya?`
                    )
                  ) {
                    onResetCourseData(course.id);
                  }
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition cursor-pointer"
                title={`Sinkronkan nilai unik standar mata kuliah ${course.name}`}
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Reset MK Ini</span>
              </button>
            )}
          </div>
        </div>

        {/* Legend for KKM Highlighting */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-700">Penandaan Otomatis:</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-400 font-extrabold text-[11px]">
              🟡 Sel Oranye/Kuning: Nilai Kurang (&lt; KKM {kkmThreshold})
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300 font-bold text-[11px]">
              🔴 Sel Merah: Alfa / Nol
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-300 text-[11px]">
              ⚪ Sel Putih: Memenuhi KKM (≥ {kkmThreshold})
            </span>
          </div>

          <div className="text-[11px] text-slate-500 italic">
            *Anda dapat langsung menyunting nilai di dalam tabel (inline edit)
          </div>
        </div>
      </div>

      {/* Main Grades Table - TANPA NIM & DENGAN WARNA ORANYE/KUNING OTOMATIS */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-center">
            <thead>
              <tr className="bg-[#0b3834] text-white text-xs">
                <th className="py-2.5 px-2 border-r border-[#134e4a] w-10">No</th>
                <th className="py-2.5 px-4 border-r border-[#134e4a] text-left min-w-[220px]">
                  Nama Mahasiswa
                </th>
                <th className="py-2.5 px-2 border-r border-[#134e4a] w-24">
                  {activeTab === 'UTS_ONLY' ? 'Absen P1-7 (15%)' : 'Nilai Absen (15%)'}
                </th>
                <th className="py-2.5 px-2 border-r border-[#134e4a] w-20">Nilai Sikap (15%)</th>
                <th className="py-2.5 px-2 border-r border-[#134e4a] w-20">Nilai Aktif (10%)</th>
                <th className="py-2.5 px-2 border-r border-[#134e4a] w-24">Tugas & Pres (20%)</th>
                <th className="py-2.5 px-2 border-r border-[#134e4a] w-20 bg-[#16504a]">
                  {activeTab === 'UTS_ONLY' ? 'Nilai UTS (40%)' : 'Nilai UTS (20%)'}
                </th>
                {activeTab !== 'UTS_ONLY' && (
                  <th className="py-2.5 px-2 border-r border-[#134e4a] w-20 bg-[#16504a]">Nilai UAS (20%)</th>
                )}
                <th className="py-2.5 px-2 border-r border-[#134e4a] w-28 bg-[#092b28] font-bold">
                  {activeTab === 'UTS_ONLY'
                    ? 'REKAPAN NILAI UTS'
                    : activeTab === 'UAS_ONLY'
                    ? 'REKAPAN AKHIR (UAS)'
                    : 'REKAPAN KESELURUHAN'}
                </th>
                <th className="py-2.5 px-2 border-r border-[#134e4a] w-16 bg-[#092b28] font-bold">
                  {activeTab === 'UTS_ONLY' ? 'Mutu UTS' : 'Mutu'}
                </th>
                {activeTab === 'MASTER' && (
                  <th className="py-2.5 px-2 border-r border-[#134e4a] w-16 bg-[#092b28] font-bold">Bobot</th>
                )}
                <th className="py-2.5 px-3 border-r border-[#134e4a] w-28">
                  {activeTab === 'UTS_ONLY' ? 'Status Ujian' : 'Status'}
                </th>
                <th className="py-2.5 px-3 text-left min-w-[180px]">Catatan Dosen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {studentEvaluations.map((item, rowIdx) => {
                const {
                  student,
                  presensiPct,
                  presensiWeighted,
                  presensiMidPct,
                  presensiMidWeighted,
                  grade,
                  totalScore,
                  totalMidScore,
                  currentTotal,
                  currentLetter,
                  letter,
                  midLetter,
                  gpa,
                  isPassed,
                  isBelowKkm,
                  isAlfaRow,
                  isTestRow,
                } = item;

                return (
                  <tr
                    key={student.id}
                    className={`hover:bg-slate-50/80 transition ${
                      isAlfaRow
                        ? 'bg-rose-50/80'
                        : isTestRow
                        ? 'bg-amber-50/80'
                        : rowIdx % 2 === 1
                        ? 'bg-slate-50/40'
                        : 'bg-white'
                    }`}
                  >
                    <td className="py-2 px-2 border-r border-slate-200 text-slate-500 font-mono text-[11px]">
                      {rowIdx + 1}
                    </td>
                    <td className="py-2 px-4 border-r border-slate-200 text-left font-medium text-slate-900">
                      <div>
                        <span className="font-semibold text-slate-950">{student.name}</span>
                        {isAlfaRow && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                            Alfa Terus Tanpa Keterangan (TIDAK LULUS)
                          </span>
                        )}
                        {isTestRow && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-900 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Izin Resmi Dosen (UJIAN SUSULAN)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Presensi - Automatic highlight if presensi percentage < KKM */}
                    <td className="py-2 px-2 border-r border-slate-200">
                      {activeTab === 'UTS_ONLY' ? (
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-mono text-[11px] border ${
                            presensiMidPct < kkmThreshold
                              ? 'bg-amber-100 text-amber-950 border-amber-400 font-bold'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                          title={presensiMidPct < kkmThreshold ? `Presensi P1-7 di bawah KKM ${kkmThreshold}%` : 'Memenuhi'}
                        >
                          {presensiMidPct}% ({presensiMidWeighted})
                        </span>
                      ) : (
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-mono text-[11px] border ${
                            presensiPct < kkmThreshold
                              ? 'bg-amber-100 text-amber-950 border-amber-400 font-bold'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                          title={presensiPct < kkmThreshold ? `Presensi di bawah KKM ${kkmThreshold}%` : 'Memenuhi'}
                        >
                          {presensiPct}% ({presensiWeighted})
                        </span>
                      )}
                    </td>

                    {/* Sikap - Colored cell if < KKM */}
                    <td className="py-1 px-1 border-r border-slate-200">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={grade.sikap}
                        onChange={(e) =>
                          onUpdateGrade(student.id, { sikap: Math.min(100, Math.max(0, Number(e.target.value))) })
                        }
                        className={`w-14 text-center py-1 rounded font-mono text-xs border focus:ring-1 focus:ring-teal-500 ${getScoreCellClass(
                          grade.sikap,
                          student.isPermanentAlfa
                        )}`}
                        title={grade.sikap < kkmThreshold ? `Sikap di bawah KKM (${kkmThreshold})` : ''}
                      />
                    </td>

                    {/* Aktif - Colored cell if < KKM */}
                    <td className="py-1 px-1 border-r border-slate-200">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={grade.aktif}
                        onChange={(e) =>
                          onUpdateGrade(student.id, { aktif: Math.min(100, Math.max(0, Number(e.target.value))) })
                        }
                        className={`w-14 text-center py-1 rounded font-mono text-xs border focus:ring-1 focus:ring-teal-500 ${getScoreCellClass(
                          grade.aktif,
                          student.isPermanentAlfa
                        )}`}
                        title={grade.aktif < kkmThreshold ? `Keaktifan di bawah KKM (${kkmThreshold})` : ''}
                      />
                    </td>

                    {/* Tugas - Colored cell if < KKM */}
                    <td className="py-1 px-1 border-r border-slate-200">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={grade.tugas}
                        onChange={(e) =>
                          onUpdateGrade(student.id, { tugas: Math.min(100, Math.max(0, Number(e.target.value))) })
                        }
                        className={`w-14 text-center py-1 rounded font-mono text-xs border focus:ring-1 focus:ring-teal-500 ${getScoreCellClass(
                          grade.tugas,
                          student.isPermanentAlfa
                        )}`}
                        title={grade.tugas < kkmThreshold ? `Tugas di bawah KKM (${kkmThreshold})` : ''}
                      />
                    </td>

                    {/* UTS - Colored cell if < KKM */}
                    <td className="py-1 px-1 border-r border-slate-200">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={grade.uts}
                        onChange={(e) =>
                          onUpdateGrade(student.id, { uts: Math.min(100, Math.max(0, Number(e.target.value))) })
                        }
                        className={`w-14 text-center py-1 rounded font-mono text-xs border focus:ring-1 focus:ring-amber-500 ${getScoreCellClass(
                          grade.uts,
                          student.isPermanentAlfa
                        )}`}
                        title={grade.uts < kkmThreshold ? `UTS di bawah KKM (${kkmThreshold})` : ''}
                      />
                    </td>

                    {/* UAS - Colored cell if < KKM - ONLY RENDER IF NOT UTS_ONLY */}
                    {activeTab !== 'UTS_ONLY' && (
                      <td className="py-1 px-1 border-r border-slate-200">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={grade.uas}
                          onChange={(e) =>
                            onUpdateGrade(student.id, { uas: Math.min(100, Math.max(0, Number(e.target.value))) })
                          }
                          className={`w-14 text-center py-1 rounded font-mono text-xs border focus:ring-1 focus:ring-indigo-500 ${getScoreCellClass(
                            grade.uas,
                            student.isPermanentAlfa
                          )}`}
                          title={grade.uas < kkmThreshold ? `UAS di bawah KKM (${kkmThreshold})` : ''}
                        />
                      </td>
                    )}

                    {/* REKAPAN (100% or Mid) - Highlighting < KKM with Orange/Yellow */}
                    <td className="py-2 px-2 border-r border-slate-200">
                      <span
                        className={`inline-block px-3 py-1 rounded-md text-xs font-black font-mono border ${
                          student.isPermanentAlfa || currentTotal === 0
                            ? 'bg-rose-100 text-rose-900 border-rose-300'
                            : isBelowKkm
                            ? 'bg-amber-100 text-amber-950 border-amber-400 ring-2 ring-amber-300'
                            : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        }`}
                        title={isBelowKkm ? `Peringatan: Nilai Rekapan di bawah KKM (${kkmThreshold})` : 'Tuntas'}
                      >
                        {currentTotal}
                      </span>
                    </td>

                    {/* Letter Grade */}
                    <td className="py-2 px-2 border-r border-slate-200 font-bold text-slate-800">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 font-mono">
                        {currentLetter}
                      </span>
                    </td>

                    {/* GPA / Bobot - ONLY RENDER IF activeTab === 'MASTER' */}
                    {activeTab === 'MASTER' && (
                      <td className="py-2 px-2 border-r border-slate-200 font-bold text-slate-800">
                        <span className="inline-block px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-mono">
                          {gpa.toFixed(1)}
                        </span>
                      </td>
                    )}

                    {/* Status with explicit wording */}
                    <td className="py-2 px-3 border-r border-slate-200">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] whitespace-nowrap ${
                          isAlfaRow
                            ? 'bg-rose-100 text-rose-900 border border-rose-400 font-extrabold shadow-2xs'
                            : isTestRow
                            ? 'bg-amber-100 text-amber-950 border border-amber-400 font-black shadow-2xs ring-1 ring-amber-300'
                            : isBelowKkm
                            ? 'bg-amber-100 text-amber-950 border border-amber-400 font-black ring-1 ring-amber-300'
                            : isPassed
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold'
                            : 'bg-rose-100 text-rose-800 border border-rose-300 font-bold'
                        }`}
                      >
                        {isAlfaRow
                          ? 'TIDAK LULUS (ALFA TANPA KETERANGAN)'
                          : isTestRow
                          ? 'UJIAN SUSULAN (IZIN DOSEN)'
                          : isBelowKkm
                          ? `PERLU REMEDIAL (< ${kkmThreshold})`
                          : activeTab === 'UTS_ONLY'
                          ? 'SELESAI EVALUASI UTS'
                          : isPassed
                          ? 'LULUS MEMUASKAN'
                          : 'TIDAK LULUS'}
                      </span>
                    </td>

                    {/* Notes */}
                    <td className="py-1 px-2 text-left">
                      <input
                        type="text"
                        value={grade.catatan || student.notes || ''}
                        placeholder={
                          isAlfaRow
                            ? 'Alfa terus tanpa keterangan...'
                            : isTestRow
                            ? 'Izin resmi dosen (Ujian Susulan)...'
                            : isBelowKkm
                            ? 'Perlu remedial / tugas perbaikan...'
                            : 'Catatan dosen...'
                        }
                        onChange={(e) => onUpdateGrade(student.id, { catatan: e.target.value })}
                        className="w-full text-xs py-1 px-2 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-teal-500 rounded transition"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
