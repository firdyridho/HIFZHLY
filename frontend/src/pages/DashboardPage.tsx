import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Settings,
  Bell,
  Sunrise,
  Sun,
  CloudSun,
  Sunset,
  MoonStar,
  BookOpen,
  Brain,
  Mic,
  TrendingUp,
  GraduationCap,
  HeartHandshake,
  Gamepad2,
  Flame,
  Target,
  CheckCircle2,
  ArrowRight,
  Play,
  ChevronRight,
  X,
} from 'lucide-react';
import type { UserProfile, TajwidModule, SrsDueItem } from '../types';
import { getStoredMutabaahLogs, formatDateKey, getUserCommitments, saveUserCommitments } from '../lib/mutabaahService';

interface PrayerSchedule {
  name: string;
  time: string;
  icon: typeof Sunrise;
  hours: number;
  minutes: number;
}

const DEFAULT_PRAYER_TIMES: PrayerSchedule[] = [
  { name: 'Shubuh', time: '04:10', icon: Sunrise, hours: 4, minutes: 10 },
  { name: 'Dzuhur', time: '11:39', icon: Sun, hours: 11, minutes: 39 },
  { name: 'Ashar', time: '14:56', icon: CloudSun, hours: 14, minutes: 56 },
  { name: 'Maghrib', time: '17:49', icon: Sunset, hours: 17, minutes: 49 },
  { name: 'Isya', time: '19:00', icon: MoonStar, hours: 19, minutes: 0 },
];

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showDzikirModal, setShowDzikirModal] = useState(false);
  const [srsItems, setSrsItems] = useState<SrsDueItem[]>([]);
  const [activeTajwidModule, setActiveTajwidModule] = useState<TajwidModule | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerSchedule[]>(DEFAULT_PRAYER_TIMES);
  const [cityName, setCityName] = useState('Serang, Banten');
  const [doaList, setDoaList] = useState<{ id: string; title: string; arabic: string; latin: string; translation: string; fadhilah?: string }[]>([]);
  const [todayReviewed, setTodayReviewed] = useState(10);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [customAyahsTarget, setCustomAyahsTarget] = useState(10);
  const [customPagesTarget, setCustomPagesTarget] = useState(2);
  const [targetToastMessage, setTargetToastMessage] = useState<string | null>(null);

  // Load Real Prayer Times and Doa from Backend API
  useEffect(() => {
    fetch('/api/v1/prayer-times')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        if (data.city) setCityName(data.city);
        if (data.schedules && Array.isArray(data.schedules)) {
          const iconMap: Record<string, typeof Sunrise> = {
            Shubuh: Sunrise,
            Dzuhur: Sun,
            Ashar: CloudSun,
            Maghrib: Sunset,
            Isya: MoonStar,
          };
          const mapped = data.schedules.map((s: any) => ({
            ...s,
            icon: iconMap[s.name] || Sun,
          }));
          setPrayerTimes(mapped);
        }
      })
      .catch(() => {});

    fetch('/api/v1/doa')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.doa && Array.isArray(data.doa)) {
          setDoaList(data.doa);
        }
      })
      .catch(() => {});
  }, []);

  // Load user profile
  useEffect(() => {
    const cached = localStorage.getItem('hifzhly_user_profile');
    if (cached) {
      try {
        setProfile(JSON.parse(cached));
      } catch (e) {
        console.error('Failed to parse cached profile:', e);
      }
    }

    const token = localStorage.getItem('hifzhly_auth_token');
    if (token) {
      fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setProfile(data);
            localStorage.setItem('hifzhly_user_profile', JSON.stringify(data));
          }
        })
        .catch(() => {});
    }

    // Load current commitment settings
    const com = getUserCommitments();
    if (com.dailyTargetAyahsHafalan) setCustomAyahsTarget(com.dailyTargetAyahsHafalan);
    if (com.dailyTargetPagesTilawah) setCustomPagesTarget(com.dailyTargetPagesTilawah);

    // 0. Sync Real Mutabaah Today Log
    const syncTodayMutabaah = () => {
      const logs = getStoredMutabaahLogs();
      const todayK = formatDateKey(new Date());
      const tLog = logs[todayK];
      if (tLog) {
        setTodayReviewed(tLog.ayahsReviewed);
      }
    };
    syncTodayMutabaah();
    window.addEventListener('hifzhly_mutabaah_updated', syncTodayMutabaah);
    window.addEventListener('storage', syncTodayMutabaah);

    // 1. Fetch Real SRS Queue from Backend API
    fetch('/api/v1/srs/today', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.items && Array.isArray(data.items)) {
          setSrsItems(data.items);
        }
      })
      .catch((err) => console.warn('Failed to load real SRS items:', err));

    // 2. Fetch Real Tajwid Module from Backend API
    fetch('/api/v1/tajwid/modules')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setActiveTajwidModule(data[0]);
        }
      })
      .catch((err) => console.warn('Failed to load real Tajwid modules:', err))
      ;
  }, []);

  // Real-time Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  // Calculate Next Prayer and Countdown
  const currentMinutesSinceMidnight =
    currentTime.getHours() * 60 + currentTime.getMinutes();

  let nextPrayer = prayerTimes[0] || DEFAULT_PRAYER_TIMES[0];
  let diffMinutes = 0;

  for (let i = 0; i < prayerTimes.length; i++) {
    const pMinutes = prayerTimes[i].hours * 60 + prayerTimes[i].minutes;
    if (pMinutes > currentMinutesSinceMidnight) {
      nextPrayer = prayerTimes[i];
      diffMinutes = pMinutes - currentMinutesSinceMidnight;
      break;
    }
    if (i === prayerTimes.length - 1) {
      // Past Isya, next is Shubuh tomorrow
      nextPrayer = prayerTimes[0];
      diffMinutes = 24 * 60 - currentMinutesSinceMidnight + prayerTimes[0].hours * 60 + prayerTimes[0].minutes;
    }
  }

  const hoursLeft = Math.floor(diffMinutes / 60);
  const minsLeft = diffMinutes % 60;
  const countdownText =
    hoursLeft > 0
      ? `${nextPrayer.name} ${hoursLeft} jam ${minsLeft} mnt lagi`
      : `${nextPrayer.name} ${minsLeft} min left`;

  const handleSaveTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveUserCommitments({
      dailyTargetAyahsHafalan: customAyahsTarget,
      dailyTargetPagesTilawah: customPagesTarget,
    });
    setProfile((prev) => prev ? { ...prev, dailyTargetAyahs: customAyahsTarget } : null);
    setShowTargetModal(false);
    setTargetToastMessage(`Target berhasil disimpan: ${customAyahsTarget} Ayat & ${customPagesTarget} Lembar per hari`);
    setTimeout(() => setTargetToastMessage(null), 4000);
  };

  const displayName = profile?.fullName || profile?.username || 'pijaa';
  const streak = profile?.currentStreak ?? 5;
  const dailyTarget = profile?.dailyTargetAyahs ?? 10;

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. TOP EMERALD BANNER (Waktu Sholat & Sapaan Santri) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-600 to-emerald-700 text-white p-5 sm:p-7 shadow-lg shadow-emerald-700/15">
        {/* Subtle Decorative Geometry */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none blur-2xl" />
        <div className="absolute -left-10 -top-10 w-48 h-48 rounded-full bg-emerald-400/10 pointer-events-none blur-xl" />

        {/* Header Row: Greeting & Settings / Notification */}
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center space-x-1.5">
              <span>Assalamu'alaikum, {displayName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium mt-0.5">
              20 Jumādá al-ūlá 1448 H
            </p>
            <div className="flex items-center space-x-1 text-[11px] text-emerald-200/80 mt-1">
              <MapPin className="w-3 h-3 text-emerald-300 shrink-0" />
              <span>{cityName}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowTargetModal(true)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-xs cursor-pointer"
              title="Atur Target Harian"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowNotificationModal(true)}
              className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-xs cursor-pointer"
              title="Pemberitahuan Murojaah"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-400 ring-2 ring-emerald-600" />
            </button>
          </div>
        </div>

        {/* Center Clock & Next Prayer Countdown */}
        <div className="relative z-10 text-center my-6 sm:my-8">
          <div className="text-5xl sm:text-6xl font-black tracking-tight text-white font-mono drop-shadow-xs">
            {formattedTime}
          </div>
          <div className="inline-block mt-2 px-3 py-1 rounded-full bg-black/15 text-xs font-semibold text-emerald-100 backdrop-blur-xs">
            {countdownText}
          </div>
        </div>

        {/* Prayer Times Row (5 Waktu Sholat) */}
        <div className="relative z-10 grid grid-cols-5 gap-1.5 sm:gap-3 pt-3 border-t border-emerald-500/40 text-center">
          {prayerTimes.map((prayer) => {
            const isNext = prayer.name === nextPrayer.name;
            const IconComponent = prayer.icon;
            return (
              <div
                key={prayer.name}
                className={`py-2 px-1 rounded-2xl transition-all ${
                  isNext
                    ? 'bg-white/20 ring-1 ring-white/40 shadow-xs'
                    : 'hover:bg-white/10'
                }`}
              >
                <span className="text-[10px] sm:text-xs font-medium text-emerald-100/90 block">
                  {prayer.name}
                </span>
                <div className="my-1.5 flex justify-center">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all ${
                      isNext
                        ? 'bg-white text-emerald-800 shadow-sm'
                        : 'bg-white/10 text-emerald-100 hover:bg-white/15'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                  </div>
                </div>
                <span
                  className={`text-xs sm:text-sm font-mono block ${
                    isNext ? 'font-black text-white' : 'font-semibold text-emerald-100/90'
                  }`}
                >
                  {prayer.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. SECTION MENU UTAMA (Grid Navigasi Fitur) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Menu Utama
          </h2>
          <span className="text-xs text-slate-500">Akses Cepat</span>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="grid grid-cols-4 gap-3 sm:gap-4">
            {/* 1. Qur'an */}
            <Link
              to="/app/mushaf"
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 group-hover:scale-105 group-hover:bg-emerald-100/80 transition-all shadow-xs">
                <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="mt-2 text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors text-center">
                Qur'an
              </span>
            </Link>

            {/* 2. Hafalan (SRS) */}
            <Link
              to="/app/murojaah"
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:scale-105 group-hover:bg-teal-100/80 transition-all shadow-xs">
                <Brain className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="mt-2 text-xs font-bold text-slate-800 group-hover:text-teal-700 transition-colors text-center">
                Hafalan
              </span>
            </Link>

            {/* 3. Murojaah AI */}
            <Link
              to="/app/murojaah"
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 group-hover:scale-105 group-hover:bg-emerald-100/80 transition-all shadow-xs">
                <Mic className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="mt-2 text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors text-center">
                Murojaah
              </span>
            </Link>

            {/* 4. Mutabaah */}
            <Link
              to="/app/mutabaah"
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 group-hover:scale-105 group-hover:bg-sky-100/80 transition-all shadow-xs">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="mt-2 text-xs font-bold text-slate-800 group-hover:text-sky-700 transition-colors text-center">
                Mutabaah
              </span>
            </Link>

            {/* 5. Belajar Tajwid (Explicit user request) */}
            <Link
              to="/app/tajwid"
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800 group-hover:scale-105 group-hover:bg-teal-100/80 transition-all shadow-xs">
                <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="mt-2 text-xs font-bold text-slate-800 group-hover:text-teal-800 transition-colors text-center">
                Tajwid
              </span>
            </Link>

            {/* 6. Doa & Dzikir */}
            <button
              type="button"
              onClick={() => setShowDzikirModal(true)}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 group-hover:scale-105 group-hover:bg-amber-100/80 transition-all shadow-xs">
                <HeartHandshake className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="mt-2 text-xs font-bold text-slate-800 group-hover:text-amber-700 transition-colors text-center">
                Doa Murojaah
              </span>
            </button>

            {/* 7. Kuis Tajwid */}
            <Link
              to="/app/tajwid"
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 group-hover:scale-105 group-hover:bg-indigo-100/80 transition-all shadow-xs">
                <Gamepad2 className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="mt-2 text-xs font-bold text-slate-800 group-hover:text-indigo-700 transition-colors text-center">
                Kuis
              </span>
            </Link>

            {/* 8. Target Harian */}
            <button
              type="button"
              onClick={() => setShowTargetModal(true)}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:scale-105 group-hover:bg-slate-200/80 transition-all shadow-xs">
                <Target className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="mt-2 text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors text-center">
                Target
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. SECTION AKTIFITAS & BELAJAR TAJWID (Explicit user request: 'ada aktifitas sama buat belajar tajwid') */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Aktivitas Murojaah &amp; Belajar Tajwid
          </h2>
          <span className="text-xs text-slate-500">Progres Santri</span>
        </div>

        {/* Highlight Card: Belajar Tajwid Terjadwal (Real Data from GET /api/v1/tajwid/modules) */}
        <div className="bg-gradient-to-r from-teal-900 to-emerald-900 rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-6 translate-y-6">
            <GraduationCap className="w-48 h-48" />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider bg-teal-800/60 px-2.5 py-1 rounded-full border border-teal-700/60 inline-block">
                Tajwid Academy Terintegrasi
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {activeTajwidModule ? activeTajwidModule.title : 'Modul 1: Hukum Nun Sukun & Tanwin'}
              </h3>
              <p className="text-xs text-teal-100/80 max-w-lg leading-relaxed">
                {activeTajwidModule
                  ? activeTajwidModule.summary
                  : 'Pelajari kaidah ilmu tajwid dilengkapi penjelasan video asatidz dan evaluasi kuis terintegrasi.'}
              </p>
            </div>

            <Link
              to="/app/tajwid"
              className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-white text-emerald-900 font-bold text-xs sm:text-sm hover:bg-emerald-50 active:scale-95 transition-all shadow-sm shrink-0 cursor-pointer"
            >
              <span>Belajar Tajwid Sekarang</span>
              <ArrowRight className="w-4 h-4 text-emerald-700" />
            </Link>
          </div>
        </div>

        {/* Two-Column Grid: Antrean Murojaah SRS & Target Harian */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card Aktivitas 1: Jadwal Murojaah Hari Ini (SRS Queue - Real Data from GET /api/v1/srs/today) */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Antrean Murojaah Hari Ini
                  </h4>
                  <p className="text-xs text-slate-500">
                    Spaced Repetition System
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                {srsItems.length} Ayat Jatuh Tempo
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {srsItems.length > 0 ? (
                srsItems.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        QS. {item.surahName || `Surah ${item.surahNumber}`} (Ayat {item.ayahNumber})
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Interval: {item.intervalDays || 1} Hari • Repetisi ke-{item.repetitionCount || 1}
                      </span>
                    </div>
                    <Link
                      to="/app/murojaah"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1 transition-all"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Mulai</span>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-center space-y-2">
                  <p className="text-xs text-slate-600">
                    Semua ayat SRS hari ini telah berhasil dimurojaah!
                  </p>
                  <Link
                    to="/app/murojaah"
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 hover:underline"
                  >
                    <span>Ulangi Hafalan Bebas</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Card Aktivitas 2: Target & Streak Konsistensi */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                  <Flame className="w-5 h-5 fill-amber-500/20" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Target &amp; Konsistensi Hafalan
                  </h4>
                  <p className="text-xs text-slate-500">
                    Pemantauan Mutabaah Harian
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                {streak} Hari Streak
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-slate-700">Target Ayat Hari Ini:</span>
                  <span className="text-emerald-800 font-mono font-bold">
                    {todayReviewed} / {dailyTarget} Ayat
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((todayReviewed / dailyTarget) * 100))}%` }}
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-xs font-bold text-emerald-900">
                    Target Harian Tercapai!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTargetModal(true)}
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center space-x-0.5 cursor-pointer"
                >
                  <span>Atur Target</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Pemberitahuan Murojaah */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <Bell className="w-4 h-4 text-emerald-700" />
                <span>Pemberitahuan Murojaah</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNotificationModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                <p className="font-bold text-emerald-900">Pengingat Waktu Sholat &amp; Murojaah</p>
                <p className="mt-0.5 text-emerald-800">
                  Waktu terbaik mengulang hafalan adalah setelah sholat fardhu. Sebentar lagi memasuki waktu {nextPrayer.name}.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-900">Jadwal Evaluasi AI</p>
                <p className="mt-0.5 text-slate-500">
                  2 surah di Juz 'Amma menunggu untuk dievaluasi hari ini agar kurva daya ingat Ebbinghaus tetap terjaga.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowNotificationModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Tutup Pemberitahuan
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Doa Sebelum & Sesudah Murojaah */}
      {showDzikirModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <HeartHandshake className="w-4 h-4 text-amber-600" />
                <span>Doa Menjaga Hafalan Al-Qur'an</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowDzikirModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              {doaList.length > 0 ? (
                doaList.map((d, dIdx) => (
                  <div
                    key={d.id || dIdx}
                    className={`p-4 rounded-2xl border space-y-2 ${
                      dIdx % 2 === 0
                        ? 'bg-amber-50/70 border-amber-200/70'
                        : 'bg-emerald-50/70 border-emerald-200/70'
                    }`}
                  >
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider block ${
                        dIdx % 2 === 0 ? 'text-amber-800' : 'text-emerald-800'
                      }`}
                    >
                      {d.title}
                    </span>
                    <p className="font-quran text-2xl text-right leading-loose text-slate-900" dir="rtl">
                      {d.arabic}
                    </p>
                    <p className="text-xs font-semibold text-slate-800">{d.latin}</p>
                    <p className="text-slate-600 italic">"{d.translation}"</p>
                    {d.fadhilah && (
                      <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                        {d.fadhilah}
                      </p>
                    )}


                  </div>
                ))
              ) : (
                <>
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 space-y-2">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                  Doa Menghafal &amp; Murojaah Al-Qur'an (Sunnah)
                </span>
                <p className="font-quran text-2xl text-right leading-loose text-slate-900">
                  اللَّهُمَّ ارْحَمْنِي بِتَرْكِ الْمَعَاصِي أَبَدًا مَا أَبْقَيْتَنِي
                </p>
                <p className="text-slate-600 italic">
                  "Ya Allah, rahmatilah aku untuk meninggalkan kemaksiatan selamanya selama Engkau masih menghidupkanku..."
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 space-y-2">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Doa Khatam &amp; Keberkahan Al-Qur'an
                </span>
                <p className="font-quran text-2xl text-right leading-loose text-slate-900">
                  اللَّهُمَّ اجْعَلْهُ لَنَا إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً
                </p>
                <p className="text-slate-600 italic">
                  "Ya Allah, jadikanlah Al-Qur'an bagi kami sebagai imam, cahaya, petunjuk, dan rahmat..."
                </p>
              </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowDzikirModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Selesai Membaca Doa
            </button>
          </div>
        </div>
      )}
      {/* SWEETALERT-STYLE TOAST BANNER */}
      {targetToastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white px-5 py-3 rounded-full shadow-2xl flex items-center space-x-2 border border-emerald-400 text-xs sm:text-sm font-semibold animate-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-200" />
          <span>{targetToastMessage}</span>
        </div>
      )}

      {/* SWEETALERT-STYLE ATUR TARGET MODAL */}
      {showTargetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowTargetModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-100">
              <Target className="w-7 h-7 text-emerald-700" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Atur Target Harian
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tentukan target hafalan dan tilawah harian Anda untuk menjaga konsistensi mutabaah.
              </p>
            </div>

            <form onSubmit={handleSaveTarget} className="space-y-4 text-xs">
              {/* Presets */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Preset Cepat (Ayat/Hari):</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[5, 10, 20, 30].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCustomAyahsTarget(preset)}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        customAyahsTarget === preset
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Ayat Input */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Target Hafalan / Murojaah (Ayat/Hari):</label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={customAyahsTarget}
                  onChange={(e) => setCustomAyahsTarget(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Custom Pages Input */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Target Tilawah Qur'an (Lembar/Hari):</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={customPagesTarget}
                  onChange={(e) => setCustomPagesTarget(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTargetModal(false)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer flex items-center justify-center space-x-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Simpan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
