import React, { useState } from 'react';
import { Course, SemesterArchive } from '../data/academicData';
import { Settings, Save, Archive, ArrowUpRight, X, Calendar, User, BookOpen } from 'lucide-react';

interface CourseSettingsModalProps {
  course: Course;
  archives: SemesterArchive[];
  onSaveCourse: (updated: Course) => void;
  onNaikSemester: (newSemesterName: string, newAcademicYear: string) => void;
  onRestoreArchive?: (archiveId: string) => void;
  onClose: () => void;
}

export const CourseSettingsModal: React.FC<CourseSettingsModalProps> = ({
  course,
  archives,
  onSaveCourse,
  onNaikSemester,
  onRestoreArchive,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'EDIT_INFO' | 'NAIK_SEMESTER' | 'ARSIP_LAMA'>('EDIT_INFO');

  // Form states for Course & Signatures
  const [name, setName] = useState(course.name);
  const [code, setCode] = useState(course.code);
  const [sks, setSks] = useState(course.sks);
  const [semester, setSemester] = useState(course.semester);
  const [academicYear, setAcademicYear] = useState(course.academicYear);
  const [dosen, setDosen] = useState(course.dosen);
  const [dosenNip, setDosenNip] = useState(course.dosenNip);
  const [kaprodi, setKaprodi] = useState(course.kaprodi);
  const [kaprodiNidn, setKaprodiNidn] = useState(course.kaprodiNidn);

  // Form states for Naik Semester
  const [newSemesterName, setNewSemesterName] = useState('Semester IV (Genap 2026/2027)');
  const [newAcademicYear, setNewAcademicYear] = useState('2026/2027');

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCourse({
      ...course,
      name,
      code,
      sks: Number(sks),
      semester,
      academicYear,
      dosen,
      dosenNip,
      kaprodi,
      kaprodiNidn,
    });
    onClose();
  };

  const handleNaikSemesterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSemesterName.trim()) return;
    if (
      confirm(
        `Apakah Anda yakin ingin menyimpan data semester ini ke arsip dan naik ke '${newSemesterName}'? Seluruh data nilai dan presensi semester ini tetap aman tersimpan di arsip.`
      )
    ) {
      onNaikSemester(newSemesterName, newAcademicYear);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Pengaturan Informasi Perkuliahan & Semester
              </h3>
              <p className="text-xs text-slate-500">
                Sunting Nama MK, Semester, Dosen, Nama Kaprodi, atau Arsipkan & Naik Semester.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('EDIT_INFO')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'EDIT_INFO'
                ? 'bg-teal-700 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Edit Nama MK, Kaprodi & Dosen
          </button>
          <button
            onClick={() => setActiveTab('NAIK_SEMESTER')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'NAIK_SEMESTER'
                ? 'bg-teal-700 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Simpan Data & Naik Semester
          </button>
          <button
            onClick={() => setActiveTab('ARSIP_LAMA')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'ARSIP_LAMA'
                ? 'bg-teal-700 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Arsip Data Lama ({archives.length})
          </button>
        </div>

        {/* TAB 1: Edit Info */}
        {activeTab === 'EDIT_INFO' && (
          <form onSubmit={handleSaveInfo} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Mata Kuliah:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode MK & SKS:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="Kode MK"
                  />
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={sks}
                    onChange={(e) => setSks(Number(e.target.value))}
                    className="w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="SKS"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Semester:</label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Contoh: Semester III (Ganjil 2026/2027)"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tahun Akademik:</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="2026/2027"
                />
              </div>
            </div>

            <div className="pt-2 border-t">
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-700" />
                Data Dosen Pengampu & Ketua Program Studi (Kaprodi):
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Nama Dosen Pengampu & Gelar:
                  </label>
                  <input
                    type="text"
                    required
                    value={dosen}
                    onChange={(e) => setDosen(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">NIP / NIDN Dosen:</label>
                  <input
                    type="text"
                    value={dosenNip}
                    onChange={(e) => setDosenNip(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Nama Ketua Program Studi (Kaprodi):
                  </label>
                  <input
                    type="text"
                    required
                    value={kaprodi}
                    onChange={(e) => setKaprodi(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    NIDN / NIP Kaprodi:
                  </label>
                  <input
                    type="text"
                    value={kaprodiNidn}
                    onChange={(e) => setKaprodiNidn(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-xs"
              >
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: Naik Semester */}
        {activeTab === 'NAIK_SEMESTER' && (
          <form onSubmit={handleNaikSemesterSubmit} className="space-y-4 text-xs">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-950 space-y-2">
              <h4 className="font-bold flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4 text-emerald-700" />
                Fitur Naik Semester & Simpan Data Lama
              </h4>
              <p className="text-emerald-900 leading-relaxed">
                Saat Anda naik semester, seluruh rekapan nilai, presensi, dan data mahasiswa semester ini akan
                secara otomatis dibackup dan diarsipkan ke dalam basis data <strong>"Data Lama"</strong>.
                Sistem kemudian akan membuka lembar semester baru yang segar bagi Anda.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Semester Baru:</label>
              <input
                type="text"
                required
                value={newSemesterName}
                onChange={(e) => setNewSemesterName(e.target.value)}
                placeholder="Contoh: Semester IV (Genap 2026/2027)"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tahun Akademik:</label>
              <input
                type="text"
                required
                value={newAcademicYear}
                onChange={(e) => setNewAcademicYear(e.target.value)}
                placeholder="2026/2027"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
              >
                <Archive className="w-4 h-4" />
                Arsipkan Sekarang & Buka Semester Baru
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: Arsip Data Lama */}
        {activeTab === 'ARSIP_LAMA' && (
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-800">Daftar Arsip Semester yang Telah Disimpan:</h4>
            {archives.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 border border-dashed rounded-xl text-slate-400">
                Belum ada arsip semester sebelumnya. Klik tab "Simpan Data & Naik Semester" untuk mengarsipkan.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {archives.map((arch) => (
                  <div
                    key={arch.id}
                    className="p-3 bg-slate-50 border rounded-lg flex items-center justify-between gap-3"
                  >
                    <div>
                      <h5 className="font-bold text-slate-900">{arch.semesterName}</h5>
                      <p className="text-[11px] text-slate-500">
                        Tahun Akademik: {arch.academicYear} • Disimpan: {arch.savedAt}
                      </p>
                    </div>
                    {onRestoreArchive && (
                      <button
                        onClick={() => onRestoreArchive(arch.id)}
                        className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded font-bold transition"
                      >
                        Buka Arsip Ini
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
