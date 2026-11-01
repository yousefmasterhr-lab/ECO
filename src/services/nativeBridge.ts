import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { PushNotifications } from '@capacitor/push-notifications';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { App } from '@capacitor/app';

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform(); // 'android' | 'ios' | 'web'

export const NativeBridge = {
  isNative: () => Capacitor.isNativePlatform(),
  getPlatform: () => Capacitor.getPlatform(),

  /**
   * Initialize native device capabilities on app start
   */
  async initApp() {
    if (!Capacitor.isNativePlatform()) return;

    try {
      // Hide native splash screen after smooth transition
      await SplashScreen.hide();
    } catch (e) {
      console.warn('[NativeBridge] SplashScreen.hide failed:', e);
    }

    try {
      // Configure initial status bar overlay behavior
      await StatusBar.setOverlaysWebView({ overlay: false });
    } catch (e) {
      console.warn('[NativeBridge] StatusBar init failed:', e);
    }

    // Initialize Push Notifications
    this.initPushNotifications();

    // Register hardware back button listener for Android
    this.initBackButtonListener();
  },

  /**
   * Synchronize StatusBar theme with ECO Brand Amber & Royal Olive
   */
  async syncStatusBar(isDark: boolean) {
    if (!Capacitor.isNativePlatform()) return;

    try {
      if (isDark) {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#07130E' });
      } else {
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: '#FFFDF9' });
      }
    } catch (e) {
      console.warn('[NativeBridge] syncStatusBar error:', e);
    }
  },

  /**
   * Request permissions and initialize Push Notifications
   */
  async initPushNotifications() {
    if (!Capacitor.isNativePlatform()) return;

    try {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.warn('[NativeBridge] Push notification permission not granted');
        return;
      }

      // Register device for push notifications
      await PushNotifications.register();

      // Listen for registration token
      await PushNotifications.addListener('registration', token => {
        console.info('[NativeBridge] Push registration success, token:', token.value);
        try {
          localStorage.setItem('eco_device_push_token', token.value);
        } catch (_) {}
      });

      // Handle registration errors
      await PushNotifications.addListener('registrationError', err => {
        console.error('[NativeBridge] Push registration error: ', err.error);
      });

      // Handle incoming notification while app is running
      await PushNotifications.addListener('pushNotificationReceived', notification => {
        console.info('[NativeBridge] Push notification received: ', notification);
        NativeBridge.hapticNotification('success');
      });

      // Handle user tapping on a notification
      await PushNotifications.addListener('pushNotificationActionPerformed', action => {
        console.info('[NativeBridge] Push notification action performed', action.actionId, action.notification);
      });
    } catch (e) {
      console.warn('[NativeBridge] Push notification init error:', e);
    }
  },

  /**
   * Android Hardware Back Button Handler
   */
  initBackButtonListener() {
    if (!Capacitor.isNativePlatform()) return;

    App.addListener('backButton', ({ canGoBack }) => {
      // Check if there are active modals or dialogs in the DOM
      const modalCloseBtn = document.querySelector('[data-modal-close], .modal-close-btn, button[aria-label="Close"]') as HTMLElement | null;
      if (modalCloseBtn) {
        modalCloseBtn.click();
        return;
      }

      if (canGoBack) {
        window.history.back();
      } else {
        App.minimizeApp();
      }
    });
  },

  /**
   * Haptic Feedback utilities
   */
  async hapticImpact(style: 'heavy' | 'medium' | 'light' = 'light') {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const impactMap = {
        heavy: ImpactStyle.Heavy,
        medium: ImpactStyle.Medium,
        light: ImpactStyle.Light,
      };
      await Haptics.impact({ style: impactMap[style] });
    } catch (_) {}
  },

  async hapticNotification(type: 'success' | 'warning' | 'error' = 'success') {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const typeMap = {
        success: NotificationType.Success,
        warning: NotificationType.Warning,
        error: NotificationType.Error,
      };
      await Haptics.notification({ type: typeMap[type] });
    } catch (_) {}
  },
};

