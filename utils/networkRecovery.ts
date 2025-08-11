import * as Network from 'expo-network';
import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Analytics from './analytics';

// Network state interface
interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  isWifiEnabled?: boolean;
  strength?: number;
}

// Failed request interface
interface FailedRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

// Network Recovery Manager
export class NetworkRecoveryManager {
  private static instance: NetworkRecoveryManager;
  private failedRequests: Map<string, FailedRequest> = new Map();
  private isOnline = true;
  private listeners: Set<(isOnline: boolean) => void> = new Set();
  private retryQueue: FailedRequest[] = [];
  private isProcessingQueue = false;

  static getInstance(): NetworkRecoveryManager {
    if (!NetworkRecoveryManager.instance) {
      NetworkRecoveryManager.instance = new NetworkRecoveryManager();
    }
    return NetworkRecoveryManager.instance;
  }

  constructor() {
    this.initializeNetworkMonitoring();
    this.loadFailedRequestsFromStorage();
  }

  private initializeNetworkMonitoring() {
    // Using expo-network instead of NetInfo
    // Note: expo-network doesn't provide real-time network state updates
    // We'll implement a polling mechanism to check network status
    const checkNetworkStatus = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        const wasOnline = this.isOnline;
        this.isOnline = networkState.isConnected ?? false;
        
        console.log(`🌐 Network state changed: ${wasOnline ? 'Online' : 'Offline'} → ${this.isOnline ? 'Online' : 'Offline'}`);
        
        // Track network changes
        Analytics.trackEvent('NETWORK_STATE_CHANGED', {
          was_online: wasOnline,
          is_online: this.isOnline,
          connection_type: networkState.type,
          is_internet_reachable: networkState.isInternetReachable
        });

        // Notify listeners
        this.listeners.forEach(listener => listener(this.isOnline));

        // Process retry queue when coming back online
        if (!wasOnline && this.isOnline) {
          console.log('✅ Network is back online - processing retry queue');
          this.processRetryQueue();
        }

        // Save offline requests when going offline
        if (wasOnline && !this.isOnline) {
          console.log('📵 Connection lost - enabling offline mode');
          this.saveFailedRequestsToStorage();
        }
      } catch (error) {
        console.error('❌ Error checking network status:', error);
        this.isOnline = false;
      }
    };

    // Check network status periodically
    setInterval(checkNetworkStatus, 5000);
    checkNetworkStatus(); // Initial check
  }

  // Add network state listener
  addNetworkListener(listener: (isOnline: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Check if currently online
  isNetworkAvailable(): boolean {
    return this.isOnline;
  }

  // Add failed request to retry queue
  addFailedRequest(request: Omit<FailedRequest, 'id' | 'timestamp' | 'retryCount'>) {
    const failedRequest: FailedRequest = {
      ...request,
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.failedRequests.set(failedRequest.id, failedRequest);
    this.retryQueue.push(failedRequest);
    
    console.log(`📝 Added failed request to queue: ${request.method} ${request.url}`);
    
    Analytics.trackEvent('NETWORK_REQUEST_FAILED', {
      request_id: failedRequest.id,
      url: request.url,
      method: request.method,
      queue_size: this.retryQueue.length
    });

    this.saveFailedRequestsToStorage();
  }

  // Process retry queue
  private async processRetryQueue() {
    if (this.isProcessingQueue || !this.isOnline) {
      return;
    }

    this.isProcessingQueue = true;
    console.log(`🔄 Processing retry queue: ${this.retryQueue.length} requests`);

    const requestsToRetry = [...this.retryQueue];
    this.retryQueue = [];

    for (const request of requestsToRetry) {
      try {
        await this.retryRequest(request);
      } catch (error) {
        console.error(`❌ Retry failed for ${request.url}:`, error);
        
        if (request.retryCount < request.maxRetries) {
          request.retryCount++;
          this.retryQueue.push(request);
          
          Analytics.trackEvent('NETWORK_RETRY_FAILED', {
            request_id: request.id,
            retry_count: request.retryCount,
            max_retries: request.maxRetries,
            error_message: error instanceof Error ? error.message : 'Unknown error'
          });
        } else {
          console.log(`🚫 Max retries exceeded for ${request.url}`);
          this.failedRequests.delete(request.id);
          
          Analytics.trackEvent('NETWORK_REQUEST_ABANDONED', {
            request_id: request.id,
            url: request.url,
            final_retry_count: request.retryCount
          });
        }
      }
    }

    this.isProcessingQueue = false;
    this.saveFailedRequestsToStorage();
  }

  // Retry individual request
  private async retryRequest(request: FailedRequest): Promise<void> {
    console.log(`🔄 Retrying request: ${request.method} ${request.url} (attempt ${request.retryCount + 1})`);

    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body ? JSON.stringify(request.body) : undefined
    });

    if (response.ok) {
      console.log(`✅ Retry successful: ${request.url}`);
      this.failedRequests.delete(request.id);
      
      Analytics.trackEvent('NETWORK_RETRY_SUCCESS', {
        request_id: request.id,
        url: request.url,
        retry_count: request.retryCount + 1,
        response_status: response.status
      });
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  // Save failed requests to storage
  private async saveFailedRequestsToStorage() {
    try {
      const requestsArray = Array.from(this.failedRequests.values());
      await AsyncStorage.setItem('failed_requests', JSON.stringify(requestsArray));
      console.log(`💾 Saved ${requestsArray.length} failed requests to storage`);
    } catch (error) {
      console.error('❌ Failed to save requests to storage:', error);
    }
  }

  // Load failed requests from storage
  private async loadFailedRequestsFromStorage() {
    try {
      const stored = await AsyncStorage.getItem('failed_requests');
      if (stored) {
        const requests: FailedRequest[] = JSON.parse(stored);
        requests.forEach(request => {
          this.failedRequests.set(request.id, request);
          this.retryQueue.push(request);
        });
        console.log(`📂 Loaded ${requests.length} failed requests from storage`);
      }
    } catch (error) {
      console.error('❌ Failed to load requests from storage:', error);
    }
  }

  // Clear all failed requests
  clearFailedRequests() {
    this.failedRequests.clear();
    this.retryQueue = [];
    AsyncStorage.removeItem('failed_requests');
    console.log('🗑️ Cleared all failed requests');
  }

  // Get queue status
  getQueueStatus() {
    return {
      totalFailed: this.failedRequests.size,
      pendingRetries: this.retryQueue.length,
      isProcessing: this.isProcessingQueue,
      isOnline: this.isOnline
    };
  }
}

// React hook for network recovery
export const useNetworkRecovery = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: null,
    type: 'unknown'
  });
  const [queueStatus, setQueueStatus] = useState({
    totalFailed: 0,
    pendingRetries: 0,
    isProcessing: false,
    isOnline: true
  });

  const networkManager = useRef(NetworkRecoveryManager.getInstance());

  useEffect(() => {
    // Listen to network state changes
    // Using expo-network instead of NetInfo
    // We'll implement a polling mechanism to check network status
    const checkNetworkStatus = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        setNetworkState({
          isConnected: networkState.isConnected ?? false,
          isInternetReachable: networkState.isInternetReachable ?? null,
          type: networkState.type ?? 'unknown'
        });
      } catch (error) {
        console.error('❌ Error checking network status:', error);
        setNetworkState({
          isConnected: false,
          isInternetReachable: false,
          type: 'unknown'
        });
      }
    };

    // Check network status periodically
    const networkInterval = setInterval(checkNetworkStatus, 5000);
    checkNetworkStatus(); // Initial check

    const unsubscribe = () => {
      clearInterval(networkInterval);
    };

    // Listen to queue status changes
    const removeNetworkListener = networkManager.current.addNetworkListener(() => {
      setQueueStatus(networkManager.current.getQueueStatus());
    });

    // Initial queue status
    setQueueStatus(networkManager.current.getQueueStatus());

    return () => {
      unsubscribe();
      removeNetworkListener();
    };
  }, []);

  const addFailedRequest = useCallback((request: Omit<FailedRequest, 'id' | 'timestamp' | 'retryCount'>) => {
    networkManager.current.addFailedRequest(request);
    setQueueStatus(networkManager.current.getQueueStatus());
  }, []);

  const clearQueue = useCallback(() => {
    networkManager.current.clearFailedRequests();
    setQueueStatus(networkManager.current.getQueueStatus());
  }, []);

  return {
    networkState,
    queueStatus,
    addFailedRequest,
    clearQueue,
    isOnline: networkState.isConnected
  };
};

// Enhanced fetch with automatic retry
export const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  maxRetries = 3
): Promise<Response> => {
  const networkManager = NetworkRecoveryManager.getInstance();
  
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error(`❌ Request failed: ${options.method || 'GET'} ${url}`, error);
    
    // Add to retry queue if offline or network error
    if (!networkManager.isNetworkAvailable() || error instanceof TypeError) {
      networkManager.addFailedRequest({
        url,
        method: options.method || 'GET',
        headers: (options.headers as Record<string, string>) || {},
        body: options.body,
        maxRetries
      });
    }
    
    throw error;
  }
};
