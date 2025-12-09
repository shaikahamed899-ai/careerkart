const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  errors?: Array<{ field: string; message: string }>;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  getAccessToken() {
    return this.accessToken;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });

        if (!response.ok) {
          this.clearTokens();
          return false;
        }

        const data = await response.json();
        if (data.success && data.data) {
          this.setTokens(data.data.accessToken, data.data.refreshToken);
          return true;
        }
        return false;
      } catch {
        this.clearTokens();
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {},
    retry = true
  ): Promise<ApiResponse<T>> {
    const { params, ...fetchConfig } = config;
    const url = this.buildUrl(endpoint, params);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers,
      });

      // Handle 401 - try to refresh token
      if (response.status === 401 && retry && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return this.request<T>(endpoint, config, false);
        }
        // Redirect to home if refresh failed
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.message || 'Request failed',
          response.status,
          data.code,
          data.errors
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 0, 'NETWORK_ERROR');
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      params,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async uploadFile<T>(endpoint: string, file: File, fieldName = 'file'): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);

    const headers: HeadersInit = {};
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || 'Upload failed',
        response.status,
        data.code,
        data.errors
      );
    }

    return data;
  }
}

export class ApiError extends Error {
  status: number;
  code?: string;
  errors?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    status: number,
    code?: string,
    errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export type { ApiResponse };
