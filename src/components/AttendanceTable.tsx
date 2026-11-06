import React, { useState } from 'react';
import { Course, Student, AttendanceStatus } from '../data/academicData';
import {
  FileSpreadsheet,
  Printer,
  Search,
  Users,
  Settings,
  AlertCircle,
  Info,
} from 'lucide-react';
import { exportPresensiToExcel } from '../utils/excelExport';

interface AttendanceTableProps {
  courses: Course[];
  course: Course;
  students: Student[];
  attendanceMap: Record<string, AttendanceStatus[]>;
  onSelectCourse: (id: string) => void;
  onUpdateAttendance: (studentId: string, sessionIndex: number, status: AttendanceStatus) => void;
  onSetAllPresent: (sessionIndex: number) => void;
  onOpenPrint: (type: 'PRESENSI_16' | 'UTS' | 'UAS' | 'MASTER') => void;
  onOpenStudentManager: () => void;
  onOpenCourseSettings: () => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  courses,
  course,
  students,
  attendanceMap,
  onSelectCourse,
  onUpdateAttendance,
  onSetAllPresent,
  onOpenPrint,
  onOpenStudentManager,
  onOpenCourseSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterView, setFilterView] = useState<'ALL' | 'MID_1_6' | 'UAS_7_9'>('ALL');
  const [selectedSessionForBulk, setSelectedSessionForBulk] = useState<number>(0);

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCellClick = (studentId: string, sIndex: number, current: AttendanceStatus) => {
    const cycle: Record<AttendanceStatus, AttendanceStatus> = {
      '-': 'H',
      H: 'I',
      I: 'S',
      S: 'A',
      A: '-',
    };
    const next = cycle[current] || 'H';
    onUpdateAttendance(studentId, sIndex, next);
  };

  const visibleSessionIndices =
    filterView === 'MID_1_6'
      ? [0, 1, 2, 3, 4, 5, 7]
      : filterView === 'UAS_7_9'
      ? [6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
      : Array.from({ length: 16 }, (_, i) => i);

  const totalStudents = students.length;
  const eligibleCount = students.filter((s) => {
    const sess = attendanceMap[s.id] || [];
    const h = sess.filter((x) => x === 'H').length;
    return (h / 16) * 100 >= 75;
  }).length;

  return (
    <div className="space-y-4">
      {/* Top Banner and Actions */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                {course.code}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900 uppercase">
                {course.prodiGroup === 'MPI_3' ? 'MPI 3' : 'MPI 1'}
              </span>
              <h2 className="text-lg font-bold text-slate-800">{course.name}</h2>
              <button
                onClick={onOpenCourseSettings}
                className="p-1 text-slate-400 hover:text-teal-700 rounded transition cursor-pointer"
                title="Sunting Nama MK, Semester, Dosen & Kaprodi"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {course.semester} • Dosen: <span className="font-semibold text-slate-700">{course.dosen}</span> •
              Kaprodi: <span className="font-semibold text-slate-700">{course.kaprodi}</span>
            </p>

            {/* Quick Switch Pills */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1">
              <span className="text-[11px] font-bold text-slate-500 mr-1">Mata Kuliah:</span>
              {courses.map((c) => {
                const isSelected = c.id === course.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => onSelectCourse(c.id)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-teal-800 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {c.id === 'kmp' ? 'Konsep Dasar MP' : c.id === 'akpi' ? 'Analisis Kebijakan PI' : 'Filsafat Ilmu'}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Student Manager / Import Button */}
            <button
              onClick={onOpenStudentManager}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              title="Edit nama mahasiswa atau impor dari Excel / Word"
            >
              <Users className="w-4 h-4" />
              <span>Kelola Mahasiswa ({students.length})</span>
            </button>

            {/* Excel Download */}
            <button
              onClick={() => exportPresensiToExcel(course, students, attendanceMap)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              title="Unduh Spreadsheet Presensi P1-P16"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Unduh Excel (.XLSX)</span>
            </button>

            {/* PDF / Print Document */}
            <button
              onClick={() => onOpenPrint('PRESENSI_16')}
              className="flex items-center gap-1.5 px-3 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              title="Pratinjau & Unduh PDF Presensi Ber-TTD"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Unduh PDF</span>
            </button>
          </div>
        </div>

        {/* View Switcher, Search, and Bulk Tools */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium w-full md:w-auto">
            <button
              onClick={() => setFilterView('ALL')}
              className={`px-3 py-1.5 rounded-md transition ${
                filterView === 'ALL'
                  ? 'bg-white text-teal-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Sesi (P1 - P16 Master)
            </button>
            <button
              onClick={() => setFilterView('MID_1_6')}
              className={`px-3 py-1.5 rounded-md transition ${
                filterView === 'MID_1_6'
                  ? 'bg-white text-amber-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fokus UTS (P1-P6 & UTS)
            </button>
            <button
              onClick={() => setFilterView('UAS_7_9')}
              className={`px-3 py-1.5 rounded-md transition ${
                filterView === 'UAS_7_9'
                  ? 'bg-white text-indigo-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fokus UAS (P7-P9 & UAS)
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari Nama Mahasiswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs w-full md:w-auto">
            <span className="text-slate-600 whitespace-nowrap">Isi Hadir Sesi:</span>
            <select
              value={selectedSessionForBulk}
              onChange={(e) => setSelectedSessionForBulk(Number(e.target.value))}
              className="text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1"
            >
              {Array.from({ length: 16 }, (_, idx) => (
                <option key={idx} value={idx}>
                  {idx === 7 ? 'P8 (UTS)' : idx === 15 ? 'P16 (UAS)' : `P${idx + 1}`}
                </option>
              ))}
            </select>
            <button
              onClick={() => onSetAllPresent(selectedSessionForBulk)}
              className="px-2.5 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 rounded text-xs font-semibold transition"
            >
              Set Semua Hadir
            </button>
          </div>
        </div>
      </div>

      {/* Special Highlights Info Box if in MPI 3 */}
      {course.prodiGroup === 'MPI_3' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-rose-50 border-l-4 border-rose-500 p-3 rounded-r-lg flex items-start gap-2 text-xs text-rose-900 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Otomatis Merah: Muhammad Irfan</span>
              <p className="text-[11px] text-rose-800 mt-0.5">
                Tidak ada orangnya dan tidak pernah datang perkuliahan sejak awal (Alfa permanen). Baris otomatis ditandai merah.
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg flex items-start gap-2 text-xs text-amber-900 shadow-xs">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Otomatis Kuning: M. Milhan Aufa Zahran</span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Izin terus karena mengikuti Test Pendidikan resmi. Baris otomatis ditandai kuning dan berhak mengikuti UTS susulan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Matrix Table - TANPA NIM */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-center">
            <thead>
              <tr className="bg-[#0b3834] text-white text-xs">
                <th className="py-2.5 px-2 border-r border-[#134e4a] w-10 text-center font-bold">No</th>
                <th className="py-2.5 px-4 border-r border-[#134e4a] text-left min-w-[220px] font-bold">
                  Nama Mahasiswa
                </th>

                {/* Visible Sessions */}
                {visibleSessionIndices.map((idx) => {
                  const isUTS = idx === 7;
                  const isUAS = idx === 15;
                  return (
                    <th
                      key={idx}
                      className={`py-2 px-1 border-r border-[#134e4a] min-w-[42px] text-center text-[11px] font-bold ${
                        isUTS ? 'bg-amber-800 text-amber-100' : isUAS ? 'bg-indigo-900 text-indigo-100' : ''
                      }`}
                    >
                      {isUTS ? 'P8 (UTS)' : isUAS ? 'P16 (UAS)' : `P${idx + 1}`}
                    </th>
                  );
                })}

                {/* Rekap H I S A */}
                <th className="py-2 px-2 border-r border-[#134e4a] min-w-[36px] bg-[#09302c] text-emerald-200 font-bold">
                  H
                </th>
                <th className="py-2 px-2 border-r border-[#134e4a] min-w-[36px] bg-[#09302c] text-amber-200 font-bold">
                  I
                </th>
                <th className="py-2 px-2 border-r border-[#134e4a] min-w-[36px] bg-[#09302c] text-yellow-200 font-bold">
                  S
                </th>
                <th className="py-2 px-2 border-r border-[#134e4a] min-w-[36px] bg-[#09302c] text-rose-200 font-bold">
                  A
                </th>
                <th className="py-2 px-2 border-r border-[#134e4a] min-w-[65px] bg-[#082825] font-bold">% Hdr</th>
                <th className="py-2 px-2 border-r border-[#134e4a] min-w-[70px] bg-[#082825] font-bold">Nilai 15%</th>
                <th className="py-2 px-3 min-w-[100px] bg-[#082825] font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredStudents.map((student, rowIdx) => {
                const sessions = attendanceMap[student.id] || Array(16).fill('-');
                const hCount = sessions.filter((x) => x === 'H').length;
                const iCount = sessions.filter((x) => x === 'I').length;
                const sCount = sessions.filter((x) => x === 'S').length;
                const aCount = sessions.filter((x) => x === 'A').length;
                const percentage = Math.round((hCount / 16) * 100);
                const score15 = Math.round(((hCount / 16) * 100) * 0.15 * 10) / 10;
                const isMemenuhi = percentage >= 75;

                // Automatic Color Coding:
                // Red strictly for permanent alfa with low presence or >=10 alfas with <=3 presence
                // If student attendance was changed to Hadir/Izin (like Rafi), isAlfaRow is false
                const isAlfaRow = (student.isPermanentAlfa && hCount < 4) || (aCount >= 10 && hCount <= 3);
                // Yellow for test excuse or high izin
                const isTestRow = !isAlfaRow && (student.isTestIzin || iCount >= 4 || (student.notes && student.notes.toLowerCase().includes('tes')));

                return (
                  <tr
                    key={student.id}
                    className={`hover:bg-slate-50/80 transition ${
                      isAlfaRow
                        ? 'bg-rose-50/80 hover:bg-rose-100/70'
                        : isTestRow
                        ? 'bg-amber-50/80 hover:bg-amber-100/70'
                        : rowIdx % 2 === 1
                        ? 'bg-slate-50/40'
                        : 'bg-white'
                    }`}
                  >
                    <td className="py-2 px-2 border-r border-slate-200 text-slate-500 font-mono text-[11px]">
                      {rowIdx + 1}
                    </td>
                    <td className="py-2 px-4 border-r border-slate-200 text-left font-medium text-slate-900">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-950">{student.name}</span>
                        {isAlfaRow && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                            Alfa Terus (TIDAK LULUS)
                          </span>
                        )}
                        {isTestRow && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-900 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Izin Dosen (UJIAN SUSULAN)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Unclipped, perfectly spaced H, I, S, A boxes */}
                    {visibleSessionIndices.map((sIdx) => {
                      const status = sessions[sIdx] || '-';
                      let badgeStyle =
                        'bg-slate-100 text-slate-400 border-slate-200 hover:border-slate-300';
                      if (status === 'H') {
                        badgeStyle =
                          'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold shadow-2xs';
                      } else if (status === 'I') {
                        badgeStyle =
                          'bg-amber-100 text-amber-800 border-amber-300 font-extrabold shadow-2xs';
                      } else if (status === 'S') {
                        badgeStyle =
                          'bg-yellow-100 text-yellow-800 border-yellow-300 font-extrabold shadow-2xs';
                      } else if (status === 'A') {
                        badgeStyle =
                          'bg-rose-100 text-rose-800 border-rose-300 font-extrabold shadow-2xs';
                      }

                      return (
                        <td
                          key={sIdx}
                          className="py-1 px-1 border-r border-slate-200 text-center"
                        >
                          <button
                            type="button"
                            onClick={() => handleCellClick(student.id, sIdx, status)}
                            className={`w-9 h-8 min-w-[36px] rounded-md border flex items-center justify-center text-xs font-mono transition-transform active:scale-95 cursor-pointer ${badgeStyle}`}
                            title={`Klik untuk ubah: ${student.name} - Pertemuan ${sIdx + 1}`}
                          >
                            {status === '-' ? '-' : status}
                          </button>
                        </td>
                      );
                    })}

                    <td className="py-2 px-2 border-r border-slate-200 font-bold text-emerald-700 bg-emerald-50/40">
                      {hCount}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-200 font-bold text-amber-700 bg-amber-50/30">
                      {iCount}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-200 font-bold text-yellow-700 bg-yellow-50/30">
                      {sCount}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-200 font-bold text-rose-700 bg-rose-50/40">
                      {aCount}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-200 font-bold text-slate-800">
                      {percentage}%
                    </td>
                    <td className="py-2 px-2 border-r border-slate-200 font-bold text-teal-800">
                      {score15}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                          isAlfaRow
                            ? 'bg-rose-100 text-rose-900 border border-rose-400 font-black'
                            : isTestRow
                            ? 'bg-amber-100 text-amber-950 border border-amber-400 font-black ring-1 ring-amber-300'
                            : isMemenuhi
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {isAlfaRow
                          ? 'TIDAK LULUS (ALFA TERUS)'
                          : isTestRow
                          ? 'UJIAN SUSULAN (IZIN DOSEN)'
                          : isMemenuhi
                          ? 'MEMENUHI (≥75%)'
                          : 'TIDAK MEMENUHI (<75%)'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Legend */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">Keterangan:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
                H
              </span>
              Hadir
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[10px]">
                I
              </span>
              Izin
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-yellow-100 text-yellow-800 font-bold flex items-center justify-center text-[10px]">
                S
              </span>
              Sakit
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-[10px]">
                A
              </span>
              Alfa
            </span>
            <span className="flex items-center gap-1.5 ml-2 font-bold text-rose-700">
              🔴 Merah: Alfa Permanen
            </span>
            <span className="flex items-center gap-1.5 font-bold text-amber-800">
              🟡 Kuning: Izin Ikut Tes
            </span>
          </div>

          <div className="text-slate-600 font-medium">
            Tingkat Kehadiran Kelas: <span className="font-bold text-teal-800">{eligibleCount}</span> dari{' '}
            <span className="font-bold">{totalStudents}</span> Mahasiswa (
            {Math.round((eligibleCount / (totalStudents || 1)) * 100)}%)
          </div>
        </div>
      </div>
    </div>
  );
};
