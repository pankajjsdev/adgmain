/**
 * Google Authentication Utility
 * Handles Google Sign-In integration with multi-tenant support
 */

import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { getClientConfig, isFeatureEnabled } from './clientConfig';

// Safely import GoogleSignin with fallback
let GoogleSignin: any = null;
let statusCodes: any = null;

// Note: Using require() here is intentional for graceful fallback when native module is not available
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const googleSigninModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleSigninModule.GoogleSignin;
  statusCodes = googleSigninModule.statusCodes;
} catch (error: any) {
  console.warn('Google Sign-In native module not available:', error?.message || 'Unknown error');
  console.warn('Google Sign-In will use web-only authentication');
}

export interface GoogleAuthConfig {
  webClientId: string;
  iosClientId: string;
  androidClientId: string;
  scopes: string[];
  hostedDomain?: string;
}

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  photo?: string;
  givenName?: string;
  familyName?: string;
}

export interface GoogleAuthResult {
  success: boolean;
  user?: GoogleUser;
  error?: string;
  cancelled?: boolean;
}

/**
 * Get Google configuration for the current client
 */
const getGoogleConfig = (): GoogleAuthConfig => {
  const clientConfig = getClientConfig();
  
  // Use client-specific Google OAuth configuration
  return {
    webClientId: clientConfig.googleAuth.webClientId,
    iosClientId: clientConfig.googleAuth.iosClientId,
    androidClientId: clientConfig.googleAuth.androidClientId,
    scopes: clientConfig.googleAuth.scopes,
    hostedDomain: clientConfig.googleAuth.hostedDomain,
  };
};

/**
 * Initialize Google Sign-In
 * Should be called once when the app starts
 */
export const initializeGoogleAuth = async (): Promise<void> => {
  try {
    if (!isFeatureEnabled('socialLogin')) {
      console.log('Social login is disabled for this client');
      return;
    }

    const config = getGoogleConfig();
    
    if (Platform.OS !== 'web' && GoogleSignin) {
      // Configure Google Sign-In for mobile (only if native module is available)
      await GoogleSignin.configure({
        webClientId: config.webClientId,
        iosClientId: config.iosClientId,
        scopes: config.scopes || ['openid', 'profile', 'email'],
        offlineAccess: true,
        hostedDomain: '',
        forceCodeForRefreshToken: true,
      });
    }
    
    console.log('Google Auth initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Google Auth:', error);
  }
};

/**
 * Check if Google Play Services are available (Android only)
 */
export const checkGooglePlayServices = async (): Promise<boolean> => {
  try {
    if (Platform.OS !== 'android' || !GoogleSignin) {
      return true;
    }
    
    await GoogleSignin.hasPlayServices();
    return true;
  } catch (error) {
    console.error('Google Play Services not available:', error);
    return false;
  }
};

/**
 * Sign in with Google (Mobile - using GoogleSignin)
 */
const signInWithGoogleMobile = async (): Promise<GoogleAuthResult> => {
  try {
    // If native module is not available, fallback to web authentication
    if (!GoogleSignin) {
      console.log('Native Google Sign-In not available, falling back to web authentication');
      return await signInWithGoogleWeb();
    }

    // Check if Google Play Services are available
    const hasPlayServices = await checkGooglePlayServices();
    if (!hasPlayServices) {
      return {
        success: false,
        error: 'Google Play Services not available'
      };
    }

    // Sign out any existing user first
    await GoogleSignin.signOut();
    
    // Sign in
    const userInfo = await GoogleSignin.signIn();
    
    if (!userInfo.data?.user) {
      return {
        success: false,
        error: 'No user information received'
      };
    }

    const googleUser = userInfo.data.user;
    const user: GoogleUser = {
      id: googleUser.id,
      email: googleUser.email,
      name: googleUser.name || '',
      photo: googleUser.photo || undefined,
      givenName: googleUser.givenName || undefined,
      familyName: googleUser.familyName || undefined,
    };

    return {
      success: true,
      user
    };
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return {
        success: false,
        cancelled: true,
        error: 'Sign-in was cancelled'
      };
    } else if (error.code === statusCodes.IN_PROGRESS) {
      return {
        success: false,
        error: 'Sign-in is already in progress'
      };
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return {
        success: false,
        error: 'Google Play Services not available'
      };
    } else {
      return {
        success: false,
        error: error.message || 'Google Sign-In failed'
      };
    }
  }
};

/**
 * Sign in with Google (Web - using AuthSession)
 */
