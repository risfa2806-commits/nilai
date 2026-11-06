export interface Student {
  id: string;
  name: string;
  gender?: 'L' | 'P'; // L = Laki-laki, P = Perempuan
  notes?: string;
  isTestIzin?: boolean; // Izin ikut tes (kuning)
  isPermanentAlfa?: boolean; // Tidak pernah hadir / Alfa (merah)
}

export type AttendanceStatus = 'H' | 'I' | 'S' | 'A' | '-';

export interface GradeRecord {
  studentId: string;
  sikap: number; // 0-100 (15%)
  aktif: number; // 0-100 (10%)
  tugas: number; // 0-100 (20%)
  uts: number; // 0-100 (20% atau 40% mid)
  uas: number; // 0-100 (20%)
  catatan?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  sks: number;
  prodiGroup: 'MPI_3' | 'MPI_1';
  semester: string;
  academicYear: string;
  dosen: string;
  dosenNip: string;
  prodi: string;
  kaprodi: string;
  kaprodiNidn: string;
}

export interface TaskSubmission {
  id: string;
  courseId: string;
  studentId: string;
  studentName: string;
  type: 'PRESENTASI' | 'UTS' | 'UAS';
  title: string;
  fileName: string;
  fileSize: string;
  submittedAt: string;
  contentSnippet?: string;
  status: 'TERKIRIM' | 'DINILAI' | 'REVISI_DIIZINKAN';
  score?: number;
  feedback?: string;
}

export interface ExamAccessControl {
  isUtsUnlocked: boolean;
  isUasUnlocked: boolean;
  utsUnlockedAt?: string;
  uasUnlockedAt?: string;
}

export interface SemesterArchive {
  id: string;
  semesterName: string;
  academicYear: string;
  savedAt: string;
  courses: Course[];
  studentsByCourse: Record<string, Student[]>;
  attendanceByCourse: Record<string, Record<string, AttendanceStatus[]>>;
  gradesByCourse: Record<string, Record<string, GradeRecord>>;
  submissionsByCourse?: Record<string, TaskSubmission[]>;
}

// Initial courses: MPI 3 and MPI 1
export const INITIAL_COURSES: Course[] = [
  {
    id: 'kmp',
    code: 'MPI 201',
    name: 'Konsep Dasar Manajemen Pendidikan',
    sks: 3,
    prodiGroup: 'MPI_3',
    semester: 'Semester III (Ganjil 2026/2027)',
    academicYear: '2026/2027',
    dosen: 'Risfa Tri Ulfa, S.Pd., M.Pd. Gr.',
    dosenNip: '198806282015032001',
    prodi: 'Manajemen Pendidikan Islam (MPI)',
    kaprodi: 'Dr. H. Ahmad Masrukin, M.Pd.I',
    kaprodiNidn: '2115047801',
  },
  {
    id: 'akpi',
    code: 'MPI 202',
    name: 'Analisis Kebijakan Pendidikan Islam',
    sks: 3,
    prodiGroup: 'MPI_3',
    semester: 'Semester III (Ganjil 2026/2027)',
    academicYear: '2026/2027',
    dosen: 'Risfa Tri Ulfa, S.Pd., M.Pd. Gr.',
    dosenNip: '198806282015032001',
    prodi: 'Manajemen Pendidikan Islam (MPI)',
    kaprodi: 'Dr. H. Ahmad Masrukin, M.Pd.I',
    kaprodiNidn: '2115047801',
  },
  {
    id: 'filsafat',
    code: 'STI 105',
    name: 'Filsafat Ilmu',
    sks: 2,
    prodiGroup: 'MPI_1',
    semester: 'Semester I (Ganjil 2026/2027)',
    academicYear: '2026/2027',
    dosen: 'Risfa Tri Ulfa, S.Pd., M.Pd. Gr.',
    dosenNip: '198806282015032001',
    prodi: 'Manajemen Pendidikan Islam (MPI)',
    kaprodi: 'Dr. H. Ahmad Masrukin, M.Pd.I',
    kaprodiNidn: '2115047801',
  },
];

