import * as ScreenOrientation from 'expo-screen-orientation';
import { Platform } from 'react-native';

/**
 * Cross-platform orientation utilities for video player fullscreen functionality
 * Ensures consistent behavior across Android and iOS platforms
 */

export interface OrientationConfig {
  portrait: ScreenOrientation.OrientationLock;
  landscape: ScreenOrientation.OrientationLock;
}

/**
 * Platform-specific orientation configurations
 * iOS: More restrictive, uses specific landscape orientations
 * Android: More flexible, allows both landscape orientations
 */
export const getOrientationConfig = (): OrientationConfig => {
  if (Platform.OS === 'ios') {
    return {
      portrait: ScreenOrientation.OrientationLock.PORTRAIT_UP,
      landscape: ScreenOrientation.OrientationLock.LANDSCAPE, // Changed to allow both landscape orientations on iOS too
    };
  } else {
    return {
      portrait: ScreenOrientation.OrientationLock.PORTRAIT_UP,
      landscape: ScreenOrientation.OrientationLock.LANDSCAPE, // Android allows both
    };
  }
};

/**
 * Safely lock orientation with error handling and platform-specific logic
 * @param orientation - Target orientation lock
 * @returns Promise<boolean> - Success status
 */
export const lockOrientation = async (
  orientation: ScreenOrientation.OrientationLock
): Promise<boolean> => {
  try {
    // Platform-specific handling
    if (Platform.OS === 'ios') {
      // iOS sometimes needs permissions check
      const supportedOrientations = await ScreenOrientation.getOrientationLockAsync();
      console.log('Current iOS orientation lock:', supportedOrientations);
    }
    
    // Attempt to lock orientation
    await ScreenOrientation.lockAsync(orientation);
    
    // Verify the lock was successful (important for iOS)
    if (Platform.OS === 'ios') {
      // Small delay for iOS to process the change
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    return true;
  } catch (error: any) {
    console.warn('Failed to lock orientation:', error);
    
    // Platform-specific error handling
    if (Platform.OS === 'ios' && error.message?.includes('not supported')) {
      console.warn('iOS: Orientation lock not supported in this context');
    } else if (Platform.OS === 'android' && error.message?.includes('permission')) {
      console.warn('Android: Missing orientation permission');
    }
    
    return false;
  }
};

/**
 * Get current orientation safely
 * @returns Promise<ScreenOrientation.Orientation | null>
 */
export const getCurrentOrientation = async (): Promise<ScreenOrientation.Orientation | null> => {
  try {
    return await ScreenOrientation.getOrientationAsync();
  } catch (error) {
    console.warn('Failed to get current orientation:', error);
    return null;
  }
};

/**
 * Unlock orientation safely
 * @returns Promise<boolean> - Success status
 */
export const unlockOrientation = async (): Promise<boolean> => {
  try {
    await ScreenOrientation.unlockAsync();
    return true;
  } catch (error) {
    console.warn('Failed to unlock orientation:', error);
    return false;
  }
};

/**
 * Initialize default portrait orientation for video player
 * @returns Promise<boolean> - Success status
 */
export const initializePortraitOrientation = async (): Promise<boolean> => {
  const config = getOrientationConfig();
  return await lockOrientation(config.portrait);
};

/**
 * Switch to fullscreen landscape orientation with platform-specific handling
 * @returns Promise<boolean> - Success status
 */
export const enterFullscreenOrientation = async (): Promise<boolean> => {
  try {
    const config = getOrientationConfig();
    
    // Platform-specific pre-lock handling
    if (Platform.OS === 'android') {
      // Android: Ensure we unlock first for smoother transition
      await unlockOrientation();
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const success = await lockOrientation(config.landscape);
    
    if (success && Platform.OS === 'ios') {
      // iOS: Additional verification after lock
      const currentOrientation = await getCurrentOrientation();
      const isNowLandscape = currentOrientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT || 
                            currentOrientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
      
      if (!isNowLandscape) {
        // Force rotation on iOS if needed
        console.log('iOS: Forcing landscape orientation');
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
        await new Promise(resolve => setTimeout(resolve, 100));
        await lockOrientation(config.landscape);
      }
    }
    
    return success;
  } catch (error) {
    console.error('Error entering fullscreen orientation:', error);
    return false;
  }
};

/**
 * Exit fullscreen and return to portrait orientation with platform-specific handling
 * @returns Promise<boolean> - Success status
 */
export const exitFullscreenOrientation = async (): Promise<boolean> => {
  try {
    const config = getOrientationConfig();
    
    // Platform-specific pre-lock handling
    if (Platform.OS === 'android') {
      // Android: Ensure we unlock first for smoother transition
      await unlockOrientation();
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const success = await lockOrientation(config.portrait);
    
    if (success && Platform.OS === 'ios') {
      // iOS: Additional verification after lock
      const currentOrientation = await getCurrentOrientation();
      const isNowPortrait = currentOrientation === ScreenOrientation.Orientation.PORTRAIT_UP || 
                           currentOrientation === ScreenOrientation.Orientation.PORTRAIT_DOWN;
      
      if (!isNowPortrait) {
        // Force rotation on iOS if needed
        console.log('iOS: Forcing portrait orientation');
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }
    }
    
    return success;
  } catch (error) {
    console.error('Error exiting fullscreen orientation:', error);
    return false;
  }
};

/**
 * Check if current orientation is landscape
 * @returns Promise<boolean>
 */
export const isLandscapeOrientation = async (): Promise<boolean> => {
  const orientation = await getCurrentOrientation();
  if (!orientation) return false;
  
  return (
    orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
    orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
  );
};

/**
 * Platform-specific status bar height calculation
 * @param isLandscape - Current landscape state
 * @returns number - Status bar height in pixels
 */
export const getStatusBarHeight = (isLandscape: boolean = false): number => {
  if (Platform.OS === 'ios') {
    // iOS status bar heights
    if (isLandscape) return 0;
    // iPhone X and newer have different status bar heights
    return 44; // Standard iOS status bar height
  } else {
    // Android status bar height is available from StatusBar.currentHeight
    return 24; // Fallback for Android
  }
};

/**
 * Test orientation functionality
 * Useful for debugging and ensuring cross-platform compatibility
 */
export const testOrientationFunctionality = async (): Promise<void> => {
  console.log('Testing orientation functionality...');
  
  // Test getting current orientation
  const currentOrientation = await getCurrentOrientation();
  console.log('Current orientation:', currentOrientation);
  
  // Test platform-specific config
  const config = getOrientationConfig();
  console.log('Platform config:', config);
  
  // Test landscape detection
  const isLandscape = await isLandscapeOrientation();
  console.log('Is landscape:', isLandscape);
  
  // Test status bar height
  const statusBarHeight = getStatusBarHeight(isLandscape);
  console.log('Status bar height:', statusBarHeight);
  
  console.log('Orientation functionality test completed');
};
