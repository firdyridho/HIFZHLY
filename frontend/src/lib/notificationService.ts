export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'prayer' | 'target' | 'srs' | 'security' | 'system';
  timestamp: number;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

const STORAGE_KEY = 'hifzhly_notifications_v1';

export function getStoredNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveNotifications(items: NotificationItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('hifzhly_notifications_updated'));
  } catch (err) {
    console.warn('Gagal menyimpan notifikasi:', err);
  }
}

export function markNotificationAsRead(id: string): void {
  const current = getStoredNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated);
}

export function markAllNotificationsAsRead(): void {
  const current = getStoredNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  saveNotifications(updated);
}

export function deleteNotificationItem(id: string): void {
  const current = getStoredNotifications();
  const updated = current.filter((n) => n.id !== id);
  saveNotifications(updated);
}

export function syncNotificationsWithContext(params: {
  prayerName?: string;
  prayerTime?: string;
  currentAyahs?: number;
  targetAyahs?: number;
  srsDueCount?: number;
  twoFactorEnabled?: boolean;
}): NotificationItem[] {
  const existing = getStoredNotifications();
  const existingIds = new Set(existing.map((n) => n.id));
  const newItems: NotificationItem[] = [];

  const todayKey = new Date().toISOString().slice(0, 10);

  // 1. Pengingat Sholat & Tilawah
  if (params.prayerName && params.prayerTime) {
    const prayerId = `prayer-${params.prayerName}-${todayKey}`;
    if (!existingIds.has(prayerId)) {
      newItems.push({
        id: prayerId,
        title: `Waktu Sholat ${params.prayerName} (${params.prayerTime})`,
        message: `Waktu ${params.prayerName} adalah saat terbaik untuk menenangkan hati dengan tilawah dan dzikir sesudah fardhu.`,
        type: 'prayer',
        timestamp: Date.now(),
        read: false,
        actionUrl: '/app/mushaf',
        actionLabel: 'Buka Mushaf',
      });
    }
  }

  // 2. Evaluasi Target Harian Santri
  if (params.targetAyahs && params.targetAyahs > 0) {
    const current = params.currentAyahs || 0;
    const targetId = `target-${todayKey}`;
    if (!existingIds.has(targetId)) {
      const remaining = Math.max(0, params.targetAyahs - current);
      if (remaining > 0) {
        newItems.push({
          id: targetId,
          title: 'Target Hafalan Hari Ini',
          message: `Anda telah menyelesaikan ${current} dari ${params.targetAyahs} ayat target hari ini. Tinggal ${remaining} ayat lagi untuk menjaga komitmen istiqomah!`,
          type: 'target',
          timestamp: Date.now() - 3600000,
          read: false,
          actionUrl: '/app/hafalan',
          actionLabel: 'Lanjutkan Hafalan',
        });
      }
    }
  }

  // 3. Pengingat SRS Murojaah Harian
  if (params.srsDueCount && params.srsDueCount > 0) {
    const srsId = `srs-${todayKey}`;
    if (!existingIds.has(srsId)) {
      newItems.push({
        id: srsId,
        title: 'Jadwal Murojaah Adaptif',
        message: `Ada ${params.srsDueCount} item hafalan yang jatuh tempo pengulangan hari ini sesuai kurva retensi daya ingat Anda.`,
        type: 'srs',
        timestamp: Date.now() - 7200000,
        read: false,
        actionUrl: '/app/murojaah',
        actionLabel: 'Mulai Murojaah',
      });
    }
  }

  // 4. Anjuran Proteksi Keamanan 2FA
  if (params.twoFactorEnabled === false) {
    const secId = 'security-2fa-recommendation';
    if (!existingIds.has(secId)) {
      newItems.push({
        id: secId,
        title: 'Tingkatkan Keamanan Akun Santri',
        message: 'Aktifkan Autentikasi Dua Faktor (2FA) di menu Pengaturan agar akun dan riwayat mutabaah Anda terlindungi ganda.',
        type: 'security',
        timestamp: Date.now() - 86400000,
        read: false,
        actionUrl: '/app/settings',
        actionLabel: 'Buka Pengaturan',
      });
    }
  }

  if (newItems.length > 0) {
    const merged = [...newItems, ...existing].slice(0, 30);
    saveNotifications(merged);
    return merged;
  }

  return existing;
}

