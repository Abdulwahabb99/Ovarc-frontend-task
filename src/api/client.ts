import type { ApiClient, ApiError, RequestConfig } from './types';
import type { 
  Book, 
  Author, 
  Store, 
  InventoryItem, 
  BookWithInventory, 
  ApiResponse, 
  AuthResponse, 
  LoginCredentials 
} from '@/types';

// Configuration
const API_TIMEOUT = 10000; // 10 seconds
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

// Environment configuration
const config = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  useMockApi: import.meta.env.VITE_USE_MOCK_API === 'true',
  timeout: API_TIMEOUT,
};

// Custom error class
class ApiClientError extends Error implements ApiError {
  status?: number;
  code?: string;
  details?: any;

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Utility functions
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

const getURL = (endpoint: string): string => {
  if (config.useMockApi) {
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  }
  return `${config.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Retry mechanism
const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  attempts: number = RETRY_ATTEMPTS
): Promise<T> => {
  try {
    return await requestFn();
  } catch (error) {
    if (attempts > 1 && error instanceof ApiClientError && error.status && error.status >= 500) {
      await sleep(RETRY_DELAY);
      return retryRequest(requestFn, attempts - 1);
    }
    throw error;
  }
};

// Generic request wrapper
const request = async <T>(
  endpoint: string,
  options: RequestConfig = { method: 'GET' }
): Promise<T> => {
  const url = getURL(endpoint);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

  const requestOptions: RequestInit = {
    method: options.method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    signal: controller.signal,
  };

  if (options.body) {
    requestOptions.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, requestOptions);
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        // Ignore JSON parse errors
      }

      throw new ApiClientError(
        errorData.message || `HTTP error! status: ${response.status}`,
        response.status,
        errorData.code,
        errorData
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiClientError) {
      throw error;
    }
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiClientError('Request timeout', 408, 'TIMEOUT');
      }
      throw new ApiClientError(error.message, undefined, 'NETWORK_ERROR');
    }
    
    throw new ApiClientError('Unknown error occurred', undefined, 'UNKNOWN');
  }
};

// API client implementation
export const apiClient: ApiClient = {
  auth: {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      return retryRequest(() => 
        request<AuthResponse>('/api/auth/login', {
          method: 'POST',
          body: credentials,
        })
      );
    },

    logout: async (): Promise<ApiResponse> => {
      return retryRequest(() => 
        request<ApiResponse>('/api/auth/logout', { method: 'POST' })
      );
    },

    getCurrentUser: async (): Promise<AuthResponse> => {
      return retryRequest(() => 
        request<AuthResponse>('/api/auth/me')
      );
    },
  },

  books: {
    getAll: async (params = {}): Promise<Book[]> => {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      if (params.storeId) searchParams.append('storeId', params.storeId.toString());
      
      const queryString = searchParams.toString();
      return retryRequest(() => 
        request<Book[]>(`/api/books${queryString ? `?${queryString}` : ''}`)
      );
    },

    getById: async (id: number): Promise<Book> => {
      return retryRequest(() => 
        request<Book>(`/api/books/${id}`)
      );
    },

    create: async (book: Omit<Book, 'id'>): Promise<Book> => {
      return retryRequest(() => 
        request<Book>('/api/books', {
          method: 'POST',
          body: book,
        })
      );
    },

    update: async (id: number, updates: Partial<Book>): Promise<Book> => {
      return retryRequest(() => 
        request<Book>(`/api/books/${id}`, {
          method: 'PUT',
          body: updates,
        })
      );
    },

    delete: async (id: number): Promise<ApiResponse> => {
      return retryRequest(() => 
        request<ApiResponse>(`/api/books/${id}`, { method: 'DELETE' })
      );
    },
  },

  authors: {
    getAll: async (params = {}): Promise<Author[]> => {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      
      const queryString = searchParams.toString();
      return retryRequest(() => 
        request<Author[]>(`/api/authors${queryString ? `?${queryString}` : ''}`)
      );
    },

    getById: async (id: number): Promise<Author> => {
      return retryRequest(() => 
        request<Author>(`/api/authors/${id}`)
      );
    },

    create: async (author: Omit<Author, 'id'>): Promise<Author> => {
      return retryRequest(() => 
        request<Author>('/api/authors', {
          method: 'POST',
          body: author,
        })
      );
    },

    update: async (id: number, updates: Partial<Author>): Promise<Author> => {
      return retryRequest(() => 
        request<Author>(`/api/authors/${id}`, {
          method: 'PUT',
          body: updates,
        })
      );
    },

    delete: async (id: number): Promise<ApiResponse> => {
      return retryRequest(() => 
        request<ApiResponse>(`/api/authors/${id}`, { method: 'DELETE' })
      );
    },
  },

  stores: {
    getAll: async (params = {}): Promise<Store[]> => {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      
      const queryString = searchParams.toString();
      return retryRequest(() => 
        request<Store[]>(`/api/stores${queryString ? `?${queryString}` : ''}`)
      );
    },

    getById: async (id: number): Promise<Store> => {
      return retryRequest(() => 
        request<Store>(`/api/stores/${id}`)
      );
    },
  },

  inventory: {
    getAll: async (params = {}): Promise<InventoryItem[]> => {
      const searchParams = new URLSearchParams();
      if (params.storeId) searchParams.append('storeId', params.storeId.toString());
      
      const queryString = searchParams.toString();
      return retryRequest(() => 
        request<InventoryItem[]>(`/api/inventory${queryString ? `?${queryString}` : ''}`)
      );
    },

    getStoreBooks: async (storeId: number): Promise<BookWithInventory[]> => {
      return retryRequest(() => 
        request<BookWithInventory[]>(`/api/inventory/${storeId}/books`)
      );
    },

    addBookToStore: async (storeId: number, bookId: number, price: number): Promise<InventoryItem> => {
      return retryRequest(() => 
        request<InventoryItem>('/api/inventory', {
          method: 'POST',
          body: { store_id: storeId, book_id: bookId, price },
        })
      );
    },

    updatePrice: async (id: number, price: number): Promise<InventoryItem> => {
      return retryRequest(() => 
        request<InventoryItem>(`/api/inventory/${id}`, {
          method: 'PUT',
          body: { price },
        })
      );
    },

    removeBookFromStore: async (storeId: number, bookId: number): Promise<ApiResponse> => {
      return retryRequest(() => 
        request<ApiResponse>(`/api/inventory/store/${storeId}/book/${bookId}`, {
          method: 'DELETE',
        })
      );
    },
  },
};

// Legacy compatibility export
export const api = apiClient;
export default apiClient;
