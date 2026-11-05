import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hifzhly.app',
  appName: 'Hifzhly',
  webDir: 'dist',
  backgroundColor: '#022c22',
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: ['hifzhly.vercel.app', '43.129.37.163:8080'],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#022c22',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#022c22',
      overlaysWebView: false,
    },
  },
};

export default config;

