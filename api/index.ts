import useAuthStore from '@/store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import * as Application from 'expo-application';
import * as Network from 'expo-network';
import { Platform } from 'react-native';


// Fix for __DEV__ import: use globalThis.__DEV__ for React Native compatibility
const IS_DEV = typeof __DEV__ !== 'undefined' ? __DEV__ : (typeof globalThis !== 'undefined' && (globalThis as any).__DEV__) || false;

// Environment configuration
const getApiBaseUrl = (): string => {
  if (IS_DEV) {
    return process.env?.EXPO_PUBLIC_API_BASE_URL_DEV || 'http://localhost:3000/api';
  }
  return process.env?.EXPO_PUBLIC_API_BASE_URL_PROD || 'https://your-production-api.com/api';
};

// Constants
export const API_BASE_URL = getApiBaseUrl();
export const REQUEST_TIMEOUT = 30000; // 30 seconds
export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY = 1000; // 1 second

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@auth/access_token',
  REFRESH_TOKEN: '@auth/refresh_token',
  USER_DATA: '@auth/user_data',
  API_CACHE: '@api/cache',
  NETWORK_STATE: '@network/state',
} as const;

// API Response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  statusCode: number;
  timestamp?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
  timestamp?: string;
  path?: string;
}

// Request configuration interface
export interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  skipRetry?: boolean;
  skipCache?: boolean;
  cacheKey?: string;
  cacheTTL?: number; // Time to live in milliseconds
  showLoader?: boolean;
  skipErrorHandling?: boolean;
}

// Network state interface
export interface NetworkState {
  isConnected: boolean;
  type: string;
  isInternetReachable: boolean;
  lastChecked: number;
}

// Token management
class TokenManager {
  private static instance: TokenManager;
  private isRefreshing = false;
  private failedQueue: {
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }[] = [];

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  async initialize(): Promise<void> {
    // Initialization is now primarily handled by the Zustand store's initializeAuth action
    console.log('TokenManager initialized');
  }

  // Get the token from the Zustand store
  getAccessToken(): string | null {
    return useAuthStore.getState().token; // Get token from Zustand
  }

  getRefreshToken(): string | null {
     // Get refresh token from Zustand store
     return useAuthStore.getState().refreshToken;
  }

  // Set tokens in the Zustand store (called after refresh)
  async setTokens(accessToken: string, refreshToken?: string): Promise<void> {
    useAuthStore.getState().setToken(accessToken);
    if (refreshToken) {
       useAuthStore.getState().setRefreshToken(refreshToken);
    }
    console.log('Tokens updated in Zustand via TokenManager');
  }

  async clearTokens(): Promise<void> {
    // Clear tokens in the Zustand store and optionally from storage
    useAuthStore.getState().logout(); // Clear token and user in Zustand and storage via logout action
    console.log('Tokens cleared via TokenManager');
  }

  async refreshAccessToken(): Promise<string> {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      // Get refresh token from Zustand store
      const currentRefreshToken = this.getRefreshToken();

      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken: currentRefreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data.data; // Adjust based on your API response

      // Update tokens in Zustand via setTokens action
      await this.setTokens(accessToken, newRefreshToken);

      // Process failed queue
      this.failedQueue.forEach(({ resolve }) => resolve(accessToken));
      this.failedQueue = [];

      return accessToken;
    } catch (error) {
      // Process failed queue
      this.failedQueue.forEach(({ reject }) => reject(error));
      this.failedQueue = [];

      // Clear tokens on refresh failure
      await this.clearTokens(); // This will also update Zustand and storage
      // You might want to add navigation to the login page here
      return Promise.reject(error);
    } finally {
      this.isRefreshing = false;
    }
  }
}

