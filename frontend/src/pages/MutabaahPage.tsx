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
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Compass,
  Bookmark,
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
  recordMutabaahReport,
  getGithubIntensityLevel,
  getGithubTileClasses,
  getMutabaahHistory,
  getUserCommitments,
  saveUserCommitments,
} from '../lib/mutabaahService';

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
  const [commitments, setCommitments] = useState<UserCommitment>(getUserCommitments());
  const [isEditingCommitment, setIsEditingCommitment] = useState(false);
  const [commitmentForm, setCommitmentForm] = useState<UserCommitment>(commitments);
  const [commitmentToast, setCommitmentToast] = useState<string | null>(null);

  // Summary Metrics
  const [summary, setSummary] = useState<MutabaahSummary>({
    currentStreak: 5,
    maxStreak: 14,
    todayReviewedAyahs: 10,
    dailyTarget: 10,
    targetMetToday: true,
    totalAyahsMemorized: 78,
    weeklyActivity: [],
  });

  // Daily target quick editor
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  const [customTarget, setCustomTarget] = useState<number>(10);

  // Selected date details modal state
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedDayData, setSelectedDayData] = useState<DayMutabaahData | null>(null);

  // Manual Report Form Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [formDate, setFormDate] = useState<string>(todayKey);
  const [formSurahNumber, setFormSurahNumber] = useState<number>(78);
  const [formAyahStart, setFormAyahStart] = useState<number>(1);
  const [formAyahEnd, setFormAyahEnd] = useState<number>(10);
  const [formScore, setFormScore] = useState<number>(95);
  const [formType, setFormType] = useState<'murojaah_ai' | 'setoran_mandiri' | 'tilawah'>('setoran_mandiri');
  const [formVerifier, setFormVerifier] = useState<string>('Ustadz Pembimbing');
  const [formNotes, setFormNotes] = useState<string>('');

  // Surah Heatmap State (Juz 'Amma)
  const [selectedSurah, setSelectedSurah] = useState<number>(78);
  const [activeSurahHeatmap, setActiveSurahHeatmap] = useState<SurahHeatmap | null>(null);

  // 1. Refresh stored logs & sync with backend summary
  const refreshData = () => {
    const stored = getStoredMutabaahLogs();
    setLogs(stored);

    const history = getMutabaahHistory();
    setHistoryList(history);

    const curCommitments = getUserCommitments();
    setCommitments(curCommitments);
    setCommitmentForm(curCommitments);

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
    }));
  };

  useEffect(() => {
    refreshData();

    const handleUpdate = () => refreshData();
    window.addEventListener('hifzhly_mutabaah_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('hifzhly_mutabaah_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [todayKey]);

  // Sync with backend API GET /api/v1/mutabaah/summary if available
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
  }, []);

  // 2. Fetch or compute Surah Heatmap
  useEffect(() => {
    const token = localStorage.getItem('hifzhly_auth_token');
    fetch(`/api/v1/mutabaah/heatmap/${selectedSurah}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: SurahHeatmap | null) => {
        if (data) {
          setActiveSurahHeatmap(data);
        } else {
          throw new Error('No backend data');
        }
      })
      .catch(() => {
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

  const handleOpenReportModal = (dateStr?: string) => {
    setFormDate(dateStr || todayKey);
    setIsReportModalOpen(true);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    const surahMeta = JUZ_AMMA_SURAHS.find((s) => s.number === formSurahNumber);
    const surahName = surahMeta ? surahMeta.name : `Surah ${formSurahNumber}`;

    await recordMutabaahReport({
      date: formDate,
      surahNumber: formSurahNumber,
      surahName,
      ayahStart: formAyahStart,
      ayahEnd: formAyahEnd,
      score: formScore,
      type: formType,
      verifier: formVerifier,
      notes: formNotes || undefined,
      santriNotes: formNotes || undefined,
    });

    setIsReportModalOpen(false);
    refreshData();

    if (selectedDateKey === formDate) {
      const updated = getStoredMutabaahLogs();
      setSelectedDayData(updated[formDate] || null);
    }
  };

  // Submit Commitment Form
  const handleSaveCommitments = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveUserCommitments(commitmentForm);
    setIsEditingCommitment(false);
    refreshData();
    setCommitmentToast('Target & Komitmen Ibadah berhasil diperbarui!');
    setTimeout(() => setCommitmentToast(null), 3000);
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
      {/* Toast Notification */}
      {commitmentToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-400 text-sm font-semibold animate-in zoom-in-95">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{commitmentToast}</span>
        </div>
      )}

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

        <button
          type="button"
          onClick={() => handleOpenReportModal()}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Setoran Baru</span>
        </button>
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

          {/* Heatmap Surah Juz 'Amma */}
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
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${statusBg} ${isSelected ? 'ring-2 ring-emerald-600 shadow-sm font-bold scale-105' : ''
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
                    Daya Tahan Memori: {JUZ_AMMA_SURAHS.find((s) => s.number === selectedSurah)?.pct}%
                  </span>
                </div>

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

              <button
                type="button"
                onClick={() => setIsEditingCommitment(!isEditingCommitment)}
                className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
              >
                {isEditingCommitment ? 'Batal Ubah' : 'Atur Komitmen Target'}
              </button>
            </div>

            {/* Target Cards Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Target Tilawah Harian */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center space-x-2 text-teal-800">
                  <BookOpen className="w-5 h-5" />
                  <span className="font-bold text-xs uppercase tracking-wider">
                    Target Tilawah Harian
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-2xl font-black text-slate-900 font-mono block">
                    {commitments.dailyTargetPagesTilawah} Lembar / Hari
                  </span>
                  <span className="text-xs text-slate-500">
                    Setara {commitments.dailyTargetAyahsTilawah} ayat tilawah Al-Qur'an
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-xs text-emerald-700 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sistem otomatis mencatat dari Mushaf</span>
                </div>
              </div>

              {/* Card 2: Target Hafalan Harian */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-800">
                  <Flame className="w-5 h-5 fill-amber-500/20 text-amber-600" />
                  <span className="font-bold text-xs uppercase tracking-wider">
                    Target Hafalan &amp; Murojaah
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-2xl font-black text-slate-900 font-mono block">
                    {commitments.dailyTargetAyahsHafalan} Ayat / Hari
                  </span>
                  <span className="text-xs text-slate-500">
                    Diulang melalui Spaced Repetition System (SRS)
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-xs text-emerald-700 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Streak konsistensi: {commitments.currentStreak} Hari</span>
                </div>
              </div>

              {/* Card 3: Target Surah Pilihan */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center space-x-2 text-indigo-800">
                  <Compass className="w-5 h-5" />
                  <span className="font-bold text-xs uppercase tracking-wider">
                    Target Surah Khusus
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-2xl font-black text-slate-900 font-mono block truncate">
                    QS. {commitments.targetSurahName}
                  </span>
                  <span className="text-xs text-slate-500">
                    Ayat {commitments.targetStartAyah} s.d. {commitments.targetEndAyah} • Tenggat {commitments.targetDeadline}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-xs text-indigo-700 font-semibold flex items-center space-x-1">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Target komitmen semester ini</span>
                </div>
              </div>
            </div>

            {/* Edit Commitment Form */}
            {isEditingCommitment && (
              <form onSubmit={handleSaveCommitments} className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-4 animate-in fade-in duration-150">
                <h4 className="font-bold text-emerald-950 text-sm">
                  Formulir Pengaturan Komitmen Target
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Target Tilawah (Lembar/Hari)</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={commitmentForm.dailyTargetPagesTilawah}
                      onChange={(e) => setCommitmentForm({ ...commitmentForm, dailyTargetPagesTilawah: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Target Hafalan (Ayat/Hari)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={commitmentForm.dailyTargetAyahsHafalan}
                      onChange={(e) => setCommitmentForm({ ...commitmentForm, dailyTargetAyahsHafalan: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nama Surah Target Khusus</label>
                    <input
                      type="text"
                      value={commitmentForm.targetSurahName}
                      onChange={(e) => setCommitmentForm({ ...commitmentForm, targetSurahName: e.target.value })}
                      placeholder="Contoh: Al-Mulk / Al-Kahf"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Rentang Ayat Mulai</label>
                    <input
                      type="number"
                      min="1"
                      value={commitmentForm.targetStartAyah}
                      onChange={(e) => setCommitmentForm({ ...commitmentForm, targetStartAyah: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Rentang Ayat Selesai</label>
                    <input
                      type="number"
                      min="1"
                      value={commitmentForm.targetEndAyah}
                      onChange={(e) => setCommitmentForm({ ...commitmentForm, targetEndAyah: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tenggat Target (Deadline)</label>
                    <input
                      type="date"
                      value={commitmentForm.targetDeadline}
                      onChange={(e) => setCommitmentForm({ ...commitmentForm, targetDeadline: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingCommitment(false)}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center space-x-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Komitmen</span>
                  </button>
                </div>
              </form>
            )}
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

                <button
                  type="button"
                  onClick={() => handleOpenReportModal(selectedDateKey)}
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Laporan</span>
                </button>
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
                      to="/app/murojaah"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Mulai Murojaah AI</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleOpenReportModal(selectedDateKey)}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Catat Manual
                    </button>
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

      {/* 5. MODAL FORM TAMBAH LAPORAN MANUAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleSubmitReport}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-base">
                  Catat Laporan Mutabaah
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tanggal Setoran</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-mono text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Surah (Juz 'Amma)</label>
                <select
                  value={formSurahNumber}
                  onChange={(e) => setFormSurahNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                >
                  {JUZ_AMMA_SURAHS.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.name} ({s.ayahs} Ayat)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ayat Mulai</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formAyahStart}
                    onChange={(e) => setFormAyahStart(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-mono text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ayat Akhir</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formAyahEnd}
                    onChange={(e) => setFormAyahEnd(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-mono text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenis Aktivitas</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="setoran_mandiri">Setoran Mandiri</option>
                    <option value="murojaah_ai">Murojaah Suara AI</option>
                    <option value="tilawah">Tilawah Harian</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nilai Evaluasi (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={formScore}
                    onChange={(e) => setFormScore(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-mono text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Penguji / Pembimbing</label>
                <input
                  type="text"
                  value={formVerifier}
                  onChange={(e) => setFormVerifier(e.target.value)}
                  placeholder="Contoh: Ustadz Ahmad, Lc. / Mandiri"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Contoh: Bacaan lancar, mad thabi'i konsisten 2 harakat."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center space-x-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Laporan</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
