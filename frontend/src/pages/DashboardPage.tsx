import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Settings,
  Bell,
  CloudMoon,
  Sun,
  CloudSun,
  Moon,
  Sparkles,
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
import type { UserProfile } from '../types';

interface PrayerSchedule {
  name: string;
  time: string;
  icon: typeof Sun;
  hours: number;
  minutes: number;
}

const PRAYER_TIMES: PrayerSchedule[] = [
  { name: 'Shubuh', time: '04:10', icon: CloudMoon, hours: 4, minutes: 10 },
  { name: 'Dzuhur', time: '11:39', icon: Sun, hours: 11, minutes: 39 },
  { name: 'Ashar', time: '14:56', icon: CloudSun, hours: 14, minutes: 56 },
  { name: 'Maghrib', time: '17:49', icon: Moon, hours: 17, minutes: 49 },
  { name: 'Isya', time: '19:00', icon: Sparkles, hours: 19, minutes: 0 },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showDzikirModal, setShowDzikirModal] = useState(false);

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

  let nextPrayer = PRAYER_TIMES[0];
  let diffMinutes = 0;

  for (let i = 0; i < PRAYER_TIMES.length; i++) {
    const pMinutes = PRAYER_TIMES[i].hours * 60 + PRAYER_TIMES[i].minutes;
    if (pMinutes > currentMinutesSinceMidnight) {
      nextPrayer = PRAYER_TIMES[i];
      diffMinutes = pMinutes - currentMinutesSinceMidnight;
      break;
    }
    if (i === PRAYER_TIMES.length - 1) {
      // Past Isya, next is Shubuh tomorrow
      nextPrayer = PRAYER_TIMES[0];
      diffMinutes = 24 * 60 - currentMinutesSinceMidnight + PRAYER_TIMES[0].hours * 60 + PRAYER_TIMES[0].minutes;
    }
  }

  const hoursLeft = Math.floor(diffMinutes / 60);
  const minsLeft = diffMinutes % 60;
  const countdownText =
    hoursLeft > 0
      ? `${nextPrayer.name} ${hoursLeft} jam ${minsLeft} mnt lagi`
      : `${nextPrayer.name} ${minsLeft} min left`;

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
              <span>Serang, Indonesia</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => navigate('/app/mutabaah')}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-xs cursor-pointer"
              title="Pengaturan Target & Profil"
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
          {PRAYER_TIMES.map((prayer) => {
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
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                      isNext
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-emerald-200'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
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
            <Link
              to="/app/mutabaah"
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:scale-105 group-hover:bg-slate-200/80 transition-all shadow-xs">
                <Target className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="mt-2 text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors text-center">
                Target
              </span>
            </Link>
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

        {/* Highlight Card: Belajar Tajwid Terjadwal */}
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
                Modul 1: Hukum Nun Sukun &amp; Tanwin
              </h3>
              <p className="text-xs text-teal-100/80 max-w-lg leading-relaxed">
                Pelajari kaidah Idzhar Halqi, Idgham Bighunnah, Iqlab, dan Ikhfa Haqiqi dilengkapi video penjelasan ustadz dan kuis pembahasan otomatis.
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
          {/* Card Aktivitas 1: Jadwal Murojaah Hari Ini (SRS Queue) */}
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
                2 Surah
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    QS. An-Naba' (Ayat 1-10)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Interval SRS: 3 Hari • Retensi 92%
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

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    QS. An-Nazi'at (Ayat 1-15)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Interval SRS: 1 Hari • Pengulangan Baru
                  </span>
                </div>
                <Link
                  to="/app/murojaah"
                  className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-emerald-600 hover:text-white text-slate-700 font-bold text-xs flex items-center space-x-1 transition-all"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Mulai</span>
                </Link>
              </div>
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
                    {dailyTarget} / {dailyTarget} Ayat
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: '100%' }}
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
                <Link
                  to="/app/mutabaah"
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center space-x-0.5"
                >
                  <span>Atur Target</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
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
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 space-y-2">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                  Doa Memohon Kemudahan Menghafal
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
    </div>
  );
}
