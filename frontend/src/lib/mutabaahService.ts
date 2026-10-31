// Service Mutabaah Yaumi & Unified Mutabaah Integration System
// Mengelola data riil aktivitas santri (Tilawah, Murojaah, Hafalan Baru), komitmen target, serta evaluasi ustadz

export interface MutabaahReportItem {
  id: string;
  time: string; // e.g. "05:30 WIB"
  surahNumber: number;
  surahName: string;
  ayahStart: number;
  ayahEnd: number;
  totalAyahs: number;
  score: number;
  type: 'murojaah_ai' | 'murojaah' | 'setoran_mandiri' | 'tilawah' | 'tajwid' | 'hafalan_baru';
  notes?: string;
  verifier?: string; // Ustadz Pembimbing / Mandiri
  pagesCount?: number;
  durationSeconds?: number;
  santriNotes?: string;
  ustadzNotes?: string;
  ustadzStatus?: 'completed' | 'verified' | 'needs_improvement';
  ustadzName?: string;
  userId?: string;
  userName?: string;
}

export interface DayMutabaahData {
  date: string; // "YYYY-MM-DD"
  ayahsReviewed: number;
  targetAchieved: boolean;
  averageScore: number;
  durationMinutes: number;
  reports: MutabaahReportItem[];
}

export interface MonthCalendarData {
  year: number;
  month: number; // 1-12
  monthName: string;
  totalAyahsMonth: number;
  activeDaysCount: number;
  averageScoreMonth: number;
  targetMetDaysCount: number;
  days: Record<string, DayMutabaahData>; // key: "YYYY-MM-DD"
}

export interface UserCommitment {
  dailyTargetAyahsTilawah: number;
  dailyTargetPagesTilawah: number;
  dailyTargetAyahsHafalan: number;
  targetSurahNumber: number;
  targetSurahName: string;
  targetStartAyah: number;
  targetEndAyah: number;
  targetDeadline: string;
  currentStreak: number;
  maxStreak: number;
}

export interface AdminSantriMonitoringItem {
  id: string;
  fullName: string;
  username: string;
  currentStreak: number;
  todayTilawah?: {
    surahName: string;
    startAyah: number;
    endAyah: number;
    pages: number;
  };
  todaySetoran?: {
    surahName: string;
    startAyah: number;
    endAyah: number;
    score: number;
  };
  targetMetToday: boolean;
  santriNotes?: string;
  evaluationStatus: 'completed' | 'verified' | 'needs_improvement' | 'pending';
  ustadzNotes?: string;
  lastLogId?: string;
}

const STORAGE_KEY = 'hifzhly_mutabaah_logs';
const COMMITMENT_STORAGE_KEY = 'hifzhly_user_commitments';

