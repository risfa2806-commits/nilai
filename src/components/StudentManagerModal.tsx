import React, { useState } from 'react';
import { Student } from '../data/academicData';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  FileSpreadsheet,
  FileText,
  Upload,
  CheckCircle,
  X,
  AlertCircle,
  Save,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface StudentManagerModalProps {
  courseName: string;
  students: Student[];
  onAddStudent: (name: string, status?: 'NORMAL' | 'MERAH_ALFA' | 'KUNING_TES') => void;
  onBulkAddStudents: (names: string[]) => void;
  onUpdateStudent: (id: string, updated: Partial<Student>) => void;
  onDeleteStudent: (id: string) => void;
  onClose: () => void;
}

export const StudentManagerModal: React.FC<StudentManagerModalProps> = ({
  courseName,
  students,
  onAddStudent,
  onBulkAddStudents,
  onUpdateStudent,
  onDeleteStudent,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'LIST' | 'IMPORT_EXCEL_WORD' | 'ADD_MANUAL'>('LIST');

  // Manual add state
  const [manualName, setManualName] = useState('');
  const [manualStatus, setManualStatus] = useState<'NORMAL' | 'MERAH_ALFA' | 'KUNING_TES'>('NORMAL');

  // Bulk paste state (From Word / Excel)
  const [bulkText, setBulkText] = useState('');

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleStartEdit = (s: Student) => {
    setEditingId(s.id);
    setEditingName(s.name);
  };

  const handleSaveEdit = (id: string) => {
    if (editingName.trim()) {
      onUpdateStudent(id, { name: editingName.trim() });
    }
    setEditingId(null);
  };

  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;
    onAddStudent(manualName.trim(), manualStatus);
    setManualName('');
    setActiveTab('LIST');
  };

  const handleBulkTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    // Split by newlines, clean numbers/bullets/tabs from Excel or Word
    const lines = bulkText
      .split('\n')
      .map((line) => {
        // Remove leading numbers like "1.", "1 ", tabs from Excel cells
        return line
          .replace(/^[\d]+[\.\)\s\t]+/, '')
          .replace(/\t.*/, '') // take first column if tab separated
          .trim();
      })
      .filter((line) => line.length > 1);

    if (lines.length === 0) {
      alert('Tidak ditemukan nama mahasiswa yang valid.');
      return;
    }

    onBulkAddStudents(lines);
    setBulkText('');
    setActiveTab('LIST');
  };

  // Upload and parse Excel file
  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        const extractedNames: string[] = [];
        data.forEach((row) => {
          if (!row || row.length === 0) return;
          // Look for text column that looks like student name
          for (let col of row) {
            if (typeof col === 'string') {
              const clean = col.trim();
              if (
                clean.length > 2 &&
                !clean.toLowerCase().includes('nama') &&
                !clean.toLowerCase().includes('mahasiswa') &&
                !clean.toLowerCase().includes('no')
              ) {
                extractedNames.push(clean);
                break;
              }
            }
          }
        });

        if (extractedNames.length > 0) {
          onBulkAddStudents(extractedNames);
          alert(`Berhasil mengimpor ${extractedNames.length} nama mahasiswa dari berkas Excel!`);
          setActiveTab('LIST');
        } else {
          alert('Tidak dapat mendeteksi kolom nama mahasiswa dalam file Excel.');
        }
      } catch (err) {
        alert('Gagal membaca berkas Excel: ' + err);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Kelola Data Mahasiswa ({courseName})
              </h3>
              <p className="text-xs text-slate-500">
                Edit nama mahasiswa, tambah manual, atau impor banyak nama dari salinan Excel / Word.
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
            onClick={() => setActiveTab('LIST')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'LIST'
                ? 'bg-teal-700 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Daftar Mahasiswa ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('IMPORT_EXCEL_WORD')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'IMPORT_EXCEL_WORD'
                ? 'bg-teal-700 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            Impor dari Excel / Word
          </button>
          <button
            onClick={() => setActiveTab('ADD_MANUAL')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'ADD_MANUAL'
                ? 'bg-teal-700 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Manual
          </button>
        </div>

        {/* TAB 1: LIST & INLINE EDIT */}
        {activeTab === 'LIST' && (
          <div className="space-y-3">
            <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2 px-3 w-10 text-center">No</th>
                    <th className="py-2 px-3">Nama Mahasiswa</th>
                    <th className="py-2 px-3 w-40 text-center">Status Khusus</th>
                    <th className="py-2 px-3 w-28 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {students.map((student, idx) => (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/70 ${
                        student.isPermanentAlfa
                          ? 'bg-rose-50/60'
                          : student.isTestIzin
                          ? 'bg-amber-50/60'
                          : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-center text-slate-500 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900">
                        {editingId === student.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="px-2 py-1 border border-teal-500 rounded text-xs w-full font-bold"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveEdit(student.id)}
                              className="p-1 bg-teal-600 text-white rounded hover:bg-teal-700"
                              title="Simpan"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{student.name}</span>
                            <button
                              onClick={() => handleStartEdit(student)}
                              className="p-1 text-slate-400 hover:text-teal-700 rounded transition"
                              title="Edit Nama"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status Khusus (Otomatis Merah / Kuning) */}
                      <td className="py-2 px-3 text-center">
                        <select
                          value={
                            student.isPermanentAlfa
                              ? 'MERAH_ALFA'
                              : student.isTestIzin
                              ? 'KUNING_TES'
                              : 'NORMAL'
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'MERAH_ALFA') {
                              onUpdateStudent(student.id, {
                                isPermanentAlfa: true,
                                isTestIzin: false,
                                notes: 'Tidak pernah masuk (Alfa)',
                              });
                            } else if (val === 'KUNING_TES') {
                              onUpdateStudent(student.id, {
                                isPermanentAlfa: false,
                                isTestIzin: true,
                                notes: 'Izin Tes Pendidikan / UTS Susulan',
                              });
                            } else {
                              onUpdateStudent(student.id, {
                                isPermanentAlfa: false,
                                isTestIzin: false,
                                notes: '',
                              });
                            }
                          }}
                          className={`text-[10px] font-bold px-2 py-1 rounded border ${
                            student.isPermanentAlfa
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : student.isTestIzin
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-slate-100 text-slate-600 border-slate-300'
                          }`}
                        >
                          <option value="NORMAL">Normal (Aktif)</option>
                          <option value="MERAH_ALFA">🔴 Merah: Alfa Terus (TIDAK LULUS)</option>
                          <option value="KUNING_TES">🟡 Kuning: Izin Dosen (UJIAN SUSULAN)</option>
                        </select>
                      </td>

                      {/* Delete */}
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => {
                            if (confirm(`Hapus ${student.name} dari daftar mata kuliah ini?`)) {
                              onDeleteStudent(student.id);
                            }
                          }}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded transition"
                          title="Hapus Mahasiswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
              <span>Total: {students.length} Mahasiswa tercatat</span>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-teal-700 text-white font-bold rounded-lg hover:bg-teal-800 shadow-xs"
              >
                Selesai
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: IMPORT EXCEL / WORD */}
        {activeTab === 'IMPORT_EXCEL_WORD' && (
          <div className="space-y-4 text-xs">
            {/* Upload File Excel Direct */}
            <div className="bg-slate-50 border-2 border-dashed border-emerald-300 rounded-xl p-4 text-center">
              <FileSpreadsheet className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
              <h4 className="font-bold text-slate-800 text-xs">
                Unggah Langsung Berkas Excel (.xlsx / .xls)
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Sistem akan otomatis mengekstrak daftar nama dari kolom dalam lembar Excel.
              </p>
              <label className="mt-2.5 inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" />
                Pilih File Excel
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleExcelFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Paste from Excel or Word */}
            <form onSubmit={handleBulkTextSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Atau Salin & Tempel (Copas) Nama dari Excel / Word:
                </label>
                <textarea
                  rows={6}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`Tempel daftar nama mahasiswa di sini (satu nama per baris), misal:
AHMAD FAUZI
BAMBANG SUDARMO
CITRA LESTARI
DEWI SARTIKA`}
                  className="w-full p-3 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-teal-500 bg-slate-50"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  *Nomor urut, tab, spasi awalan otomatis dibersihkan oleh sistem.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setActiveTab('LIST')}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg shadow-xs"
                >
                  Tambahkan Mahasiswa Terpilih
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: ADD MANUAL SINGLE */}
        {activeTab === 'ADD_MANUAL' && (
          <form onSubmit={handleManualAddSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Mahasiswa:</label>
              <input
                type="text"
                required
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Masukkan nama lengkap mahasiswa..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status Khusus Mahasiswa:</label>
              <select
                value={manualStatus}
                onChange={(e: any) => setManualStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 bg-slate-50"
              >
                <option value="NORMAL">Normal (Aktif Perkuliahan)</option>
                <option value="MERAH_ALFA">🔴 Tanda Merah: Alfa Terus Tanpa Keterangan (TIDAK LULUS)</option>
                <option value="KUNING_TES">🟡 Tanda Kuning: Izin Dosen Ikut Tes (UJIAN SUSULAN)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setActiveTab('LIST')}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg shadow-xs"
              >
                Simpan Mahasiswa Baru
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
