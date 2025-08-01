import create from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { apiPost, apiGet } from '@/api'; // Assuming you have apiGet and apiPost

const TOKEN_STORAGE_KEY = '@auth/tokens';
const USER_STORAGE_KEY = '@auth/user'; // Key for storing user data

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


  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await apiPost('/login', credentials);
      if (response.ok) {
        // Assuming your login API returns user data and a token
        const { user, token, refreshToken } = response.data.data; // Adjust based on your API response structure
        get().setToken(token); // Use setToken action
        get().setRefreshToken(refreshToken); // Use setRefreshToken action
        get().setUser(user); // Use setUser action
        set({ isAuthenticated: true, loading: false, error: null }); // Clear error on success
      } else {
        // API error (non-2xx response)
        console.error('Login API error:', response.error);
        // More specific error messages based on API response (adjust as needed)
        if (response.statusCode === 401) {
          set({ error: 'Invalid email or password', loading: false });
        } else if (response.error?.message) {
           set({ error: response.error.message, loading: false });
        }
        else {
          set({ error: 'Login failed. Please try again.', loading: false });
        }
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
      if (response.ok) {
        // Assuming signup also returns tokens and user data for immediate login
        const { user, token, refreshToken } = response.data.data; // Adjust based on your API response
        get().setToken(token);
        get().setRefreshToken(refreshToken);
        get().setUser(user);
        set({ isAuthenticated: true, loading: false, error: null }); // Clear error on success
      } else {
         console.error('Signup API error:', response.error);
         // More specific error messages based on API response (adjust as needed)
         if (response.statusCode === 409) { // Example: Conflict for existing user
           set({ error: 'Email already exists', loading: false });
         } else if (response.error?.message) {
            set({ error: response.error.message, loading: false });
         } else {
           set({ error: 'Signup failed. Please try again.', loading: false });
         }
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
    set({ loading: true, error: null }); // Set loading true during initialization
    try {
      const storedTokens = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
      const storedUser = await SecureStore.getItemAsync(USER_STORAGE_KEY);

      if (storedTokens) {
        const { accessToken, refreshToken } = JSON.parse(storedTokens);
        set({ token: accessToken, refreshToken });

        // Token validation or profile fetching
        try {
          const userProfileResponse = await apiGet('/profile'); // Replace '/profile' with your actual endpoint
          if (userProfileResponse.ok) {
            get().setUser(userProfileResponse.data.data); // Adjust based on your API response
            set({ isAuthenticated: true, error: null }); // Clear error on successful initialization
          } else {
            console.warn('Stored token might be invalid, attempting refresh...');
            // If profile fetch fails, attempt refresh (handled by API interceptor)
            // If refresh also fails, the interceptor will call logout
             set({ error: userProfileResponse.error?.message || 'Failed to validate token', isAuthenticated: false }); // Set error if validation fails
             await get().logout(); // Clear invalid tokens and log out
          }
        } catch (validationError: any) {
           console.error('Failed to validate token or fetch profile:', validationError);
           // If validation API call fails (e.g., network error), set error and logout
           set({ error: validationError.message || 'Failed to validate token', isAuthenticated: false });
           await get().logout();
        }

      } else if (storedUser) {
         set({ user: JSON.parse(storedUser) });
         // Note: Without a token, subsequent authenticated API calls will likely fail.
         // Consider clearing user data if no valid token is found.
         // await get().logout(); // Uncomment to enforce token requirement for isAuthenticated
      }

    } catch (error: any) {
      console.error('Failed to initialize auth from storage:', error);
      set({ error: error.message || 'Failed to load session' }); // Set error for storage issues
    } finally {
      set({ loading: false });
    }
  },
}));

export default useAuthStore;