// Cache management
class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      const cachedData = await AsyncStorage.getItem(STORAGE_KEYS.API_CACHE);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        this.cache = new Map(parsed);
      }
    } catch (error) {
      console.error('Failed to initialize cache:', error);
    }
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  set(key: string, data: any, ttl: number = 300000): void { // Default 5 minutes
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    // Persist to AsyncStorage (debounced)
    this.debouncedPersist();
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.debouncedPersist();
  }

  clear(): void {
    this.cache.clear();
    AsyncStorage.removeItem(STORAGE_KEYS.API_CACHE);
  }

  private persistTimeout: number | null = null;
  private debouncedPersist = (): void => {
    if (this.persistTimeout) {
      clearTimeout(this.persistTimeout);
    }

    this.persistTimeout = setTimeout(async () => {
      try {
        const serialized = JSON.stringify(Array.from(this.cache.entries()));
        await AsyncStorage.setItem(STORAGE_KEYS.API_CACHE, serialized);
      } catch (error) {
        console.error('Failed to persist cache:', error);
      }
    }, 1000) as unknown as number;
  };
}

// Expo-compatible Network Manager
class NetworkManager {
  private static instance: NetworkManager;
  private networkState: NetworkState = {
    isConnected: true,
    type: 'unknown',
    isInternetReachable: true,
    lastChecked: Date.now(),
  };
  private listeners: ((state: NetworkState) => void)[] = [];
  private checkInterval: number | null = null;
  private readonly CHECK_INTERVAL = 10000; // Check every 10 seconds

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Load cached network state
      const cachedState = await AsyncStorage.getItem(STORAGE_KEYS.NETWORK_STATE);
      if (cachedState) {
        this.networkState = { ...this.networkState, ...JSON.parse(cachedState) };
      }

      // Initial network check
      await this.checkNetworkState();

