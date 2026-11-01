import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hrsup.eco.erp',
  appName: 'ECO ERP',
  webDir: 'dist',
  server: {
    // Production live URL: Enables instant synchronization with Cloudflare D1 and live modules without store updates
    url: 'https://eco.hrsup.com',
    cleartext: false,
    androidScheme: 'https',
    allowNavigation: [
      'eco.hrsup.com',
      '*.hrsup.com',
      '*.cloudflare.com',
      '*.pages.dev',
      'challenges.cloudflare.com',
    ],
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#07130E',
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#07130E',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;

