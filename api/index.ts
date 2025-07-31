import axios from 'axios';

const API_BASE_URL = 'YOUR_API_BASE_URL'; // Replace with your actual API base URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Add any other default headers here, like authorization tokens
    // 'Authorization': `Bearer ${yourAccessToken}`,
  },
});

// Request interceptor to handle refresh tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Handle refresh token logic here if applicable
    // if (error.response.status === 401 && !originalRequest._retry) {
    //   originalRequest._retry = true;
    //   await refreshToken(); // Implement your refresh token logic
    //   // Update the authorization header with the new token
    //   api.defaults.headers.common['Authorization'] = `Bearer ${yourNewAccessToken}`;
    //   return api(originalRequest); // Retry the original request
    // }
    return Promise.reject(error);
  }
);

export const fetchApi = async (endpoint: string, method: string = 'GET', body?: any, headers?: any): Promise<any> => {
  try {
    const response = await api({
      url: endpoint,
      method,
      data: body,
      headers: {
        ...api.defaults.headers,
        ...headers,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('API call failed:', error.response?.data || error.message);
    throw error; // Re-throw the error for the calling code to handle
  }
};
