/**
 * alarmService.ts
 * Layanan Multi-Alarm Mandiri Hifzhly:
 * - Pengingat fleksibel untuk Murojaah, Hafalan Baru, Sholat Tahajjud, Sahur, dll.
 * - Deskripsi kustom yang ditampilkan pada banner notifikasi smartphone
 * - Pilihan nada dering bawaan (Adzan Subuh, Adzan Makkah, Bel Santri)
 * - Dukungan upload audio kustom (MP3/WAV) yang disimpan secara aman di IndexedDB (bebas kuota 5MB)
 * - Resilien terhadap gangguan sistem: suara TIDAK akan berhenti saat menaikkan volume atau membuka bilah status bar
 * - Sinkronisasi jadwal ke Capacitor LocalNotifications (Android/iOS)
 */

import { LocalNotifications } from '@capacitor/local-notifications';
import { isNativePlatform } from './capacitorBridge';
import { ADZAN_ACTION_TYPE_ID } from './adzanNotificationService';

export interface AlarmItem {
  id: string; // e.g. "alarm-1700000000000"
  time: string; // "04:30" (24 jam)
  label: string; // e.g. "Murojaah Juz 30"
  description: string; // e.g. "Waktunya murojaah Surat An-Naba sebelum sholat Subuh"
  soundType: 'built-in' | 'custom';
  soundBuiltInId: 'adzan_subuh' | 'adzan' | 'bel_santri' | 'chime';
  soundCustomName?: string;
  repeatDays: number[]; // 0 = Ahad, 1 = Senin, ..., 6 = Sabtu. Kosong = Sekali saja
  enabled: boolean;
  createdAt: number;
}

const STORAGE_KEY = 'hifzhly_user_alarms_v1';
const DB_NAME = 'hifzhly_alarms_db';
const DB_VERSION = 1;
const STORE_NAME = 'custom_audio';

let activeRingingAudio: HTMLAudioElement | null = null;
let currentRingingAlarm: AlarmItem | null = null;
let isAlarmDismissed = true;

// =========================================================================
// 1. INDEXED DB HELPER FOR CUSTOM AUDIO (UNLIMITED QUOTA)
// =========================================================================

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB tidak didukung pada peramban ini'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveCustomAudio(id: string, name: string, dataUrl: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ id, name, dataUrl, createdAt: Date.now() });
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Gagal menyimpan audio kustom ke IndexedDB:', err);
  }
}

export async function getCustomAudio(id: string): Promise<{ id: string; name: string; dataUrl: string } | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function deleteCustomAudio(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
  } catch {}
}

// =========================================================================
// 2. ALARM CRUD MANAGEMENT (LOCALSTORAGE SANITIZED)
// =========================================================================