// 27 Students for MPI 3 (Konsep Dasar Manajemen Pendidikan & Analisis Kebijakan Pendidikan Islam)
// WITHOUT NIM as explicitly requested: "DATA MAHASISWA JANGAN PAKAI NIM"
// Gender explicitly assigned: L = Laki-laki, P = Perempuan
export const STUDENTS_MPI3: Student[] = [
  { id: 's01', name: 'ABDUL HANIF', gender: 'L' },
  { id: 's02', name: 'AJI AGUNG PRATAMA', gender: 'L' },
  { id: 's03', name: 'ANITA MIRDAYANTI', gender: 'P' },
  { id: 's04', name: 'DEA OKTAVIA', gender: 'P' },
  { id: 's05', name: 'DEDI', gender: 'L' },
  { id: 's06', name: 'ERRA LATIFATUL ROKHMAH', gender: 'P' },
  { id: 's07', name: 'HERU BUDI UTOMO', gender: 'L' },
  { id: 's08', name: 'IRMA NURBAITI', gender: 'P' },
  { id: 's09', name: 'IRMA PUTRI JULIANA', gender: 'P' },
  { id: 's10', name: 'KHAMIDATUL FITRO', gender: 'P' },
  { id: 's11', name: 'M ADE SOFYAN', gender: 'L' },
  {
    id: 's12',
    name: 'M. MILHAN AUFA ZAHRAN',
    gender: 'L',
    notes: 'Izin Tes Pendidikan / UTS Susulan',
    isTestIzin: true,
  },
  { id: 's13', name: 'M. NAWAWI', gender: 'L' },
  { id: 's14', name: 'M. MUKHLIS SYAIFULLOH', gender: 'L' },
  { id: 's15', name: 'M. SHOLEH SAPUTRA', gender: 'L' },
  { id: 's16', name: 'MUHAMMAD HAFIZH', gender: 'L' },
  { id: 's17', name: 'MUZAKI ABDUL FAQIH', gender: 'L' },
  { id: 's18', name: 'NAZARA SYAHBRILIANDES', gender: 'P' },
  { id: 's19', name: 'NUR ARDILA TUROHMAN', gender: 'P' },
  { id: 's20', name: 'NURHADISMA', gender: 'P' },
  { id: 's21', name: 'PUPUT EVITA SARI', gender: 'P' },
  { id: 's22', name: 'RAFI AUDITY ADIFA SYAQILA', gender: 'L' },
  { id: 's23', name: 'RINA SAFITRI', gender: 'P' },
  { id: 's24', name: 'TINA SARI', gender: 'P' },
  { id: 's25', name: 'ZAIMA AFIF', gender: 'P' },
  { id: 's26', name: 'ZAINUL MUBAROK', gender: 'L' },
  {
    id: 's27',
    name: 'MUHAMMAD IRFAN',
    gender: 'L',
    notes: 'Tidak ada orangnya / Tidak pernah masuk (Alfa)',
    isPermanentAlfa: true,
  },
];

// 14 Students for MPI 1 (Filsafat Ilmu - as in the PDF)
// DOES NOT contain Muhammad Irfan or M. Milhan
export const STUDENTS_MPI1_FILSAFAT: Student[] = [
  { id: 'f01', name: 'Husna', gender: 'P' },
  { id: 'f02', name: 'Ikha', gender: 'P' },
  { id: 'f03', name: 'Indah', gender: 'P' },
  { id: 'f04', name: 'Kirana', gender: 'P' },
  { id: 'f05', name: 'Khoir', gender: 'L' },
  { id: 'f06', name: 'Nurazizah', gender: 'P' },
  { id: 'f07', name: 'Haza', gender: 'P' },
  { id: 'f08', name: 'Tomi', gender: 'L' },
  { id: 'f09', name: 'Estiyani', gender: 'P' },
  { id: 'f10', name: 'Munailatul', gender: 'P' },
  { id: 'f11', name: 'Anggun', gender: 'P' },
  { id: 'f12', name: 'Ridho', gender: 'L' },
  { id: 'f13', name: 'Nia', gender: 'P' },
  { id: 'f14', name: 'AYU', gender: 'P' },
];

