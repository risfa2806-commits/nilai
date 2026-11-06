import {
  Course,
  Student,
  AttendanceStatus,
  GradeRecord,
  SemesterArchive,
  TaskSubmission,
  ExamAccessControl,
  INITIAL_COURSES,
  STUDENTS_MPI3,
  STUDENTS_MPI1_FILSAFAT,
  INITIAL_ATTENDANCE_KMP,
  INITIAL_GRADES_KMP,
  INITIAL_ATTENDANCE_AKPI,
  INITIAL_GRADES_AKPI,
  INITIAL_ATTENDANCE_FILSAFAT,
  INITIAL_GRADES_FILSAFAT,
  INITIAL_EXAM_ACCESS,
  INITIAL_SUBMISSIONS,
} from '../data/academicData';

const STORAGE_KEY = 'siakad_stai_jarinabi_rekap_v8';

export interface AppState {
  courses: Course[];
  selectedCourseId: string;
  studentsByCourse: Record<string, Student[]>;
  attendanceByCourse: Record<string, Record<string, AttendanceStatus[]>>;
  gradesByCourse: Record<string, Record<string, GradeRecord>>;
  examAccessByCourse: Record<string, ExamAccessControl>;
  submissionsByCourse: Record<string, TaskSubmission[]>;
  archives: SemesterArchive[];
  lastUpdated: string;
}

export function getInitialState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.courses && parsed.studentsByCourse && parsed.gradesByCourse) {
        // Ensure examAccessByCourse & submissionsByCourse are populated
        if (!parsed.examAccessByCourse) {
          parsed.examAccessByCourse = { ...INITIAL_EXAM_ACCESS };
        }
        if (!parsed.submissionsByCourse) {
          parsed.submissionsByCourse = { ...INITIAL_SUBMISSIONS };
        }

        // Ensure akpi has distinct grades and not identical clone of kmp
        if (
          parsed.gradesByCourse.kmp &&
          parsed.gradesByCourse.akpi &&
          parsed.gradesByCourse.kmp['s01']?.catatan === parsed.gradesByCourse.akpi['s01']?.catatan
        ) {
          parsed.gradesByCourse.akpi = { ...INITIAL_GRADES_AKPI };
          parsed.attendanceByCourse.akpi = { ...INITIAL_ATTENDANCE_AKPI };
        }

        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse state from localStorage, loading initial state:', e);
  }

  // Initial students allocation:
  // MPI 3: kmp & akpi (27 students including Irfan and Milhan)
  // MPI 1: filsafat (14 students from PDF, no Irfan/Milhan)
  const studentsByCourse: Record<string, Student[]> = {
    kmp: STUDENTS_MPI3,
    akpi: STUDENTS_MPI3,
    filsafat: STUDENTS_MPI1_FILSAFAT,
  };

  // Distinct attendance per course:
  const attendanceByCourse: Record<string, Record<string, AttendanceStatus[]>> = {
    kmp: { ...INITIAL_ATTENDANCE_KMP },
    akpi: { ...INITIAL_ATTENDANCE_AKPI },
    filsafat: { ...INITIAL_ATTENDANCE_FILSAFAT },
  };

  // Distinct grades per course (JANGAN SAMA; P: ~88-95, L: ~65-78):
  const gradesByCourse: Record<string, Record<string, GradeRecord>> = {
    kmp: { ...INITIAL_GRADES_KMP },
    akpi: { ...INITIAL_GRADES_AKPI },
    filsafat: { ...INITIAL_GRADES_FILSAFAT },
  };

  const examAccessByCourse: Record<string, ExamAccessControl> = {
    ...INITIAL_EXAM_ACCESS,
  };

  const submissionsByCourse: Record<string, TaskSubmission[]> = {
    ...INITIAL_SUBMISSIONS,
  };

  return {
    courses: INITIAL_COURSES,
    selectedCourseId: 'kmp',
    studentsByCourse,
    attendanceByCourse,
    gradesByCourse,
    examAccessByCourse,
    submissionsByCourse,
    archives: [],
    lastUpdated: new Date().toISOString(),
  };
}

export function saveStateToStorage(state: AppState): void {
  try {
    const updated = {
      ...state,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving state to localStorage:', e);
  }
}