export function getAlarms(): AlarmItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      const defaultAlarms: AlarmItem[] = [
        {
          id: 'alarm-default-1',
          time: '04:00',
          label: 'Persiapan Subuh & Murojaah Pagi',
          description: 'Bangun lebih awal, dirikan qiyamullail, dan murojaah hafalan Juz 30.',
          soundType: 'built-in',
          soundBuiltInId: 'adzan_subuh',
          repeatDays: [0, 1, 2, 3, 4, 5, 6],
          enabled: true,
          createdAt: Date.now(),
        },
        {
          id: 'alarm-default-2',
          time: '20:00',
          label: 'Murojaah Malam Mandiri',
          description: 'Waktunya setoran hafalan baru atau pengulangan mandiri sebelum istirahat.',
          soundType: 'built-in',
          soundBuiltInId: 'adzan',
          repeatDays: [1, 2, 3, 4, 5],
          enabled: false,
          createdAt: Date.now(),
        },
      ];
      saveAlarms(defaultAlarms);
      return defaultAlarms;
    }
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveAlarms(alarms: AlarmItem[]): void {
  try {
    // Sanitasi: Pastikan tidak ada data URL raksasa yang masuk ke localStorage
    const sanitized = alarms.map((a: any) => {
      const { soundCustomDataUrl, ...clean } = a;
      return clean;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    syncNativeAlarms(sanitized).catch(() => {});
    window.dispatchEvent(new CustomEvent('hifzhly_alarms_updated', { detail: sanitized }));
  } catch (err) {
    console.warn('Gagal menyimpan alarm ke localStorage:', err);
  }
}

export function addAlarm(newAlarm: Omit<AlarmItem, 'id' | 'createdAt'>): AlarmItem {
  const alarms = getAlarms();
  const created: AlarmItem = {
    ...newAlarm,
    id: 'alarm-' + Date.now(),
    createdAt: Date.now(),
  };
  alarms.push(created);
  saveAlarms(alarms);
  return created;
}

export function updateAlarm(id: string, updates: Partial<AlarmItem>): AlarmItem[] {
  const alarms = getAlarms();
  const index = alarms.findIndex((a) => a.id === id);
  if (index !== -1) {
    alarms[index] = { ...alarms[index], ...updates };
    saveAlarms(alarms);
  }
  return alarms;
}

export function deleteAlarm(id: string): AlarmItem[] {
  const alarms = getAlarms().filter((a) => a.id !== id);
  saveAlarms(alarms);
  deleteCustomAudio(id).catch(() => {});
  return alarms;
}

export function toggleAlarm(id: string): AlarmItem[] {
  const alarms = getAlarms();
  const target = alarms.find((a) => a.id === id);
  if (target) {
    target.enabled = !target.enabled;
    saveAlarms(alarms);
  }
  return alarms;
}

// =========================================================================
// 3. NATIVE NOTIFICATION SYNC (CAPACITOR)
// =========================================================================

export async function syncNativeAlarms(alarmsList?: AlarmItem[]): Promise<void> {
  if (!isNativePlatform()) return;

  const alarms = alarmsList || getAlarms();

  try {
    // 1. Batalkan notifikasi alarm sebelumnya (ID range 50000 - 59999)
    const existing = await LocalNotifications.getPending();
    const alarmNotifIds = existing.notifications
      .filter((n) => n.id >= 50000 && n.id < 60000)
      .map((n) => ({ id: n.id }));

    if (alarmNotifIds.length > 0) {
      await LocalNotifications.cancel({ notifications: alarmNotifIds });
    }

    const notificationsToSchedule: any[] = [];
    const now = new Date();

    alarms.filter((a) => a.enabled).forEach((alarm, idx) => {
      const [hoursStr, minutesStr] = alarm.time.split(':');
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      if (isNaN(hours) || isNaN(minutes)) return;

      const scheduleDate = new Date();
      scheduleDate.setHours(hours, minutes, 0, 0);

      if (scheduleDate.getTime() <= now.getTime()) {
        scheduleDate.setDate(scheduleDate.getDate() + 1);
      }

      const notifId = 50000 + idx;
      const soundFile =
        alarm.soundType === 'built-in' && alarm.soundBuiltInId === 'adzan_subuh'
          ? 'adzan_subuh.mp3'
          : 'adzan.mp3';

      notificationsToSchedule.push({
        id: notifId,
        title: `Alarm: ${alarm.label}`,
        body: alarm.description || `Saatnya ${alarm.label}. Mari lanjutkan aktivitas hafalan dan tilawah Al-Qur'an Anda.`,
        channelId: alarm.soundBuiltInId === 'adzan_subuh' ? 'hifzhly-adzan-subuh-channel-v1' : 'hifzhly-adzan-channel-v2',
        schedule: {
          at: scheduleDate,
          allowWhileIdle: true,
        },
        sound: soundFile,
        smallIcon: 'ic_stat_hifzhly',
        iconColor: '#059669',
        actionTypeId: ADZAN_ACTION_TYPE_ID,
      });
    });

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({ notifications: notificationsToSchedule });
    }
  } catch (err) {
    console.warn('Gagal sinkronisasi alarm native:', err);
  }
}

// =========================================================================
// 4. RESILIENT AUDIO PLAYBACK CONTROLLER
// Suara TIDAK AKAN mati saat menaikkan volume atau membuka notifikasi bar
// =========================================================================

export async function playAlarmSound(alarm: AlarmItem): Promise<void> {
  stopAlarmSound();
  currentRingingAlarm = alarm;
  isAlarmDismissed = false;

  try {
    let src = '/audio/adzan.mp3';

    if (alarm.soundType === 'custom') {
      const customData = await getCustomAudio(alarm.id);
      if (customData?.dataUrl) {
        src = customData.dataUrl;
      }
    } else {
      if (alarm.soundBuiltInId === 'adzan_subuh') {
        src = '/audio/adzan_subuh.mp3';
      } else if (alarm.soundBuiltInId === 'adzan') {
        src = '/audio/adzan.mp3';
      } else {
        src = '/audio/adzan.mp3';
      }
    }

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 1.0;
    activeRingingAudio = audio;

    // Resiliensi 1: Jika sistem Android menjeda audio karena panel volume atau bilah status bar ditarik,
    // segera lanjutkan pemutaran selama pengguna belum menekan "Hentikan Suara".
    audio.addEventListener('pause', () => {
      if (!isAlarmDismissed && activeRingingAudio === audio) {
        setTimeout(() => {
          if (!isAlarmDismissed && activeRingingAudio === audio) {
            audio.play().catch(() => {});
          }
        }, 200);
      }
    });

    // Mulai putar
    audio.play().catch((e) => {
      console.warn('Audio play error (gesture needed):', e);
    });

    // Kirim event global ke antarmuka pengguna
    window.dispatchEvent(
      new CustomEvent('hifzhly_alarm_ringing', {
        detail: { alarm },
      })
    );
  } catch (err) {
    console.warn('Gagal memutar suara alarm:', err);
  }
}

export function stopAlarmSound(): void {
  isAlarmDismissed = true;
  if (activeRingingAudio) {
    try {
      activeRingingAudio.pause();
      activeRingingAudio.currentTime = 0;
    } catch {}
    activeRingingAudio = null;
  }
  currentRingingAlarm = null;
  window.dispatchEvent(new CustomEvent('hifzhly_alarm_stopped'));
}

export function getCurrentlyRingingAlarm(): AlarmItem | null {
  return currentRingingAlarm;
}

// Resiliensi 2: Pantau kembalinya fokus jendela (misal saat pengguna selesai melihat status bar)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!isAlarmDismissed && activeRingingAudio && activeRingingAudio.paused) {
      activeRingingAudio.play().catch(() => {});
    }
  });
}
if (typeof window !== 'undefined') {
  window.addEventListener('focus', () => {
    if (!isAlarmDismissed && activeRingingAudio && activeRingingAudio.paused) {
      activeRingingAudio.play().catch(() => {});
    }
  });
}

// =========================================================================
// 5. IN-APP BACKGROUND TIMER MONITOR
// =========================================================================

let timerInterval: any = null;

export function startAlarmMonitor(): void {
  if (timerInterval) return;

  timerInterval = setInterval(() => {
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMins = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMins}`;
    const currentDay = now.getDay();
    const currentSeconds = now.getSeconds();

    // Jalankan tepat pada detik ke-0 setiap menit
    if (currentSeconds !== 0) return;

    const alarms = getAlarms();
    for (const alarm of alarms) {
      if (!alarm.enabled) continue;
      if (alarm.time === currentTimeStr) {
        // Cek repetisi hari
        if (alarm.repeatDays.length === 0 || alarm.repeatDays.includes(currentDay)) {
          playAlarmSound(alarm);

          // Jika alarm hanya sekali (repeatDays kosong), nonaktifkan setelah berdering
          if (alarm.repeatDays.length === 0) {
            updateAlarm(alarm.id, { enabled: false });
          }
          break;
        }
      }
    }
  }, 1000);
}