      // Start periodic network checks
      this.startPeriodicChecks();
    } catch (error) {
      console.error('Failed to initialize network manager:', error);
    }
  }

  private async checkNetworkState(): Promise<void> {
    try {
      // Use Expo Network API
      const networkState = await Network.getNetworkStateAsync();
      
      const newState: NetworkState = {
        isConnected: networkState.isConnected ?? false,
        type: networkState.type || 'unknown',
        isInternetReachable: networkState.isInternetReachable ?? false,
        lastChecked: Date.now(),
      };

      // Check if state changed
      const stateChanged = 
        this.networkState.isConnected !== newState.isConnected ||
        this.networkState.isInternetReachable !== newState.isInternetReachable;

      this.networkState = newState;

      // Persist state
      await AsyncStorage.setItem(STORAGE_KEYS.NETWORK_STATE, JSON.stringify(newState));

      // Notify listeners if state changed
      if (stateChanged) {
        this.listeners.forEach(listener => listener(newState));
      }
    } catch (error) {
      console.error('Failed to check network state:', error);
      
      // Fallback: try to make a simple request to check connectivity
      try {
        await this.checkConnectivityFallback();
      } catch (fallbackError) {
        // Assume offline if all checks fail
        this.networkState = {
          ...this.networkState,
          isConnected: false,
          isInternetReachable: false,
          lastChecked: Date.now(),
        };
      }
    }
  }

  private startPeriodicChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.checkNetworkState();
    }, this.CHECK_INTERVAL) as unknown as number;
  }

  isOnline(): boolean {
    return this.networkState.isConnected && this.networkState.isInternetReachable;
  }

  getNetworkState(): NetworkState {
    return { ...this.networkState };
  }

  addListener(listener: (state: NetworkState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  async forceCheck(): Promise<NetworkState> {
    await this.checkNetworkState();
    return this.getNetworkState();
  }

  cleanup(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.listeners = [];
  }
}

// Request queue for offline support
class RequestQueue {
  private static instance: RequestQueue;
  private queue: {
    config: RequestConfig;
    resolve: (value: any) => void;
    reject: (error: any) => void;
    timestamp: number;
  }[] = [];
  private readonly MAX_QUEUE_SIZE = 50;
  private readonly MAX_QUEUE_AGE = 300000; // 5 minutes

  static getInstance(): RequestQueue {
    if (!RequestQueue.instance) {
      RequestQueue.instance = new RequestQueue();
    }
    return RequestQueue.instance;
  }

  add(config: RequestConfig): Promise<any> {
    return new Promise((resolve, reject) => {
      // Clean old requests
      this.cleanQueue();

      // Check queue size
      if (this.queue.length >= this.MAX_QUEUE_SIZE) {
        reject(new Error('Request queue is full'));
        return;
      }

      this.queue.push({ 
        config, 
        resolve, 
        reject, 
        timestamp: Date.now() 
      });
    });
  }

  private cleanQueue(): void {
    const now = Date.now();
    this.queue = this.queue.filter(item => 
      now - item.timestamp < this.MAX_QUEUE_AGE
    );
  }

  async processQueue(): Promise<void> {
    const requests = [...this.queue];
    this.queue = [];

    for (const { config, resolve, reject } of requests) {
      try {
        const response = await api.request(config);
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    }
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  clear(): void {
    // Reject all pending requests
    this.queue.forEach(({ reject }) => {
      reject(new Error('Request queue cleared'));
    });
    this.queue = [];
  }
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Platform': Platform.OS,
    'X-Client-Version': Application.nativeApplicationVersion || '1.0.0',
    'X-Client-Build': Application.nativeBuildVersion || '1',
  },
});

// Initialize managers
const tokenManager = TokenManager.getInstance();
const cacheManager = CacheManager.getInstance();
const networkManager = NetworkManager.getInstance();
const requestQueue = RequestQueue.getInstance();

// Request interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const customConfig = config as InternalAxiosRequestConfig & RequestConfig;
    
    // Add authentication token
    if (!customConfig.skipAuth) {
      const token = tokenManager.getAccessToken(); // Get the token from the Zustand store via TokenManager
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Add request ID for tracking
    config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Log request in development
    if (IS_DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (IS_DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & RequestConfig & { _retry?: boolean };

    // Log error in development
    if (IS_DEV) {
      console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest?._retry && !originalRequest?.skipAuth) {
      originalRequest._retry = true;

      try {
        const newToken = await tokenManager.refreshAccessToken();
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear tokens and potentially redirect to login on refresh failure
        await tokenManager.clearTokens(); // This will also update Zustand
        // You might want to add navigation to the login page here
        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
    if (!error.response && !networkManager.isOnline()) {
      // Queue request for later if offline
      if (originalRequest && !originalRequest.skipRetry) {
        return requestQueue.add(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

// Retry mechanism
const retryRequest = async (
  config: RequestConfig,
  attempt: number = 1
): Promise<AxiosResponse> => {
  try {
    return await api.request(config);
  } catch (error) {
    if (attempt < MAX_RETRY_ATTEMPTS && !config.skipRetry) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      return retryRequest(config, attempt + 1);
    }
    throw error;
  }
};

// Main API function
export const fetchApi = async <T = any>(
  endpoint: string,
  options: RequestConfig = {}
): Promise<ApiResponse<T>> => {
  const {
    method = 'GET',
    data,
    headers,
    skipCache = false,
    cacheKey,
    cacheTTL = 300000, // 5 minutes default
    skipRetry = false,
    ...restOptions
  } = options;

  // Generate cache key
  const finalCacheKey = cacheKey || `${method}:${endpoint}:${JSON.stringify(data)}`;

  // Check cache for GET requests
  if (method === 'GET' && !skipCache) {
    const cachedData = cacheManager.get(finalCacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  // Check network connectivity
  if (!networkManager.isOnline()) {
    // Try to serve from cache if available
    if (method === 'GET') {
      const cachedData = cacheManager.get(finalCacheKey);
      if (cachedData) {
        console.warn('Serving stale data due to network unavailability');
        return cachedData;
      }
    }
    throw new Error('No internet connection');
  }

  const config: RequestConfig = {
    url: endpoint,
    method,
    data,
    headers: {
      ...headers,
    },
    skipRetry,
    ...restOptions,
  };

  try {
    const response = skipRetry 
      ? await api.request(config)
      : await retryRequest(config);

    const result: ApiResponse<T> = {
      data: response.data.data || response.data,
      message: response.data.message,
      success: response.data.success ?? true,
      statusCode: response.status,
      timestamp: response.data.timestamp,
      meta: response.data.meta,
    };

    // Cache successful GET requests
    if (method === 'GET' && !skipCache && response.status === 200) {
      cacheManager.set(finalCacheKey, result, cacheTTL);
    }

    return result;
  } catch (error: any) {
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'An error occurred',
      statusCode: error.response?.status || 0,
      errors: error.response?.data?.errors,
      timestamp: error.response?.data?.timestamp,
      path: endpoint,
    };

    throw apiError;
  }
};

// Convenience methods
export const apiGet = <T = any>(
  endpoint: string,
  options?: Omit<RequestConfig, 'method'>
): Promise<ApiResponse<T>> => {
  return fetchApi<T>(endpoint, { ...options, method: 'GET' });
};

export const apiPost = <T = any>(
  endpoint: string,
  data?: any,
  options?: Omit<RequestConfig, 'method' | 'data'>
): Promise<ApiResponse<T>> => {
  return fetchApi<T>(endpoint, { ...options, method: 'POST', data });
};

export const apiPut = <T = any>(
  endpoint: string,
  data?: any,
  options?: Omit<RequestConfig, 'method' | 'data'>
): Promise<ApiResponse<T>> => {
  return fetchApi<T>(endpoint, { ...options, method: 'PUT', data });
};

export const apiPatch = <T = any>(
  endpoint: string,
  data?: any,
  options?: Omit<RequestConfig, 'method' | 'data'>
): Promise<ApiResponse<T>> => {
  return fetchApi<T>(endpoint, { ...options, method: 'PATCH', data });
};

export const apiDelete = <T = any>(
  endpoint: string,
  options?: Omit<RequestConfig, 'method'>
): Promise<ApiResponse<T>> => {
  return fetchApi<T>(endpoint, { ...options, method: 'DELETE' });
};

// File upload helper (Expo compatible)
export const uploadFile = async (
  endpoint: string,
  file: {
    uri: string;
    type: string;
    name: string;
  },
  additionalData?: Record<string, any>,
  onProgress?: (progress: number) => void
): Promise<ApiResponse> => {
  const formData = new FormData();
  
  formData.append('file', {
    uri: file.uri,
    type: file.type,
    name: file.name,
  } as any);

  if (additionalData) {
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });
  }

  return fetchApi(endpoint, {
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = (progressEvent.loaded / progressEvent.total) * 100;
        onProgress(Math.round(progress));
      }
    },
  });
};

// Batch requests
export const batchRequests = async <T = any>(
  requests: {
    endpoint: string;
    options?: RequestConfig;
  }[]
): Promise<(ApiResponse<T> | ApiError)[]> => {
  const promises = requests.map(({ endpoint, options }) =>
    fetchApi<T>(endpoint, options).catch(error => error)
  );

  return Promise.all(promises);
};

// Network status utilities
export const getNetworkStatus = (): NetworkState => {
  return networkManager.getNetworkState();
};

export const checkNetworkConnection = async (): Promise<NetworkState> => {
  return networkManager.forceCheck();
};

export const onNetworkChange = (callback: (state: NetworkState) => void): (() => void) => {
  return networkManager.addListener(callback);
};

// Initialize API utility
export const initializeApi = async (): Promise<void> => {
  try {
    await Promise.all([
      tokenManager.initialize(),
      cacheManager.initialize(),
      networkManager.initialize(),
    ]);

    // Set up network listener to process queue when back online
    networkManager.addListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        requestQueue.processQueue();
      }
    });

    console.log('API utility initialized successfully');
  } catch (error) {
    console.error('Failed to initialize API utility:', error);
  }
};

// Cleanup function
export const cleanupApi = (): void => {
  cacheManager.clear();
  requestQueue.clear();
  networkManager.cleanup();
};

// Export managers for advanced usage
export {
  api as axiosInstance, cacheManager,
  networkManager,
  requestQueue, tokenManager
};

// Export default instance
export default {
  fetchApi,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  uploadFile,
  batchRequests,
  initializeApi,
  cleanupApi,
  getNetworkStatus,
  checkNetworkConnection,
  onNetworkChange,
  tokenManager,
  cacheManager,
  networkManager,
};