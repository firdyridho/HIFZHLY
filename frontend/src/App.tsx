import { useState, useEffect } from 'react';
import { BookOpen, Mic, Award, BarChart3, Volume2, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import type { SurahSummary, SrsDueItem, TajwidModule } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'murojaah' | 'mushaf' | 'tajwid' | 'mutabaah'>('murojaah');
  const [surahs, setSurahs] = useState<SurahSummary[]>([]);
  const [dueAyahs, setDueAyahs] = useState<SrsDueItem[]>([]);
  const [tajwidModules, setTajwidModules] = useState<TajwidModule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch Quran surahs & mock SRS from Go backend
    const fetchData = async () => {
      try {
        const [resSurahs, resSrs, resTajwid] = await Promise.all([
          fetch('/api/v1/quran/surahs').catch(() => null),
          fetch('/api/v1/srs/today').catch(() => null),
          fetch('/api/v1/tajwid/modules').catch(() => null),
        ]);

        if (resSurahs && resSurahs.ok) {
          const data = await resSurahs.json();
          setSurahs(data.slice(77, 85)); // Juz 'Amma (An-Naba onwards)
        }
        if (resSrs && resSrs.ok) {
          const data = await resSrs.json();
          setDueAyahs(data.items || []);
        }
        if (resTajwid && resTajwid.ok) {
          const data = await resTajwid.json();
          setTajwidModules(data || []);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <span className="font-bold text-xl">H</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">Hifzhly</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                  AI Murojaah
                </span>
              </div>
              <p className="text-xs text-slate-500">Membantu Menjaga Murojaahmu</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-amber-800 text-xs font-bold">
              <span>🔥 3 Hari Streak</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        {loading && (
          <div className="flex items-center justify-center p-8 text-emerald-700 space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-semibold">Menghubungkan ke server Hifzhly...</span>
          </div>
        )}
        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-2 p-1.5 bg-slate-200/70 rounded-2xl mb-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('murojaah')}
            className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl transition-all ${
              activeTab === 'murojaah'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">Smart Murojaah</span>
            <span className="sm:hidden">Murojaah</span>
          </button>

          <button
            onClick={() => setActiveTab('mushaf')}
            className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl transition-all ${
              activeTab === 'mushaf'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Mushaf Digital</span>
            <span className="sm:hidden">Mushaf</span>
          </button>

          <button
            onClick={() => setActiveTab('tajwid')}
            className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl transition-all ${
              activeTab === 'tajwid'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">Tajwid Academy</span>
            <span className="sm:hidden">Tajwid</span>
          </button>

          <button
            onClick={() => setActiveTab('mutabaah')}
            className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl transition-all ${
              activeTab === 'mutabaah'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Mutabaah</span>
            <span className="sm:hidden">Grafik</span>
          </button>
        </div>

        {/* Tab 1: Smart Murojaah & SRS */}
        {activeTab === 'murojaah' && (
          <div className="space-y-6">
            {/* SRS Due Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-700 text-white shadow-xl shadow-emerald-900/10 relative overflow-hidden">
              <div className="relative z-10">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium text-emerald-100 mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Adaptive Spaced Repetition</span>
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
        )}

        {/* Tab 2: Mushaf Digital */}
        {activeTab === 'mushaf' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Daftar Surah (Juz 'Amma)</h2>
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
                      <h4 className="font-bold text-sm text-slate-900">{surah.nameLatin}</h4>
                      <p className="text-xs text-slate-500">{surah.translation} • {surah.numberOfAyahs} Ayat</p>
                    </div>
                  </div>
                  <span className="font-quran text-xl text-emerald-900">{surah.nameArabic}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Tajwid Academy */}
        {activeTab === 'tajwid' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Modul Edukasi Tajwid & Kuis</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tajwidModules.map((module) => (
                <div
                  key={module.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                      Modul {module.orderIndex}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-2">{module.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{module.summary}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Teks, Video & Kuis</span>
                    <button className="flex items-center space-x-1 text-xs text-emerald-700 font-bold hover:underline">
                      <span>Pelajari</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Mutabaah & Analitik */}
        {activeTab === 'mutabaah' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Target Harian</span>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">10 <span className="text-xs font-normal text-slate-500">Ayat</span></p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Streak Aktif</span>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">3 <span className="text-xs font-normal text-slate-500">Hari</span></p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Total Dihafal</span>
                <p className="text-2xl font-extrabold text-teal-600 mt-1">40 <span className="text-xs font-normal text-slate-500">Ayat</span></p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2">Konsistensi Mingguan</h3>
              <p className="text-xs text-slate-500 mb-4">Catatan mutabaah otomatis terekam setiap kali kamu murojaah.</p>
              <div className="flex items-center justify-between gap-2">
                {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Aha'].map((day, i) => (
                  <div key={day} className="flex-1 flex flex-col items-center">
                    <div className={`w-full h-16 rounded-xl flex items-center justify-center font-bold text-xs ${
                      i >= 4 ? 'bg-emerald-500 text-white' : i === 2 ? 'bg-slate-100 text-slate-400' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {i >= 4 ? '10' : i === 2 ? '0' : '10'}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1">{day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© 2026 Tim FIFA - Universitas Sultan Ageng Tirtayasa. Hackathon Project.</p>
          <p>Murojaah Al-Qur'an Berbasis AI & Spaced Repetition</p>
        </div>
      </footer>
    </div>
  );
}

