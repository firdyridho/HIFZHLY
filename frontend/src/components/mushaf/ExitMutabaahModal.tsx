import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Clock,
  Check,
  X,
  FileText,
  Layers,
} from 'lucide-react';

export interface ExitMutabaahSummary {
  surahNumber: number;
  surahName: string;
  isJuz?: boolean;
  juzNumber?: number;
  startAyah: number;
  endAyah: number;
  totalAyahs: number;
  pagesCount: number;
  durationMinutes: number;
}

export interface ExitMutabaahModalProps {
  isOpen: boolean;
  summary: ExitMutabaahSummary | null;
  onConfirm: (data: {
    surahNumber: number;
    surahName: string;
    startAyah: number;
    endAyah: number;
    notes: string;
    durationMinutes: number;
  }) => void;
  onSkipAndExit: () => void;
  onClose: () => void;
}

export const ExitMutabaahModal: React.FC<ExitMutabaahModalProps> = ({
  isOpen,
  summary,
  onConfirm,
  onSkipAndExit,
  onClose,
}) => {
  const [startAyah, setStartAyah] = useState<number>(1);
  const [endAyah, setEndAyah] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (summary) {
      setStartAyah(summary.startAyah || 1);
      setEndAyah(summary.endAyah || 1);
      setDurationMinutes(Math.max(1, summary.durationMinutes || 1));
      setNotes('');
      setIsSubmitting(false);
    }
  }, [summary, isOpen]);

  if (!isOpen || !summary) return null;

  const calculatedAyahs = Math.max(1, Math.abs(endAyah - startAyah) + 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onConfirm({
      surahNumber: summary.surahNumber,
      surahName: summary.surahName,
      startAyah: Math.min(startAyah, endAyah),
      endAyah: Math.max(startAyah, endAyah),
      notes: notes.trim(),
      durationMinutes,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-5 pt-5 pb-4 border-b border-slate-100 bg-linear-to-b from-emerald-50/50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Catat Tilawah ke Mutabaah
                </h3>
                <p className="text-xs text-slate-500">
                  Simpan sesi membaca agar tersinkronisasi otomatis
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Tutup dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4 overflow-y-auto">
          {/* Summary Box */}
          <div className="bg-slate-50/90 rounded-xl p-3.5 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Surah / Sumber:</span>
              <span className="font-bold text-slate-900">
                {summary.isJuz ? `Juz ${summary.juzNumber} • ` : ''}
                {summary.surahName}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-xs">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-slate-500 block text-[10px]">Total Dibaca</span>
                  <span className="font-semibold text-slate-800">
                    {calculatedAyahs} Ayat
                    {summary.pagesCount > 0 ? ` (${summary.pagesCount} Hal)` : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-slate-500 block text-[10px]">Durasi Sesi</span>
                  <span className="font-semibold text-slate-800">{durationMinutes} Menit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ayah Range Adjuster */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Rentang Ayat Yang Dibaca
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="block text-[10px] text-slate-500 mb-0.5">Ayat Awal</span>
                <input
                  type="number"
                  min={1}
                  value={startAyah}
                  onChange={(e) => setStartAyah(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 mb-0.5">Ayat Akhir</span>
                <input
                  type="number"
                  min={1}
                  value={endAyah}
                  onChange={(e) => setEndAyah(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Notes / Catatan Santri */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Catatan Pribadi Santri (Opsional)</span>
              </span>
              <span className="text-[10px] text-slate-400">Tersimpan di Mutabaah</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Ayat 15 makhraj 'ain masih perlu dilancarkan, hukum ikhfa diperjelas..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center gap-2">
            <button
              type="button"
              onClick={onSkipAndExit}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer text-center"
            >
              Lewati & Keluar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-60"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan ke Mutabaah'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
