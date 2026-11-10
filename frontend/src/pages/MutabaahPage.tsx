import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Target,
  BookOpen,
  CheckCircle2,
  Award,
  Settings2,
  Minus,
  Plus,
  Save,
  X,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Mic,
  FileText,
  UserCheck,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Compass,
  Bookmark,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import type { MutabaahSummary, SurahHeatmap } from '../types';
import {
  DayMutabaahData,
  MutabaahReportItem,
  UserCommitment,
  INDONESIAN_MONTHS,
  INDONESIAN_DAYS_SHORT,
  INDONESIAN_DAYS_FULL,
  formatDateKey,
  getStoredMutabaahLogs,
  getGithubIntensityLevel,
  getGithubTileClasses,
  getMutabaahHistory,
  getUserCommitments,
  saveUserCommitments,
} from '../lib/mutabaahService';
import {
  ALL_QURAN_SURAHS,
  getSurahMeta,
  getSurahsInJuz,
  type SurahMetaInfo,
} from '../lib/quranMeta';

function resolveInitialTarget(c: UserCommitment): { juz: number; surah: number } {
  if (c.progressionOrder === 'juz_1_asc') {
    const s = c.targetSurahNumber && c.targetSurahNumber <= 2 ? c.targetSurahNumber : 1;
    return { juz: c.targetJuzNumber && c.targetJuzNumber <= 2 ? c.targetJuzNumber : 1, surah: s };
  }
  if (c.targetSurahNumber) {
    const meta = getSurahMeta(c.targetSurahNumber);
    if (meta) {
      return {
        juz: c.targetJuzNumber || meta.juzStart,
        surah: c.targetSurahNumber,
      };
    }
  }
  if (c.targetJuzNumber && c.targetJuzNumber >= 1 && c.targetJuzNumber <= 30) {
    const inJuz = getSurahsInJuz(c.targetJuzNumber);
    return {
      juz: c.targetJuzNumber,
      surah: inJuz[0]?.number || 1,
    };
  }
  return { juz: 30, surah: 78 };
}

