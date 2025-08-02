import { apiGet, apiPost } from '@/api'; // Assuming you have apiGet and apiPost
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

const TOKEN_STORAGE_KEY = 'auth-tokens';
const USER_STORAGE_KEY = 'auth-user'; // Key for storing user data

interface AuthState {
  user: any | null; // Replace 'any' with your user data type
  token: string | null;
  refreshToken: string | null; // Add refresh token to state
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<void>; // Replace 'any' with your credentials type
  signup: (userData: any) => Promise<void>; // Replace 'any' with your user data type
  logout: () => Promise<void>; // Make logout async to clear storage
  initializeAuth: () => Promise<void>; // Action to initialize auth state
  setToken: (token: string | null) => void; // Action to set token
  setRefreshToken: (token: string | null) => void; // Action to set refresh token
  setUser: (user: any | null) => void; // Action to set user data
  clearError: () => void; // Action to clear error
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  // Action to set token and store it securely
  setToken: (token) => {
    set({ token });
    // Update stored tokens with the new access token and existing refresh token
    SecureStore.setItemAsync(TOKEN_STORAGE_KEY, JSON.stringify({ accessToken: token, refreshToken: get().refreshToken }));
  },

  // Action to set refresh token and update stored tokens
  setRefreshToken: (refreshToken) => {
    set({ refreshToken });
    // Update stored tokens with the existing access token and new refresh token
    SecureStore.setItemAsync(TOKEN_STORAGE_KEY, JSON.stringify({ accessToken: get().token, refreshToken }));
  },

  // Action to set user data and optionally store it securely
  setUser: (user) => {
    set({ user });
    if (user) {
      SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      SecureStore.deleteItemAsync(USER_STORAGE_KEY);
    }
  },

  // Action to clear error
  clearError: () => {
    set({ error: null });
  },

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await apiPost('/auth/student/local/login', {...credentials, vendorCode: process.env.EXPO_PUBLIC_VENDOR_CODE});
      console.log('Login response:', response); // Debugging
      
      if (response.success && response.data) {
        // Assuming your login API returns user data and a token
        const { user, token, refreshToken } = response.data; // Adjust based on your API response structure
        get().setToken(token); // Use setToken action
        get().setRefreshToken(refreshToken); // Use setRefreshToken action
        get().setUser(user); // Use setUser action
        set({ isAuthenticated: true, loading: false, error: null }); // Clear error on success
      } else {
        // API returned success: false
        console.error('Login API error:', response.message);
        set({ error: response.message || 'Login failed. Please try again.', loading: false });
      }
    } catch (err: any) {
      // Network error or other exceptions
      console.error('Login failed:', err);
      // More specific error messages for common issues
      if (err.message === 'Network Error') { // Example check for axios network error
         set({ error: 'Network error. Please check your internet connection.', loading: false });
      } else {
         set({ error: err.message || 'An unexpected error occurred. Please try again later.', loading: false });
      }
    }
  },

  signup: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiPost('/signup', userData);
      
      if (response.success && response.data) {
        // Assuming signup also returns tokens and user data for immediate login
        const { user, token, refreshToken } = response.data; // Adjust based on your API response
        get().setToken(token);
        get().setRefreshToken(refreshToken);
        get().setUser(user);
        set({ isAuthenticated: true, loading: false, error: null }); // Clear error on success
      } else {
         console.error('Signup API error:', response.message);
         set({ error: response.message || 'Signup failed. Please try again.', loading: false });
      }
    } catch (err: any) {
      console.error('Signup failed:', err);
       // More specific error messages for common issues
       if (err.message === 'Network Error') {
          set({ error: 'Network error. Please check your internet connection.', loading: false });
       } else {
          set({ error: err.message || 'An unexpected error occurred. Please try again later.', loading: false });
       }
    }
  },

  logout: async () => {
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
    await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
    await SecureStore.deleteItemAsync(USER_STORAGE_KEY); // Clear user data from storage
    // Optionally call logout API endpoint here
  },

  // Action to initialize authentication state from storage
  initializeAuth: async () => {
    set({ loading: true, error: null });
    
    try {
      console.log('🔄 Initializing authentication...');
      
      const storedTokens = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
      const storedUser = await SecureStore.getItemAsync(USER_STORAGE_KEY);

      // If no tokens found, user needs to login
      if (!storedTokens) {
        console.log('❌ No stored tokens found, user needs to login');
        set({ 
          user: null, 
          token: null, 
          refreshToken: null, 
          isAuthenticated: false, 
          loading: false,
          error: null 
        });
        return;
      }

      try {
        const { accessToken, refreshToken } = JSON.parse(storedTokens);
        
        // Basic token validation (check if tokens exist and are strings)
        if (!accessToken || typeof accessToken !== 'string') {
          console.log('❌ Invalid access token format');
          await get().logout();
          return;
        }

        // Set tokens in state
        set({ token: accessToken, refreshToken });
        console.log('✅ Tokens loaded from storage');

        // Validate token by fetching user profile
        try {
          console.log('🔍 Validating token with profile fetch...');
          const userProfileResponse = await apiGet('/student/profile');
          
          if (userProfileResponse.success && userProfileResponse.data) {
            const userData = userProfileResponse.data;
            console.log('✅ Token validation successful, user authenticated');
            
            // Update user data and mark as authenticated
            get().setUser(userData);
            set({ isAuthenticated: true, error: null });
            
          } else {
            console.warn('⚠️ Token validation failed, attempting refresh...');
            
            // Token might be expired, let the API interceptor handle refresh
            // If refresh fails, it will automatically call logout
            set({ 
              isAuthenticated: false, 
              error: 'Session expired, please login again' 
            });
            await get().logout();
          }
          
        } catch (validationError: any) {
          console.error('❌ Token validation error:', validationError);
          
          // Check if it's a network error vs auth error
          if (validationError.statusCode === 401 || validationError.statusCode === 403) {
            console.log('🔄 Unauthorized error, tokens expired');
            set({ error: 'Session expired, please login again' });
            await get().logout();
          } else if (!validationError.statusCode) {
            // Network error - keep tokens but don't authenticate yet
            console.log('🌐 Network error during validation, will retry later');
            if (storedUser) {
              const userData = JSON.parse(storedUser);
              set({ 
                user: userData, 
                isAuthenticated: false, // Don't authenticate without validation
                error: 'Network error, please check connection' 
              });
            } else {
              set({ 
                isAuthenticated: false,
                error: 'Network error, please check connection' 
              });
            }
          } else {
            // Other API errors
            console.log('❌ API error during validation');
            set({ error: validationError.message || 'Failed to validate session' });
            await get().logout();
          }
        }
        
      } catch (error) {
        console.error('❌ Failed to parse stored tokens:', error);
        await get().logout();
      }
      
    } catch (storageError: any) {
      console.error('❌ Failed to read from secure storage:', storageError);
      set({ 
        error: 'Failed to load session data', 
        isAuthenticated: false,
        loading: false 
      });
    } finally {
      set({ loading: false });
      console.log('✅ Authentication initialization complete');
    }
  },
}));

export default useAuthStore;