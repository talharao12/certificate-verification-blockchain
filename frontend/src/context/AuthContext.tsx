import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Corrected import

// Define the base URL for the Django backend
const API_URL = 'http://127.0.0.1:8000';

interface AuthContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: any | null; // Replace 'any' with a specific User type if available
  login: (access: string, refresh: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to check if a token is expired
const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const decoded: { exp: number } = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

// --- Axios Instance Setup (Module Scope) ---
export const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken && !isTokenExpired(refreshToken)) { // Check refresh token expiry
        try {
          const response = await axios.post(`${API_URL}/api/token/refresh/`, {
            refresh: refreshToken,
          });
          const { access, user } = response.data;
          localStorage.setItem('accessToken', access);
          // Update Authorization header for the instance for subsequent requests in this session
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access}`;
          // Update header for the original request and retry
          originalRequest.headers['Authorization'] = `Bearer ${access}`;
          await login(access, refreshToken, user);
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Trigger logout if refresh fails
          // Need a way to call logout() here, which is defined inside AuthProvider
          // Option 1: Emit an event
          // Option 2: Have a global state/function (less ideal)
          // Option 3: Check auth status again on next navigation/action
          localStorage.removeItem('accessToken'); // Clear tokens immediately
          localStorage.removeItem('refreshToken');
          window.location.href = '/login'; // Force redirect
          return Promise.reject(refreshError); 
        }
      } else {
         // No refresh token or it's expired, logout
         console.log('No valid refresh token, logging out.');
         localStorage.removeItem('accessToken');
         localStorage.removeItem('refreshToken');
         window.location.href = '/login'; // Force redirect
      }
    }
    return Promise.reject(error);
  }
);
// --- End Axios Instance Setup ---

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'));
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Function to fetch user data using the access token
  const fetchUserData = useCallback(async (token: string) => {
    setIsLoading(true);
    try {
      // Use axiosInstance which includes the Auth header
      const response = await axiosInstance.get(`/api/user/profile/`); // Assuming this endpoint exists
      setUser(response.data); // Update user state
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // Handle error, maybe logout user if profile fetch fails
      // logout(); 
    } finally {
      setIsLoading(false);
    }
  }, []); // Add dependencies for useCallback (currently none external to it)

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (storedAccessToken && storedRefreshToken) {
        if (!isTokenExpired(storedAccessToken)) {
          console.log('Access token valid, fetching user data...');
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          // Set the authorization header for axios
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${storedAccessToken}`;
          await fetchUserData(storedAccessToken);
        } else if (!isTokenExpired(storedRefreshToken)) {
          console.log('Access token expired, attempting refresh...');
          try {
            const response = await axios.post(`${API_URL}/api/token/refresh/`, {
              refresh: storedRefreshToken,
            });
            const { access } = response.data;
            localStorage.setItem('accessToken', access);
            setAccessToken(access);
            // Update axios headers with new token
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access}`;
            await fetchUserData(access); // Fetch user data with new token
          } catch (error) {
            console.error('Failed to refresh token on load:', error);
            logout(); // Logout if refresh fails
          }
        } else {
          console.log('Both tokens expired on load, logging out.');
          logout(); // Both tokens expired
        }
      } else {
        setIsLoading(false); // No tokens, not authenticated
      }
    };

    initializeAuth();
  }, [fetchUserData]); // Add fetchUserData to dependency array

  const login = async (access: string, refresh: string, userData?: any) => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    setAccessToken(access);
    setRefreshToken(refresh);
    // Update axios instance headers immediately
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    
    if (userData) {
      // If user data is provided directly (from token response)
      setUser(userData);
      setIsAuthenticated(true);
      setIsLoading(false);
    } else {
      // Fallback to fetching user data if not provided
      try {
        const decoded: any = jwtDecode(access);
        if (decoded.user) {
          setUser(decoded.user);
          setIsAuthenticated(true);
        } else {
          await fetchUserData(access);
        }
      } catch (error) {
        console.error('Error decoding token during login:', error);
        await fetchUserData(access);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, accessToken, refreshToken, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
