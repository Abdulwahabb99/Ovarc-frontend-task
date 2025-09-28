import type { 
  Book, 
  Author, 
  Store, 
  InventoryItem, 
  BookWithInventory, 
  ApiResponse, 
  AuthResponse, 
  LoginCredentials,
} from '@/types';

export interface ApiClient {
  auth: {
    login: (credentials: LoginCredentials) => Promise<AuthResponse>;
    logout: () => Promise<ApiResponse>;
    getCurrentUser: () => Promise<AuthResponse>;
  };
  books: {
    getAll: (params?: { search?: string; storeId?: number }) => Promise<Book[]>;
    getById: (id: number) => Promise<Book>;
    create: (book: Omit<Book, 'id'>) => Promise<Book>;
    update: (id: number, updates: Partial<Book>) => Promise<Book>;
    delete: (id: number) => Promise<ApiResponse>;
  };
  authors: {
    getAll: (params?: { search?: string }) => Promise<Author[]>;
    getById: (id: number) => Promise<Author>;
    create: (author: Omit<Author, 'id'>) => Promise<Author>;
    update: (id: number, updates: Partial<Author>) => Promise<Author>;
    delete: (id: number) => Promise<ApiResponse>;
  };
  stores: {
    getAll: (params?: { search?: string }) => Promise<Store[]>;
    getById: (id: number) => Promise<Store>;
  };
  inventory: {
    getAll: (params?: { storeId?: number }) => Promise<InventoryItem[]>;
    getStoreBooks: (storeId: number) => Promise<BookWithInventory[]>;
    addBookToStore: (storeId: number, bookId: number, price: number) => Promise<InventoryItem>;
    updatePrice: (id: number, price: number) => Promise<InventoryItem>;
    removeBookFromStore: (storeId: number, bookId: number) => Promise<ApiResponse>;
  };
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}