const signInWithGoogleWeb = async (): Promise<GoogleAuthResult> => {
  try {
    const config = getGoogleConfig();
    const redirectUri = AuthSession.makeRedirectUri();
    
    // Create request
    const request = new AuthSession.AuthRequest({
      clientId: config.webClientId,
      scopes: config.scopes || ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Code,
      redirectUri,
      state: await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        redirectUri + Date.now(),
        { encoding: Crypto.CryptoEncoding.HEX }
      ),
    });

    // Prompt for authentication
    const result = await request.promptAsync({
      authorizationEndpoint: 'https://accounts.google.com/oauth/authorize',
    });

    if (result.type === 'success') {
      // Exchange code for tokens
      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId: config.webClientId,
          code: result.params.code,
          redirectUri,
          extraParams: {
            code_verifier: request.codeVerifier || '',
          },
        },
        {
          tokenEndpoint: 'https://oauth2.googleapis.com/token',
        }
      );

      // Get user info
      const userInfoResponse = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResult.accessToken}`
      );
      const userInfo = await userInfoResponse.json();

      const user: GoogleUser = {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name || '',
        photo: userInfo.picture || undefined,
        givenName: userInfo.given_name || undefined,
        familyName: userInfo.family_name || undefined,
      };

      return {
        success: true,
        user
      };
    } else if (result.type === 'cancel') {
      return {
        success: false,
        cancelled: true,
        error: 'Sign-in was cancelled'
      };
    } else {
      return {
        success: false,
        error: 'Google Sign-In failed'
      };
    }
  } catch (error: any) {
    console.error('Google Web Sign-In error:', error);
    return {
      success: false,
      error: error.message || 'Google Sign-In failed'
    };
  }
};

/**
 * Main Google Sign-In function
 * Automatically chooses the appropriate method based on platform
 */
export const signInWithGoogle = async (): Promise<GoogleAuthResult> => {
  try {
    // Check if social login is enabled for this client
    if (!isFeatureEnabled('socialLogin')) {
      return {
        success: false,
        error: 'Social login is not enabled for this app'
      };
    }

    // If native module is not available, use web authentication
    if (!GoogleSignin) {
      console.log('Native Google Sign-In not available, using web authentication');
      return await signInWithGoogleWeb();
    }

    // Choose appropriate sign-in method based on platform
    if (Platform.OS === 'web') {
      return await signInWithGoogleWeb();
    } else {
      return await signInWithGoogleMobile();
    }
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    return {
      success: false,
      error: error.message || 'Google Sign-In failed'
    };
  }
};

/**
 * Sign out from Google
 */
export const signOutFromGoogle = async (): Promise<void> => {
  try {
    if (Platform.OS !== 'web' && GoogleSignin) {
      await GoogleSignin.signOut();
    }
    console.log('Signed out from Google successfully');
  } catch (error) {
    console.error('Failed to sign out from Google:', error);
  }
};

/**
 * Get current Google user (if signed in)
 */
export const getCurrentGoogleUser = async (): Promise<GoogleUser | null> => {
  try {
    if (Platform.OS === 'web' || !GoogleSignin) {
      return null; // Web doesn't persist Google user or native module not available
    }
    
    const userInfo = await GoogleSignin.getCurrentUser();
    if (!userInfo?.user) {
      return null;
    }

    return {
      id: userInfo.user.id,
      email: userInfo.user.email,
      name: userInfo.user.name || '',
      photo: userInfo.user.photo || undefined,
      givenName: userInfo.user.givenName || undefined,
      familyName: userInfo.user.familyName || undefined,
    };
  } catch (error) {
    console.error('Failed to get current Google user:', error);
    return null;
  }
};

/**
 * Check if user is signed in to Google
 */
export const isGoogleSignedIn = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web' || !GoogleSignin) {
      // For web or when native module is not available
      return false;
    }
    
    const currentUser = await GoogleSignin.getCurrentUser();
    return currentUser !== null;
  } catch (error) {
    console.error('Error checking Google sign-in status:', error);
    return false;
  }
};

/**
 * Development helper to log Google Auth configuration
 */
export const logGoogleAuthConfig = (): void => {
  if (__DEV__) {
    const config = getGoogleConfig();
    console.log('=== Google Auth Configuration ===');
    console.log('Social Login Enabled:', isFeatureEnabled('socialLogin'));
    console.log('Web Client ID:', config.webClientId);
    console.log('iOS Client ID:', config.iosClientId);
    console.log('Android Client ID:', config.androidClientId);
    console.log('Scopes:', config.scopes);
    console.log('==================================');
  }
};
