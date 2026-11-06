import React, { useState } from 'react';
import {
  Course,
  Student,
  AttendanceStatus,
  GradeRecord,
  TaskSubmission,
  ExamAccessControl,
} from '../data/academicData';
import { exportSemesterBackupZip } from '../utils/zipExport';
import {
  Lock,
  Unlock,
  Archive,
  Upload,
  FileText,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Users,
  Eye,
  Search,
  Check,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';

interface AssignmentExamPortalProps {
  course: Course;
  courses: Course[];
  students: Student[];
  attendanceMap: Record<string, AttendanceStatus[]>;
  gradesMap: Record<string, GradeRecord>;
  examAccess: ExamAccessControl;
  submissions: TaskSubmission[];
  onSelectCourse: (courseId: string) => void;
  onToggleExamLock: (type: 'UTS' | 'UAS') => void;
  onSubmitTask: (submission: Omit<TaskSubmission, 'id' | 'submittedAt'>) => void;
  onUpdateSubmission: (id: string, updates: Partial<TaskSubmission>) => void;
  onDeleteSubmission: (id: string) => void;
  onResetSubmissionForRevision: (id: string) => void;
}

export const AssignmentExamPortal: React.FC<AssignmentExamPortalProps> = ({
  course,
  courses,
  students,
  attendanceMap,
  gradesMap,
  examAccess,
  submissions,
  onSelectCourse,
  onToggleExamLock,
  onSubmitTask,
  onUpdateSubmission,
  onDeleteSubmission,
  onResetSubmissionForRevision,
}) => {
  const [activeTab, setActiveTab] = useState<'MONITORING' | 'SUBMIT' | 'COLLABORATION'>('MONITORING');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [taskType, setTaskType] = useState<'PRESENTASI' | 'UTS' | 'UAS'>('PRESENTASI');
  const [taskTitle, setTaskTitle] = useState('');
  const [fileName, setFileName] = useState('');
  const [contentSnippet, setContentSnippet] = useState('');
  const [selectedFileObj, setSelectedFileObj] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'PRESENTASI' | 'UTS' | 'UAS'>('ALL');
  const [previewSub, setPreviewSub] = useState<TaskSubmission | null>(null);

  const courseSubmissions = submissions.filter((s) => s.courseId === course.id);

  // Check if current selected student has submitted the chosen task type
  const existingSubmission = courseSubmissions.find(
    (s) => s.studentId === selectedStudentId && s.type === taskType
  );

  const isFormLockedForStudent =
    existingSubmission && existingSubmission.status !== 'REVISI_DIIZINKAN';

  // Check if exam is locked by lecturer
  const isExamLocked =
    (taskType === 'UTS' && !examAccess.isUtsUnlocked) ||
    (taskType === 'UAS' && !examAccess.isUasUnlocked);

  const handleBackupZip = async () => {
    setIsBackingUp(true);
    try {
      await exportSemesterBackupZip(course, students, attendanceMap, gradesMap, courseSubmissions);
    } catch (err) {
      console.error('Error generating backup zip:', err);
      alert('Gagal membuat backup ZIP. Silakan coba lagi.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileObj(file);
      setFileName(file.name);
      if (!taskTitle) {
        setTaskTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) return;

    if (isExamLocked) {
      alert(`Ujian ${taskType} saat ini terkunci oleh Dosen. Pengiriman jawaban belum dibuka.`);
      return;
    }

    if (isFormLockedForStudent) {
      alert('Tugas telah berhasil dikirim sebelumnya dan form terkunci. Pengiriman hanya dapat diulang jika dosen mereset status tugas untuk revisi.');
      return;
    }

    const calculatedSize = selectedFileObj
      ? `${(selectedFileObj.size / (1024 * 1024)).toFixed(1)} MB`
      : '2.4 MB';

    const chosenFileName = fileName || `${taskType}_${student.name.replace(/\s+/g, '_')}.pdf`;

    onSubmitTask({
      courseId: course.id,
      studentId: student.id,
      studentName: student.name,
      type: taskType,
      title: taskTitle || `Tugas ${taskType} - ${student.name}`,
      fileName: chosenFileName,
      fileSize: calculatedSize,
      contentSnippet:
        contentSnippet ||
        `Dokumen tugas ${taskType} mata kuliah ${course.name} resmi diunggah oleh mahasiswa ${student.name}.`,
      status: 'TERKIRIM',
    });

    // Reset form fields
    setTaskTitle('');
    setFileName('');
    setContentSnippet('');
    setSelectedFileObj(null);
    alert(`Berkas ${taskType} atas nama ${student.name} berhasil dikirim dan tersimpan permanen!`);
  };

  const filteredSubmissions = courseSubmissions.filter((sub) => {
    const matchCat = categoryFilter === 'ALL' || sub.type === categoryFilter;
    const matchSearch =
      sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const presentationSubmissions = courseSubmissions.filter((s) => s.type === 'PRESENTASI');

  const downloadTextFile = (sub: TaskSubmission) => {
    const textContent = `DOKUMEN TUGAS AKADEMIK STAI JARINABI
==============================================
Mata Kuliah     : ${course.name} (${course.code})
Dosen Pengampu  : ${course.dosen}
Nama Mahasiswa  : ${sub.studentName}
Kategori        : ${sub.type}
Judul Berkas    : ${sub.title}
Nama File       : ${sub.fileName}
Waktu Unggah    : ${sub.submittedAt}
Status          : ${sub.status}
Nilai Dosen     : ${sub.score !== undefined ? sub.score : 'Belum dinilai'}
Catatan Dosen   : ${sub.feedback || '-'}
----------------------------------------------
Ringkasan Materi / Isi Berkas:
${sub.contentSnippet || 'Dokumen tugas pembelajaran tersimpan aman dalam sistem.'}
`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sub.fileName.replace(/\.[^/.]+$/, '')}_STAI_Jarinabi.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Course Selector Banner */}
      <div className="bg-gradient-to-r from-[#0b3834] via-[#0f443f] to-[#134e4a] text-white p-4 rounded-xl shadow-md border border-emerald-900 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase">
              {course.prodiGroup === 'MPI_3' ? 'KELAS MPI 3' : 'KELAS MPI 1'}
            </span>
            <span className="text-teal-200 text-xs font-mono font-bold">{course.code}</span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-emerald-300 text-xs font-semibold">{course.sks} SKS</span>
          </div>
          <h2 className="text-lg md:text-xl font-extrabold text-white mt-0.5">
            {course.name} — Portal Tugas, Ujian & Arsip
          </h2>
          <p className="text-xs text-teal-100/90 mt-1">
            Dosen Pengampu: <span className="font-bold text-white">{course.dosen}</span> • Kaprodi:{' '}
            <span className="font-bold text-white">{course.kaprodi}</span>
          </p>
        </div>

        {/* Course Quick Switches */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/30 p-1.5 rounded-lg border border-teal-800/60">
          <span className="text-[11px] font-bold text-teal-200 px-1 hidden lg:inline">Pilih MK:</span>
          {courses.map((c) => {
            const isSelected = c.id === course.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectCourse(c.id)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {c.id === 'kmp' ? 'KD Manajemen' : c.id === 'akpi' ? 'Kebijakan Islam' : 'Filsafat Ilmu'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Kontrol Akses Ujian Dosen & Backup ZIP Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Kontrol Akses UTS */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800">Kontrol Akses UTS:</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  examAccess.isUtsUnlocked
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {examAccess.isUtsUnlocked ? 'TERBUKA' : 'TERKUNCI'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {examAccess.isUtsUnlocked
                ? 'Mahasiswa dapat mengirim jawaban UTS'
                : 'Pengiriman UTS ditutup/terkunci'}
            </p>
          </div>
          <button
            onClick={() => onToggleExamLock('UTS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer ${
              examAccess.isUtsUnlocked
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            title="Dosen mengontrol akses pengiriman jawaban UTS secara manual"
          >
            {examAccess.isUtsUnlocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{examAccess.isUtsUnlocked ? 'Kunci UTS' : 'Buka Kunci UTS'}</span>
          </button>
        </div>

        {/* Kontrol Akses UAS */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800">Kontrol Akses UAS:</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  examAccess.isUasUnlocked
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {examAccess.isUasUnlocked ? 'TERBUKA' : 'TERKUNCI'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {examAccess.isUasUnlocked
                ? 'Mahasiswa dapat mengirim jawaban UAS'
                : 'Pengiriman UAS ditutup/terkunci'}
            </p>
          </div>
          <button
            onClick={() => onToggleExamLock('UAS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer ${
              examAccess.isUasUnlocked
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            title="Dosen mengontrol akses pengiriman jawaban UAS secara manual"
          >
            {examAccess.isUasUnlocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{examAccess.isUasUnlocked ? 'Kunci UAS' : 'Buka Kunci UAS'}</span>
          </button>
        </div>

        {/* Backup Menyeluruh Format ZIP */}
        <div className="bg-gradient-to-r from-teal-800 to-emerald-800 p-3.5 rounded-xl border border-emerald-700 shadow-xs text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white flex items-center gap-1">
              <Archive className="w-3.5 h-3.5 text-amber-300" />
              Backup Semester (.ZIP)
            </span>
            <p className="text-[11px] text-teal-100/90 mt-0.5">
              Seluruh berkas tugas, UTS, UAS & nilai
            </p>
          </div>
          <button
            onClick={handleBackupZip}
            disabled={isBackingUp}
            className="px-3 py-1.5 rounded-lg text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-1.5 shadow-md transition disabled:opacity-50 cursor-pointer"
            title="Unduh backup data per semester berformat file .zip terpadu"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isBackingUp ? 'Memproses...' : 'Unduh ZIP'}</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-1.5 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('MONITORING')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'MONITORING'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Panel Pemantauan Dosen (Real-time)</span>
        </button>

        <button
          onClick={() => setActiveTab('COLLABORATION')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'COLLABORATION'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Repositori Presentasi Teman (Review & Unduh)</span>
        </button>

        <button
          onClick={() => setActiveTab('SUBMIT')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'SUBMIT'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Formulir Pengumpulan Tugas & Ujian</span>
        </button>
      </div>

      {/* TAB 1: Panel Pemantauan Dosen (Real-time) */}
      {activeTab === 'MONITORING' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          {/* Header Controls */}
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Filter Kategori:</span>
              {(['ALL', 'PRESENTASI', 'UTS', 'UAS'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-teal-700 text-white'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cat === 'ALL' ? 'Semua Berkas' : cat}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari mahasiswa / judul berkas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-56"
              />
            </div>
          </div>

          {/* Submissions Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-[#0b3834] text-white">
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-4 min-w-[180px]">Nama Mahasiswa</th>
                  <th className="py-2.5 px-3 w-28 text-center">Kategori</th>
                  <th className="py-2.5 px-4 min-w-[220px]">Judul & Berkas</th>
                  <th className="py-2.5 px-3 w-32">Waktu Kirim</th>
                  <th className="py-2.5 px-3 w-28 text-center">Status Validasi</th>
                  <th className="py-2.5 px-3 w-20 text-center">Nilai</th>
                  <th className="py-2.5 px-4 min-w-[200px]">Catatan / Feedback Dosen</th>
                  <th className="py-2.5 px-3 w-36 text-center">Aksi Dosen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                      Belum ada berkas tugas atau ujian yang dikumpulkan untuk kriteria ini.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub, idx) => (
                    <tr
                      key={sub.id}
                      className={`hover:bg-slate-50 transition ${
                        sub.status === 'REVISI_DIIZINKAN'
                          ? 'bg-amber-50/60'
                          : sub.score !== undefined && sub.score < 75
                          ? 'bg-amber-50/30'
                          : 'bg-white'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{sub.studentName}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            sub.type === 'PRESENTASI'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : sub.type === 'UTS'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                          }`}
                        >
                          {sub.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <p className="font-semibold text-slate-800 leading-tight">{sub.title}</p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono">{sub.fileName}</span>
                          <span>•</span>
                          <span>{sub.fileSize}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                        {sub.submittedAt}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            sub.status === 'DINILAI'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : sub.status === 'REVISI_DIIZINKAN'
                              ? 'bg-amber-100 text-amber-950 border border-amber-400 font-black'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {sub.status === 'DINILAI'
                            ? 'Sudah Dinilai'
                            : sub.status === 'REVISI_DIIZINKAN'
                            ? 'Revisi Diizinkan'
                            : 'Terkirim'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={sub.score ?? ''}
                          placeholder="0"
                          onChange={(e) =>
                            onUpdateSubmission(sub.id, {
                              score: e.target.value === '' ? undefined : Number(e.target.value),
                              status: 'DINILAI',
                            })
                          }
                          className={`w-14 text-center py-1 rounded font-bold font-mono text-xs border ${
                            sub.score !== undefined && sub.score < 75
                              ? 'bg-amber-100 text-amber-950 border-amber-400 ring-1 ring-amber-300'
                              : 'bg-white text-slate-800 border-slate-300'
                          }`}
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={sub.feedback || ''}
                          placeholder="Ketik feedback atau catatan dosen..."
                          onChange={(e) => onUpdateSubmission(sub.id, { feedback: e.target.value })}
                          className="w-full text-xs py-1 px-2 border border-slate-200 rounded focus:border-teal-500 bg-white"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Preview / Download */}
                          <button
                            onClick={() => downloadTextFile(sub)}
                            className="p-1.5 text-teal-700 hover:bg-teal-50 rounded border border-teal-200 transition cursor-pointer"
                            title="Unduh / Buka Dokumen Tugas"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset / Allow Revision */}
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `Buka kembali akses pengiriman untuk ${sub.studentName} agar dapat mengirim revisi tugas ini?`
                                )
                              ) {
                                onResetSubmissionForRevision(sub.id);
                              }
                            }}
                            className="p-1.5 text-amber-700 hover:bg-amber-50 rounded border border-amber-200 transition cursor-pointer"
                            title="Buka akses pengiriman ulang (Revisi) untuk mahasiswa ini"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          {/* Manual Delete by Lecturer */}
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `Hapus permanen berkas "${sub.fileName}" milik ${sub.studentName}? Sesuai aturan, berkas hanya dapat dihapus manual oleh dosen.`
                                )
                              ) {
                                onDeleteSubmission(sub.id);
                              }
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded border border-rose-200 transition cursor-pointer"
                            title="Hapus manual tugas mahasiswa ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Repositori Presentasi Teman (Review & Unduh) */}
      {activeTab === 'COLLABORATION' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-4 rounded-xl border border-teal-200 text-xs text-teal-900 flex items-center gap-3">
            <Users className="w-5 h-5 text-teal-700 shrink-0" />
            <div>
              <p className="font-bold text-teal-950">
                Pusat Pembelajaran & Diskusi Kolaboratif Mahasiswa
              </p>
              <p className="text-teal-800 mt-0.5">
                Setiap mahasiswa dapat melihat, mereview gagasan, dan mengunduh berkas materi presentasi teman sekelas
                untuk bahan referensi, persiapan ujian, dan pengayaan diskusi ilmiah.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presentationSubmissions.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 italic bg-white rounded-xl border border-slate-200">
                Belum ada berkas tugas presentasi yang diunggah oleh mahasiswa di mata kuliah ini.
              </div>
            ) : (
              presentationSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-bold">
                        PRESENTASI
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">{sub.fileSize}</span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                      {sub.title}
                    </h3>
                    <p className="text-xs font-semibold text-teal-700 mt-1">
                      Oleh: {sub.studentName}
                    </p>

                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-3">
                      {sub.contentSnippet || 'Kajian materi presentasi lengkap.'}
                    </p>

                    {sub.feedback && (
                      <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-50/70 p-2 rounded border border-emerald-200">
                        <span className="font-bold">Ulasan Dosen:</span> {sub.feedback}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {sub.submittedAt.split(' ')[0]}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPreviewSub(sub)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 flex items-center gap-1 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </button>
                      <button
                        onClick={() => downloadTextFile(sub)}
                        className="px-2.5 py-1 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded flex items-center gap-1 shadow-xs transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh File</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Formulir Pengumpulan Tugas & Ujian */}
      {activeTab === 'SUBMIT' && (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xs border border-slate-200 p-5 md:p-6">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-base text-slate-900">
              Formulir Pengumpulan Tugas & Dokumen Ujian
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sistem menerapkan aturan satu kali kirim permanen. Pastikan dokumen yang diunggah sudah benar.
            </p>
          </div>

          <form onSubmit={handleStudentSubmit} className="space-y-4">
            {/* Student Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Nama Mahasiswa Pengirim:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full text-xs font-semibold py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} {st.isPermanentAlfa ? '(Alfa Tanpa Keterangan)' : st.isTestIzin ? '(Izin Susulan)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Task Type Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori Berkas yang Dikirim:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['PRESENTASI', 'UTS', 'UAS'] as const).map((t) => {
                  const isSelected = taskType === t;
                  const isLocked =
                    (t === 'UTS' && !examAccess.isUtsUnlocked) ||
                    (t === 'UAS' && !examAccess.isUasUnlocked);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTaskType(t)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold flex flex-col items-center gap-1 border transition cursor-pointer ${
                        isSelected
                          ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {isLocked && <Lock className="w-3 h-3 text-rose-500" />}
                        {t}
                      </span>
                      <span className="text-[10px] font-normal opacity-80">
                        {t === 'PRESENTASI'
                          ? 'Makalah / PPT'
                          : t === 'UTS'
                          ? 'Ujian Tengah'
                          : 'Ujian Akhir'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lock Warnings */}
            {isExamLocked && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg flex items-start gap-2.5 text-xs text-rose-900">
                <Lock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Akses Pengiriman Ujian {taskType} Terkunci:</span>
                  <p className="mt-0.5">
                    Dosen pengampu belum membuka akses ujian {taskType}. Pengumpulan jawaban hanya dapat
                    dilakukan pada jadwal resmi saat tombol dibuka oleh dosen.
                  </p>
                </div>
              </div>
            )}

            {isFormLockedForStudent && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-2.5 text-xs text-amber-950">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Form Terkunci (Satu Kali Kirim):</span>
                  <p className="mt-0.5">
                    Mahasiswa ini telah berhasil mengirimkan {taskType} pada{' '}
                    <span className="font-mono font-bold">{existingSubmission?.submittedAt}</span> (File:{' '}
                    <span className="font-mono">{existingSubmission?.fileName}</span>).
                  </p>
                  <p className="text-[11px] text-amber-800 mt-1">
                    *Untuk melakukan perbaikan (revisi), dosen harus mereset atau mengizinkan perbaikan di panel dosen.
                  </p>
                </div>
              </div>
            )}

            {/* Title & File Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Judul Tugas / Berkas:
              </label>
              <input
                type="text"
                disabled={isExamLocked || isFormLockedForStudent}
                placeholder={`Contoh: Tugas ${taskType} - Konsep Dasar Manajemen`}
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                required
              />
            </div>

            {/* File Upload Simulator & Real File Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Berkas Dokumen (PDF, PPTX, DOCX):
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition cursor-pointer">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <label className="cursor-pointer block">
                  <span className="text-xs font-bold text-teal-700 hover:underline">
                    Pilih File dari Perangkat
                  </span>
                  <input
                    type="file"
                    disabled={isExamLocked || isFormLockedForStudent}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.pptx,.ppt,.docx,.doc,.xlsx,.zip"
                  />
                </label>
                <p className="text-[11px] text-slate-500 mt-1">
                  {fileName ? (
                    <span className="font-bold text-teal-800 font-mono">{fileName}</span>
                  ) : (
                    'Mendukung format .pdf, .pptx, .docx (Maksimal 25MB)'
                  )}
                </p>
              </div>
            </div>

            {/* Content Snippet / Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ringkasan / Abstrak Materi:
              </label>
              <textarea
                disabled={isExamLocked || isFormLockedForStudent}
                rows={3}
                placeholder="Tuliskan intisari materi atau catatan khusus terkait tugas..."
                value={contentSnippet}
                onChange={(e) => setContentSnippet(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isExamLocked || isFormLockedForStudent}
              className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white font-bold rounded-lg text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              <span>
                {isExamLocked
                  ? 'Ujian Terkunci oleh Dosen'
                  : isFormLockedForStudent
                  ? 'Sudah Dikirim (Terkunci)'
                  : 'Kirim Dokumen Tugas Sekarang'}
              </span>
            </button>
          </form>
        </div>
      )}

      {/* Review Modal */}
      {previewSub && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">Review Berkas Presentasi</h3>
              <button
                onClick={() => setPreviewSub(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="py-3 space-y-2 text-xs">
              <p>
                <span className="font-bold text-slate-700">Mahasiswa:</span> {previewSub.studentName}
              </p>
              <p>
                <span className="font-bold text-slate-700">Judul:</span> {previewSub.title}
              </p>
              <p>
                <span className="font-bold text-slate-700">Nama File:</span>{' '}
                <span className="font-mono">{previewSub.fileName}</span> ({previewSub.fileSize})
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2">
                <span className="font-bold text-slate-800 block mb-1">Ringkasan Materi Presentasi:</span>
                <p className="text-slate-700 leading-relaxed">
                  {previewSub.contentSnippet || 'Kajian materi presentasi lengkap.'}
                </p>
              </div>
              {previewSub.feedback && (
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 mt-2 text-emerald-950">
                  <span className="font-bold block mb-0.5">Catatan Dosen Pengampu:</span>
                  <p>{previewSub.feedback}</p>
                </div>
              )}
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setPreviewSub(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  downloadTextFile(previewSub);
                  setPreviewSub(null);
                }}
                className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Berkas</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
