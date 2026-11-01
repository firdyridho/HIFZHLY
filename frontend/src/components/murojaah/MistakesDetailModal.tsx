import {
  X,
  Volume2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

export interface MistakeItem {
  id: string;
  verseKey: string; // e.g. "78:3"
  ayahNumber: number;
  surahNumber: number;
  surahName?: string;
  expectedText: string;
  spokenText: string;
  timestamp: Date;
}

interface MistakesDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  mistakes: MistakeItem[];
  onPlayAyah?: (ayahNumber: number) => void;
  onClearMistakes?: () => void;
}

export default function MistakesDetailModal({
  isOpen,
  onClose,
  mistakes,
  onPlayAyah,
  onClearMistakes,
}: MistakesDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[88vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Rincian Kesalahan &amp; Koreksi Makhraj
              </h3>
              <p className="text-xs text-slate-500">
                Total {mistakes.length} catatan koreksi pada sesi ini
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {mistakes.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-900 text-sm">
                Alhamdulillah, Belum Ada Kesalahan
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Lafal hafalan Anda terbaca lancar dan cocok dengan tajwid Uthmani ayat.
              </p>
            </div>
          ) : (
            mistakes.map((m, idx) => (
              <div
                key={m.id || idx}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5 hover:border-slate-300 transition"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-[11px] font-mono">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900">
                      Ayat {m.ayahNumber} {m.surahName ? `(${m.surahName})` : ''}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(m.timestamp).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Ayat Asli vs Suara Terdengar */}
                <div className="space-y-1.5 pt-1">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">
                      Teks Al-Qur'an Asli:
                    </span>
                    <p className="font-quran text-lg text-slate-900 leading-relaxed" dir="rtl">
                      {m.expectedText}
                    </p>
                  </div>

                  {m.spokenText && (
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-0.5">
                        Terdengar oleh Mikrofon:
                      </span>
                      <p className="text-xs font-semibold text-slate-800 leading-relaxed font-sans">
                        "{m.spokenText}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Tombol Putar Audio Koreksi */}
                {onPlayAyah && (
                  <div className="pt-1 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => onPlayAyah(m.ayahNumber)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Dengar Koreksi Qari</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          {onClearMistakes && mistakes.length > 0 ? (
            <button
              type="button"
              onClick={onClearMistakes}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Catatan</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Dengarkan audio qari untuk melatih makhraj</span>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
