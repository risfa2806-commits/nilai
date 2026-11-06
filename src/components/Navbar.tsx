import React from 'react';
import { Course } from '../data/academicData';
import {
  Download,
  Printer,
  Settings,
  Users,
  Layers,
  BookOpen,
} from 'lucide-react';

interface NavbarProps {
  courses: Course[];
  selectedCourseId: string;
  onSelectCourse: (id: string) => void;
  onOpenExportModal: () => void;
  onOpenStudentManager: () => void;
  onOpenCourseSettings: () => void;
  onOpenPrint: (type: 'PRESENSI_16' | 'UTS' | 'UAS' | 'MASTER') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  courses,
  selectedCourseId,
  onSelectCourse,
  onOpenExportModal,
  onOpenStudentManager,
  onOpenCourseSettings,
  onOpenPrint,
}) => {
  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top institution bar with STAI Jarinabi Official Logo */}
      <div className="bg-[#0b3834] text-white px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/download_fd70491a.jpg"
              alt="Logo STAI Jarinabi"
              className="w-10 h-10 object-contain rounded-full bg-white p-0.5 border border-emerald-400 shadow-xs"
            />
            <div>
              <h1 className="text-xs md:text-sm font-extrabold tracking-wider uppercase font-serif text-emerald-100">
                STAI JARINABI TANJUNG JABUNG TIMUR JAMBI
              </h1>
              <p className="text-[10px] md:text-[11px] text-teal-200 font-sans tracking-wide">
                SIAKAD — REKAPAN NILAI & PRESENSI PERKULIAHAN LENGKAP
              </p>
            </div>
          </div>

          {/* Quick Action Center: Unduh Nilai, Kelola Mahasiswa, Pengaturan MK */}
          <div className="flex items-center gap-2">
            {/* Kelola Mahasiswa */}
            <button
              onClick={onOpenStudentManager}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              title="Kelola Nama Mahasiswa & Impor dari Excel / Word"
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kelola Mahasiswa</span>
            </button>

            {/* Pengaturan MK & Semester */}
            <button
              onClick={onOpenCourseSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-200 hover:text-white rounded-lg text-xs font-bold border border-teal-700/60 transition cursor-pointer"
              title="Edit Nama MK, Semester, Dosen, Kaprodi, atau Naik Semester"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pengaturan MK</span>
            </button>

            {/* PROMINENT DOWNLOAD CENTER BUTTON */}
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-black shadow-md transition cursor-pointer"
              title="Pilihan Unduh Nilai UTS, UAS, Rekapan Keseluruhan & Presensi"
            >
              <Download className="w-3.5 h-3.5" />
              <span>UNDUH NILAI & REKAPAN</span>
            </button>
          </div>
        </div>
      </div>

      {/* Course Bar with MPI 3 vs MPI 1 separation */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Course selector tabs */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-teal-700" />
            Mata Kuliah:
          </span>
          <div className="flex items-center gap-1.5">
            {courses.map((course) => {
              const isSelected = course.id === selectedCourseId;
              const isMPI3 = course.prodiGroup === 'MPI_3';
              return (
                <button
                  key={course.id}
                  onClick={() => onSelectCourse(course.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-teal-800 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      isMPI3 ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                    }`}
                  >
                    {isMPI3 ? 'MPI 3' : 'MPI 1'}
                  </span>
                  <span>{course.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded ${
                      isSelected ? 'bg-teal-900 text-teal-200' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {course.sks} SKS
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Quick Export Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenPrint('MASTER')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition cursor-pointer"
            title="Buka Lembar Pratinjau Master & Cetak PDF"
          >
            <Printer className="w-3.5 h-3.5 text-teal-400" />
            <span>Cetak Rekapan Master</span>
          </button>
        </div>
      </div>
    </header>
  );
};
