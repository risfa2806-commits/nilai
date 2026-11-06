import React, { useState, useEffect } from 'react';
import {
  AppState,
  getInitialState,
  saveStateToStorage,
} from './utils/storage';
import {
  AttendanceStatus,
  GradeRecord,
  Course,
  Student,
  SemesterArchive,
  TaskSubmission,
  INITIAL_GRADES_KMP,
  INITIAL_ATTENDANCE_KMP,
  INITIAL_GRADES_AKPI,
  INITIAL_ATTENDANCE_AKPI,
  INITIAL_GRADES_FILSAFAT,
  INITIAL_ATTENDANCE_FILSAFAT,
} from './data/academicData';
import { Navbar } from './components/Navbar';
import { AttendanceTable } from './components/AttendanceTable';
import { GradesTable } from './components/GradesTable';
import { AssignmentExamPortal } from './components/AssignmentExamPortal';
import { PrintDocument } from './components/PrintDocument';
import { ExportModal } from './components/ExportModal';
import { CourseSettingsModal } from './components/CourseSettingsModal';
import { StudentManagerModal } from './components/StudentManagerModal';
import {
  Calendar,
  BarChart3,
  CheckCircle,
  Users,
  Settings,
  Download,
  FolderKanban,
} from 'lucide-react';

export default function App() {
  const [state, setState] = useState<AppState>(getInitialState);
  const [activeTab, setActiveTab] = useState<'PRESENSI' | 'NILAI' | 'TUGAS_UJIAN'>('PRESENSI');
  const [printDocType, setPrintDocType] = useState<
    'PRESENSI_16' | 'UTS' | 'UAS' | 'MASTER' | null
  >(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCourseSettingsOpen, setIsCourseSettingsOpen] = useState(false);
  const [isStudentManagerOpen, setIsStudentManagerOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const currentCourse =
    state.courses.find((c) => c.id === state.selectedCourseId) || state.courses[0];
  const currentStudents = state.studentsByCourse[currentCourse.id] || [];
  const currentAttendance = state.attendanceByCourse[currentCourse.id] || {};
  const currentGrades = state.gradesByCourse[currentCourse.id] || {};
  const currentExamAccess = state.examAccessByCourse[currentCourse.id] || {
    isUtsUnlocked: false,
    isUasUnlocked: false,
  };
  const currentSubmissions = state.submissionsByCourse[currentCourse.id] || [];

  // Handlers for updating Attendance
  const handleUpdateAttendance = (
    studentId: string,
    sessionIndex: number,
    status: AttendanceStatus
  ) => {
    setState((prev) => {
      const courseAtt = { ...(prev.attendanceByCourse[prev.selectedCourseId] || {}) };
      const currentSessions = [...(courseAtt[studentId] || Array(16).fill('-'))];
      currentSessions[sessionIndex] = status;
      courseAtt[studentId] = currentSessions;

      return {
        ...prev,
        attendanceByCourse: {
          ...prev.attendanceByCourse,
          [prev.selectedCourseId]: courseAtt,
        },
      };
    });
  };

  const handleSetAllPresent = (sessionIndex: number) => {
    setState((prev) => {
      const courseAtt = { ...(prev.attendanceByCourse[prev.selectedCourseId] || {}) };
      const students = prev.studentsByCourse[prev.selectedCourseId] || [];

      students.forEach((st) => {
        // Special case: Muhammad Irfan / permanent alfa
        if (st.isPermanentAlfa) {
          const sessions = [...(courseAtt[st.id] || Array(16).fill('-'))];
          sessions[sessionIndex] = 'A';
          courseAtt[st.id] = sessions;
          return;
        }

        const sessions = [...(courseAtt[st.id] || Array(16).fill('-'))];
        sessions[sessionIndex] = 'H';
        courseAtt[st.id] = sessions;
      });

      return {
        ...prev,
        attendanceByCourse: {
          ...prev.attendanceByCourse,
          [prev.selectedCourseId]: courseAtt,
        },
      };
    });
    showNotification(
      `Semua mahasiswa diset Hadir pada pertemuan ${
        sessionIndex === 7 ? 'P8 (UTS)' : sessionIndex === 15 ? 'P16 (UAS)' : sessionIndex + 1
      }.`
    );
  };

  // Handlers for Grades
  const handleUpdateGrade = (studentId: string, updated: Partial<GradeRecord>) => {
    setState((prev) => {
      const courseGrades = { ...(prev.gradesByCourse[prev.selectedCourseId] || {}) };
      const currentGrade = courseGrades[studentId] || {
        studentId,
        sikap: 80,
        aktif: 80,
        tugas: 80,
        uts: 80,
        uas: 80,
      };

      courseGrades[studentId] = {
        ...currentGrade,
        ...updated,
      };

      return {
        ...prev,
        gradesByCourse: {
          ...prev.gradesByCourse,
          [prev.selectedCourseId]: courseGrades,
        },
      };
    });
  };

  // Handlers for Student Management
  const handleAddStudent = (name: string, status?: 'NORMAL' | 'MERAH_ALFA' | 'KUNING_TES') => {
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      name: name.toUpperCase(),
      isPermanentAlfa: status === 'MERAH_ALFA',
      isTestIzin: status === 'KUNING_TES',
      notes:
        status === 'MERAH_ALFA'
          ? 'Tidak pernah masuk (Alfa)'
          : status === 'KUNING_TES'
          ? 'Izin Tes Pendidikan / UTS Susulan'
          : '',
    };

    setState((prev) => {
      const studentsList = [...(prev.studentsByCourse[prev.selectedCourseId] || []), newStudent];
      const attMap = { ...(prev.attendanceByCourse[prev.selectedCourseId] || {}) };
      attMap[newStudent.id] = newStudent.isPermanentAlfa ? Array(16).fill('A') : Array(16).fill('-');

      const grMap = { ...(prev.gradesByCourse[prev.selectedCourseId] || {}) };
      grMap[newStudent.id] = {
        studentId: newStudent.id,
        sikap: newStudent.isPermanentAlfa ? 0 : 80,
        aktif: newStudent.isPermanentAlfa ? 0 : 80,
        tugas: newStudent.isPermanentAlfa ? 0 : 80,
        uts: newStudent.isPermanentAlfa ? 0 : 80,
        uas: newStudent.isPermanentAlfa ? 0 : 80,
      };

      return {
        ...prev,
        studentsByCourse: {
          ...prev.studentsByCourse,
          [prev.selectedCourseId]: studentsList,
        },
        attendanceByCourse: {
          ...prev.attendanceByCourse,
          [prev.selectedCourseId]: attMap,
        },
        gradesByCourse: {
          ...prev.gradesByCourse,
          [prev.selectedCourseId]: grMap,
        },
      };
    });
    showNotification(`Mahasiswa ${newStudent.name} berhasil ditambahkan.`);
  };

  const handleBulkAddStudents = (names: string[]) => {
    setState((prev) => {
      const currentList = [...(prev.studentsByCourse[prev.selectedCourseId] || [])];
      const attMap = { ...(prev.attendanceByCourse[prev.selectedCourseId] || {}) };
      const grMap = { ...(prev.gradesByCourse[prev.selectedCourseId] || {}) };

      names.forEach((name, i) => {
        const newId = `bulk-${Date.now()}-${i}`;
        const newStudent: Student = {
          id: newId,
          name: name.trim().toUpperCase(),
        };
        currentList.push(newStudent);
        attMap[newId] = Array(16).fill('-');
        grMap[newId] = {
          studentId: newId,
          sikap: 80,
          aktif: 80,
          tugas: 80,
          uts: 80,
          uas: 80,
        };
      });

      return {
        ...prev,
        studentsByCourse: {
          ...prev.studentsByCourse,
          [prev.selectedCourseId]: currentList,
        },
        attendanceByCourse: {
          ...prev.attendanceByCourse,
          [prev.selectedCourseId]: attMap,
        },
        gradesByCourse: {
          ...prev.gradesByCourse,
          [prev.selectedCourseId]: grMap,
        },
      };
    });
    showNotification(`Berhasil menambahkan ${names.length} nama mahasiswa ke roster.`);
  };

  const handleUpdateStudent = (id: string, updated: Partial<Student>) => {
    setState((prev) => {
      const currentList = (prev.studentsByCourse[prev.selectedCourseId] || []).map((s) => {
        if (s.id === id) {
          return { ...s, ...updated };
        }
        return s;
      });

      // If set to permanent alfa, automatically fill attendance with 'A'
      let attMap = { ...(prev.attendanceByCourse[prev.selectedCourseId] || {}) };
      if (updated.isPermanentAlfa) {
        attMap[id] = Array(16).fill('A');
      }

      return {
        ...prev,
        studentsByCourse: {
          ...prev.studentsByCourse,
          [prev.selectedCourseId]: currentList,
        },
        attendanceByCourse: {
          ...prev.attendanceByCourse,
          [prev.selectedCourseId]: attMap,
        },
      };
    });
    showNotification('Data mahasiswa berhasil diperbarui.');
  };

  const handleDeleteStudent = (id: string) => {
    setState((prev) => {
      const currentList = (prev.studentsByCourse[prev.selectedCourseId] || []).filter((s) => s.id !== id);
      return {
        ...prev,
        studentsByCourse: {
          ...prev.studentsByCourse,
          [prev.selectedCourseId]: currentList,
        },
      };
    });
    showNotification('Mahasiswa dihapus dari kelas.');
  };

  // Handlers for Course Info & Semester Promotion / Archiving
  const handleSaveCourse = (updated: Course) => {
    setState((prev) => ({
      ...prev,
      courses: prev.courses.map((c) => (c.id === updated.id ? updated : c)),
    }));
    showNotification('Informasi mata kuliah & pejabat penandatangan berhasil diperbarui.');
  };

  const handleNaikSemester = (newSemesterName: string, newAcademicYear: string) => {
    setState((prev) => {
      // 1. Snapshot current semester into archives
      const currentArchive: SemesterArchive = {
        id: `arch-${Date.now()}`,
        semesterName: currentCourse.semester,
        academicYear: currentCourse.academicYear,
        savedAt: new Date().toLocaleString('id-ID'),
        courses: [...prev.courses],
        studentsByCourse: JSON.parse(JSON.stringify(prev.studentsByCourse)),
        attendanceByCourse: JSON.parse(JSON.stringify(prev.attendanceByCourse)),
        gradesByCourse: JSON.parse(JSON.stringify(prev.gradesByCourse)),
        submissionsByCourse: JSON.parse(JSON.stringify(prev.submissionsByCourse || {})),
      };

      // 2. Update courses with new semester name and year
      const updatedCourses = prev.courses.map((c) => ({
        ...c,
        semester: newSemesterName,
        academicYear: newAcademicYear,
      }));

      // 3. Reset attendance & grades for fresh new semester while preserving students roster
      const freshAttendance: Record<string, Record<string, AttendanceStatus[]>> = {};
      const freshGrades: Record<string, Record<string, GradeRecord>> = {};

      Object.keys(prev.studentsByCourse).forEach((courseId) => {
        freshAttendance[courseId] = {};
        freshGrades[courseId] = {};
        prev.studentsByCourse[courseId].forEach((s) => {
          freshAttendance[courseId][s.id] = s.isPermanentAlfa ? Array(16).fill('A') : Array(16).fill('-');
          freshGrades[courseId][s.id] = {
            studentId: s.id,
            sikap: s.isPermanentAlfa ? 0 : 80,
            aktif: s.isPermanentAlfa ? 0 : 80,
            tugas: s.isPermanentAlfa ? 0 : 80,
            uts: s.isPermanentAlfa ? 0 : 80,
            uas: s.isPermanentAlfa ? 0 : 80,
          };
        });
      });

      return {
        ...prev,
        courses: updatedCourses,
        attendanceByCourse: freshAttendance,
        gradesByCourse: freshGrades,
        archives: [currentArchive, ...prev.archives],
      };
    });
    showNotification(`Semester berhasil diarsipkan. Selamat datang di ${newSemesterName}!`);
  };

  const handleResetCourseData = (courseId: string) => {
    setState((prev) => {
      let freshGrades = { ...(prev.gradesByCourse[courseId] || {}) };
      let freshAtt = { ...(prev.attendanceByCourse[courseId] || {}) };

      if (courseId === 'kmp') {
        freshGrades = { ...INITIAL_GRADES_KMP };
        freshAtt = { ...INITIAL_ATTENDANCE_KMP };
      } else if (courseId === 'akpi') {
        freshGrades = { ...INITIAL_GRADES_AKPI };
        freshAtt = { ...INITIAL_ATTENDANCE_AKPI };
      } else if (courseId === 'filsafat') {
        freshGrades = { ...INITIAL_GRADES_FILSAFAT };
        freshAtt = { ...INITIAL_ATTENDANCE_FILSAFAT };
      }

      return {
        ...prev,
        gradesByCourse: {
          ...prev.gradesByCourse,
          [courseId]: freshGrades,
        },
        attendanceByCourse: {
          ...prev.attendanceByCourse,
          [courseId]: freshAtt,
        },
      };
    });
    showNotification(`Nilai & presensi ${currentCourse.name} telah disinkronkan ke data standar.`);
  };

  // Handlers for Exam Access & Submissions
  const handleToggleExamLock = (type: 'UTS' | 'UAS') => {
    setState((prev) => {
      const currentAccess = prev.examAccessByCourse[prev.selectedCourseId] || {
        isUtsUnlocked: false,
        isUasUnlocked: false,
      };
      const updated = {
        ...currentAccess,
        ...(type === 'UTS'
          ? {
              isUtsUnlocked: !currentAccess.isUtsUnlocked,
              utsUnlockedAt: new Date().toLocaleString('id-ID'),
            }
          : {
              isUasUnlocked: !currentAccess.isUasUnlocked,
              uasUnlockedAt: new Date().toLocaleString('id-ID'),
            }),
      };
      return {
        ...prev,
        examAccessByCourse: {
          ...prev.examAccessByCourse,
          [prev.selectedCourseId]: updated,
        },
      };
    });
    showNotification(`Akses ujian ${type} diperbarui.`);
  };

  const handleSubmitTask = (submission: Omit<TaskSubmission, 'id' | 'submittedAt'>) => {
    const newSub: TaskSubmission = {
      ...submission,
      id: `sub-${Date.now()}`,
      submittedAt: new Date().toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setState((prev) => {
      const existing = prev.submissionsByCourse[prev.selectedCourseId] || [];
      const filtered = existing.filter(
        (s) => !(s.studentId === newSub.studentId && s.type === newSub.type)
      );
      return {
        ...prev,
        submissionsByCourse: {
          ...prev.submissionsByCourse,
          [prev.selectedCourseId]: [newSub, ...filtered],
        },
      };
    });
    showNotification(
      `Berkas ${submission.type} atas nama ${submission.studentName} tersimpan permanen.`
    );
  };

  const handleUpdateSubmission = (id: string, updates: Partial<TaskSubmission>) => {
    setState((prev) => {
      const currentSubs = prev.submissionsByCourse[prev.selectedCourseId] || [];
      const updatedSubs = currentSubs.map((s) => (s.id === id ? { ...s, ...updates } : s));
      return {
        ...prev,
        submissionsByCourse: {
          ...prev.submissionsByCourse,
          [prev.selectedCourseId]: updatedSubs,
        },
      };
    });
  };

  const handleDeleteSubmission = (id: string) => {
    setState((prev) => {
      const currentSubs = prev.submissionsByCourse[prev.selectedCourseId] || [];
      const filtered = currentSubs.filter((s) => s.id !== id);
      return {
        ...prev,
        submissionsByCourse: {
          ...prev.submissionsByCourse,
          [prev.selectedCourseId]: filtered,
        },
      };
    });
    showNotification('Berkas berhasil dihapus dari sistem oleh dosen.');
  };

  const handleResetSubmissionForRevision = (id: string) => {
    setState((prev) => {
      const currentSubs = prev.submissionsByCourse[prev.selectedCourseId] || [];
      const updatedSubs = currentSubs.map((s) =>
        s.id === id ? { ...s, status: 'REVISI_DIIZINKAN' as const } : s
      );
      return {
        ...prev,
        submissionsByCourse: {
          ...prev.submissionsByCourse,
          [prev.selectedCourseId]: updatedSubs,
        },
      };
    });
    showNotification('Akses revisi telah dibuka. Mahasiswa dapat mengunggah perbaikan.');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar
        courses={state.courses}
        selectedCourseId={state.selectedCourseId}
        onSelectCourse={(id) => setState((p) => ({ ...p, selectedCourseId: id }))}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenStudentManager={() => setIsStudentManagerOpen(true)}
        onOpenCourseSettings={() => setIsCourseSettingsOpen(true)}
        onOpenPrint={(type) => setPrintDocType(type)}
      />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-teal-500 text-xs animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Container - Focused purely on Presensi & Nilai */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-4">
        {/* Primary Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-1.5 flex flex-col md:flex-row items-stretch md:items-center gap-2">
          <button
            onClick={() => setActiveTab('PRESENSI')}
            className={`flex-1 py-3 px-3 rounded-lg text-xs md:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'PRESENSI'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Presensi Perkuliahan (P1 - P16)</span>
          </button>

          <button
            onClick={() => setActiveTab('NILAI')}
            className={`flex-1 py-3 px-3 rounded-lg text-xs md:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'NILAI'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Rekapitulasi Nilai (Master, UTS, UAS)</span>
          </button>

          <button
            onClick={() => setActiveTab('TUGAS_UJIAN')}
            className={`flex-1 py-3 px-3 rounded-lg text-xs md:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'TUGAS_UJIAN'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Tugas, Akses Ujian & Backup ZIP</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase hidden sm:inline">
              UTS/UAS
            </span>
          </button>
        </div>

        {/* Tab 1: Presensi */}
        {activeTab === 'PRESENSI' && (
          <AttendanceTable
            courses={state.courses}
            course={currentCourse}
            students={currentStudents}
            attendanceMap={currentAttendance}
            onSelectCourse={(id) => setState((p) => ({ ...p, selectedCourseId: id }))}
            onUpdateAttendance={handleUpdateAttendance}
            onSetAllPresent={handleSetAllPresent}
            onOpenPrint={(type) => setPrintDocType(type)}
            onOpenStudentManager={() => setIsStudentManagerOpen(true)}
            onOpenCourseSettings={() => setIsCourseSettingsOpen(true)}
          />
        )}

        {/* Tab 2: Nilai Lengkap */}
        {activeTab === 'NILAI' && (
          <GradesTable
            courses={state.courses}
            course={currentCourse}
            students={currentStudents}
            gradesMap={currentGrades}
            attendanceMap={currentAttendance}
            onSelectCourse={(id) => setState((p) => ({ ...p, selectedCourseId: id }))}
            onUpdateGrade={handleUpdateGrade}
            onResetCourseData={handleResetCourseData}
            onOpenPrint={(type) => setPrintDocType(type)}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            onOpenStudentManager={() => setIsStudentManagerOpen(true)}
            onOpenCourseSettings={() => setIsCourseSettingsOpen(true)}
          />
        )}

        {/* Tab 3: Tugas, Ujian & Backup ZIP */}
        {activeTab === 'TUGAS_UJIAN' && (
          <AssignmentExamPortal
            courses={state.courses}
            course={currentCourse}
            students={currentStudents}
            attendanceMap={currentAttendance}
            gradesMap={currentGrades}
            examAccess={currentExamAccess}
            submissions={currentSubmissions}
            onSelectCourse={(id) => setState((p) => ({ ...p, selectedCourseId: id }))}
            onToggleExamLock={handleToggleExamLock}
            onSubmitTask={handleSubmitTask}
            onUpdateSubmission={handleUpdateSubmission}
            onDeleteSubmission={handleDeleteSubmission}
            onResetSubmissionForRevision={handleResetSubmissionForRevision}
          />
        )}
      </main>

      {/* Export Modal */}
      {isExportModalOpen && (
        <ExportModal
          course={currentCourse}
          students={currentStudents}
          attendanceMap={currentAttendance}
          gradesMap={currentGrades}
          onClose={() => setIsExportModalOpen(false)}
          onOpenPrint={(type) => {
            setIsExportModalOpen(false);
            setPrintDocType(type);
          }}
        />
      )}

      {/* Student Manager Modal (Edit Nama & Impor dari Word/Excel) */}
      {isStudentManagerOpen && (
        <StudentManagerModal
          courseName={currentCourse.name}
          students={currentStudents}
          onAddStudent={handleAddStudent}
          onBulkAddStudents={handleBulkAddStudents}
          onUpdateStudent={handleUpdateStudent}
          onDeleteStudent={handleDeleteStudent}
          onClose={() => setIsStudentManagerOpen(false)}
        />
      )}

      {/* Course & Semester Settings Modal (Edit Kaprodi, Semester, Dosen, Naik Semester) */}
      {isCourseSettingsOpen && (
        <CourseSettingsModal
          course={currentCourse}
          archives={state.archives}
          onSaveCourse={handleSaveCourse}
          onNaikSemester={handleNaikSemester}
          onClose={() => setIsCourseSettingsOpen(false)}
        />
      )}

      {/* Print & Direct PDF Document Modal */}
      {printDocType && (
        <PrintDocument
          course={currentCourse}
          students={currentStudents}
          attendanceMap={currentAttendance}
          gradesMap={currentGrades}
          docType={printDocType}
          onClose={() => setPrintDocType(null)}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026/2027 Sekolah Tinggi Agama Islam (STAI) Jarinabi — Program Studi Manajemen Pendidikan Islam (MPI).
          </span>
          <span className="text-teal-800 font-semibold">
            Dosen Pengampu: {currentCourse.dosen} • Kaprodi: {currentCourse.kaprodi}
          </span>
        </div>
      </footer>
    </div>
  );
}