export const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const INDONESIAN_DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
export const INDONESIAN_DAYS_FULL = [
  'Ahad',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

/**
 * Format Date to YYYY-MM-DD
 */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Inisialisasi data riil seed bila pengguna baru pertama kali membuka
 */
function getInitialSeedLogs(): Record<string, DayMutabaahData> {
  const logs: Record<string, DayMutabaahData> = {};
  const today = new Date();

  const streakSeeds = [
    {
      daysAgo: 4,
      surahName: "An-Naba'",
      surahNumber: 78,
      ayahStart: 1,
      ayahEnd: 10,
      totalAyahs: 10,
      score: 95.0,
      duration: 15,
      time: '05:30 WIB',
      santriNotes: "Lancar, mad thabi'i konsisten.",
      ustadzNotes: "Mumtaz! Pertahankan makhraj 'ain di ayat 5.",
      ustadzStatus: 'verified' as const,
      ustadzName: 'Ustadz Ahmad, Lc.',
    },
    {
      daysAgo: 3,
      surahName: "An-Naba'",
      surahNumber: 78,
      ayahStart: 11,
      ayahEnd: 25,
      totalAyahs: 15,
      score: 92.5,
      duration: 20,
      time: '16:15 WIB',
      santriNotes: 'Ayat 20 wa futihatis-samaa-u tajwid mad wajib muttashil.',
      ustadzNotes: 'Sudah baik, lanjutkan repetisi.',
      ustadzStatus: 'verified' as const,
      ustadzName: 'Ustadz Ahmad, Lc.',
    },
    {
      daysAgo: 2,
      surahName: "An-Nazi'at",
      surahNumber: 79,
      ayahStart: 1,
      ayahEnd: 15,
      totalAyahs: 15,
      score: 96.0,
      duration: 18,
      time: '05:45 WIB',
      santriNotes: 'Hafalan subuh berjalan lancar.',
      ustadzNotes: 'Bagus sekali tajwid ikhfa-nya.',
      ustadzStatus: 'verified' as const,
      ustadzName: 'Ustadz Ahmad, Lc.',
    },
    {
      daysAgo: 1,
      surahName: "An-Nazi'at",
      surahNumber: 79,
      ayahStart: 16,
      ayahEnd: 30,
      totalAyahs: 15,
      score: 94.0,
      duration: 20,
      time: '19:40 WIB',
      santriNotes: "Kisah Nabi Musa di Lembah Thuwa.",
      ustadzNotes: "Maa syaa Allah, mutqin.",
      ustadzStatus: 'verified' as const,
      ustadzName: 'Ustadz Ahmad, Lc.',
    },
    {
      daysAgo: 0,
      surahName: "'Abasa",
      surahNumber: 80,
      ayahStart: 1,
      ayahEnd: 10,
      totalAyahs: 10,
      score: 98.0,
      duration: 15,
      time: '06:00 WIB',
      santriNotes: 'Lafal jelas dan lancar.',
      ustadzNotes: 'Menunggu verifikasi ustadz',
      ustadzStatus: 'completed' as const,
      ustadzName: 'Ustadz Ahmad, Lc.',
    },
  ];

  streakSeeds.forEach((s) => {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - s.daysAgo);
    const key = formatDateKey(targetDate);

    logs[key] = {
      date: key,
      ayahsReviewed: s.totalAyahs,
      targetAchieved: s.totalAyahs >= 10,
      averageScore: s.score,
      durationMinutes: s.duration,
      reports: [
        {
          id: `seed-${key}-1`,
          time: s.time,
          surahNumber: s.surahNumber,
          surahName: s.surahName,
          ayahStart: s.ayahStart,
          ayahEnd: s.ayahEnd,
          totalAyahs: s.totalAyahs,
          score: s.score,
          type: 'murojaah_ai',
          notes: 'Kelancaran makhraj dan harakat tervalidasi AI Levenshtein.',
          verifier: s.ustadzName,
          santriNotes: s.santriNotes,
          ustadzNotes: s.ustadzNotes,
          ustadzStatus: s.ustadzStatus,
          ustadzName: s.ustadzName,
          pagesCount: 1,
          durationSeconds: s.duration * 60,
        },
      ],
    };
  });

  return logs;
}

/**
 * Mengambil seluruh catatan mutabaah dari storage
 */
export function getStoredMutabaahLogs(): Record<string, DayMutabaahData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSeedLogs();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read mutabaah logs from storage:', err);
    return getInitialSeedLogs();
  }
}

/**
 * Mendapatkan seluruh riwayat entri log mutabaah secara kronologis (terbaru di atas)
 */
export function getMutabaahHistory(): MutabaahReportItem[] {
  const allLogs = getStoredMutabaahLogs();
  const list: MutabaahReportItem[] = [];

  Object.entries(allLogs).forEach(([dateStr, dayData]) => {
    if (dayData.reports && Array.isArray(dayData.reports)) {
      dayData.reports.forEach((rep) => {
        list.push({
          ...rep,
          time: rep.time.includes(dateStr) ? rep.time : `${dateStr} • ${rep.time}`,
        });
      });
    }
  });

  // Urutkan berdasarkan ID / timestamp (terbaru terlebih dahulu)
  list.sort((a, b) => b.id.localeCompare(a.id));
  return list;
}

