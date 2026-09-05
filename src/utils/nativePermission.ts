import { Capacitor, registerPlugin } from '@capacitor/core';

export interface MicrophonePermissionResult {
  permission: 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale';
  isPermanentlyDenied: boolean;
}

export interface MicrophonePermissionPlugin {
  checkMicrophonePermission(): Promise<MicrophonePermissionResult>;
  requestMicrophonePermission(): Promise<MicrophonePermissionResult>;
  openAppSettings(): Promise<{ success: boolean }>;
}

/**
 * Returns true only when running inside the native Android APK/wrapper.
 * Returns false when running in standard web browsers (desktop, iOS, Chrome on Android).
 */
export const isAndroidNative = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    const win = window as any;
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
      return true;
    }
    if (win.Capacitor && typeof win.Capacitor.isNativePlatform === 'function' && win.Capacitor.isNativePlatform()) {
      return win.Capacitor.getPlatform() === 'android';
    }
    if (win.androidBridge || win._capacitorAndroidBridge) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

/**
 * Returns true if the user is on an Android device (either APK or Android mobile browser/preview).
 */
export const isAndroidDevice = (): boolean => {
  try {
    if (typeof navigator === 'undefined') return false;
    return isAndroidNative() || /Android/i.test(navigator.userAgent);
  } catch {
    return false;
  }
};

const NativeMicrophonePermission = registerPlugin<MicrophonePermissionPlugin>('MicrophonePermission');

/**
 * Checks current microphone permission status on Android native platform.
 */
export const checkAndroidMicPermission = async (): Promise<MicrophonePermissionResult> => {
  if (!isAndroidNative()) {
    return { permission: 'granted', isPermanentlyDenied: false };
  }
  try {
    return await NativeMicrophonePermission.checkMicrophonePermission();
  } catch (err) {
    console.warn('MicrophonePermission: checkMicrophonePermission fallback', err);
    return { permission: 'prompt', isPermanentlyDenied: false };
  }
};

/**
 * Triggers the native Android runtime permission dialog for RECORD_AUDIO.
 */
export const requestAndroidMicPermission = async (): Promise<MicrophonePermissionResult> => {
  if (!isAndroidNative()) {
    return { permission: 'granted', isPermanentlyDenied: false };
  }
  try {
    return await NativeMicrophonePermission.requestMicrophonePermission();
  } catch (err) {
    console.warn('MicrophonePermission: requestMicrophonePermission error', err);
    return { permission: 'denied', isPermanentlyDenied: false };
  }
};

/**
 * Opens Android system settings for WDNIN so the user can grant microphone access.
 */
export const openAndroidAppSettings = async (): Promise<boolean> => {
  if (!isAndroidNative()) {
    return false;
  }
  try {
    const res = await NativeMicrophonePermission.openAppSettings();
    return !!res.success;
  } catch (err) {
    console.warn('MicrophonePermission: openAppSettings error', err);
    return false;
  }
};
