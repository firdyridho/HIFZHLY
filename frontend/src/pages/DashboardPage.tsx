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
  Flame,
  Target,
  CheckCircle2,
  ArrowRight,
  Play,
  ChevronRight,
  X,
  Trophy,
  AlarmClock,
} from 'lucide-react';
import type { UserProfile, TajwidModule, SrsDueItem } from '../types';
import { getStoredMutabaahLogs, formatDateKey } from '../lib/mutabaahService';
import { getStoredTajwidModules, fetchSynchronizedTajwidModules } from '../lib/tajwidStore';
import {
  NotificationItem,
  getStoredNotifications,
  syncNotificationsWithContext,
} from '../lib/notificationService';
import { schedulePrayerNotifications } from '../lib/adzanNotificationService';

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
  const [showDzikirModal, setShowDzikirModal] = useState(false);
  const [srsItems, setSrsItems] = useState<SrsDueItem[]>([]);
  const [activeTajwidModule, setActiveTajwidModule] = useState<TajwidModule | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerSchedule[]>(DEFAULT_PRAYER_TIMES);
  const [cityName, setCityName] = useState('Serang, Banten');
  const [doaList, setDoaList] = useState<{ id: string; title: string; arabic: string; latin: string; translation: string; fadhilah?: string }[]>([]);
  const [todayReviewed, setTodayReviewed] = useState(10);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getStoredNotifications());
  const [lastRead] = useState<{ surahNumber: number; surahName: string; ayahNumber: number } | null>(() => {
    try {
      const raw = localStorage.getItem('hifzhly_last_read');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const loadNotifications = () => {
    const p = prayerTimes[0] || DEFAULT_PRAYER_TIMES[0];
    const synced = syncNotificationsWithContext({
      prayerName: p.name,
      prayerTime: p.time,
      currentAyahs: todayReviewed,
      targetAyahs: profile?.dailyTargetAyahs || 5,
      srsDueCount: srsItems.length,
      twoFactorEnabled: profile?.twoFactorEnabled,
    });
    setNotifications(synced);
  };

  // Jadwalkan notifikasi native Adzan di smartphone saat jadwal sholat dimuat
  useEffect(() => {
    if (prayerTimes && prayerTimes.length > 0) {
      schedulePrayerNotifications(
        prayerTimes.map((p) => ({
          name: p.name === 'Shubuh' ? 'Subuh' : p.name,
          time: p.time,
        }))
      ).catch(() => {});
    }
  }, [prayerTimes]);

  // Load Real Prayer Times (equran.id API v2 shalat with city preference) and Doa
  const loadPrayerSchedule = () => {
    const savedProv = localStorage.getItem('hifzhly_prayer_provinsi');
    const savedKab = localStorage.getItem('hifzhly_prayer_kabkota');

    if (savedProv && savedKab) {
      setCityName(`${savedKab}, ${savedProv}`);
      fetch('https://equran.id/api/v2/shalat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provinsi: savedProv, kabkota: savedKab }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.data) {
            const todayDay = new Date().getDate();
            const todayItem = Array.isArray(json.data) ? json.data[todayDay - 1] || json.data[0] : json.data;
            if (todayItem) {
              const parseH = (s: string) => parseInt(s.split(':')[0], 10) || 0;
              const parseM = (s: string) => parseInt(s.split(':')[1], 10) || 0;
              setPrayerTimes([
                { name: 'Shubuh', time: todayItem.subuh || '04:10', icon: Sunrise, hours: parseH(todayItem.subuh || '04:10'), minutes: parseM(todayItem.subuh || '04:10') },
                { name: 'Dzuhur', time: todayItem.dzuhur || '11:40', icon: Sun, hours: parseH(todayItem.dzuhur || '11:40'), minutes: parseM(todayItem.dzuhur || '11:40') },
                { name: 'Ashar', time: todayItem.ashar || '15:00', icon: CloudSun, hours: parseH(todayItem.ashar || '15:00'), minutes: parseM(todayItem.ashar || '15:00') },
                { name: 'Maghrib', time: todayItem.maghrib || '17:50', icon: Sunset, hours: parseH(todayItem.maghrib || '17:50'), minutes: parseM(todayItem.maghrib || '17:50') },
                { name: 'Isya', time: todayItem.isya || '19:05', icon: MoonStar, hours: parseH(todayItem.isya || '19:05'), minutes: parseM(todayItem.isya || '19:05') },
              ]);
              return;
            }
          }
          throw new Error('Fallback ke backend');
        })
        .catch(() => loadBackendPrayerTimes());
    } else {
      loadBackendPrayerTimes();
    }
  };

  const loadBackendPrayerTimes = () => {
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
  };

  useEffect(() => {
    loadPrayerSchedule();

    fetch('/api/v1/doa')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.doa && Array.isArray(data.doa)) {
          setDoaList(data.doa);
        }
      })
      .catch(() => {});

    window.addEventListener('hifzhly_location_updated', loadPrayerSchedule);
    window.addEventListener('hifzhly_notifications_updated', loadNotifications);

    return () => {
      window.removeEventListener('hifzhly_location_updated', loadPrayerSchedule);
      window.removeEventListener('hifzhly_notifications_updated', loadNotifications);
    };
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

    // 2. Fetch Real Tajwid Module from Store & Backend API
    const localTajwid = getStoredTajwidModules();
    if (localTajwid.length > 0) {
      setActiveTajwidModule(localTajwid[0]);
    }
    fetchSynchronizedTajwidModules().then((synced) => {
      if (synced && synced.length > 0) {
        setActiveTajwidModule(synced[0]);
      }
    }).catch((err) => console.warn('Failed to sync Tajwid modules:', err));
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
            <Link
              to="/app/alarm"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-xs cursor-pointer"
              title="Pengaturan Alarm Mandiri"
            >
              <AlarmClock className="w-4 h-4" />
            </Link>
            <Link
              to="/app/settings"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-xs cursor-pointer"
              title="Pengaturan Akun & Keamanan"
            >
              <Settings className="w-4 h-4" />
            </Link>
            <Link
              to="/app/notifications"
              className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-xs cursor-pointer"
              title="Pemberitahuan & Pengingat"
            >
              <Bell className="w-4 h-4" />
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold ring-2 ring-emerald-800 animate-in zoom-in">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </Link>
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

      {/* 2. SECTION MENU UTAMA (Editorial Feature Hub — Anti AI-Slop) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Pilar Layanan &amp; Menu Utama
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              Ekosistem talaqqi, asistensi tilawah, dan penjaga kemutqinan Al-Qur'an
            </p>
          </div>
          <span className="hidden sm:inline-block text-[11px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
            Standar Kemenag RI
          </span>
        </div>

        {/* ── Tier 1: Two Prominent Hero Pillars (Mushaf Madinah & Murojaah AI) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hero Pillar 1: Mushaf Madinah 15 Baris */}
          <Link
            to="/app/mushaf"
            className="group relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Subtle Calligraphic Watermark */}
            <div
              aria-hidden="true"
              className="absolute -right-4 -bottom-4 font-quran text-7xl sm:text-8xl text-emerald-950/[0.03] select-none pointer-events-none group-hover:scale-105 transition-transform duration-500"
            >
              اقْرَأْ
            </div>

            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 group-hover:scale-105 transition-transform shadow-2xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50/90 px-2 py-0.5 rounded-lg border border-emerald-200/60">
                  Rasm Utsmani
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight group-hover:text-emerald-800 transition-colors">
                  Mushaf Madinah 15 Baris
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Membaca mushaf standar cetakan Madinah &amp; Kemenag RI, dilengkapi tajwid warna interaktif dan tafsir tahlili.
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              {lastRead ? (
                <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  Lanjut: <strong className="text-slate-800 font-semibold">QS. {lastRead.surahName} [{lastRead.ayahNumber}]</strong>
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">
                  Mulai dari Surah Al-Fatihah
                </span>
              )}
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform text-[11px]">
                <span>Buka Mushaf</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>

          {/* Hero Pillar 2: Murojaah Mandiri Suara Real-time AI */}
          <Link
            to="/app/murojaah"
            className="group relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Subtle Calligraphic Watermark */}
            <div
              aria-hidden="true"
              className="absolute -right-4 -bottom-4 font-quran text-7xl sm:text-8xl text-emerald-950/[0.03] select-none pointer-events-none group-hover:scale-105 transition-transform duration-500"
            >
              وَرَتِّلْ
            </div>

            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800 group-hover:scale-105 transition-transform shadow-2xs">
                  <Mic className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-800 bg-teal-50/90 px-2 py-0.5 rounded-lg border border-teal-200/60">
                  Memory-Only DSP
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight group-hover:text-teal-800 transition-colors">
                  Murojaah Mandiri Suara
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Penyimak lisan cerdas dengan penyejajaran Levenshtein kata-demi-kata. Deteksi keliru harakat instan tanpa kirim audio ke server.
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">
                Latensi Evaluasi &lt; 3 Detik
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-teal-700 group-hover:translate-x-0.5 transition-transform text-[11px]">
                <span>Mulai Murojaah</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        </div>

        {/* ── Tier 2: Two Methodology Pillars (Hafalan FSRS & Mutabaah Heatmap) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pillar 3: Hafalan & Kurva Lupa FSRS */}
          <Link
            to="/app/hafalan"
            className="group p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all flex items-center justify-between gap-3"
          >
            <div className="flex items-center space-x-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-800 transition-colors shrink-0">
                <Brain className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors truncate">
                    Hafalan Mandiri (SRS)
                  </h4>
                  {srsItems.length > 0 && (
                    <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 shrink-0">
                      {srsItems.length} Jatuh Tempo
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  Algoritma repetisi berjarak melawan kurva kelupaan
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>

          {/* Pillar 4: Mutabaah & Heatmap Retensi */}
          <Link
            to="/app/mutabaah"
            className="group p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all flex items-center justify-between gap-3"
          >
            <div className="flex items-center space-x-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:bg-sky-50 group-hover:text-sky-800 transition-colors shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-800 transition-colors truncate">
                    Mutabaah &amp; Heatmap
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
                    {streak} Hari Streak
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  Peta retensi surah dan pencatatan dawam harian
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        </div>

        {/* ── Tier 3: 4 Specialized Disciplines (Compact 4-column cards) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Item 1: Tajwid Academy */}
          <Link
            to="/app/tajwid"
            className="group p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">Modul</span>
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                Tajwid Academy
              </h5>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                Kaidah makhraj &amp; shifat
              </p>
            </div>
          </Link>

          {/* Item 2: Doa & Dzikir */}
          <Link
            to="/app/doa"
            className="group p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-800 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">Sunnah</span>
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                Doa &amp; Adab Penghafal
              </h5>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                Doa khatam &amp; keteguhan
              </p>
            </div>
          </Link>

          {/* Item 3: Kuis Qur'an */}
          <Link
            to="/app/quiz"
            className="group p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 group-hover:scale-105 transition-transform">
                <Trophy className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">Uji Cepat</span>
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-800 transition-colors">
                Kuis &amp; Retensi
              </h5>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                Sambung ayat &amp; mutasyabihat
              </p>
            </div>
          </Link>

          {/* Item 4: Target & Ritme */}
          <Link
            to="/app/target"
            className="group p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:scale-105 transition-transform">
                <Target className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">Ritme</span>
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                Target Khatam
              </h5>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                Jadwal harian {dailyTarget} ayat
              </p>
            </div>
          </Link>
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
                <Link
                  to="/app/target"
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center space-x-0.5 cursor-pointer"
                >
                  <span>Atur Target</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Doa Sebelum & Sesudah Murojaah */}
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

            <div className="space-y-2 pt-2">
              <Link
                to="/app/doa"
                onClick={() => setShowDzikirModal(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs transition-colors cursor-pointer text-center block"
              >
                Buka Seluruh Koleksi Doa &amp; Dzikir Lengkap &rarr;
              </Link>
              <button
                type="button"
                onClick={() => setShowDzikirModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