/**
 * Mendapatkan data mutabaah untuk bulan tertentu
 */
export async function getMonthMutabaahData(
  year: number,
  month: number // 1-12
): Promise<MonthCalendarData> {
  const token = localStorage.getItem('hifzhly_auth_token');

  try {
    const res = await fetch(`/api/v1/mutabaah/calendar?year=${year}&month=${month}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.days) {
        return data;
      }
    }
  } catch {
    // Fallback to local storage
  }

  const allLogs = getStoredMutabaahLogs();
  const monthKeyPrefix = `${year}-${String(month).padStart(2, '0')}`;

  const monthDays: Record<string, DayMutabaahData> = {};
  let totalAyahs = 0;
  let activeDays = 0;
  let scoreSum = 0;
  let targetMetDays = 0;

  Object.entries(allLogs).forEach(([dateStr, dayData]) => {
    if (dateStr.startsWith(monthKeyPrefix)) {
      monthDays[dateStr] = dayData;
      if (dayData.ayahsReviewed > 0) {
        totalAyahs += dayData.ayahsReviewed;
        activeDays += 1;
        scoreSum += dayData.averageScore;
        if (dayData.targetAchieved) targetMetDays += 1;
      }
    }
  });

  const avgScore = activeDays > 0 ? Math.round((scoreSum / activeDays) * 10) / 10 : 0;

  return {
    year,
    month,
    monthName: INDONESIAN_MONTHS[month - 1] || '',
    totalAyahsMonth: totalAyahs,
    activeDaysCount: activeDays,
    averageScoreMonth: avgScore,
    targetMetDaysCount: targetMetDays,
    days: monthDays,
  };
}

/**
 * Simpan laporan mutabaah baru (Unified Logging)
 */
export async function recordMutabaahReport(params: {
  date?: string; // default today YYYY-MM-DD
  time?: string;
  activityType?: 'tilawah' | 'murojaah' | 'hafalan_baru' | 'tajwid' | 'murojaah_ai' | 'setoran_mandiri';
  surahNumber: number;
  surahName: string;
  ayahStart: number;
  ayahEnd: number;
  score?: number;
  type?: 'murojaah_ai' | 'setoran_mandiri' | 'tilawah' | 'tajwid' | 'hafalan_baru';
  notes?: string;
  santriNotes?: string;
  verifier?: string;
  durationMinutes?: number;
  durationSeconds?: number;
  pagesCount?: number;
}): Promise<DayMutabaahData> {
  const dateStr = params.date || formatDateKey(new Date());
  const now = new Date();
  const timeStr =
    params.time ||
    `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

  const totalAyahs = Math.max(1, Math.abs(params.ayahEnd - params.ayahStart) + 1);
  const score = params.score ?? 100;
  const durationSec =
    params.durationSeconds ??
    (params.durationMinutes ? params.durationMinutes * 60 : Math.ceil(totalAyahs * 90));
  const durationMin = Math.max(1, Math.ceil(durationSec / 60));
  const pages = params.pagesCount ?? Math.max(1, Math.ceil(totalAyahs / 15));

  const finalType = (params.activityType || params.type || 'tilawah') as MutabaahReportItem['type'];

  const reportItem: MutabaahReportItem = {
    id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    time: timeStr,
    surahNumber: params.surahNumber,
    surahName: params.surahName,
    ayahStart: params.ayahStart,
    ayahEnd: params.ayahEnd,
    totalAyahs,
    score,
    type: finalType,
    notes: params.notes || params.santriNotes,
    santriNotes: params.santriNotes || params.notes,
    verifier: params.verifier || 'Ustadz Pembimbing',
    pagesCount: pages,
    durationSeconds: durationSec,
    ustadzStatus: 'completed',
    ustadzNotes: 'Menunggu evaluasi ustadz pembimbing.',
    ustadzName: params.verifier || 'Ustadz Pembimbing',
  };

  const logs = getStoredMutabaahLogs();
  const existingDay = logs[dateStr] || {
    date: dateStr,
    ayahsReviewed: 0,
    targetAchieved: false,
    averageScore: 0,
    durationMinutes: 0,
    reports: [],
  };

  // Cek target harian user
  let dailyTarget = 10;
  const cachedProfile = localStorage.getItem('hifzhly_user_profile');
  if (cachedProfile) {
    try {
      const p = JSON.parse(cachedProfile);
      if (p.dailyTargetAyahs) dailyTarget = p.dailyTargetAyahs;
    } catch {}
  }

  const updatedReports = [reportItem, ...existingDay.reports];
  const newAyahsCount = existingDay.ayahsReviewed + totalAyahs;
  const newDuration = existingDay.durationMinutes + durationMin;

  const totalScorePoints = updatedReports.reduce((acc, r) => acc + r.score * r.totalAyahs, 0);
  const totalReportedAyahs = updatedReports.reduce((acc, r) => acc + r.totalAyahs, 0);
  const newAvgScore =
    totalReportedAyahs > 0 ? Math.round((totalScorePoints / totalReportedAyahs) * 10) / 10 : 100;

  const updatedDay: DayMutabaahData = {
    date: dateStr,
    ayahsReviewed: newAyahsCount,
    targetAchieved: newAyahsCount >= dailyTarget,
    averageScore: newAvgScore,
    durationMinutes: newDuration,
    reports: updatedReports,
  };

  logs[dateStr] = updatedDay;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));

  // Trigger real-time event
  window.dispatchEvent(new Event('hifzhly_mutabaah_updated'));
  window.dispatchEvent(new Event('storage'));

  // Sync ke backend REST API POST /api/v1/mutabaah/log
  try {
    const token = localStorage.getItem('hifzhly_auth_token');
    fetch('/api/v1/mutabaah/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        activityType: finalType,
        surahNumber: params.surahNumber,
        surahName: params.surahName,
        startAyah: params.ayahStart,
        endAyah: params.ayahEnd,
        totalAyahs,
        pagesCount: pages,
        durationSeconds: durationSec,
        score,
        santriNotes: params.santriNotes || params.notes,
      }),
    }).catch(() => {});
  } catch {}

  return updatedDay;
}

