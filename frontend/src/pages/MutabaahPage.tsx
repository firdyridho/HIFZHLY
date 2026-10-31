import { useState, useEffect } from 'react';
import {
  Flame,
  Target,
  BookOpen,
  CheckCircle2,
  Loader2,
  Award,
  Settings2,
  Minus,
  Plus,
  Save,
  X,
} from 'lucide-react';
import type { MutabaahSummary, SurahHeatmap } from '../types';

const FALLBACK_SUMMARY: MutabaahSummary = {
  currentStreak: 5,
  maxStreak: 14,
  todayReviewedAyahs: 10,
  dailyTarget: 10,
  targetMetToday: true,
  totalAyahsMemorized: 78,
  weeklyActivity: [
    { date: '2026-10-25', ayahs: 12, targetMet: true },
    { date: '2026-10-26', ayahs: 10, targetMet: true },
    { date: '2026-10-27', ayahs: 5, targetMet: false },
    { date: '2026-10-28', ayahs: 15, targetMet: true },
    { date: '2026-10-29', ayahs: 10, targetMet: true },
    { date: '2026-10-30', ayahs: 10, targetMet: true },
    { date: '2026-10-31', ayahs: 10, targetMet: true },
  ],
};

const JUZ_AMMA_SURAHS = [
  { number: 78, name: "An-Naba'", ayahs: 40, status: 'strong' as const, pct: 92 },
  { number: 79, name: "An-Nazi'at", ayahs: 46, status: 'reviewing' as const, pct: 78 },
  { number: 80, name: "'Abasa", ayahs: 42, status: 'learning' as const, pct: 64 },
  { number: 81, name: 'At-Takwir', ayahs: 29, status: 'strong' as const, pct: 95 },
  { number: 82, name: 'Al-Infitar', ayahs: 19, status: 'strong' as const, pct: 88 },
  { number: 83, name: 'Al-Muthaffifin', ayahs: 36, status: 'reviewing' as const, pct: 74 },
  { number: 84, name: 'Al-Insyiqaq', ayahs: 25, status: 'strong' as const, pct: 90 },
  { number: 85, name: 'Al-Buruj', ayahs: 22, status: 'reviewing' as const, pct: 76 },
  { number: 86, name: 'Ath-Thariq', ayahs: 17, status: 'strong' as const, pct: 98 },
  { number: 87, name: "Al-A'la", ayahs: 19, status: 'strong' as const, pct: 100 },
  { number: 88, name: 'Al-Ghasyiyah', ayahs: 26, status: 'strong' as const, pct: 94 },
  { number: 89, name: 'Al-Fajr', ayahs: 30, status: 'reviewing' as const, pct: 80 },
  { number: 90, name: 'Al-Balad', ayahs: 20, status: 'learning' as const, pct: 60 },
  { number: 91, name: 'Asy-Syams', ayahs: 15, status: 'strong' as const, pct: 96 },
  { number: 92, name: 'Al-Lail', ayahs: 21, status: 'strong' as const, pct: 90 },
  { number: 93, name: 'Adh-Dhuha', ayahs: 11, status: 'strong' as const, pct: 100 },
  { number: 94, name: 'Asy-Syarh', ayahs: 8, status: 'strong' as const, pct: 100 },
  { number: 95, name: 'At-Tin', ayahs: 8, status: 'strong' as const, pct: 100 },
  { number: 96, name: "Al-'Alaq", ayahs: 19, status: 'reviewing' as const, pct: 75 },
  { number: 97, name: 'Al-Qadr', ayahs: 5, status: 'strong' as const, pct: 100 },
  { number: 98, name: 'Al-Bayyinah', ayahs: 8, status: 'learning' as const, pct: 55 },
  { number: 99, name: 'Az-Zalzalah', ayahs: 8, status: 'strong' as const, pct: 100 },
  { number: 100, name: "Al-'Adiyat", ayahs: 11, status: 'strong' as const, pct: 92 },
  { number: 101, name: "Al-Qari'ah", ayahs: 11, status: 'strong' as const, pct: 100 },
  { number: 102, name: 'At-Takatsur', ayahs: 8, status: 'strong' as const, pct: 95 },
  { number: 103, name: "Al-'Ashr", ayahs: 3, status: 'strong' as const, pct: 100 },
  { number: 104, name: 'Al-Humazah', ayahs: 9, status: 'strong' as const, pct: 98 },
  { number: 105, name: 'Al-Fil', ayahs: 5, status: 'strong' as const, pct: 100 },
  { number: 106, name: 'Quraisy', ayahs: 4, status: 'strong' as const, pct: 100 },
  { number: 107, name: "Al-Ma'un", ayahs: 7, status: 'strong' as const, pct: 100 },
  { number: 108, name: 'Al-Kautsar', ayahs: 3, status: 'strong' as const, pct: 100 },
  { number: 109, name: 'Al-Kafirun', ayahs: 6, status: 'strong' as const, pct: 95 },
  { number: 110, name: 'An-Nashr', ayahs: 3, status: 'strong' as const, pct: 100 },
  { number: 111, name: 'Al-Lahab', ayahs: 5, status: 'strong' as const, pct: 100 },
  { number: 112, name: 'Al-Ikhlas', ayahs: 4, status: 'strong' as const, pct: 100 },
  { number: 113, name: 'Al-Falaq', ayahs: 5, status: 'strong' as const, pct: 100 },
  { number: 114, name: 'An-Nas', ayahs: 6, status: 'strong' as const, pct: 100 },
];

