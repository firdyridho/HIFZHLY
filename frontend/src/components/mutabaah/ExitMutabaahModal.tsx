import React, { useState } from 'react';
import {
  BookOpen,
  Mic,
  Sparkles,
  Clock,
  Award,
  X,
  CheckCircle2,
} from 'lucide-react';

export interface ExitMutabaahPayload {
  activityType: 'tilawah' | 'murojaah' | 'hafalan_baru';
  surahNumber: number;
  surahName: string;
  startAyah: number;
  endAyah: number;
  totalAyahs: number;
  pagesCount: number;
  durationSeconds: number;
  score?: number;
  santriNotes?: string;
}

interface ExitMutabaahModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: ExitMutabaahPayload) => void;
  activityType: 'tilawah' | 'murojaah' | 'hafalan_baru';
  surahNumber: number;
  surahName: string;
  startAyah: number;
  endAyah: number;
  totalAyahs: number;
  pagesCount?: number;
  durationSeconds: number;
  score?: number;
}

export default function ExitMutabaahModal({
  isOpen,
  onClose,
  onSave,
  activityType,
  surahNumber,
  surahName,
  startAyah,
  endAyah,
  totalAyahs,
  pagesCount = 1,
  durationSeconds,
  score,
}: ExitMutabaahModalProps) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Format durasi: "X menit Y detik"
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  const durationText =
    minutes > 0
      ? `${minutes} menit ${seconds > 0 ? `${seconds} detik` : ''}`
      : `${seconds} detik`;

  const titleText =
    activityType === 'tilawah'
      ? "Selesai Membaca Al-Qur'an?"
      : activityType === 'murojaah'
      ? 'Sesi Murojaah Selesai!'
      : 'Sesi Hafalan Baru Selesai!';

  const IconComponent =
    activityType === 'tilawah' ? BookOpen : activityType === 'murojaah' ? Mic : Sparkles;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    onSave({
      activityType,
      surahNumber,
      surahName,
      startAyah,
      endAyah,
      totalAyahs,
      pagesCount,
      durationSeconds,
      score,
      santriNotes: notes.trim() || undefined,
    });

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {titleText}
              </h3>
              <p className="text-xs text-slate-500">
                Simpan aktivitas ke Mutabaah Yaumi otomatis
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Tutup dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ringkasan Pre-filled Card */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Ringkasan Sesi
            </span>
            <span className="text-xs font-semibold text-emerald-900 flex items-center space-x-1">
              <Clock className="w-3 h-3 text-emerald-700 inline" />
              <span>{durationText}</span>
            </span>
          </div>

          <div className="text-slate-900 font-bold text-sm">
            QS. {surahName} (Surah {surahNumber}) : Ayat {startAyah} – {endAyah}
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-600 pt-1">
            <span className="font-semibold text-emerald-800 bg-white/80 px-2 py-0.5 rounded-lg border border-emerald-200">
              {totalAyahs} Ayat
            </span>
            {pagesCount > 0 && (
              <span className="font-semibold text-emerald-800 bg-white/80 px-2 py-0.5 rounded-lg border border-emerald-200">
                {pagesCount} Lembar
              </span>
            )}
            {score !== undefined && (
              <span className="font-semibold text-emerald-800 bg-white/80 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center space-x-1">
                <Award className="w-3 h-3 text-emerald-700" />
                <span>Skor AI: {score}%</span>
              </span>
            )}
          </div>
        </div>

        {/* Form Catatan Santri (Opsional) */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Catatan Refleksi / Kendala Santri (Opsional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Ayat 155 makhraj 'ain masih kurang mantap, perlu diulang besok..."
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 resize-none transition-all placeholder:text-slate-400"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Catatan ini akan dapat dilihat dan dievaluasi langsung oleh Ustadz pembimbing Anda.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
            >
              Lewati / Nanti Saja
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan ke Mutabaah</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