// ============================================================================
// 1. MATA KULIAH 1: KONSEP DASAR MANAJEMEN PENDIDIKAN (KMP - MPI 3)
// Aturan: Nilai Laki-laki lebih rendah dari Perempuan
// ============================================================================
export const INITIAL_ATTENDANCE_KMP: Record<string, AttendanceStatus[]> = {
  s01: ['H', 'H', 'H', 'H', 'H', 'H', 'S', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s02: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s03: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s04: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s05: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s06: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s07: ['H', 'H', 'I', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s08: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s09: ['H', 'H', 'H', 'H', 'I', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s10: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s11: ['H', 'H', 'H', 'H', 'H', 'H', 'I', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  // M. Milhan: Izin Tes Pendidikan (Kuning), UTS susulan
  s12: ['H', 'H', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s13: ['H', 'H', 'I', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s14: ['H', 'H', 'H', 'H', 'I', 'I', 'I', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s15: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s16: ['H', 'H', 'I', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s17: ['H', 'H', 'H', 'H', 'I', 'I', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s18: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s19: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s20: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s21: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  // RAFI: Sudah dirubah hadir dan izin (TIDAK ALFA, tidak merah)
  s22: ['H', 'H', 'H', 'H', 'H', 'I', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s23: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s24: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s25: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s26: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  // Muhammad Irfan: Alfa permanently (Merah)
  s27: ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'],
};

export const INITIAL_GRADES_KMP: Record<string, GradeRecord> = {
  // Laki-laki KECUALI TINGGI: Abdul Hanif (Aktif & Presentasi Sangat Tinggi)
  s01: { studentId: 's01', sikap: 93, aktif: 95, tugas: 94, uts: 92, uas: 94, catatan: 'Keaktifan kelas & presentasi manajemen sangat aktif dan tinggi' },
  // Laki-laki: Tetap di atas KKM (80-84, aktif & presentasi tinggi)
  s02: { studentId: 's02', sikap: 82, aktif: 86, tugas: 85, uts: 79, uas: 82, catatan: 'Baik, keaktifan & tugas presentasi di atas KKM' },
  // Perempuan: Lebih tinggi dari laki-laki (91-95)
  s03: { studentId: 's03', sikap: 93, aktif: 95, tugas: 94, uts: 92, uas: 94, catatan: 'Sangat baik, tugas presentasi kepemimpinan rapi' },
  s04: { studentId: 's04', sikap: 92, aktif: 94, tugas: 93, uts: 91, uas: 93, catatan: 'Rajin, keaktifan & presentasi manajemen sangat baik' },
  // Laki-laki: DEDI -> NILAI B (78, di atas KKM 75)
  s05: { studentId: 's05', sikap: 75, aktif: 80, tugas: 75, uts: 72, uas: 73, catatan: 'Nilai B, tugas & keaktifan baik di atas KKM' },
  // Perempuan: Lebih tinggi
  s06: { studentId: 's06', sikap: 95, aktif: 96, tugas: 95, uts: 94, uas: 95, catatan: 'Prestasi sangat memuaskan, sangat aktif presentasi' },
  // Laki-laki: HERU -> NILAI B+ (84)
  s07: { studentId: 's07', sikap: 82, aktif: 86, tugas: 83, uts: 79, uas: 81, catatan: 'Nilai B+, keaktifan forum & tugas presentasi baik' },
  // Perempuan: Lebih tinggi
  s08: { studentId: 's08', sikap: 92, aktif: 94, tugas: 93, uts: 91, uas: 93, catatan: 'Rajin, tepat waktu dan aktif presentasi' },
  s09: { studentId: 's09', sikap: 91, aktif: 93, tugas: 92, uts: 90, uas: 92, catatan: 'Keaktifan & pemahaman materi presentasi baik' },
  s10: { studentId: 's10', sikap: 94, aktif: 95, tugas: 94, uts: 93, uas: 94, catatan: 'Kompak, aktif diskusi & tugas mandiri unggul' },
  // Laki-laki KECUALI TINGGI: M Ade Sofyan (Aktif & Presentasi Sangat Tinggi)
  s11: { studentId: 's11', sikap: 92, aktif: 94, tugas: 93, uts: 91, uas: 93, catatan: 'Keaktifan forum & presentasi materi sangat aktif dan tinggi' },
  // Laki-laki: M. Milhan (Izin tes / UTS susulan - Kuning, tetap di atas KKM)
  s12: {
    studentId: 's12',
    sikap: 82,
    aktif: 86,
    tugas: 84,
    uts: 80,
    uas: 82,
    catatan: 'Izin Tes Pendidikan Resmi (UTS Susulan)',
  },
  // Laki-laki: NAWAWI -> NILAI B (78, di atas KKM 75)
  s13: { studentId: 's13', sikap: 76, aktif: 80, tugas: 75, uts: 72, uas: 74, catatan: 'Nilai B, presentasi & keaktifan tuntas di atas KKM' },
  // Laki-laki: MUKHLIS -> NILAI B+ (83)
  s14: { studentId: 's14', sikap: 83, aktif: 88, tugas: 85, uts: 80, uas: 82, catatan: 'Nilai B+, tugas presentasi dan keaktifan baik' },
  // Laki-laki KECUALI TINGGI: M. Sholeh Saputra (Aktif & Presentasi Sangat Tinggi)
  s15: { studentId: 's15', sikap: 93, aktif: 95, tugas: 94, uts: 92, uas: 93, catatan: 'Sangat aktif dalam presentasi kelas dan diskusi kelompok' },
  // Laki-laki: Tetap di atas KKM
  s16: { studentId: 's16', sikap: 81, aktif: 85, tugas: 84, uts: 79, uas: 81, catatan: 'Baik dan aktif presentasi di atas KKM' },
  // Laki-laki: MUZAKI -> NILAI B (77, di atas KKM 75)
  s17: { studentId: 's17', sikap: 76, aktif: 80, tugas: 76, uts: 73, uas: 74, catatan: 'Nilai B, keaktifan & tugas presentasi memuaskan' },
  // Perempuan: Lebih tinggi
  s18: { studentId: 's18', sikap: 93, aktif: 95, tugas: 94, uts: 92, uas: 94, catatan: 'Analisis evaluasi pendidikan sangat baik & aktif' },
  s19: { studentId: 's19', sikap: 95, aktif: 96, tugas: 96, uts: 95, uas: 96, catatan: 'Prestasi sangat memuaskan, presentasi istimewa' },
  s20: { studentId: 's20', sikap: 92, aktif: 94, tugas: 93, uts: 91, uas: 93, catatan: 'Konsisten, disiplin dan aktif presentasi' },
  s21: { studentId: 's21', sikap: 91, aktif: 93, tugas: 92, uts: 90, uas: 92, catatan: 'Tugas perencanaan manajemen & presentasi lengkap' },
  // Laki-laki: RAFI AUDITY -> NILAI B+ (84)
  s22: {
    studentId: 's22',
    sikap: 81,
    aktif: 86,
    tugas: 84,
    uts: 79,
    uas: 81,
    catatan: 'Nilai B+, hadir aktif, presentasi & keaktifan baik di atas KKM',
  },
  // Perempuan: Lebih tinggi
  s23: { studentId: 's23', sikap: 93, aktif: 95, tugas: 94, uts: 92, uas: 94, catatan: 'Penguasaan teori manajemen & presentasi sangat mantap' },
  s24: { studentId: 's24', sikap: 92, aktif: 94, tugas: 93, uts: 91, uas: 93, catatan: 'Baik, rajin dan aktif dalam forum kelas' },
  s25: { studentId: 's25', sikap: 93, aktif: 95, tugas: 94, uts: 92, uas: 94, catatan: 'Tugas analisis mutu & presentasi sangat memuaskan' },
  // Laki-laki: ZAINUL -> NILAI B+ (84)
  s26: { studentId: 's26', sikap: 81, aktif: 85, tugas: 82, uts: 78, uas: 80, catatan: 'Nilai B+, keaktifan dan tugas presentasi tuntas di atas KKM' },
  // Laki-laki: MUHAMMAD IRFAN (Alfa terus tanpa keterangan - Merah)
  s27: {
    studentId: 's27',
    sikap: 0,
    aktif: 0,
    tugas: 0,
    uts: 0,
    uas: 0,
    catatan: 'Tidak pernah hadir perkuliahan (Alfa Terus / Tidak Lulus)',
  },
};

// ============================================================================
// 2. MATA KULIAH 2: ANALISIS KEBIJAKAN PENDIDIKAN ISLAM (AKPI - MPI 3)
// Aturan: Nilai Laki-laki lebih rendah dari Perempuan
// ============================================================================
export const INITIAL_ATTENDANCE_AKPI: Record<string, AttendanceStatus[]> = {
  s01: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s02: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s03: ['H', 'H', 'H', 'H', 'I', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s04: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s05: ['H', 'H', 'H', 'I', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s06: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s07: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s08: ['H', 'H', 'H', 'H', 'H', 'H', 'S', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s09: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s10: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s11: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  // M. Milhan: Izin Tes Pendidikan (Kuning), UTS susulan
  s12: ['H', 'H', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'H', 'H', 'H', 'H', 'H', 'H'],
  s13: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s14: ['H', 'H', 'H', 'H', 'H', 'I', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s15: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s16: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s17: ['H', 'H', 'H', 'I', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s18: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s19: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s20: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s21: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  // RAFI: Hadir dan izin di AKPI
  s22: ['H', 'H', 'H', 'S', 'H', 'H', 'I', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s23: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s24: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s25: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  s26: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  // Muhammad Irfan: Alfa permanently (Merah)
  s27: ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'],
};

export const INITIAL_GRADES_AKPI: Record<string, GradeRecord> = {
  // Laki-laki KECUALI TINGGI: Abdul Hanif
  s01: { studentId: 's01', sikap: 93, aktif: 95, tugas: 94, uts: 92, uas: 94, catatan: 'Analisis regulasi & presentasi kebijakan sangat aktif dan tinggi' },
  // Laki-laki: Tetap di atas KKM (80-84, aktif & presentasi tinggi)
  s02: { studentId: 's02', sikap: 82, aktif: 86, tugas: 85, uts: 79, uas: 82, catatan: 'Baik pada kajian kebijakan pesantren di atas KKM' },
  // Perempuan: Lebih tinggi dari laki-laki (91-95)
  s03: { studentId: 's03', sikap: 93, aktif: 95, tugas: 94, uts: 92, uas: 94, catatan: 'Kajian sertifikasi guru & presentasi sangat mendalam' },
  s04: { studentId: 's04', sikap: 92, aktif: 94, tugas: 93, uts: 91, uas: 93, catatan: 'Analisis implementasi kebijakan & keaktifan rapi' },
  // Laki-laki: DEDI -> NILAI B (78)
  s05: { studentId: 's05', sikap: 75, aktif: 80, tugas: 75, uts: 72, uas: 73, catatan: 'Nilai B, formulasi kebijakan & tugas presentasi baik di atas KKM' },
  // Perempuan: Lebih tinggi
  s06: { studentId: 's06', sikap: 95, aktif: 96, tugas: 95, uts: 94, uas: 96, catatan: 'Sangat kritis dan tajam evaluasi kebijakan Kemenag' },
  // Laki-laki: HERU -> NILAI B+ (84)
  s07: { studentId: 's07', sikap: 82, aktif: 86, tugas: 83, uts: 79, uas: 81, catatan: 'Nilai B+, aktif berpendapat tentang zonasi madrasah' },
  // Perempuan: Lebih tinggi
  s08: { studentId: 's08', sikap: 92, aktif: 94, tugas: 93, uts: 91, uas: 93, catatan: 'Tugas analisis kurikulum & presentasi sangat tuntas' },
  s09: { studentId: 's09', sikap: 91, aktif: 93, tugas: 92, uts: 90, uas: 92, catatan: 'Baik, aktif dan bertanggung jawab' },
  s10: { studentId: 's10', sikap: 94, aktif: 95, tugas: 94, uts: 93, uas: 94, catatan: 'Presentasi kebijakan sangat sistematis dan aktif' },
  // Laki-laki KECUALI TINGGI: M Ade Sofyan
  s11: { studentId: 's11', sikap: 92, aktif: 94, tugas: 93, uts: 91, uas: 93, catatan: 'Studi kasus kebijakan & keaktifan presentasi sangat tinggi' },
  // Laki-laki: M. Milhan (Izin tes / UTS susulan - Kuning, tetap di atas KKM)
  s12: {
    studentId: 's12',
    sikap: 82,
    aktif: 86,
    tugas: 84,
    uts: 80,
    uas: 82,
    catatan: 'Izin Resmi Dosen Ikut Tes (Berhak Ujian Susulan)',
  },
  // Laki-laki: NAWAWI -> NILAI B (78)
  s13: { studentId: 's13', sikap: 76, aktif: 80, tugas: 75, uts: 72, uas: 74, catatan: 'Nilai B, makalah kebijakan di atas KKM' },
  // Laki-laki: MUKHLIS -> NILAI B+ (83)
  s14: { studentId: 's14', sikap: 83, aktif: 88, tugas: 85, uts: 80, uas: 82, catatan: 'Nilai B+, tugas presentasi kebijakan baik' },
  // Laki-laki KECUALI TINGGI: M. Sholeh Saputra
  s15: { studentId: 's15', sikap: 93, aktif: 95, tugas: 94, uts: 92, uas: 93, catatan: 'Sangat aktif dalam presentasi kelas dan diskusi kebijakan' },
  // Laki-laki: Tetap di atas KKM
  s16: { studentId: 's16', sikap: 81, aktif: 85, tugas: 84, uts: 79, uas: 81, catatan: 'Keaktifan & tugas presentasi baik di atas KKM' },
  // Laki-laki: MUZAKI -> NILAI B (77)
  s17: { studentId: 's17', sikap: 76, aktif: 80, tugas: 76, uts: 73, uas: 74, catatan: 'Nilai B, tugas presentasi memuaskan di atas KKM' },
  // Perempuan: Lebih tinggi
  s18: { studentId: 's18', sikap: 93, aktif: 95, tugas: 94, uts: 92, uas: 94, catatan: 'Advokasi kebijakan sangat analitis & aktif' },
  s19: { studentId: 's19', sikap: 95, aktif: 96, tugas: 96, uts: 95, uas: 96, catatan: 'Sangat unggul dalam diskusi dan tugas presentasi' },
  s20: { studentId: 's20', sikap: 92, aktif: 94, tugas: 93, uts: 91, uas: 93, catatan: 'Tugas evaluasi perda pesantren memuaskan & aktif' },
  s21: { studentId: 's21', sikap: 91, aktif: 93, tugas: 92, uts: 90, uas: 92, catatan: 'Disiplin, teliti dan aktif presentasi' },
  // Laki-laki: RAFI AUDITY -> NILAI B+ (84)
  s22: {
    studentId: 's22',
    sikap: 81,
    aktif: 86,
    tugas: 84,
    uts: 79,
    uas: 81,
    catatan: 'Nilai B+, presensi hadir & izin aktif, presentasi baik di atas KKM',
  },
  // Perempuan: Lebih tinggi
  s23: { studentId: 's23', sikap: 93, aktif: 95, tugas: 94, uts: 92, uas: 94, catatan: 'Makalah kebijakan pendidikan Islam sangat rapi & aktif' },
  s24: { studentId: 's24', sikap: 92, aktif: 94, tugas: 93, uts: 91, uas: 93, catatan: 'Baik, rajin dan aktif presentasi' },
  s25: { studentId: 's25', sikap: 93, aktif: 95, tugas: 94, uts: 92, uas: 94, catatan: 'Penguasaan materi kebijakan mutakhir & aktif' },
  // Laki-laki: ZAINUL -> NILAI B+ (84)
  s26: { studentId: 's26', sikap: 81, aktif: 85, tugas: 82, uts: 78, uas: 80, catatan: 'Nilai B+, tugas dan telaah kebijakan tuntas di atas KKM' },
  // Laki-laki: MUHAMMAD IRFAN (Alfa terus tanpa keterangan - Merah)
  s27: {
    studentId: 's27',
    sikap: 0,
    aktif: 0,
    tugas: 0,
    uts: 0,
    uas: 0,
    catatan: 'Tidak pernah hadir perkuliahan (Alfa Terus / Tidak Lulus)',
  },
};

// ============================================================================
// 3. MATA KULIAH 3: FILSAFAT ILMU (MPI 1 - 14 MAHASISWA)
// Aturan: Nilai Laki-laki lebih rendah dari Perempuan
// ============================================================================
export const INITIAL_ATTENDANCE_FILSAFAT: Record<string, AttendanceStatus[]> = {
  f01: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  f02: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  f03: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  f04: ['H', 'H', 'H', 'H', 'I', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  f05: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  f06: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  f07: ['H', 'H', 'H', 'H', 'H', 'H', 'S', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  f08: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  f09: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  f10: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  f11: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  f12: ['H', 'H', 'H', 'H', 'I', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  f13: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  // Ayu: Presensi tidak aktif / belum masuk
  f14: ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
};

export const INITIAL_GRADES_FILSAFAT: Record<string, GradeRecord> = {
  // Perempuan: Lebih tinggi dari laki-laki (91-95)
  f01: { studentId: 'f01', sikap: 93, aktif: 95, tugas: 94, uts: 92, uas: 93, catatan: 'Pemahaman ontologi & presentasi logika sangat tajam' },
  f02: { studentId: 'f02', sikap: 92, aktif: 94, tugas: 93, uts: 90, uas: 92, catatan: 'Kajian epistemologi keilmuan Islam & presentasi baik' },
  f03: { studentId: 'f03', sikap: 93, aktif: 95, tugas: 94, uts: 91, uas: 93, catatan: 'Argumen filosofis logis, aktif dan runtut' },
  f04: { studentId: 'f04', sikap: 92, aktif: 94, tugas: 93, uts: 90, uas: 92, catatan: 'Tugas presentasi aksiologi nilai ilmu tuntas' },
  // Laki-laki: Khoir (Tetap di atas KKM 75: ~82, aktif & presentasi tinggi)
  f05: { studentId: 'f05', sikap: 82, aktif: 86, tugas: 85, uts: 79, uas: 82, catatan: 'Baik pada sejarah filsafat Islam di atas KKM' },
  // Perempuan: Lebih tinggi
  f06: { studentId: 'f06', sikap: 95, aktif: 96, tugas: 95, uts: 94, uas: 95, catatan: 'Sangat aktif dalam dialektika pemikiran & presentasi' },
  f07: { studentId: 'f07', sikap: 91, aktif: 93, tugas: 92, uts: 90, uas: 92, catatan: 'Makalah positivisme vs rasionalisme rapi & aktif' },
  // Laki-laki: Tomi (Tetap di atas KKM 75: ~81, aktif & presentasi tinggi)
  f08: { studentId: 'f08', sikap: 81, aktif: 85, tugas: 84, uts: 78, uas: 81, catatan: 'Tugas presentasi etika keilmuan baik di atas KKM' },
  // Perempuan: Lebih tinggi
  f09: { studentId: 'f09', sikap: 93, aktif: 95, tugas: 94, uts: 92, uas: 93, catatan: 'Paham hakikat kebenaran ilmiah & aktif presentasi' },
  f10: { studentId: 'f10', sikap: 92, aktif: 94, tugas: 93, uts: 91, uas: 93, catatan: 'Tugas tepat waktu, analitis dan aktif' },
  f11: { studentId: 'f11', sikap: 93, aktif: 95, tugas: 94, uts: 92, uas: 94, catatan: 'Baik dalam diskusi metodologi ilmiah & presentasi' },
  // Laki-laki: Ridho (Tetap di atas KKM 75: ~81, aktif & presentasi tinggi)
  f12: { studentId: 'f12', sikap: 81, aktif: 85, tugas: 84, uts: 78, uas: 81, catatan: 'Presentasi dan keaktifan baik di atas KKM' },
  // Perempuan: Lebih tinggi
  f13: { studentId: 'f13', sikap: 92, aktif: 94, tugas: 93, uts: 91, uas: 93, catatan: 'Pemahaman konsep filsafat ilmu baik & aktif' },
  // Perempuan: Ayu (Belum aktif / perlu konfirmasi)
  f14: {
    studentId: 'f14',
    sikap: 40,
    aktif: 30,
    tugas: 40,
    uts: 0,
    uas: 0,
    catatan: 'Belum aktif mengikuti perkuliahan / perlu konfirmasi',
  },
};

// Aliases for backwards compatibility if needed
export const INITIAL_ATTENDANCE_MPI3 = INITIAL_ATTENDANCE_KMP;
export const INITIAL_GRADES_MPI3 = INITIAL_GRADES_KMP;

export const INITIAL_EXAM_ACCESS: Record<string, ExamAccessControl> = {
  kmp: {
    isUtsUnlocked: false,
    isUasUnlocked: false,
  },
  akpi: {
    isUtsUnlocked: false,
    isUasUnlocked: false,
  },
  filsafat: {
    isUtsUnlocked: false,
    isUasUnlocked: false,
  },
};

export const INITIAL_SUBMISSIONS: Record<string, TaskSubmission[]> = {
  kmp: [
    {
      id: 'sub-kmp-01',
      courseId: 'kmp',
      studentId: 's03',
      studentName: 'ANITA MIRDAYANTI',
      type: 'PRESENTASI',
      title: 'Presentasi Konsep Dasar POAC dalam Manajemen Pendidikan Islam',
      fileName: 'Presentasi_Kelompok1_Anita_Mirdayanti_KDMP.pptx',
      fileSize: '3.4 MB',
      submittedAt: '2026-10-14 09:30',
      contentSnippet: 'Analisis fungsi perencanaan (planning), pengorganisasian (organizing), penggerakan (actuating), dan pengendalian (controlling) pada madrasah modern.',
      status: 'DINILAI',
      score: 94,
      feedback: 'Presentasi sangat sistematis, penguasaan materi istimewa dan komunikatif.',
    },
    {
      id: 'sub-kmp-02',
      courseId: 'kmp',
      studentId: 's06',
      studentName: 'ERRA LATIFATUL ROKHMAH',
      type: 'PRESENTASI',
      title: 'Kepemimpinan Efektif & Budaya Mutu Lembaga Pendidikan Islam',
      fileName: 'Makalah_Presentasi_Kelompok2_Erra_Latifatul.pdf',
      fileSize: '2.1 MB',
      submittedAt: '2026-10-15 14:15',
      contentSnippet: 'Kajian empiris kepemimpinan transformasional kyai dan kepala madrasah dalam membangun iklim akademik yang unggul.',
      status: 'DINILAI',
      score: 93,
      feedback: 'Analisis studi kasus komprehensif, referensi literatur sangat mutakhir.',
    },
    {
      id: 'sub-kmp-03',
      courseId: 'kmp',
      studentId: 's12',
      studentName: 'M. MILHAN AUFA ZAHRAN',
      type: 'PRESENTASI',
      title: 'Digitalisasi Sistem Informasi Manajemen Pendidikan Madrasah (SIMPATIKA)',
      fileName: 'Tugas_Presentasi_Kelompok3_M_Milhan.pdf',
      fileSize: '1.9 MB',
      submittedAt: '2026-10-16 11:00',
      contentSnippet: 'Implementasi platform SIMPATIKA dan EMIS Kemenag dalam optimasi administrasi guru dan pemantauan mutu kelembagaan.',
      status: 'DINILAI',
      score: 75,
      feedback: 'Cukup aplikatif, perlu melengkapi studi kendala jaringan di daerah pesisir.',
    },
    {
      id: 'sub-kmp-04',
      courseId: 'kmp',
      studentId: 's22',
      studentName: 'RAFI AUDITY ADIFA SYAQILA',
      type: 'PRESENTASI',
      title: 'Manajemen Keuangan dan Pembiayaan Pendidikan Berbasis RKAM',
      fileName: 'Slide_Presentasi_Kelompok4_Rafi_Audity.pptx',
      fileSize: '2.8 MB',
      submittedAt: '2026-10-18 10:20',
      contentSnippet: 'Tata kelola anggaran madrasah, akuntabilitas dana BOS, dan formulasi efisiensi belanja operasional pendidikan Islam.',
      status: 'DINILAI',
      score: 73,
      feedback: 'Paparan visual baik, perbaiki formula analisis rasio biaya per siswa.',
    },
  ],
  akpi: [
    {
      id: 'sub-akpi-01',
      courseId: 'akpi',
      studentId: 's04',
      studentName: 'DEA OKTAVIA',
      type: 'PRESENTASI',
      title: 'Analisis Formulasi Kebijakan Kurikulum Madrasah Mandiri Berprestasi',
      fileName: 'Presentasi_AKPI_Dea_Oktavia.pptx',
      fileSize: '2.5 MB',
      submittedAt: '2026-10-20 08:45',
      contentSnippet: 'Kajian regulasi PMA No 347 Tahun 2022 tentang implementasi kurikulum merdeka pada madrasah aliyah.',
      status: 'DINILAI',
      score: 92,
      feedback: 'Sangat analitis dan berbasis landasan hukum yang presisi.',
    },
  ],
  filsafat: [
    {
      id: 'sub-fil-01',
      courseId: 'filsafat',
      studentId: 'f06',
      studentName: 'ESTIYANI',
      type: 'PRESENTASI',
      title: 'Dialektika Rasionalisme & Empirisme dalam Epistemologi Sains Islam',
      fileName: 'Presentasi_Filsafat_Ilmu_Estiyani.pdf',
      fileSize: '2.2 MB',
      submittedAt: '2026-10-12 13:00',
      contentSnippet: 'Sintesis metodologi ilmiah Ibnu al-Haitsam dan signifikansinya dalam integrasi sains dan agama modern.',
      status: 'DINILAI',
      score: 95,
      feedback: 'Argumentasi filosofis tajam, dialektika ilmiah tersusun rapi.',
    },
  ],
};

