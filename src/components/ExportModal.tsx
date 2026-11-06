import React from 'react';
import { Course, Student, AttendanceStatus, GradeRecord } from '../data/academicData';
import {
  FileSpreadsheet,
  Printer,
  X,
  Download,
  Award,
  Calendar,
  CheckCircle2,
  Sparkles,
  Archive,
} from 'lucide-react';
import {
  exportPresensiToExcel,
  exportUTSToExcel,
  exportUASToExcel,
  exportMasterToExcel,
} from '../utils/excelExport';
import { exportSemesterBackupZip } from '../utils/zipExport';

interface ExportModalProps {
  course: Course;
  students: Student[];
  attendanceMap: Record<string, AttendanceStatus[]>;
  gradesMap: Record<string, GradeRecord>;
  onClose: () => void;
  onOpenPrint: (type: 'PRESENSI_16' | 'UTS' | 'UAS' | 'MASTER') => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  course,
  students,
  attendanceMap,
  gradesMap,
  onClose,
  onOpenPrint,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Pusat Unduh Nilai UTS, UAS, Rekapan Keseluruhan & Presensi
              </h3>
              <p className="text-xs text-slate-500">
                Mata Kuliah: <span className="font-semibold text-slate-700">{course.name}</span> ({course.code}) • {course.semester}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Nilai UTS */}
          <div className="border border-slate-200 rounded-xl p-4 bg-gradient-to-br from-amber-50/50 to-white hover:border-amber-300 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                  MID-SEMESTER
                </span>
                <span className="text-[10px] text-slate-400">Pertemuan 1 - 8</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Rekapan Nilai UTS</h4>
              <p className="text-xs text-slate-600 mt-1">
                Lengkap dengan rincian: <strong>Nilai Absen (15%)</strong>, <strong>Nilai Sikap (15%)</strong>,{' '}
                <strong>Nilai Keaktifan (10%)</strong>, <strong>Tugas (20%)</strong>, dan{' '}
                <strong>Nilai Murni UTS (40%)</strong>.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => exportUTSToExcel(course, students, gradesMap, attendanceMap)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                title="Unduh berkas Excel .XLSX dengan rumus otomatis"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Unduh Excel (.XLSX)
              </button>
              <button
                onClick={() => onOpenPrint('UTS')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                title="Cetak atau simpan format PDF Ber-TTD Dosen"
              >
                <Printer className="w-3.5 h-3.5" />
                Unduh / Cetak PDF
              </button>
            </div>
          </div>

          {/* Card 2: Nilai UAS */}
          <div className="border border-slate-200 rounded-xl p-4 bg-gradient-to-br from-indigo-50/50 to-white hover:border-indigo-300 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-900">
                  AKHIR SEMESTER
                </span>
                <span className="text-[10px] text-slate-400">Pertemuan 9 - 16</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Rekapan Nilai UAS</h4>
              <p className="text-xs text-slate-600 mt-1">
                Lengkap dengan rincian: <strong>Nilai Absen</strong>, <strong>Sikap</strong>,{' '}
                <strong>Keaktifan</strong>, <strong>Tugas</strong>, <strong>UTS</strong>,{' '}
                <strong>Nilai Murni UAS</strong>, dan Rekapan Akhir.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => exportUASToExcel(course, students, gradesMap, attendanceMap)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                title="Unduh berkas Excel .XLSX dengan rumus otomatis"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Unduh Excel (.XLSX)
              </button>
              <button
                onClick={() => onOpenPrint('UAS')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                title="Cetak atau simpan format PDF Ber-TTD Dosen"
              >
                <Printer className="w-3.5 h-3.5" />
                Unduh / Cetak PDF
              </button>
            </div>
          </div>

          {/* Card 3: Rekapan Keseluruhan (Master 100%) */}
          <div className="border-2 border-teal-500/30 rounded-xl p-4 bg-gradient-to-br from-teal-50/70 to-white hover:border-teal-500 transition flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-200 text-teal-900 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  MASTER EVALUASI 100%
                </span>
                <span className="text-[10px] font-bold text-teal-700">Kumulatif</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                Rekapan Nilai Keseluruhan Master
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Rekapan komprehensif seluruh komponen: <strong>Absen (15%) + Sikap (15%) + Aktif (10%) + Tugas (20%) + UTS (20%) + UAS (20%) = 100%</strong>, Huruf Mutu (A-E), GPA, dan Status Kelulusan.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => exportMasterToExcel(course, students, gradesMap, attendanceMap)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                title="Unduh Excel multi-sheet ber-rumus"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Unduh Master Excel (.XLSX)
              </button>
              <button
                onClick={() => onOpenPrint('MASTER')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                title="Cetak lembar master nilai A4 Ber-TTD Dosen & Kaprodi"
              >
                <Printer className="w-3.5 h-3.5" />
                Unduh / Cetak PDF
              </button>
            </div>
          </div>

          {/* Card 4: Presensi 16 Pertemuan */}
          <div className="border border-slate-200 rounded-xl p-4 bg-gradient-to-br from-emerald-50/50 to-white hover:border-emerald-300 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900">
                  PRESENSI LENGKAP
                </span>
                <span className="text-[10px] text-slate-400">16 Sesi Perkuliahan</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                Rekapan Presensi Kehadiran (P1-P16)
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Matriks kehadiran 16 kali pertemuan dengan kotak seimbang H, I, S, A utuh, persentase kehadiran, dan bobot nilai presensi 15%.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => exportPresensiToExcel(course, students, attendanceMap)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                title="Unduh matriks presensi Excel dengan rumus COUNTIF"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Unduh Excel (.XLSX)
              </button>
              <button
                onClick={() => onOpenPrint('PRESENSI_16')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                title="Cetak lembar presensi A4 Landscape Ber-TTD"
              >
                <Printer className="w-3.5 h-3.5" />
                Unduh / Cetak PDF
              </button>
            </div>
          </div>

          {/* Card 5: Backup Menyeluruh Per Semester Format ZIP */}
          <div className="col-span-full border-2 border-emerald-600/40 rounded-xl p-4 bg-gradient-to-r from-teal-900 via-[#0b3834] to-emerald-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400 text-slate-950 flex items-center gap-1">
                  <Archive className="w-3 h-3" />
                  FORMAT .ZIP TERPADU
                </span>
                <span className="text-[11px] font-bold text-emerald-300">
                  Cadangan Menyeluruh Per Semester
                </span>
              </div>
              <h4 className="font-extrabold text-base text-white">
                Backup Data & Berkas Semester ({course.name})
              </h4>
              <p className="text-xs text-teal-100/90 mt-1 max-w-xl">
                Mengemas seluruh berkas tugas presentasi mahasiswa, arsip ujian UTS, UAS, nilai tugas/aktif/sikap, rekapan presensi 16 pertemuan, dan lembar pengesahan TTD resmi ke dalam 1 berkas arsip .ZIP.
              </p>
            </div>

            <button
              onClick={() => exportSemesterBackupZip(course, students, attendanceMap, gradesMap, [])}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-xs shadow-lg flex items-center gap-2 shrink-0 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Backup .ZIP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
