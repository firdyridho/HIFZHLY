import { useState, useEffect } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { SurahSummary } from '../types';

export default function MushafPage() {
  const [surahs, setSurahs] = useState<SurahSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/v1/quran/surahs')
      .then((res) => res.json())
      .then((data) => setSurahs(data.slice(77, 114))) // Juz 'Amma
      .catch((err) => console.error('Error fetching surahs:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-emerald-700 space-x-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-semibold">Memuat teks Mushaf Al-Qur'an...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Daftar Surah (Juz 'Amma)</h2>
        <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">
          Teks Kemenag RI + QUL Mutasyabihat
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {surahs.map((surah) => (
          <div
            key={surah.number}
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-xs text-emerald-800">
                {surah.number}
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h4 className="font-bold text-sm text-slate-900">{surah.nameLatin}</h4>
                  {surah.number === 78 && (
                    <span className="inline-flex items-center space-x-0.5 text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded-md font-medium">
                      <AlertCircle className="w-2.5 h-2.5" />
                      <span>Mutasyabih</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{surah.translation} • {surah.numberOfAyahs} Ayat</p>
              </div>
            </div>
            <span className="font-quran text-xl text-emerald-900">{surah.nameArabic}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

