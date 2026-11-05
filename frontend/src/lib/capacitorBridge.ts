import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Preferences } from '@capacitor/preferences';

/**
 * Cek apakah aplikasi sedang berjalan di dalam container native mobile (Android / iOS)
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Dapatkan platform aktif saat ini ('android' | 'ios' | 'web')
 */
export function getActivePlatform(): 'android' | 'ios' | 'web' {
  return Capacitor.getPlatform() as 'android' | 'ios' | 'web';
}

/**
 * Inisialisasi status bar dan splash screen native
 */
export async function initNativeAppShell(): Promise<void> {
  if (!isNativePlatform()) return;

  try {
    // Set Status Bar ke tema Emerald Hifzhly (#022c22)
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#022c22' });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch (err) {
    console.warn('StatusBar init notice:', err);
  }

  try {
    // Sembunyikan Splash Screen setelah aplikasi siap
    await SplashScreen.hide();
  } catch (err) {
    console.warn('SplashScreen hide notice:', err);
  }
}

/**
 * Efek getaran haptik responsif saat evaluasi tajwid atau hafalan
 */
export async function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'): Promise<void> {
  if (!isNativePlatform()) return;

  try {
    switch (type) {
      case 'light':
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
      case 'medium':
        await Haptics.impact({ style: ImpactStyle.Medium });
        break;
      case 'heavy':
        await Haptics.impact({ style: ImpactStyle.Heavy });
        break;
      case 'success':
        await Haptics.notification({ type: NotificationType.Success });
        break;
      case 'warning':
        await Haptics.notification({ type: NotificationType.Warning });
        break;
      case 'error':
        await Haptics.notification({ type: NotificationType.Error });
        break;
    }
  } catch (err) {
    console.warn('Haptics trigger notice:', err);
  }
}

/**
 * Penyimpanan data native persisten (Preferences pada native, fallback ke localStorage pada web)
 */
export async function setPersistentItem(key: string, value: string): Promise<void> {
  if (isNativePlatform()) {
    try {
      await Preferences.set({ key, value });
      return;
    } catch (err) {
      console.warn('Preferences.set notice:', err);
    }
  }
  localStorage.setItem(key, value);
}

export async function getPersistentItem(key: string): Promise<string | null> {
  if (isNativePlatform()) {
    try {
      const { value } = await Preferences.get({ key });
      return value;
    } catch (err) {
      console.warn('Preferences.get notice:', err);
    }
  }
  return localStorage.getItem(key);
}