export default function MutabaahPage() {
  const [summary, setSummary] = useState<MutabaahSummary>(FALLBACK_SUMMARY);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSurah, setSelectedSurah] = useState<number>(78);
  const [activeSurahHeatmap, setActiveSurahHeatmap] = useState<SurahHeatmap | null>(null);
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  const [customTarget, setCustomTarget] = useState<number>(10);

  useEffect(() => {
    const token = localStorage.getItem('hifzhly_auth_token');
    fetch('/api/v1/mutabaah/summary', {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch summary');
        return res.json();
      })
      .then((data: MutabaahSummary) => {
        const cached = localStorage.getItem('hifzhly_user_profile');
        let target = data.dailyTarget;
        if (cached) {
          try {
            const p = JSON.parse(cached);
            if (p.dailyTargetAyahs) target = p.dailyTargetAyahs;
          } catch(e) {}
        }
        setSummary({ ...data, dailyTarget: target });
        setCustomTarget(target);
      })
      .catch((err) => {
        console.warn('Using fallback mutabaah summary:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveTarget = () => {
    const newTarget = customTarget;
    setSummary((prev) => ({
      ...prev,
      dailyTarget: newTarget,
      targetMetToday: prev.todayReviewedAyahs >= newTarget,
    }));

    const cached = localStorage.getItem('hifzhly_user_profile');
    let profile = cached ? JSON.parse(cached) : {};
    profile.dailyTargetAyahs = newTarget;
    localStorage.setItem('hifzhly_user_profile', JSON.stringify(profile));

    window.dispatchEvent(new Event('hifzhly_profile_updated'));
    window.dispatchEvent(new Event('storage'));
    setIsEditingTarget(false);
  };

  // Fetch or generate heatmap for selected surah
  useEffect(() => {
    const token = localStorage.getItem('hifzhly_auth_token');
    fetch(`/api/v1/mutabaah/heatmap/${selectedSurah}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch surah heatmap');
        return res.json();
      })
      .then((data: SurahHeatmap) => setActiveSurahHeatmap(data))
      .catch(() => {
        // Fallback realistic ayah heatmap
        const surahObj = JUZ_AMMA_SURAHS.find((s) => s.number === selectedSurah) || JUZ_AMMA_SURAHS[0];
        const ayahsList = Array.from({ length: surahObj.ayahs }, (_, i) => {
          const ayahNum = i + 1;
          const status =
            ayahNum <= 10
              ? ('strong' as const)
              : ayahNum <= 25
              ? ('reviewing' as const)
              : ('learning' as const);
          return {
            ayahNumber: ayahNum,
            status,
            lastScore: status === 'strong' ? 95 : status === 'reviewing' ? 82 : 65,
            intervalDays: status === 'strong' ? 14 : status === 'reviewing' ? 3 : 1,
          };
        });

        setActiveSurahHeatmap({
          surahNumber: surahObj.number,
          surahName: surahObj.name,
          totalAyahs: surahObj.ayahs,
          ayahs: ayahsList,
        });
      });
  }, [selectedSurah]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-emerald-700 space-x-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-semibold">Memuat analitik Mutabaah Yaumi...</span>
      </div>
    );
  }

  const selectedSurahMeta = JUZ_AMMA_SURAHS.find((s) => s.number === selectedSurah);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Dashboard Mutabaah Digital &amp; Analitik Retensi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pencatatan murojaah otomatis, kurva daya ingat ilmiah, dan pemetaan ayat Mutqin di Juz 'Amma.
          </p>
        </div>
      </div>

      {/* 1. 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak Murojaah */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Flame className="w-6 h-6 fill-amber-500/20" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Streak Aktif
            </span>
            <span className="text-2xl font-black text-slate-900 font-mono tabular-nums block">
              {summary.currentStreak} Hari
            </span>
            <span className="text-[10px] text-slate-500">
              Rekor terbaik: {summary.maxStreak} Hari
            </span>
          </div>
        </div>

        {/* Daily Target Progress (Interactive Target Manager) */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Target Hari Ini
                </span>
                <span className="text-2xl font-black text-emerald-800 font-mono tabular-nums block">
                  {summary.todayReviewedAyahs} / {summary.dailyTarget}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingTarget(!isEditingTarget)}
              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
              title="Atur Target Ayat/Hari"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px]">
            {summary.todayReviewedAyahs >= summary.dailyTarget ? (
              <span className="font-semibold text-emerald-700 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 inline" />
                <span>Target Tercapai</span>
              </span>
            ) : (
              <span className="font-medium text-slate-500">
                Sisa {summary.dailyTarget - summary.todayReviewedAyahs} ayat lagi
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsEditingTarget(!isEditingTarget)}
              className="font-semibold text-emerald-700 hover:underline cursor-pointer"
            >
              {isEditingTarget ? 'Tutup' : 'Ubah Target'}
            </button>
          </div>

          {/* Quick Target Settings Panel */}
          {isEditingTarget && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                <span>Pilih Target Harian:</span>
                <button
                  type="button"
                  onClick={() => setIsEditingTarget(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Preset buttons */}
              <div className="grid grid-cols-4 gap-1">
                {[5, 10, 15, 20].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCustomTarget(preset)}
                    className={`py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      customTarget === preset
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Stepper & Save */}
              <div className="flex items-center space-x-1.5 pt-1">
                <div className="flex items-center border border-slate-200 bg-white rounded-xl overflow-hidden shrink-0">
                  <button
                    type="button"
                    onClick={() => setCustomTarget(Math.max(1, customTarget - 1))}
                    className="px-2 py-1 hover:bg-slate-100 text-slate-600 cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={customTarget}
                    onChange={(e) => setCustomTarget(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-10 text-center text-xs font-bold font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomTarget(customTarget + 1)}
                    className="px-2 py-1 hover:bg-slate-100 text-slate-600 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveTarget}
                  className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1"
                >
                  <Save className="w-3 h-3" />
                  <span>Simpan</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Total Memorized */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Ayat Mutqin
            </span>
            <span className="text-2xl font-black text-slate-900 font-mono tabular-nums block">
              {summary.totalAyahsMemorized} Ayat
            </span>
            <span className="text-[10px] text-slate-500">
              Juz 'Amma (Juz 30)
            </span>
          </div>
        </div>

        {/* Retention Quality */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Tingkat Retensi
            </span>
            <span className="text-2xl font-black text-sky-800 font-mono tabular-nums block">
              91.4%
            </span>
            <span className="text-[10px] text-slate-500">
              Evaluasi Speech Levenshtein
            </span>
          </div>
        </div>
      </div>

      {/* 2. Weekly Activity Consistency Chart */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Konsistensi Murojaah Mingguan
            </h3>
            <p className="text-xs text-slate-500">
              Rekam jejak ayat yang telah diulang selama 7 hari terakhir
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Status: Konsisten
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-2">
          {summary.weeklyActivity.map((day, idx) => {
            const dateObj = new Date(day.date);
            const dayName = ['Aha', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][
              dateObj.getDay()
            ];

            return (
              <div key={idx} className="flex flex-col items-center space-y-2">
                <div
                  className={`w-full h-24 rounded-2xl flex flex-col items-center justify-end p-2 transition-all border ${
                    day.targetMet
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                      : day.ayahs > 0
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  <span className="text-sm font-black font-mono">
                    {day.ayahs}
                  </span>
                  <span className="text-[9px] uppercase font-bold opacity-80">
                    Ayat
                  </span>
                </div>

                <div className="text-center">
                  <span className="text-xs font-bold text-slate-700 block">
                    {dayName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {day.date.slice(8, 10)}/{day.date.slice(5, 7)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Heatmap Hafalan Surah (Juz 'Amma 37 Surahs) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">
              Peta Visual Retensi Surah (Heatmap Juz 30)
            </h3>
            <p className="text-xs text-slate-500">
              Pilih salah satu surah untuk melihat rincian ketahanan memori per ayat
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-4 text-xs font-medium">
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span>Kuat (Mutqin)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-amber-400" />
              <span>Reviewing</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-rose-400" />
              <span>Lemah</span>
            </span>
          </div>
        </div>

        {/* 37 Surah Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {JUZ_AMMA_SURAHS.map((surah) => {
            const isSelected = selectedSurah === surah.number;
            let statusBg = 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:border-emerald-400';
            if (surah.status === 'reviewing') {
              statusBg = 'bg-amber-50 text-amber-900 border-amber-200 hover:border-amber-400';
            } else if (surah.status === 'learning') {
              statusBg = 'bg-rose-50 text-rose-900 border-rose-200 hover:border-rose-400';
            }

            return (
              <button
                key={surah.number}
                type="button"
                onClick={() => setSelectedSurah(surah.number)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${statusBg} ${
                  isSelected ? 'ring-2 ring-emerald-600 shadow-sm font-bold scale-105' : ''
                }`}
              >
                <div className="flex items-center justify-between text-[10px] opacity-75 font-mono">
                  <span>{surah.number}</span>
                  <span>{surah.pct}%</span>
                </div>
                <div className="text-xs font-bold truncate mt-0.5">{surah.name}</div>
                <div className="text-[10px] text-slate-500">{surah.ayahs} Ayat</div>
              </button>
            );
          })}
        </div>

        {/* Selected Surah Ayah-by-Ayah Heatmap Detail */}
        {activeSurahHeatmap && (
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900">
                  Rincian Ayat Surah {activeSurahHeatmap.surahName} (QS. {activeSurahHeatmap.surahNumber}):
                </span>
                <span className="text-xs text-slate-500 ml-2">
                  Total {activeSurahHeatmap.totalAyahs} Ayat
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                Daya Tahan Memori: {selectedSurahMeta?.pct}%
              </span>
            </div>

            {/* Ayah Grid */}
            <div className="flex flex-wrap gap-2">
              {activeSurahHeatmap.ayahs.map((ayah) => {
                let colorClass = 'bg-emerald-500 text-white';
                if (ayah.status === 'reviewing') colorClass = 'bg-amber-400 text-amber-950';
                if (ayah.status === 'learning') colorClass = 'bg-rose-400 text-white';

                return (
                  <div
                    key={ayah.ayahNumber}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs transition-transform hover:scale-110 cursor-pointer ${colorClass}`}
                    title={`Ayat ${ayah.ayahNumber} • Skor: ${ayah.lastScore}% • Interval: +${ayah.intervalDays} Hari`}
                  >
                    {ayah.ayahNumber}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