/**
 * Hook khusus saat ayat murojaah selesai dilafalkan di MurojaahPage
 */
export function recordMurojaahSingleAyah(
  surahNumber: number,
  surahName: string,
  ayahNumber: number,
  score: number = 100
) {
  return recordMutabaahReport({
    surahNumber,
    surahName,
    ayahStart: ayahNumber,
    ayahEnd: ayahNumber,
    score,
    type: 'murojaah_ai',
    notes: 'Penyelesaian ayat via Murojaah Suara Real-time AI Levenshtein.',
    verifier: 'Hifzhly AI Voice Evaluator',
    durationMinutes: 1,
    durationSeconds: 60,
  });
}

/**
 * Mengambil komitmen target mandiri santri
 */
export function getUserCommitments(): UserCommitment {
  const defaultCommitment: UserCommitment = {
    dailyTargetAyahsTilawah: 20,
    dailyTargetPagesTilawah: 2,
    dailyTargetAyahsHafalan: 10,
    targetSurahNumber: 67,
    targetSurahName: 'Al-Mulk',
    targetStartAyah: 1,
    targetEndAyah: 30,
    targetDeadline: '2026-11-30',
    currentStreak: 5,
    maxStreak: 14,
  };

  try {
    const raw = localStorage.getItem(COMMITMENT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(COMMITMENT_STORAGE_KEY, JSON.stringify(defaultCommitment));
      return defaultCommitment;
    }
    return JSON.parse(raw);
  } catch {
    return defaultCommitment;
  }
}

/**
 * Menyimpan pembaruan komitmen target mandiri santri
 */
