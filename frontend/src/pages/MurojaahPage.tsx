import { useState, useEffect } from 'react';
import { Mic, Volume2, Sparkles, Loader2 } from 'lucide-react';
import type { SrsDueItem } from '../types';

export default function MurojaahPage() {
  const [dueAyahs, setDueAyahs] = useState<SrsDueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/v1/srs/today')
      .then((res) => res.json())
      .then((data) => setDueAyahs(data.items || []))
      .catch((err) => console.error('Error fetching due ayahs:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-emerald-700 space-x-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-semibold">Memuat jadwal Murojaah SRS...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SRS Due Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-700 text-white shadow-xl shadow-emerald-900/10 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 bg-white/10 border border-white/20 rounded-md text-xs font-medium text-emerald-100 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Adaptive Spaced Repetition (SRS)</span>
          </div>
          <h2 className="text-2xl font-extrabold mb-1">Jadwal Murojaah Hari Ini</h2>
          <p className="text-emerald-100 text-sm max-w-md">
            Sistem AI mendeteksi ada {dueAyahs.length} ayat yang perlu kamu ulang agar tidak lupa dari memori jangka panjang.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {dueAyahs.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>QS. {item.surahName}: Ayat {item.ayahNumber}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Evaluator Recording Sandbox */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Surah An-Naba' : Ayat 1</h3>
            <p className="text-xs text-slate-500">Lafalkan ayat di bawah dari hafalanmu dengan tartil</p>
          </div>
          <button className="flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-semibold transition-all">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Dengar Qari</span>
          </button>
        </div>

        {/* Quran Ayah Text */}
        <div className="py-8 text-center bg-slate-50/70 rounded-2xl border border-slate-100 mb-6 px-4">
          <p className="font-quran text-4xl text-slate-900 leading-loose" dir="rtl">
            عَمَّ يَتَسَآءَلُونَ
          </p>
          <p className="text-xs text-slate-500 mt-3 italic font-sans">
            "'Amma yatasaa'aluun - Tentang apakah mereka saling bertanya-tanya?"
          </p>
        </div>

        {/* Action Recording Bar */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <button
            className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
            title="Mulai Rekam Suara"
          >
            <Mic className="w-8 h-8" />
          </button>
          <p className="text-xs text-slate-500">Tekan mikrofon untuk mulai evaluasi AI suara</p>
        </div>
      </div>
    </div>
  );
}

