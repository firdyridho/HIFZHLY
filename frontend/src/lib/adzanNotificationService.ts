/**
 * adzanNotificationService.ts
 * Layanan Notifikasi Lokal Jadwal Sholat & Adzan di Smartphone Android / iOS (Capacitor)
 */

import { LocalNotifications } from '@capacitor/local-notifications';
import { isNativePlatform } from './capacitorBridge';

export interface PrayerTimeItem {
  name: string;
  time: string; // "04:15"
}

const STORAGE_KEY = 'hifzhly_adzan_notif_enabled';
const ADZAN_CHANNEL_ID = 'hifzhly-adzan-channel';

const PRAYER_IDS: Record<string, number> = {
  Subuh: 101,
  Dzuhur: 102,
  Ashar: 103,
  Maghrib: 104,
  Isya: 105,
};

/**
 * Inisialisasi Channel Notifikasi Android dengan prioritas tinggi
 */
export async function initAdzanNotificationChannel(): Promise<void> {
  if (!isNativePlatform()) return;

  try {
    await LocalNotifications.createChannel({
      id: ADZAN_CHANNEL_ID,
      name: 'Jadwal Sholat & Adzan',
      description: 'Pengingat otomatis saat masuk waktu sholat 5 waktu',
      importance: 5, // High
      visibility: 1, // Public on lockscreen
      sound: 'default',
      vibration: true,
      lights: true,
      lightColor: '#059669',
    });
  } catch (err) {
    console.warn('Gagal membuat notification channel:', err);
  }
}

/**
 * Periksa status izin notifikasi sistem
 */
export async function checkNotificationPermission(): Promise<boolean> {
  if (!isNativePlatform()) {
    if ('Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  }

  try {
    const status = await LocalNotifications.checkPermissions();
    return status.display === 'granted';
  } catch {
    return false;
  }
}

/**
 * Minta izin notifikasi ke sistem operasi (Android 13+ POST_NOTIFICATIONS)
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNativePlatform()) {
    if ('Notification' in window) {
      const res = await Notification.requestPermission();
      return res === 'granted';
    }
    return false;
  }

  try {
    await initAdzanNotificationChannel();
    const req = await LocalNotifications.requestPermissions();
    return req.display === 'granted';
  } catch (err) {
    console.warn('Gagal meminta izin notifikasi:', err);
    return false;
  }
}

/**
 * Periksa apakah santri mengaktifkan pengingat adzan di pengaturan
 */
export function isAdzanNotificationEnabled(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    // Default aktif jika belum pernah diatur
    return saved === null ? true : saved === 'true';
  } catch {
    return true;
  }
}

/**
 * Simpan preferensi notifikasi adzan
 */
export async function setAdzanNotificationEnabled(enabled: boolean): Promise<boolean> {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
    if (!enabled) {
      await cancelAllPrayerNotifications();
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Batalkan seluruh jadwal notifikasi sholat yang sedang mengantre
 */
export async function cancelAllPrayerNotifications(): Promise<void> {
  if (!isNativePlatform()) return;

  try {
    const ids = Object.values(PRAYER_IDS).map((id) => ({ id }));
    await LocalNotifications.cancel({ notifications: ids });
  } catch (err) {
    console.warn('Gagal membatalkan notifikasi sholat:', err);
  }
}

/**
 * Jadwalkan pengingat notifikasi 5 waktu sholat harian
 */
export async function schedulePrayerNotifications(prayers: PrayerTimeItem[]): Promise<boolean> {
  if (!isNativePlatform() || !isAdzanNotificationEnabled()) {
    return false;
  }

  try {
    const hasPerm = await checkNotificationPermission();
    if (!hasPerm) return false;

    await initAdzanNotificationChannel();
    await cancelAllPrayerNotifications();

    const now = new Date();
    const notificationsToSchedule: any[] = [];

    for (const prayer of prayers) {
      const id = PRAYER_IDS[prayer.name];
      if (!id) continue;

      const [hoursStr, minutesStr] = prayer.time.split(':');
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      if (isNaN(hours) || isNaN(minutes)) continue;

      const scheduleDate = new Date();
      scheduleDate.setHours(hours, minutes, 0, 0);

      // Jika waktu sholat hari ini sudah lewat, jadwalkan untuk besok di jam yang sama
      if (scheduleDate.getTime() <= now.getTime()) {
        scheduleDate.setDate(scheduleDate.getDate() + 1);
      }

      notificationsToSchedule.push({
        id,
        title: `Waktu Sholat ${prayer.name} (${prayer.time})`,
        body: `Hayya 'alash-Sholah. Waktu ${prayer.name} telah tiba. Mari sejenak tunaikan sholat dan lanjutkan hafalan Qur'an.`,
        channelId: ADZAN_CHANNEL_ID,
        schedule: {
          at: scheduleDate,
          allowWhileIdle: true,
        },
        sound: 'default',
        smallIcon: 'ic_launcher',
        actionTypeId: 'OPEN_PRAYER',
      });
    }

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({
        notifications: notificationsToSchedule,
      });
    }

    return true;
  } catch (err) {
    console.warn('Gagal menjadwalkan notifikasi sholat:', err);
    return false;
  }
}

/**
 * Uji notifikasi Adzan langsung ke status bar smartphone dalam 2 detik
 */
export async function triggerTestAdzanNotification(): Promise<boolean> {
  const hasPerm = await checkNotificationPermission();
  if (!hasPerm) {
    const granted = await requestNotificationPermission();
    if (!granted) return false;
  }

  if (isNativePlatform()) {
    try {
      await initAdzanNotificationChannel();
      const testDate = new Date(Date.now() + 2000);
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 999,
            title: 'Waktu Sholat Telah Tiba',
            body: 'Hayya \'alash-Sholah. Pengingat sholat dan tilawah Hifzhly berfungsi optimal di smartphone Anda.',
            channelId: ADZAN_CHANNEL_ID,
            schedule: {
              at: testDate,
              allowWhileIdle: true,
            },
            sound: 'default',
            smallIcon: 'ic_launcher',
          },
        ],
      });
      return true;
    } catch (err) {
      console.warn('Gagal memicu test notifikasi native:', err);
      return false;
    }
  } else {
    // Web Fallback Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Waktu Sholat Telah Tiba', {
        body: 'Hayya \'alash-Sholah. Pengingat sholat dan tilawah Hifzhly berfungsi optimal di smartphone Anda.',
        icon: '/logo saja.png',
      });
      return true;
    }
    return false;
  }
}