export async function saveUserCommitments(
  update: Partial<UserCommitment>
): Promise<UserCommitment> {
  const current = getUserCommitments();
  const updated: UserCommitment = { ...current, ...update };
  localStorage.setItem(COMMITMENT_STORAGE_KEY, JSON.stringify(updated));

  // Sync juga target ayat ke profil pengguna
  if (update.dailyTargetAyahsHafalan) {
    const cachedProfile = localStorage.getItem('hifzhly_user_profile');
    const profile = cachedProfile ? JSON.parse(cachedProfile) : {};
    profile.dailyTargetAyahs = update.dailyTargetAyahsHafalan;
    localStorage.setItem('hifzhly_user_profile', JSON.stringify(profile));
  }

  window.dispatchEvent(new Event('hifzhly_profile_updated'));
  window.dispatchEvent(new Event('hifzhly_mutabaah_updated'));
  window.dispatchEvent(new Event('storage'));

  // Sync ke backend PUT /api/v1/mutabaah/targets
  try {
    const token = localStorage.getItem('hifzhly_auth_token');
    fetch('/api/v1/mutabaah/targets', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(updated),
    }).catch(() => {});
  } catch {}

  return updated;
}

/**
 * Ustadz memberikan catatan evaluasi dan penilaian pada mutabaah santri
 */