export default function MutabaahPage() {
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => formatDateKey(today), [today]);

  // Main Section Tabs: 'calendar' | 'journal' | 'commitments'
  const [activeMainTab, setActiveMainTab] = useState<'calendar' | 'journal' | 'commitments'>('calendar');

  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1); // 1-12

  // Stored Mutabaah Logs (Real persistent data)
  const [logs, setLogs] = useState<Record<string, DayMutabaahData>>({});
  const [historyList, setHistoryList] = useState<MutabaahReportItem[]>([]);
  const [journalFilter, setJournalFilter] = useState<'all' | 'tilawah' | 'murojaah' | 'hafalan_baru'>('all');

  // Commitments State
  const initialCommitments = useMemo(() => getUserCommitments(), []);
  const initialFocus = useMemo(() => resolveInitialTarget(initialCommitments), [initialCommitments]);
  const [commitments, setCommitments] = useState<UserCommitment>(initialCommitments);

  // Summary Metrics
  const [summary, setSummary] = useState<MutabaahSummary>({
    currentStreak: 5,
    maxStreak: 14,
    todayReviewedAyahs: 10,
    dailyTarget: 10,
    targetMetToday: true,
    totalAyahsMemorized: 0,
    weeklyActivity: [],
  });

  // Daily target quick editor
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  const [customTarget, setCustomTarget] = useState<number>(10);

  // Selected date details modal state
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedDayData, setSelectedDayData] = useState<DayMutabaahData | null>(null);

  // Monthly Line Chart Interactive State
  const [hoveredChartPoint, setHoveredChartPoint] = useState<{
    day: number;
    dateKey: string;
    ayahs: number;
    targetMet: boolean;
    score: number;
  } | null>(null);

  // Surah Heatmap State (Dynamic Juz 1-30 & All 114 Surahs matching active hafalan target)
  const [selectedJuzFilter, setSelectedJuzFilter] = useState<number | 'all'>(initialFocus.juz);
  const [selectedSurah, setSelectedSurah] = useState<number>(initialFocus.surah);
  const [activeSurahHeatmap, setActiveSurahHeatmap] = useState<SurahHeatmap | null>(null);

  // 1. Refresh stored logs & sync with backend summary
  const refreshData = () => {
    const stored = getStoredMutabaahLogs();
    setLogs(stored);

    const history = getMutabaahHistory();
    setHistoryList(history);

    const curCommitments = getUserCommitments();
    setCommitments(curCommitments);

    const todayLog = stored[todayKey];
    let dailyTarget = curCommitments.dailyTargetAyahsHafalan || 10;
    const cachedProfile = localStorage.getItem('hifzhly_user_profile');
    if (cachedProfile) {
      try {
        const p = JSON.parse(cachedProfile);
        if (p.dailyTargetAyahs) dailyTarget = p.dailyTargetAyahs;
      } catch { }
    }
    setCustomTarget(dailyTarget);

    const todayReviewed = todayLog ? todayLog.ayahsReviewed : 0;
    const isTargetMet = todayReviewed >= dailyTarget;

    // Hitung jumlah ayat unik yang pernah disetorkan/dimurojaah (di luar tilawah umum)
    const uniqueMemorizedAyahs = new Set<string>();
    Object.values(stored).forEach((dayData) => {
      dayData.reports?.forEach((rep) => {
        if (rep.type !== 'tilawah' && rep.surahNumber && rep.ayahStart && rep.ayahEnd) {
          for (let a = rep.ayahStart; a <= rep.ayahEnd; a++) {
            uniqueMemorizedAyahs.add(`${rep.surahNumber}:${a}`);
          }
        }
      });
    });

    // Hitung streak riil
    let calcStreak = 0;
    const checkDate = new Date(today);
    while (true) {
      const key = formatDateKey(checkDate);
      const dLog = stored[key];
      if (dLog && dLog.ayahsReviewed > 0) {
        calcStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    const finalStreak = Math.max(calcStreak, curCommitments.currentStreak || 1);

    setSummary((prev) => ({
      ...prev,
      todayReviewedAyahs: todayReviewed,
      dailyTarget,
      targetMetToday: isTargetMet,
      currentStreak: finalStreak,
      maxStreak: Math.max(finalStreak, curCommitments.maxStreak || 14),
      totalAyahsMemorized: Math.max(uniqueMemorizedAyahs.size, prev.totalAyahsMemorized),
    }));
  };

  useEffect(() => {
    refreshData();

    const handleUpdate = () => {
      refreshData();
      const updatedTarget = resolveInitialTarget(getUserCommitments());
      setSelectedJuzFilter(updatedTarget.juz);
      setSelectedSurah(updatedTarget.surah);
    };
    window.addEventListener('hifzhly_mutabaah_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('hifzhly_mutabaah_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [todayKey]);

  // Sync with backend API GET /api/v1/mutabaah/summary & /targets if available
  useEffect(() => {
    const token = localStorage.getItem('hifzhly_auth_token');
    fetch('/api/v1/mutabaah/summary', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: MutabaahSummary | null) => {
        if (data) {
          setSummary((prev) => ({
            ...prev,
            maxStreak: data.maxStreak || prev.maxStreak,
            totalAyahsMemorized: data.totalAyahsMemorized || prev.totalAyahsMemorized,
          }));
        }
      })
      .catch(() => { });

    fetch('/api/v1/mutabaah/targets', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: UserCommitment | null) => {
        if (data && data.targetSurahNumber) {
          setCommitments((prev) => ({ ...prev, ...data }));
          const syncedFocus = resolveInitialTarget(data);
          setSelectedJuzFilter(syncedFocus.juz);
          setSelectedSurah(syncedFocus.surah);
        }
      })
      .catch(() => { });
  }, []);

  // 2. Fetch or compute Surah Heatmap (Semua 114 Surah + Gabungan Riwayat Lokal & Backend FSRS)
  useEffect(() => {
    const surahMeta = getSurahMeta(selectedSurah) || {
      number: selectedSurah,
      name: `Surah ${selectedSurah}`,
      nameArabic: '',
      ayahs: 20,
      startPage: 1,
      endPage: 1,
      juzStart: 1,
      juzEnd: 1,
    };

    const buildLocalMergedHeatmap = (backendData?: SurahHeatmap | null): SurahHeatmap => {
      // Mulai dengan state dari backend jika tersedia, atau semua 'untested'
      const baseAyahs = Array.from({ length: surahMeta.ayahs }, (_, i) => {
        const ayahNum = i + 1;
        const fromBackend = backendData?.ayahs?.find((a) => a.ayahNumber === ayahNum);
        return fromBackend
          ? { ...fromBackend }
          : {
              ayahNumber: ayahNum,
              status: 'untested' as 'untested' | 'learning' | 'reviewing' | 'strong',
              lastScore: 0,
              intervalDays: 0,
            };
      });

      // Overlay data riil lokal jika backend belum mencatat sesi lokal tersebut
      historyList.forEach((rep) => {
        if (
          rep.surahNumber === selectedSurah &&
          rep.type !== 'tilawah' &&
          rep.ayahStart &&
          rep.ayahEnd
        ) {
          const score = rep.score || 90;
          const localStatus: 'learning' | 'reviewing' | 'strong' =
            score >= 85 ? 'strong' : score >= 70 ? 'reviewing' : 'learning';

          for (let a = rep.ayahStart; a <= rep.ayahEnd; a++) {
            const idx = a - 1;
            if (idx >= 0 && idx < baseAyahs.length && baseAyahs[idx].status === 'untested') {
              baseAyahs[idx] = {
                ayahNumber: a,
                status: localStatus,
                lastScore: score,
                intervalDays: score >= 85 ? 7 : score >= 70 ? 3 : 1,
              };
            }
          }
        }
      });

      return {
        surahNumber: surahMeta.number,
        surahName: backendData?.surahName || surahMeta.name,
        totalAyahs: surahMeta.ayahs,
        ayahs: baseAyahs,
      };
    };

    // Set langsung data lokal agar tampilan instan tanpa kedip
    setActiveSurahHeatmap(buildLocalMergedHeatmap(null));

    const token = localStorage.getItem('hifzhly_auth_token');
    fetch(`/api/v1/mutabaah/heatmap/${selectedSurah}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: SurahHeatmap | null) => {
        if (data) {
          setActiveSurahHeatmap(buildLocalMergedHeatmap(data));
        }
      })
      .catch(() => {
        // Data lokal sudah diterapkan
      });
  }, [selectedSurah, historyList]);

  // Handle Save Quick Target
  const handleSaveTarget = () => {
    const newTarget = customTarget;
    setSummary((prev) => ({
      ...prev,
      dailyTarget: newTarget,
      targetMetToday: prev.todayReviewedAyahs >= newTarget,
    }));

    saveUserCommitments({ dailyTargetAyahsHafalan: newTarget });
    setIsEditingTarget(false);
  };

  // Calendar Month Navigation
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
  };

  // Build Calendar Grid for Current Month
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay();
    const totalDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const totalDaysInPrevMonth = new Date(currentYear, currentMonth - 1, 0).getDate();

    const cells: {
      dateKey: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      data?: DayMutabaahData;
      isToday: boolean;
    }[] = [];

    // Ghost padding cells from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = totalDaysInPrevMonth - i;
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      const key = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({
        dateKey: key,
        dayNumber: dayNum,
        isCurrentMonth: false,
        data: logs[key],
        isToday: key === todayKey,
      });
    }

    // Days in current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const key = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dateKey: key,
        dayNumber: d,
        isCurrentMonth: true,
        data: logs[key],
        isToday: key === todayKey,
      });
    }

    // Padding cells for next month
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      for (let n = 1; n <= remaining; n++) {
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
        const key = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
        cells.push({
          dateKey: key,
          dayNumber: n,
          isCurrentMonth: false,
          data: logs[key],
          isToday: key === todayKey,
        });
      }
    }

    return cells;
  }, [currentYear, currentMonth, logs, todayKey]);

  // Month Statistics
  const monthStats = useMemo(() => {
    let totalAyahs = 0;
    let activeDays = 0;
    let scoreSum = 0;
    let targetMetDays = 0;

    const prefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    Object.entries(logs).forEach(([k, d]) => {
      if (k.startsWith(prefix) && d.ayahsReviewed > 0) {
        totalAyahs += d.ayahsReviewed;
        activeDays += 1;
        scoreSum += d.averageScore;
        if (d.targetAchieved) targetMetDays += 1;
      }
    });

    const avgScore = activeDays > 0 ? Math.round((scoreSum / activeDays) * 10) / 10 : 0;
    return {
      totalAyahs,
      activeDays,
      targetMetDays,
      avgScore,
    };
  }, [currentYear, currentMonth, logs]);

  // Open Date Detail Modal on click
  const handleCellClick = (cellDateKey: string) => {
    setSelectedDateKey(cellDateKey);
    setSelectedDayData(logs[cellDateKey] || null);
  };

  const handleCloseDetailModal = () => {
    setSelectedDateKey(null);
    setSelectedDayData(null);
  };




  const formattedSelectedDate = useMemo(() => {
    if (!selectedDateKey) return '';
    const [y, m, d] = selectedDateKey.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayName = INDONESIAN_DAYS_FULL[dateObj.getDay()];
    const monthName = INDONESIAN_MONTHS[m - 1];
    return `${dayName}, ${d} ${monthName} ${y}`;
  }, [selectedDateKey]);

  // Filtered Journal History
  const filteredHistory = useMemo(() => {
    if (journalFilter === 'all') return historyList;
    return historyList.filter((item) => {
      if (journalFilter === 'tilawah') return item.type === 'tilawah';
      if (journalFilter === 'murojaah') return item.type === 'murojaah_ai' || item.type === 'murojaah';
      if (journalFilter === 'hafalan_baru') return item.type === 'hafalan_baru' || item.type === 'setoran_mandiri';
      return true;
    });
  }, [historyList, journalFilter]);

  return (
    <div className="space-y-6 pb-28 font-sans">

      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Sistem Mutabaah Yaumiyyah Terpadu
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pusat data tunggal pencatatan tilawah, murojaah, komitmen hafalan, dan evaluasi ustadz pembimbing.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <Link
            to="/app/mushaf"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all cursor-pointer shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
            <span>Tilawah Qur'an</span>
          </Link>
          <Link
            to="/app/murojaah"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Murojaah AI</span>
          </Link>
        </div>
      </div>

      {/* 2. Metric Cards (4 Kolom) */}
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

        {/* Daily Target Progress */}
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
                Sisa {Math.max(0, summary.dailyTarget - summary.todayReviewedAyahs)} ayat lagi
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

              <div className="grid grid-cols-4 gap-1">
                {[5, 10, 15, 20].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCustomTarget(preset)}
                    className={`py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${customTarget === preset
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

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
              Fokus: QS. {commitments.targetSurahName || 'Al-Fatihah'} (Ayat {commitments.targetStartAyah || 1}–{commitments.targetEndAyah || 7})
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
              Rata-rata Skor Bulan Ini
            </span>
            <span className="text-2xl font-black text-sky-800 font-mono tabular-nums block">
              {monthStats.avgScore > 0 ? `${monthStats.avgScore}%` : '95.0%'}
            </span>
            <span className="text-[10px] text-slate-500">
              Evaluasi Speech Levenshtein
            </span>
          </div>
        </div>
      </div>

      {/* 3. MAIN SECTION TABS NAVIGATION */}
      <div className="flex border-b border-slate-200 gap-1 sm:gap-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveMainTab('calendar')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center space-x-2 transition-all cursor-pointer shrink-0 ${activeMainTab === 'calendar'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Kalender Heatmap</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('journal')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center space-x-2 transition-all cursor-pointer shrink-0 ${activeMainTab === 'journal'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <FileText className="w-4 h-4" />
          <span>Jurnal &amp; Catatan Musyrif</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('commitments')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center space-x-2 transition-all cursor-pointer shrink-0 ${activeMainTab === 'commitments'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <Target className="w-4 h-4" />
          <span>Target &amp; Komitmen Mandiri</span>
        </button>
      </div>

      {/* TAB 1: KALENDER HEATMAP (GitHub Style) */}
      {activeMainTab === 'calendar' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-5">
            {/* Top Controls: Month Selector & Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-5 h-5 text-emerald-700" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Kalender Mutabaah Murojaah
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Warna hijau semakin pekat menandakan jumlah ayat yang dimurojaah semakin banyak. Klik tanggal untuk melihat rincian laporan.
                </p>
              </div>

              <div className="flex items-center space-x-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                  title="Bulan Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 min-w-[140px] text-center">
                  {INDONESIAN_MONTHS[currentMonth - 1]} {currentYear}
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                  title="Bulan Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleJumpToToday}
                  className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Bulan Ini
                </button>
              </div>
            </div>

            {/* Month Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/60 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Total Bulan Ini</span>
                <span className="font-bold text-slate-900 font-mono text-sm sm:text-base">
                  {monthStats.totalAyahs} Ayat
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Hari Aktif</span>
                <span className="font-bold text-slate-900 font-mono text-sm sm:text-base">
                  {monthStats.activeDays} Hari
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Target Tercapai</span>
                <span className="font-bold text-emerald-800 font-mono text-sm sm:text-base">
                  {monthStats.targetMetDays} Hari
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Rata-rata Akurasi</span>
                <span className="font-bold text-slate-900 font-mono text-sm sm:text-base">
                  {monthStats.avgScore > 0 ? `${monthStats.avgScore}%` : '-'}
                </span>
              </div>
            </div>

            {/* Day-of-Week Column Headers */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
              {INDONESIAN_DAYS_SHORT.map((dayName, idx) => (
                <div
                  key={idx}
                  className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-400 py-1"
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Calendar Grid of Day Tiles */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {calendarCells.map((cell, idx) => {
                const ayahsCount = cell.data ? cell.data.ayahsReviewed : 0;
                const level = cell.isCurrentMonth ? getGithubIntensityLevel(ayahsCount) : 0;
                const tileColorClass = cell.isCurrentMonth
                  ? getGithubTileClasses(level, cell.isToday)
                  : 'bg-slate-50/50 border-slate-100 text-slate-300 opacity-40';

                const isSelected = selectedDateKey === cell.dateKey;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCellClick(cell.dateKey)}
                    className={`relative aspect-square sm:aspect-auto sm:h-20 rounded-2xl border p-1.5 sm:p-2.5 flex flex-col justify-between transition-all cursor-pointer text-left ${tileColorClass} ${isSelected ? 'ring-2 ring-emerald-700 shadow-md scale-102 z-10' : ''
                      }`}
                    title={`${cell.dateKey}: ${ayahsCount} ayat dimurojaah`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs sm:text-sm font-bold font-mono ${cell.isCurrentMonth
                            ? level >= 3
                              ? 'text-white'
                              : 'text-slate-800'
                            : 'text-slate-300'
                          }`}
                      >
                        {cell.dayNumber}
                      </span>

                      {cell.isToday && (
                        <span
                          className={`w-2 h-2 rounded-full ${level >= 3 ? 'bg-amber-300' : 'bg-emerald-600'
                            }`}
                          title="Hari Ini"
                        />
                      )}
                    </div>

                    {cell.isCurrentMonth && ayahsCount > 0 ? (
                      <div className="hidden sm:flex flex-col">
                        <span
                          className={`text-xs font-black font-mono leading-none ${level >= 3 ? 'text-white' : 'text-emerald-950'
                            }`}
                        >
                          {ayahsCount}
                        </span>
                        <span
                          className={`text-[9px] uppercase font-bold tracking-tight opacity-80 ${level >= 3 ? 'text-emerald-100' : 'text-emerald-800'
                            }`}
                        >
                          Ayat
                        </span>
                      </div>
                    ) : (
                      cell.isCurrentMonth && (
                        <span className="hidden sm:block text-[9px] text-slate-300 font-mono">-</span>
                      )
                    )}

                    {cell.isCurrentMonth && ayahsCount > 0 && (
                      <div className="sm:hidden self-end w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* GitHub Heatmap Intensity Legend */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500 text-[11px]">
                * Klik salah satu kotak tanggal untuk membaca riwayat laporan setoran santri.
              </span>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-400 font-semibold">Sedikit (0 Ayat)</span>
                <div className="flex items-center space-x-1">
                  <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200" title="0 Ayat" />
                  <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-200" title="1-4 Ayat" />
                  <span className="w-3.5 h-3.5 rounded bg-emerald-300 border border-emerald-400" title="5-9 Ayat" />
                  <span className="w-3.5 h-3.5 rounded bg-emerald-500 border border-emerald-600" title="10-19 Ayat" />
                  <span className="w-3.5 h-3.5 rounded bg-emerald-700 border border-emerald-800" title=">= 20 Ayat" />
                </div>
                <span className="text-[11px] text-slate-600 font-bold">Banyak (20+ Ayat)</span>
              </div>
            </div>
          </div>

                    {/* 3. DIAGRAM LINE STATISTIK PROGRES BULANAN (User Request) */}
          {(() => {
            const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
            const dailyStats = Array.from({ length: daysInMonth }, (_, i) => {
              const dNum = i + 1;
              const dKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
              const dLog = logs[dKey];
              const ayahs = dLog ? dLog.ayahsReviewed : 0;
              const targetMet = ayahs >= summary.dailyTarget;
              const score = dLog ? dLog.averageScore : 0;
              return {
                day: dNum,
                dateKey: dKey,
                ayahs,
                targetMet,
                score,
                hasActivity: ayahs > 0,
              };
            });

            const maxVal = Math.max(...dailyStats.map((d) => d.ayahs), 0);
            const chartMax = Math.max(Math.ceil((maxVal + 5) / 10) * 10, summary.dailyTarget + 10, 25);

            const svgW = 760;
            const svgH = 220;
            const padL = 40;
            const padR = 25;
            const padT = 30;
            const padB = 40;
            const plotW = svgW - padL - padR;
            const plotH = svgH - padT - padB;

            const getX = (idx: number) => padL + (idx / (daysInMonth - 1)) * plotW;
            const getY = (val: number) => padT + plotH - (val / chartMax) * plotH;

            const targetY = getY(summary.dailyTarget);

            const pointsString = dailyStats
              .map((d, idx) => `${getX(idx).toFixed(1)},${getY(d.ayahs).toFixed(1)}`)
              .join(' ');

            const areaString = `${getX(0).toFixed(1)},${(padT + plotH).toFixed(1)} ` +
              pointsString +
              ` ${getX(daysInMonth - 1).toFixed(1)},${(padT + plotH).toFixed(1)}`;

            return (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-emerald-700" />
                      <h3 className="font-extrabold text-slate-900 text-lg">
                        Diagram Garis Tren Progres Harian
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Statistik perkembangan total ayat ibadah Al-Qur'an per hari ({INDONESIAN_MONTHS[currentMonth - 1]} {currentYear})
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 text-xs font-medium self-start sm:self-auto">
                    <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                      <span className="w-3.5 h-1 bg-emerald-600 rounded-full inline-block" />
                      <span>Realisasi Ayat</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-amber-700 font-semibold">
                      <span className="w-3.5 h-0.5 border-t-2 border-dashed border-amber-500 inline-block" />
                      <span>Target ({summary.dailyTarget} Ayat/Hari)</span>
                    </div>
                  </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/70 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] font-bold uppercase block">Total Bulan Ini</span>
                    <span className="font-black text-emerald-950 font-mono text-sm sm:text-base">
                      {monthStats.totalAyahs} Ayat
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] font-bold uppercase block">Rata-Rata / Hari</span>
                    <span className="font-black text-slate-800 font-mono text-sm sm:text-base">
                      {(monthStats.totalAyahs / daysInMonth).toFixed(1)} Ayat
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] font-bold uppercase block">Hari Aktif</span>
                    <span className="font-black text-slate-800 font-mono text-sm sm:text-base">
                      {monthStats.activeDays} / {daysInMonth} Hari
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] font-bold uppercase block">Target Tercapai</span>
                    <span className="font-black text-emerald-700 font-mono text-sm sm:text-base">
                      {monthStats.targetMetDays} Hari
                    </span>
                  </div>
                </div>

                {/* SVG Line Chart */}
                <div className="relative overflow-x-auto pt-2">
                  <div className="min-w-[620px] sm:min-w-full">
                    <svg
                      viewBox={`0 0 ${svgW} ${svgH}`}
                      className="w-full h-56 sm:h-64 overflow-visible"
                    >
                      <defs>
                        <linearGradient id="mutabaahLineGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#059669" stopOpacity="0.28" />
                          <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid lines & Y-Axis Labels */}
                      {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                        const yPos = padT + plotH - pct * plotH;
                        const labelVal = Math.round(pct * chartMax);
                        return (
                          <g key={idx}>
                            <line
                              x1={padL}
                              y1={yPos}
                              x2={svgW - padR}
                              y2={yPos}
                              stroke="#e2e8f0"
                              strokeWidth="1"
                              strokeDasharray={pct === 0 ? "none" : "2 2"}
                            />
                            <text
                              x={padL - 8}
                              y={yPos + 3}
                              textAnchor="end"
                              className="text-[10px] fill-slate-400 font-mono font-bold"
                            >
                              {labelVal}
                            </text>
                          </g>
                        );
                      })}

                      {/* Daily Target Threshold Dashed Line */}
                      <g>
                        <line
                          x1={padL}
                          y1={targetY}
                          x2={svgW - padR}
                          y2={targetY}
                          stroke="#f59e0b"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={svgW - padR}
                          y={targetY - 5}
                          textAnchor="end"
                          className="text-[10px] fill-amber-700 font-bold"
                        >
                          Target: {summary.dailyTarget} Ayat
                        </text>
                      </g>

                      {/* Gradient Fill under the line */}
                      <polygon points={areaString} fill="url(#mutabaahLineGrad)" />

                      {/* Main Trend Line */}
                      <polyline
                        points={pointsString}
                        fill="none"
                        stroke="#059669"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Data Points */}
                      {dailyStats.map((d, idx) => {
                        const cx = getX(idx);
                        const cy = getY(d.ayahs);
                        const isHovered = hoveredChartPoint?.day === d.day;
                        const isToday = d.dateKey === todayKey;

                        return (
                          <g key={idx} className="cursor-pointer">
                            {/* Hover hit area */}
                            <circle
                              cx={cx}
                              cy={cy}
                              r="12"
                              fill="transparent"
                              onMouseEnter={() => setHoveredChartPoint(d)}
                              onClick={() => handleCellClick(d.dateKey)}
                            />

                            {/* Visible Circle dot */}
                            <circle
                              cx={cx}
                              cy={cy}
                              r={isHovered ? 6 : d.hasActivity ? 4 : 2.5}
                              fill={d.hasActivity ? (d.targetMet ? "#059669" : "#0d9488") : "#94a3b8"}
                              stroke="#ffffff"
                              strokeWidth={d.hasActivity ? 2 : 1}
                              className="transition-all duration-150"
                              onMouseEnter={() => setHoveredChartPoint(d)}
                              onClick={() => handleCellClick(d.dateKey)}
                            />

                            {isToday && (
                              <circle
                                cx={cx}
                                cy={cy}
                                r="8"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="1.5"
                                strokeDasharray="2 2"
                                className="animate-pulse"
                              />
                            )}
                          </g>
                        );
                      })}

                      {/* X-Axis Day Numbers */}
                      {dailyStats.map((d, idx) => {
                        // Display every 3 days and the last day
                        const shouldShow = d.day === 1 || d.day % 3 === 0 || d.day === daysInMonth;
                        if (!shouldShow) return null;
                        const cx = getX(idx);
                        return (
                          <text
                            key={idx}
                            x={cx}
                            y={padT + plotH + 18}
                            textAnchor="middle"
                            className="text-[10px] fill-slate-500 font-mono font-bold"
                          >
                            {d.day}
                          </text>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* Tooltip Overlay Banner */}
                {hoveredChartPoint ? (
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs animate-in fade-in duration-150">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800">
                        Tanggal {hoveredChartPoint.day} {INDONESIAN_MONTHS[currentMonth - 1]}:
                      </span>
                      <span className="font-black font-mono text-emerald-800">
                        {hoveredChartPoint.ayahs} Ayat
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                          hoveredChartPoint.targetMet
                            ? "bg-emerald-600 text-white"
                            : hoveredChartPoint.ayahs > 0
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {hoveredChartPoint.targetMet
                          ? "Target Tercapai"
                          : hoveredChartPoint.ayahs > 0
                          ? "Di Bawah Target"
                          : "Tidak Ada Aktivitas"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCellClick(hoveredChartPoint.dateKey)}
                      className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Buka Rincian &rarr;
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 text-center italic">
                    Arahkan kursor atau sentuh titik tanggal pada grafik untuk melihat rincian capaian ayat.
                  </p>
                )}
              </div>
            );
          })()}

          {/* Heatmap Surah (Data Riil Spaced Repetition - Mendukung Seluruh 30 Juz & 114 Surah) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Peta Visual Retensi Surah (Heatmap Spaced Repetition)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visualisasi daya ingat per ayat yang menyesuaikan dengan Juz, Surah, dan rentang ayat hafalan aktif Anda.
                </p>
              </div>

              <div className="flex items-center space-x-3 text-xs font-medium flex-wrap gap-y-1">
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500" />
                  <span>Mutqin</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded bg-amber-400" />
                  <span>Diulang</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded bg-rose-400" />
                  <span>Belum Lancar</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300" />
                  <span>Belum Dimurojaah</span>
                </span>
              </div>
            </div>

            {/* Bar Kontrol Juz & Sinkronisasi Posisi Hafalan */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
              <div className="flex flex-wrap items-center gap-2.5">
                <label htmlFor="juz-heatmap-filter" className="text-xs font-bold text-slate-700">
                  Tampilkan Wilayah Hafalan:
                </label>
                <select
                  id="juz-heatmap-filter"
                  value={selectedJuzFilter}
                  onChange={(e) => {
                    const val = e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10);
                    setSelectedJuzFilter(val);
                    if (val !== 'all') {
                      const inJuz = getSurahsInJuz(val);
                      const targetInJuz = inJuz.find((s) => s.number === commitments.targetSurahNumber);
                      if (targetInJuz) {
                        setSelectedSurah(targetInJuz.number);
                      } else if (inJuz.length > 0) {
                        setSelectedSurah(inJuz[0].number);
                      }
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {Array.from({ length: 30 }, (_, idx) => idx + 1).map((juzNum) => {
                    const surahsInThisJuz = getSurahsInJuz(juzNum);
                    const firstName = surahsInThisJuz[0]?.name || '';
                    const lastName = surahsInThisJuz[surahsInThisJuz.length - 1]?.name || '';
                    const rangeLabel =
                      firstName && lastName && firstName !== lastName
                        ? `${firstName} – ${lastName}`
                        : firstName;
                    return (
                      <option key={juzNum} value={juzNum}>
                        Juz {juzNum} ({rangeLabel})
                      </option>
                    );
                  })}
                  <option value="all">Semua 114 Surah (30 Juz Lengkap)</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    const resolved = resolveInitialTarget(commitments);
                    setSelectedJuzFilter(resolved.juz);
                    setSelectedSurah(resolved.surah);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white border border-emerald-200 hover:bg-emerald-50 text-xs font-bold text-emerald-800 transition cursor-pointer"
                >
                  Fokus Target Saya (QS. {commitments.targetSurahName || 'An-Naba'})
                </button>
              </div>

              <Link
                to="/app/target"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline self-start sm:self-auto"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Ubah Posisi Mulai/Sampai</span>
              </Link>
            </div>

            {(() => {
              const displayedSurahs: SurahMetaInfo[] =
                selectedJuzFilter === 'all'
                  ? ALL_QURAN_SURAHS
                  : getSurahsInJuz(selectedJuzFilter);

              return (
                <div
                  className={`grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 ${
                    selectedJuzFilter === 'all' ? 'max-h-72 overflow-y-auto pr-1' : ''
                  }`}
                >
                  {displayedSurahs.map((surah) => {
                    const isSelected = selectedSurah === surah.number;
                    const isActiveTarget = commitments.targetSurahNumber === surah.number;
                    return (
                      <button
                        key={surah.number}
                        type="button"
                        onClick={() => setSelectedSurah(surah.number)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-xs font-bold'
                            : isActiveTarget
                            ? 'border-emerald-300 bg-emerald-50/30 hover:border-emerald-400'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>QS. {surah.number}</span>
                          {isActiveTarget && (
                            <span className="text-[9px] font-sans font-bold text-emerald-700">
                              Target
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-slate-900 truncate mt-0.5">
                          {surah.name}
                        </div>
                        <div className="text-[10px] text-slate-500">{surah.ayahs} Ayat</div>
                      </button>
                    );
                  })}
                </div>
              );
            })()}

            {activeSurahHeatmap && (() => {
              const strongCount = activeSurahHeatmap.ayahs.filter((a) => a.status === 'strong').length;
              const reviewingCount = activeSurahHeatmap.ayahs.filter((a) => a.status === 'reviewing').length;
              const learningCount = activeSurahHeatmap.ayahs.filter(
                (a) => a.status === 'learning' || (a.status as string) === 'weak'
              ).length;
              const total = activeSurahHeatmap.totalAyahs || 1;
              const realRetentionPct = Math.round(((strongCount + reviewingCount * 0.5) / total) * 100);
              const isViewingTargetSurah =
                activeSurahHeatmap.surahNumber === commitments.targetSurahNumber;
              const tStart = commitments.targetStartAyah || 1;
              const tEnd = commitments.targetEndAyah || activeSurahHeatmap.totalAyahs;

              return (
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900">
                        Rincian Ayat Surah {activeSurahHeatmap.surahName} (QS. {activeSurahHeatmap.surahNumber}):
                      </span>
                      <span className="text-xs text-slate-500 ml-2">
                        Total {activeSurahHeatmap.totalAyahs} Ayat • {strongCount} Mutqin • {reviewingCount} Diulang • {learningCount} Lemah
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80 self-start sm:self-auto">
                      Daya Tahan Memori: {realRetentionPct}%
                    </span>
                  </div>

                  {isViewingTargetSurah && (
                    <div className="px-3.5 py-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-950">
                      <div className="flex items-center space-x-2">
                        <Compass className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>
                          Rentang hafalan aktif saat ini: <strong>Mulai Ayat {tStart}</strong> sampai <strong>Ayat {tEnd}</strong> (Tenggat: {commitments.targetDeadline}).
                        </span>
                      </div>
                      <Link
                        to="/app/murojaah"
                        className="font-bold text-emerald-800 hover:underline shrink-0"
                      >
                        Lanjut Setoran →
                      </Link>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto p-1">
                    {activeSurahHeatmap.ayahs.map((ayah) => {
                      const inActiveTargetRange =
                        isViewingTargetSurah &&
                        ayah.ayahNumber >= tStart &&
                        ayah.ayahNumber <= tEnd;

                      let colorClass = inActiveTargetRange
                        ? 'bg-emerald-50/60 text-emerald-900 border border-emerald-300 hover:border-emerald-500'
                        : 'bg-slate-100 text-slate-600 border border-slate-200 hover:border-slate-400';

                      let statusTitle = inActiveTargetRange
                        ? `Ayat ${ayah.ayahNumber} (Target Aktif ${tStart}–${tEnd}): Belum Pernah Dimurojaah`
                        : `Ayat ${ayah.ayahNumber}: Belum Pernah Dimurojaah`;

                      if (ayah.status === 'strong') {
                        colorClass = 'bg-emerald-500 text-white shadow-2xs';
                        statusTitle = `Ayat ${ayah.ayahNumber} • Mutqin (${ayah.lastScore || 90}%) • Interval +${ayah.intervalDays} Hari`;
                      } else if (ayah.status === 'reviewing') {
                        colorClass = 'bg-amber-400 text-amber-950 shadow-2xs';
                        statusTitle = `Ayat ${ayah.ayahNumber} • Perlu Diulang (${ayah.lastScore}%) • Interval +${ayah.intervalDays} Hari`;
                      } else if (ayah.status === 'learning' || (ayah.status as string) === 'weak') {
                        colorClass = 'bg-rose-400 text-white shadow-2xs';
                        statusTitle = `Ayat ${ayah.ayahNumber} • Belum Lancar (${ayah.lastScore}%) • Interval +${ayah.intervalDays} Hari`;
                      }

                      return (
                        <div
                          key={ayah.ayahNumber}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-transform hover:scale-110 cursor-pointer ${colorClass}`}
                          title={statusTitle}
                        >
                          {ayah.ayahNumber}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* TAB 2: JURNAL & CATATAN MUSYRIF */}
      {activeMainTab === 'journal' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Timeline Riwayat Jurnal Mutabaah
                </h3>
                <p className="text-xs text-slate-500">
                  Pusat catatan tilawah dan setoran murojaah santri lengkap dengan umpan balik Ustadz pembimbing.
                </p>
              </div>

              {/* Activity Filters */}
              <div className="flex items-center space-x-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
                {(['all', 'tilawah', 'murojaah', 'hafalan_baru'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setJournalFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer capitalize ${journalFilter === cat
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    {cat === 'all'
                      ? 'Semua'
                      : cat === 'murojaah'
                        ? 'Murojaah AI'
                        : cat === 'hafalan_baru'
                          ? 'Hafalan Baru'
                          : 'Tilawah'}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Journal Entries */}
            <div className="space-y-4 pt-2">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => {
                  const isTilawah = item.type === 'tilawah';
                  const isMurojaah = item.type === 'murojaah_ai' || item.type === 'murojaah';
                  const isVerified = item.ustadzStatus === 'verified';
                  const isNeedsImprovement = item.ustadzStatus === 'needs_improvement';

                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:border-emerald-300 transition-all space-y-3"
                    >
                      {/* Entry Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-2.5">
                          <span
                            className={`p-2 rounded-xl text-xs font-bold ${isTilawah
                                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                                : isMurojaah
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                              }`}
                          >
                            {isTilawah ? <BookOpen className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                          </span>

                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-bold text-slate-900 text-sm">
                                QS. {item.surahName} : Ayat {item.ayahStart} – {item.ayahEnd}
                              </h4>
                              <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                {item.type.replace('_', ' ')}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 font-mono">
                              {item.time}
                            </span>
                          </div>
                        </div>

                        {/* Badges / Metrics */}
                        <div className="flex items-center space-x-2 self-start sm:self-auto">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                            {item.totalAyahs} Ayat
                          </span>
                          {item.pagesCount && item.pagesCount > 0 && (
                            <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                              {item.pagesCount} Lembar
                            </span>
                          )}
                          {item.score !== undefined && (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 font-mono">
                              {item.score}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Santri Notes Box */}
                      {item.santriNotes && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Catatan Kendala / Refleksi Santri:
                          </span>
                          <p className="italic leading-relaxed">
                            "{item.santriNotes}"
                          </p>
                        </div>
                      )}

                      {/* Ustadz Feedback / Evaluasi Box */}
                      {item.ustadzNotes && (
                        <div
                          className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${isVerified
                              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                              : isNeedsImprovement
                                ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                                : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold flex items-center space-x-1.5">
                              {isVerified ? (
                                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                              ) : isNeedsImprovement ? (
                                <AlertCircle className="w-4 h-4 text-amber-600" />
                              ) : (
                                <UserCheck className="w-4 h-4 text-slate-600" />
                              )}
                              <span>Catatan Evaluasi Musyrif / Ustadz Pembimbing:</span>
                            </span>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isVerified
                                  ? 'bg-emerald-200/80 text-emerald-900'
                                  : isNeedsImprovement
                                    ? 'bg-amber-200/80 text-amber-900'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                            >
                              {isVerified ? 'Disetujui (Mumtaz)' : isNeedsImprovement ? 'Perlu Diulang' : 'Tercatat'}
                            </span>
                          </div>

                          <p className="leading-relaxed font-medium">
                            {item.ustadzNotes}
                          </p>

                          {item.ustadzName && (
                            <span className="text-[10px] text-slate-500 block text-right font-semibold">
                              — {item.ustadzName}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center p-12 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2">
                  <p className="text-xs text-slate-500">
                    Belum ada riwayat aktivitas untuk kategori ini.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TARGET & KOMITMEN MANDIRI */}
      {activeMainTab === 'commitments' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Target &amp; Komitmen Ibadah Mandiri Santri
                </h3>
                <p className="text-xs text-slate-500">
                  Tetapkan target tilawah lembar dan surat hafalan pilihan untuk menjaga istiqomah hafalan Anda.
                </p>
              </div>

              <Link
                to="/app/target"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer self-start sm:self-auto flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Target className="w-4 h-4" />
                <span>Atur di Halaman Target</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Target Cards Overview (Read-Only) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
              {/* Card 1: Target Murojaah Harian */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                <div className="flex items-center space-x-2 text-emerald-800">
                  <RotateCcw className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">
                    Target Murojaah
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xl font-black text-slate-900 font-mono block">
                    {commitments.dailyTargetMurojaahCount || 1} {commitments.murojaahTargetUnit === 'ayah' ? 'Ayat' : commitments.murojaahTargetUnit === 'page' ? 'Halaman' : 'Surah'} / Hari
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Alur: {commitments.progressionOrder === 'juz_1_asc' ? 'Juz 1 Berurutan' : commitments.progressionOrder === 'custom_surah' ? 'Surah Pilihan' : 'Juz 30 (Juz Amma)'}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Spaced Repetition System</span>
                </div>
              </div>

              {/* Card 2: Target Hafalan Baru */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                <div className="flex items-center space-x-2 text-emerald-800">
                  <Mic className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">
                    Hafalan Baru (Ziyadah)
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xl font-black text-slate-900 font-mono block">
                    {commitments.dailyTargetAyahsHafalan} Ayat / Hari
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Diulang sampai mutqin
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Streak: {commitments.currentStreak} Hari</span>
                </div>
              </div>

              {/* Card 3: Target Tilawah Harian */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                <div className="flex items-center space-x-2 text-teal-800">
                  <BookOpen className="w-4 h-4 text-teal-600" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">
                    Target Tilawah
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xl font-black text-slate-900 font-mono block">
                    {commitments.dailyTargetPagesTilawah} Lembar / Hari
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Setara {commitments.dailyTargetAyahsTilawah} ayat tilawah
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Otomatis dari Mushaf</span>
                </div>
              </div>

              {/* Card 4: Target Surah Khusus */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                <div className="flex items-center space-x-2 text-indigo-800">
                  <Compass className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">
                    Target Surah Khusus
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xl font-black text-slate-900 font-mono block truncate">
                    QS. {commitments.targetSurahName}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Ayat {commitments.targetStartAyah} s.d. {commitments.targetEndAyah} • {commitments.targetDeadline}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-indigo-700 font-semibold flex items-center space-x-1">
                  <Bookmark className="w-3 h-3" />
                  <span>Tenggat Target</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL DETAIL LAPORAN TANGGAL */}
      {selectedDateKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Laporan Mutabaah
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {formattedSelectedDate}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseDetailModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 text-center">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Ayat</span>
                <span className="text-lg font-black text-slate-900 font-mono">
                  {selectedDayData ? selectedDayData.ayahsReviewed : 0}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Status Target</span>
                <span
                  className={`text-xs font-bold block mt-1 ${selectedDayData?.targetAchieved
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                    }`}
                >
                  {selectedDayData?.targetAchieved ? 'Tercapai' : 'Belum'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Rata-rata Skor</span>
                <span className="text-lg font-black text-slate-900 font-mono">
                  {selectedDayData && selectedDayData.ayahsReviewed > 0
                    ? `${selectedDayData.averageScore}%`
                    : '-'}
                </span>
              </div>
            </div>

            {/* Reports List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Rincian Sesi Laporan ({selectedDayData?.reports?.length || 0})
                </h4>

                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Tersinkronisasi Otomatis
                </span>
              </div>

              {selectedDayData && selectedDayData.reports && selectedDayData.reports.length > 0 ? (
                <div className="space-y-2.5">
                  {selectedDayData.reports.map((report: MutabaahReportItem) => {
                    const isAi = report.type === 'murojaah_ai' || report.type === 'murojaah';
                    const isTilawah = report.type === 'tilawah';
                    return (
                      <div
                        key={report.id}
                        className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2 hover:border-emerald-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`p-1.5 rounded-lg text-xs ${
                                isTilawah
                                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                  : isAi
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-teal-50 text-teal-700 border border-teal-200'
                                }`}
                            >
                              {isTilawah ? (
                                <BookOpen className="w-3.5 h-3.5" />
                              ) : isAi ? (
                                <Mic className="w-3.5 h-3.5" />
                              ) : (
                                <FileText className="w-3.5 h-3.5" />
                              )}
                            </span>
                            <div>
                              <span className="text-xs font-bold text-slate-900 block">
                                QS. {report.surahName} : Ayat {report.ayahStart} - {report.ayahEnd}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {report.totalAyahs} Ayat • {report.time}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              Skor {report.score}%
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {report.score >= 90 ? 'Mutqin' : 'Jayyid'}
                            </span>
                          </div>
                        </div>

                        {report.santriNotes && (
                          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed italic">
                            "{report.santriNotes}"
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                          <span className="flex items-center space-x-1">
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            <span>Penguji: {report.verifier || 'Mandiri'}</span>
                          </span>
                          <span className="capitalize">{isTilawah ? 'Tilawah Harian' : report.type.replace('_', ' ')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-8 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">
                      Belum Ada Catatan Murojaah
                    </h5>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-0.5">
                      Belum ada ayat yang dilaporkan untuk tanggal ini. Mulai murojaah sekarang atau catat setoran mandiri.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-center space-x-2">
                    <Link
                      to="/app/mushaf"
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-2xs"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Baca di Mushaf</span>
                    </Link>
                    <Link
                      to="/app/murojaah"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-xs"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Setor Murojaah AI</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCloseDetailModal}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

          </div>
  );
}