export async function submitUstadzEvaluation(
  logId: string,
  status: 'verified' | 'needs_improvement',
  ustadzNotes: string,
  ustadzName: string = 'Ustadz Ahmad, Lc.'
): Promise<boolean> {
  const logs = getStoredMutabaahLogs();
  let found = false;

  Object.keys(logs).forEach((dateKey) => {
    const day = logs[dateKey];
    if (day.reports) {
      day.reports = day.reports.map((rep) => {
        if (rep.id === logId) {
          found = true;
          return {
            ...rep,
            ustadzStatus: status,
            ustadzNotes,
            ustadzName,
            verifier: ustadzName,
          };
        }
        return rep;
      });
    }
  });

  if (found) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    window.dispatchEvent(new Event('hifzhly_mutabaah_updated'));
    window.dispatchEvent(new Event('storage'));
  }

  // Sync ke backend POST /api/v1/admin/mutabaah/:id/evaluation
  try {
    const token = localStorage.getItem('hifzhly_auth_token');
    fetch(`/api/v1/admin/mutabaah/${logId}/evaluation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        status,
        ustadzNotes,
        ustadzName,
      }),
    }).catch(() => {});
  } catch {}

  return found;
}

/**
 * Live Monitoring Data Seluruh Santri untuk Ustadz / Musyrif
 */
export async function getAdminSantriMonitoring(): Promise<AdminSantriMonitoringItem[]> {
  const token = localStorage.getItem('hifzhly_auth_token');

  try {
    const res = await fetch('/api/v1/admin/mutabaah/monitoring', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}

  // Fallback realistic monitoring list connected to real mutabaah logs
  const history = getMutabaahHistory();
  const latestLog = history[0];

  const defaultList: AdminSantriMonitoringItem[] = [
    {
      id: 'santri-01',
      fullName: 'Faeyza Ardellein (Pijaa)',
      username: 'pijaa',
      currentStreak: 5,
      todayTilawah: {
        surahName: latestLog ? latestLog.surahName : 'Al-Baqarah',
        startAyah: latestLog ? latestLog.ayahStart : 142,
        endAyah: latestLog ? latestLog.ayahEnd : 160,
        pages: latestLog?.pagesCount || 2,
      },
      todaySetoran: {
        surahName: "An-Naba'",
        startAyah: 1,
        endAyah: 15,
        score: latestLog?.score || 96.0,
      },
      targetMetToday: true,
      santriNotes: latestLog?.santriNotes || "Makhraj 'ain dan ghunnah sudah lancar, siap lanjut ayat 16.",
      evaluationStatus: latestLog?.ustadzStatus || 'verified',
      ustadzNotes: latestLog?.ustadzNotes || 'Maa syaa Allah, bacaan sangat fasih dan mutqin.',
      lastLogId: latestLog?.id || 'seed-rep-1',
    },
    {
      id: 'santri-02',
      fullName: 'Muhammad Bilal',
      username: 'mbilal_santri',
      currentStreak: 3,
      todayTilawah: {
        surahName: 'Ali Imran',
        startAyah: 1,
        endAyah: 20,
        pages: 2,
      },
      todaySetoran: {
        surahName: "An-Nazi'at",
        startAyah: 1,
        endAyah: 10,
        score: 72.0,
      },
      targetMetToday: false,
      santriNotes: "Ayat 8 masih sering tertukar dengan surah 'Abasa.",
      evaluationStatus: 'needs_improvement',
      ustadzNotes: 'Perlu bimbingan khusus pada waqaf dan ibtida di ayat 8-10.',
      lastLogId: 'seed-rep-2',
    },
    {
      id: 'santri-03',
      fullName: 'Fatimah Az-Zahra',
      username: 'fatimah_z',
      currentStreak: 12,
      todayTilawah: {
        surahName: 'An-Nisa',
        startAyah: 50,
        endAyah: 75,
        pages: 3,
      },
      todaySetoran: {
        surahName: "'Abasa",
        startAyah: 1,
        endAyah: 20,
        score: 98.0,
      },
      targetMetToday: true,
      santriNotes: 'Alhamdulillah sudah setoran tuntas sebelum maghrib.',
      evaluationStatus: 'verified',
      ustadzNotes: 'Mumtaz! Tajwid dan tartil sangat terjaga.',
      lastLogId: 'seed-rep-3',
    },
    {
      id: 'santri-04',
      fullName: 'Zaid bin Tsabit',
      username: 'zaid_t',
      currentStreak: 1,
      todayTilawah: undefined,
      todaySetoran: {
        surahName: 'At-Takwir',
        startAyah: 1,
        endAyah: 14,
        score: 58.0,
      },
      targetMetToday: false,
      santriNotes: 'Belum sempat tilawah lembar hari ini karena persiapan ujian.',
      evaluationStatus: 'pending',
      ustadzNotes: undefined,
      lastLogId: 'seed-rep-4',
    },
  ];

  return defaultList;
}

/**
 * Level intensitas GitHub (0 - 4)
 */
export function getGithubIntensityLevel(ayahs: number): 0 | 1 | 2 | 3 | 4 {
  if (ayahs <= 0) return 0;
  if (ayahs < 5) return 1;
  if (ayahs < 10) return 2;
  if (ayahs < 20) return 3;
  return 4;
}

/**
 * Kelas CSS Tailwind untuk level intensitas GitHub
 */
export function getGithubTileClasses(level: 0 | 1 | 2 | 3 | 4, isToday: boolean = false): string {
  let baseColor = '';
  switch (level) {
    case 0:
      baseColor = 'bg-slate-100/80 border-slate-200/60 text-slate-500 hover:bg-slate-200/80 hover:border-slate-300';
      break;
    case 1:
      baseColor = 'bg-emerald-100 border-emerald-200 text-emerald-800 hover:bg-emerald-200 hover:border-emerald-300';
      break;
    case 2:
      baseColor = 'bg-emerald-300 border-emerald-400 text-emerald-950 font-semibold hover:bg-emerald-400 hover:border-emerald-500';
      break;
    case 3:
      baseColor = 'bg-emerald-500 border-emerald-600 text-white font-bold hover:bg-emerald-600 hover:border-emerald-700 shadow-xs';
      break;
    case 4:
      baseColor = 'bg-emerald-700 border-emerald-800 text-white font-black hover:bg-emerald-800 hover:border-emerald-900 shadow-sm';
      break;
  }

  const todayRing = isToday ? 'ring-2 ring-emerald-600 ring-offset-2' : '';
  return `${baseColor} ${todayRing}`;
}
